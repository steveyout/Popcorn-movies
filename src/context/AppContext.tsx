'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem, NavTab, WatchlistItem, AppSettings } from '@/src/types';
import { getDefaultTmdbApiKey, normalizeTmdbApiKey, setTmdbApiKey } from '@/src/services/tmdb';
import { triggerHaptic } from '@/src/utils/haptics';
import { DEFAULT_BRAND_CONFIG, getClientDomainBranding, DomainBrandConfig } from '@/src/lib/domainBranding';
import { auth } from '@/src/services/firebase';
import { 
  saveCloudWatchlistItem, 
  removeCloudWatchlistItem, 
  subscribeCloudWatchlist,
  saveCloudSettings,
  fetchCloudSettings
} from '@/src/services/firestoreSync';
import { trackWatchlistAction, trackSearch, trackPageView } from '@/src/services/analytics';
import { getMediaPath } from '@/src/lib/mediaSeo';

interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'favorite';
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedMedia: MediaItem | null;
  setSelectedMedia: (media: MediaItem | null) => void;
  activePlayerMedia: MediaItem | null;
  setActivePlayerMedia: (media: MediaItem | null) => void;
  
  // Brand configuration
  brandConfig: DomainBrandConfig;

  // Watchlist & Library
  watchlist: WatchlistItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  toggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  markAsWatched: (id: number, watched: boolean) => void;
  toggleDownload: (id: number) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  // Settings & Theme
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'favorite') => void;
  removeToast: (id: string) => void;

  // Mobile drawer
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  tmdbApiKey: getDefaultTmdbApiKey(),
  useLiveTmdb: true,
  accentColor: 'cyan',
  glassTint: 'violet',
  autoPlayTrailers: true,
  streamQuality: '1080p',
  defaultProvider: 'cinemaos',
  autoplayNextEpisode: true,
  autoplayStream: true,
  playerLanguage: 'en',
  playerShowRelated: true,
  playerDisableInfo: false,
  playerDisableControls: false,
  ambientLightEnabled: true,
  ambientIntensity: 'normal',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Try to get initial brand config
const getInitialBrandConfig = (): DomainBrandConfig => {
  if (typeof window !== 'undefined') {
    return getClientDomainBranding();
  }
  return DEFAULT_BRAND_CONFIG;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname;
    if (path === '/discover') return 'browse';
    if (path === '/search') return 'search';
    if (path === '/library') return 'library';
    return 'home';
  });
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [activePlayerMedia, setActivePlayerMedia] = useState<MediaItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [brandConfig, setBrandConfig] = useState<DomainBrandConfig>(getInitialBrandConfig);

  // Local storage for Watchlist
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('popcorn_watchlist');
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Local storage for Recent Searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('popcorn_recent_searches');
        return saved ? JSON.parse(saved) : ['Dune', 'Lioness', 'Stranger Things', 'Minions'];
      }
      return ['Dune', 'Lioness', 'Stranger Things', 'Minions'];
    } catch {
      return ['Dune', 'Lioness', 'Stranger Things', 'Minions'];
    }
  });

  // Local storage for Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('popcorn_settings');
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<AppSettings>;
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            tmdbApiKey: normalizeTmdbApiKey(parsed.tmdbApiKey),
          };
        }
        return DEFAULT_SETTINGS;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Update brand config on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBrandConfig(getClientDomainBranding());
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('popcorn_watchlist', JSON.stringify(watchlist));
      }
    } catch (e) {
      console.error(e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('popcorn_recent_searches', JSON.stringify(recentSearches));
      }
    } catch (e) {
      console.error(e);
    }
  }, [recentSearches]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('popcorn_settings', JSON.stringify(settings));
        if (settings.tmdbApiKey) {
          setTmdbApiKey(settings.tmdbApiKey);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Dynamic Domain SEO Detection & Initial Analytics on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackPageView('home', `${brandConfig.brandName} & TV Stream`);
    }
  }, [brandConfig]);

  // Real-time Cloud Firestore Watchlist & Settings Sync with Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // 1. Fetch remote settings if exists
        try {
          const remoteSettings = await fetchCloudSettings(currentUser.uid);
          if (remoteSettings) {
            setSettings(prev => ({ ...prev, ...remoteSettings }));
          }
        } catch (e) {
          console.warn('Could not load remote settings:', e);
        }

        // 2. Real-time Firestore sync for Watchlist
        const unsubWatchlist = subscribeCloudWatchlist(currentUser.uid, (cloudItems) => {
          if (cloudItems && cloudItems.length > 0) {
            setWatchlist(cloudItems);
          }
        });

        return () => unsubWatchlist();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'favorite' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSetActiveTab = (tab: NavTab) => {
    if (typeof window !== 'undefined') {
      triggerHaptic('light');
    }
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const tabPath: Record<NavTab, string> = {
        home: '/',
        browse: '/discover',
        search: '/search',
        library: '/library',
        menu: '/',
      };
      const nextPath = tabPath[tab];
      if (nextPath && window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
    }
    trackPageView(tab);
  };

  const handleSetSelectedMedia = (media: MediaItem | null) => {
    if (media && typeof window !== 'undefined') {
      triggerHaptic('medium');
    }
    setSelectedMedia(media);
    if (typeof window !== 'undefined') {
      if (media) {
        const nextPath = getMediaPath(media);
        if (window.location.pathname !== nextPath) {
          window.history.pushState({}, '', nextPath);
        }
      } else if (/^\/(movie|tv)\/[^/]+$/.test(window.location.pathname)) {
        window.history.back();
      }
    }
  };

  const handleSetActivePlayerMedia = (media: MediaItem | null) => {
    if (media && typeof window !== 'undefined') {
      triggerHaptic('heavy');
    }
    setActivePlayerMedia(media);
  };

  const addToWatchlist = (item: MediaItem) => {
    if (!isInWatchlist(item.id)) {
      if (typeof window !== 'undefined') {
        triggerHaptic('success');
      }
      const newItem: WatchlistItem = {
        id: item.id,
        item,
        addedAt: Date.now(),
        watched: false,
        isFavorite: false,
        progress: 0
      };
      setWatchlist(prev => [newItem, ...prev]);
      showToast(`Added "${item.title || item.name}" to your Library`);

      // Analytics & Cloud Sync
      trackWatchlistAction('add', item);
      const currentUser = auth.currentUser;
      if (currentUser) {
        saveCloudWatchlistItem(currentUser.uid, newItem);
      }
    }
  };

  const removeFromWatchlist = (id: number) => {
    if (typeof window !== 'undefined') {
      triggerHaptic('light');
    }
    const target = watchlist.find(w => w.id === id);
    setWatchlist(prev => prev.filter(w => w.id !== id));
    if (target) {
      showToast(`Removed "${target.item.title || target.item.name}" from Library`, 'info');
      trackWatchlistAction('remove', target.item);
    }
    const currentUser = auth.currentUser;
    if (currentUser) {
      removeCloudWatchlistItem(currentUser.uid, id);
    }
  };

  const toggleWatchlist = (item: MediaItem) => {
    if (isInWatchlist(item.id)) {
      removeFromWatchlist(item.id);
    } else {
      addToWatchlist(item);
    }
  };

  const isInWatchlist = (id: number): boolean => {
    return watchlist.some(w => w.id === id);
  };

  const toggleFavorite = (id: number) => {
    if (typeof window !== 'undefined') {
      triggerHaptic('medium');
    }
    setWatchlist(prev => prev.map(w => {
      if (w.id === id) {
        const nextFav = !w.isFavorite;
        const updated = { ...w, isFavorite: nextFav };
        showToast(nextFav ? `Favorited "${w.item.title || w.item.name}"` : 'Removed from Favorites', 'favorite');
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          saveCloudWatchlistItem(currentUser.uid, updated);
        }
        return updated;
      }
      return w;
    }));
  };

  const markAsWatched = (id: number, watched: boolean) => {
    if (typeof window !== 'undefined') {
      triggerHaptic('medium');
    }
    setWatchlist(prev => prev.map(w => {
      if (w.id === id) {
        const updated = { ...w, watched, progress: watched ? 100 : 0 };
        showToast(watched ? `Marked as Watched` : 'Marked as Unwatched');
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          saveCloudWatchlistItem(currentUser.uid, updated);
        }
        return updated;
      }
      return w;
    }));
  };

  const toggleDownload = (id: number) => {
    if (typeof window !== 'undefined') {
      triggerHaptic('medium');
    }
    setWatchlist(prev => prev.map(w => {
      if (w.id === id) {
        const isDownloaded = !w.downloaded;
        showToast(isDownloaded ? 'Downloaded for offline viewing' : 'Removed from offline storage');
        return { ...w, downloaded: isDownloaded };
      }
      return w;
    }));
  };

  const addRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    if (typeof window !== 'undefined') {
      triggerHaptic('selection');
    }
    trackSearch(clean, 0);
    setRecentSearches(prev => [clean, ...prev.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 10));
  };

  const clearRecentSearches = () => {
    if (typeof window !== 'undefined') {
      triggerHaptic('light');
    }
    setRecentSearches([]);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    if (typeof window !== 'undefined') {
      triggerHaptic('medium');
    }
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    showToast('Preferences updated', 'info');

    const currentUser = auth.currentUser;
    if (currentUser) {
      saveCloudSettings(currentUser.uid, merged);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab: handleSetActiveTab,
        selectedMedia,
        setSelectedMedia: handleSetSelectedMedia,
        activePlayerMedia,
        setActivePlayerMedia: handleSetActivePlayerMedia,
        brandConfig,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        toggleFavorite,
        markAsWatched,
        toggleDownload,
        searchQuery,
        setSearchQuery,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        settings,
        updateSettings,
        isSettingsOpen,
        setIsSettingsOpen,
        toasts,
        showToast,
        removeToast,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
