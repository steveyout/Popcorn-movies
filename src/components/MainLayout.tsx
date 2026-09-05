'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/src/context/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { HomeView } from './HomeView';
import { DiscoverView } from './DiscoverView';
import { SearchView } from './SearchView';
import { LibraryView } from './LibraryView';
import { DetailModal } from './DetailModal';
import { VideoPlayer } from './VideoPlayer';
import { SettingsModal } from './SettingsModal';
import { MobileDrawer } from './MobileDrawer';
import { ToastContainer } from './ToastContainer';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';
import { getGlassTintConfig } from '@/src/utils/themeStyles';
import { AnimatePresence, motion } from 'motion/react';
import { getMediaIdFromSlug } from '@/src/lib/mediaSeo';
import { tmdbService } from '@/src/services/tmdb';
import type { MediaItem } from '@/src/types';

const MainLayout: React.FC<{ initialMedia?: MediaItem }> = ({ initialMedia }) => {
  const { 
    activeTab, 
    setActiveTab,
    selectedMedia, 
    setSelectedMedia, 
    activePlayerMedia, 
    setActivePlayerMedia,
    settings,
    brandConfig,
  } = useApp();
  
  const [mediaFilter, setMediaFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const currentTint = getGlassTintConfig(settings.glassTint);

  useEffect(() => {
    const openMediaFromPath = async () => {
      const match = window.location.pathname.match(/^\/(movie|tv)\/([^/]+)$/);
      if (!match) return;

      if (initialMedia && initialMedia.media_type === match[1]) {
        setSelectedMedia(initialMedia);
        return;
      }

      const id = getMediaIdFromSlug(match[2]);
      if (!id) return;

      const media = await tmdbService.getDetails(id, match[1] as 'movie' | 'tv');
      if (media) setSelectedMedia(media);
    };

    const handlePopState = () => {
      if (window.location.pathname === '/') {
        setSelectedMedia(null);
      } else {
        void openMediaFromPath();
      }
    };

    void openMediaFromPath();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const syncTabFromPath = () => {
      const path = window.location.pathname;
      const tab = path === '/discover'
        ? 'browse'
        : path === '/search'
          ? 'search'
          : path === '/library'
            ? 'library'
            : 'home';
      if (activeTab !== tab) {
        // Browser navigation should update the view without adding another history entry.
        setActiveTab(tab);
      }
    };

    window.addEventListener('popstate', syncTabFromPath);
    return () => window.removeEventListener('popstate', syncTabFromPath);
  }, [activeTab, setActiveTab]);

  const handleSelectGenreFromSidebar = (genreId: number) => {
    setSelectedGenreId(genreId);
  };

  return (
    <div 
      className="min-h-screen bg-[#050508] text-white flex flex-row transition-all duration-700 ease-in-out selection:bg-indigo-500 selection:text-white"
      style={{ background: currentTint.radialBackground }}
      data-brand={brandConfig.logoType}
    >
      {/* Desktop Responsive Glassmorphic Sidebar */}
      <Sidebar onSelectGenre={handleSelectGenreFromSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <Header mediaFilter={mediaFilter} setMediaFilter={setMediaFilter} />

        {/* View Switcher with Smooth Page Transitions */}
        <main className="flex-1 max-w-7xl w-full mx-auto pt-4 sm:pt-6 pb-28 sm:pb-32 lg:pb-12 px-2 sm:px-4">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <HomeView
                  mediaFilter={mediaFilter}
                  onSelectGenre={handleSelectGenreFromSidebar}
                />
              </motion.div>
            )}

            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <DiscoverView initialGenreId={selectedGenreId} />
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SearchView />
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <LibraryView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <DetailModal
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* Video & Cinema Stream Player */}
      <AnimatePresence>
        {activePlayerMedia && (
          <VideoPlayer
            media={activePlayerMedia}
            onClose={() => setActivePlayerMedia(null)}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal />

      {/* Firebase Authentication & Google Sign-In Modal */}
      <AuthModal />

      {/* User Cloud Profile & Analytics Activity Feed Modal */}
      <UserProfileModal />

      {/* Mobile Slide-Out Drawer */}
      <MobileDrawer onSelectGenre={handleSelectGenreFromSidebar} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export { MainLayout };
