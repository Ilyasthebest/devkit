import React, { useEffect } from 'react';
import { TOOLS } from '../../data/tools';
import { ToolIcon } from '../common/ToolIcon';
import { ToolId } from '../../types';
import { LayoutGrid, X, ShieldCheck, Star, Clock } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: ToolId | 'home';
  onSelectTool: (tool: ToolId | 'home') => void;
  favorites: ToolId[];
  recentTools: ToolId[];
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTool,
  onSelectTool,
  favorites,
  recentTools,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.id));
  const recentToolItems = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is (typeof TOOLS)[0] => !!t);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      className="fixed inset-0 z-50 md:hidden flex flex-col"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-zinc-950 h-full flex flex-col justify-between p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-xl z-10 border-r border-zinc-200 dark:border-zinc-800">
        <div className="space-y-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-base text-zinc-900 dark:text-white">DevKit Tools</span>
            <button
              id="mobile-nav-close-btn"
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Home option */}
          <button
            type="button"
            onClick={() => {
              onSelectTool('home');
              onClose();
            }}
            className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
              activeTool === 'home'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Tools (Home)</span>
          </button>

          {/* Starred Favorites (if any) */}
          {favoriteTools.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Favorites</span>
              </div>
              {favoriteTools.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={`mob-fav-${tool.id}`}
                    type="button"
                    onClick={() => {
                      onSelectTool(tool.id);
                      onClose();
                    }}
                    className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <ToolIcon
                      name={tool.icon}
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-500'}`}
                    />
                    <span className="truncate">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent (if any) */}
          {recentToolItems.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent</span>
              </div>
              {recentToolItems.slice(0, 4).map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={`mob-recent-${tool.id}`}
                    type="button"
                    onClick={() => {
                      onSelectTool(tool.id);
                      onClose();
                    }}
                    className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <ToolIcon
                      name={tool.icon}
                      className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`}
                    />
                    <span className="truncate">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* All Tool list */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              All 14 Utilities
            </div>
            {TOOLS.map((tool) => {
              const isActive = activeTool === tool.id;
              const isFav = favorites.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ToolIcon
                      name={tool.icon}
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`}
                    />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  {isFav && !isActive && (
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
