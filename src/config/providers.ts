export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  enabled: boolean;
}

export const providers: Provider[] = [
  {
    id: 'cinemaos',
    name: 'Server 1 (Echo)',
    baseUrl: 'https://cinemaos.tech',
    enabled: true,
  },
  {
    id: 'vidking',
    name: 'Server 2 (Nova)',
    baseUrl: 'https://www.vidking.net',
    enabled: true,
  },
  {
    id: 'vidlink',
    name: 'Server 3 (Pulse)',
    baseUrl: 'https://vidlink.pro',
    enabled: true,
  },
  {
    id: 'vidsrc_to',
    name: 'Server 4 (Apex)',
    baseUrl: 'https://vidsrc.to/embed',
    enabled: true,
  },
  {
    id: 'vidnest',
    name: 'Server 5 (Orbit)',
    baseUrl: 'https://vidnest.fun',
    enabled: true,
  },
  {
    id: 'vidfast',
    name: 'Server 6 (Vortex)',
    baseUrl: 'https://vidfast.net',
    enabled: true,
  },
  {
    id: 'videasy',
    name: 'Server 7 (Zenith)',
    baseUrl: 'https://player.videasy.net',
    enabled: true,
  },
  {
    id: 'vidsrc_me',
    name: 'Server 8 (Mirage)',
    baseUrl: 'https://vsembed.ru/embed',
    enabled: true,
  },
  {
    id: 'vidup',
    name: 'Server 9 (Horizon)',
    baseUrl: 'https://vidup.to',
    enabled: true,
  },
  {
    id: 'rivestream',
    name: 'Server 10 (Cosmos)',
    baseUrl: 'https://rivestream.org/embed',
    enabled: true,
  },
  {
    id: 'vidcore',
    name: 'Server 11 (Aether)',
    baseUrl: 'https://vidcore.org',
    enabled: true,
  },
];

export const DEFAULT_PROVIDER_ID = 'cinemaos';

export const THEME_COLOR_MAP: Record<string, string> = {
  amber: 'F59E0B',
  cyan: '06B6D4',
  rose: 'F43F5E',
  emerald: '10B981',
  purple: '8B5CF6',
  default: '06B6D4'
};

export interface EmbedOptions {
  autoplay?: boolean;
  startAt?: number;
  themeColor?: string;
  lang?: string;
  showRelated?: boolean;
  disableInfo?: boolean;
  disableControls?: boolean;
}

/**
 * Helper to build the streaming embed URL based on media type and selected server.
 * Supports both Movies and TV Shows across 11 anonymous high-speed stream engines.
 */
export const getEmbedUrl = (
  providerId: string = DEFAULT_PROVIDER_ID,
  type: 'movie' | 'tv',
  tmdbId: string | number,
  season: number = 1,
  episode: number = 1,
  progressSeconds: number = 0,
  themeColor: string = '06B6D4',
  options: EmbedOptions = {}
): string => {
  const selected = providers.find((p) => p.id === providerId) || 
                   providers.find((p) => p.id === DEFAULT_PROVIDER_ID) || 
                   providers[0];
  if (!selected) return '';

  if (selected.id === 'cinemaos') {
    return type === 'movie'
      ? `${selected.baseUrl}/player/${tmdbId}`
      : `${selected.baseUrl}/player/${tmdbId}/${season}/${episode}`;
  }

  if (selected.id === 'vidking') {
    let url = '';
    if (type === 'movie') {
      url = `${selected.baseUrl}/embed/movie/${tmdbId}?color=06b6d4`;
    } else {
      url = `${selected.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}?color=06b6d4&nextEpisode=true&episodeSelector=true`;
    }
    if (progressSeconds > 0) {
      url += `&progress=${progressSeconds}`;
    }
    return url;
  }

  if (selected.id === 'vidcore') {
    const cleanTheme = (themeColor.startsWith('#') ? themeColor.slice(1) : themeColor) || '06B6D4';
    const path = type === 'movie'
      ? `${selected.baseUrl}/embed/movie/${tmdbId}`
      : `${selected.baseUrl}/embed/tv/${tmdbId}/${season}/${episode}`;

    const queryParams = new URLSearchParams();
    queryParams.set('theme', cleanTheme);
    queryParams.set('color', cleanTheme);

    if (options.autoplay !== false) {
      queryParams.set('autoplay', '1');
    }

    if (progressSeconds > 0 || (options.startAt && options.startAt > 0)) {
      queryParams.set('startAt', String(progressSeconds || options.startAt || 0));
    }

    if (options.lang) {
      queryParams.set('lang', options.lang);
    }

    if (options.showRelated !== undefined) {
      queryParams.set('showRelated', options.showRelated ? 'true' : 'false');
    }

    if (options.disableInfo) {
      queryParams.set('disableInfo', 'true');
    }

    if (options.disableControls) {
      queryParams.set('disableControls', 'true');
    }

    return `${path}?${queryParams.toString()}`;
  }

  // Fallbacks for other servers
  if (type === 'movie') {
    if (selected.id === 'vidlink') {
      return `${selected.baseUrl}/movie/${tmdbId}`;
    }
    return `${selected.baseUrl}/movie/${tmdbId}`;
  }

  // For TV shows
  if (selected.id === 'vidlink') {
    return `${selected.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
  }
  return `${selected.baseUrl}/tv/${tmdbId}/${season}/${episode}`;
};

export const getNextEnabledProviderId = (currentId: string, failedIds: string[] = []): string | null => {
  const candidates = providers.filter(
    (p) => p.enabled && !failedIds.includes(p.id) && p.id !== currentId
  );
  return candidates.length > 0 ? candidates[0].id : null;
};

