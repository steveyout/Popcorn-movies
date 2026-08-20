import React from 'react';
import { Home, Compass, Search, Bookmark, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import { getGlassTintConfig } from '../utils/themeStyles';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsDrawerOpen, watchlist, settings } = useApp();
  const currentTint = getGlassTintConfig(settings.glassTint);

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Bookmark },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1">
      <nav className="relative flex items-center justify-around h-16 rounded-2xl backdrop-blur-2xl bg-white/10 border border-white/15 shadow-2xl shadow-black/90 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors select-none group cursor-pointer"
            >
              {/* Active Ambient Glow Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-x-2 inset-y-1 bg-white/10 rounded-xl border border-white/20 shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? 'scale-110'
                        : 'text-white/50 group-hover:text-white'
                    }`}
                    style={{ color: isActive ? currentTint.ambientGlow : undefined }}
                  />
                  {tab.id === 'library' && watchlist.length > 0 && (
                    <span 
                      className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: currentTint.ambientGlow }}
                    >
                      {watchlist.length > 9 ? '9+' : watchlist.length}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-wide transition-colors ${
                    isActive ? 'font-bold text-white' : 'text-white/50 group-hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}

        {/* Menu Tab -> Opens Mobile Drawer */}
        <button
          id="bottom-nav-menu"
          onClick={() => setIsDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors select-none group text-white/50 hover:text-white"
        >
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <Menu className="w-5 h-5 transition-transform group-hover:scale-110 text-white/50 group-hover:text-white" />
            <span className="text-[10px] tracking-wide text-white/50 group-hover:text-white">
              Menu
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
};
