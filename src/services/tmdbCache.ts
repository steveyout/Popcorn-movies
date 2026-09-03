/**
 * LocalStorage & In-Memory Caching Layer for TMDB API Requests
 * 
 * Provides:
 * - Two-tier caching (L1 In-Memory Map + L2 LocalStorage)
 * - Deterministic cache key generation with sorted query parameters
 * - Endpoint-aware TTL (Time-To-Live) expiration
 * - Automatic cache eviction & QuotaExceededError protection
 * - Stale-on-error fallback for offline resilience
 * - Cache statistics and manual clearing utilities
 */

const CACHE_PREFIX = 'popcorn_tmdb_cache_v1:';
const MAX_CACHE_ENTRIES = 120; // Maximum items in localStorage

export interface CacheEnvelope<T> {
  data: T;
  cachedAt: number; // epoch ms
  ttl: number;      // lifetime in ms
}

export interface CacheStats {
  count: number;
  estimatedKb: number;
}

// In-Memory L1 Cache for 0ms same-session instant lookups
const memoryCache = new Map<string, CacheEnvelope<any>>();

/**
 * Returns default TTL based on endpoint stability:
 * - Media Details / Credits: 2 hours (rarely change)
 * - Top Rated / Genres: 1 hour
 * - Trending / Popular / Upcoming: 30 minutes
 * - Discover: 20 minutes
 * - Search: 10 minutes
 */
export const getDefaultTtl = (endpoint: string): number => {
  if (endpoint.includes('/credits') || endpoint.includes('/videos') || endpoint.startsWith('/movie/') || endpoint.startsWith('/tv/')) {
    return 2 * 60 * 60 * 1000; // 2 hours
  }
  if (endpoint.includes('top_rated') || endpoint.includes('/genre/')) {
    return 60 * 60 * 1000; // 1 hour
  }
  if (endpoint.startsWith('/search/')) {
    return 10 * 60 * 1000; // 10 minutes
  }
  if (endpoint.startsWith('/discover/')) {
    return 20 * 60 * 1000; // 20 minutes
  }
  // Trending, popular, upcoming
  return 30 * 60 * 1000; // 30 minutes
};

/**
 * Deterministically constructs a unique cache key from the endpoint and sorted params.
 */
export const getCacheKey = (endpoint: string, params: Record<string, string | number | boolean> = {}): string => {
  const sortedEntries = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  const queryString = new URLSearchParams(
    sortedEntries.map(([k, v]) => [k, String(v)])
  ).toString();

  return `${CACHE_PREFIX}${endpoint}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Retrieves cached response. Returns { hit: true, data } if fresh,
 * or { hit: false, isStale: true, data } if expired (useful for offline fallback).
 */
export const getCachedData = <T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): { hit: boolean; isStale?: boolean; data: T | null } => {
  const key = getCacheKey(endpoint, params);
  const now = Date.now();

  // 1. Check L1 Memory Cache
  const memItem = memoryCache.get(key);
  if (memItem) {
    if (now - memItem.cachedAt < memItem.ttl) {
      return { hit: true, data: memItem.data as T };
    }
    // Expired in memory
    memoryCache.delete(key);
  }

  // 2. Check L2 LocalStorage
  if (typeof window === 'undefined' || !window.localStorage) {
    return { hit: false, data: null };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { hit: false, data: null };
    }

    const envelope = JSON.parse(raw) as CacheEnvelope<T>;
    if (!envelope || !envelope.cachedAt || !envelope.ttl) {
      window.localStorage.removeItem(key);
      return { hit: false, data: null };
    }

    const isFresh = now - envelope.cachedAt < envelope.ttl;
    if (isFresh) {
      // Re-populate L1 memory cache
      memoryCache.set(key, envelope);
      return { hit: true, data: envelope.data };
    }

    // Stale item (can be used as fallback if network request fails)
    return { hit: false, isStale: true, data: envelope.data };
  } catch (err) {
    // Malformed JSON or read error
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return { hit: false, data: null };
  }
};

/**
 * Stores data into L1 (memory) and L2 (localStorage) with quota handling.
 */
export const setCachedData = <T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  data: T,
  customTtl?: number
): void => {
  if (!data) return;

  const key = getCacheKey(endpoint, params);
  const ttl = customTtl || getDefaultTtl(endpoint);
  const envelope: CacheEnvelope<T> = {
    data,
    cachedAt: Date.now(),
    ttl
  };

  // 1. Save to L1 Memory Cache
  memoryCache.set(key, envelope);

  // 2. Save to L2 LocalStorage
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch (err) {
    // Likely QuotaExceededError or storage full - perform proactive cleanup and retry once
    pruneCache(true);
    try {
      window.localStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      // If still fails, silent fail (L1 in-memory will still serve this session)
    }
  }
};

/**
 * Prunes expired or oldest entries from localStorage.
 * If forceAggressive is true, drops the oldest 30% of entries to free immediate space.
 */
export const pruneCache = (forceAggressive: boolean = false): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const now = Date.now();
    const tmdbKeys: string[] = [];
    const entries: { key: string; cachedAt: number }[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        tmdbKeys.push(k);
      }
    }

    // 1. Remove expired items first
    for (const key of tmdbKeys) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const envelope = JSON.parse(raw);
        if (now - envelope.cachedAt >= envelope.ttl) {
          window.localStorage.removeItem(key);
          memoryCache.delete(key);
        } else {
          entries.push({ key, cachedAt: envelope.cachedAt || 0 });
        }
      } catch {
        window.localStorage.removeItem(key);
        memoryCache.delete(key);
      }
    }

    // 2. If count exceeds MAX_CACHE_ENTRIES or forceAggressive is true, drop oldest items
    if (forceAggressive || entries.length > MAX_CACHE_ENTRIES) {
      entries.sort((a, b) => a.cachedAt - b.cachedAt);
      const toRemoveCount = Math.max(
        entries.length - MAX_CACHE_ENTRIES,
        forceAggressive ? Math.ceil(entries.length * 0.3) : 0
      );

      for (let i = 0; i < toRemoveCount && i < entries.length; i++) {
        window.localStorage.removeItem(entries[i].key);
        memoryCache.delete(entries[i].key);
      }
    }
  } catch {
    // Storage access might be restricted
  }
};

/**
 * Completely clears all TMDB cache entries from both memory and localStorage.
 */
export const clearTmdbCache = (): void => {
  memoryCache.clear();

  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
};

/**
 * Returns current TMDB cache size and entry count.
 */
export const getTmdbCacheStats = (): CacheStats => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { count: memoryCache.size, estimatedKb: 0 };
  }

  try {
    let count = 0;
    let totalBytes = 0;

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        count++;
        const val = window.localStorage.getItem(key);
        if (val) {
          totalBytes += (key.length + val.length) * 2; // UTF-16 approx
        }
      }
    }

    return {
      count: Math.max(count, memoryCache.size),
      estimatedKb: Math.round(totalBytes / 1024)
    };
  } catch {
    return { count: memoryCache.size, estimatedKb: 0 };
  }
};
