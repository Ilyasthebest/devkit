import React from 'react';
import {
  Search,
  Sun,
  Moon,
  Monitor,
  Terminal,
  X,
  Menu,
  ShieldCheck,
  History,
  Command,
} from 'lucide-react';
import { ToolId, ThemeMode } from '../../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTool: ToolId | 'home';
  onSelectTool: (tool: ToolId | 'home') => void;
  theme: ThemeMode;
  onCycleTheme: () => void;
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
  onOpenCommandPalette: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeTool,
  onSelectTool,
  theme,
  onCycleTheme,
  isMobileNavOpen,
  onToggleMobileNav,
  onOpenCommandPalette,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile menu trigger & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            id="mobile-nav-toggle-btn"
            type="button"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            id="brand-logo-btn"
            type="button"
            onClick={() => onSelectTool('home')}
            aria-label="DevKit Home"
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-500 transition-colors shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                DevKit
                <span className="hidden xs:inline text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded">
                  v3.0
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Global Search Bar / Command Palette Trigger */}
        <div className="flex-1 max-w-md mx-1 sm:mx-2 min-w-0">
          <div
            onClick={onOpenCommandPalette}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenCommandPalette();
              }
            }}
            id="global-search-trigger"
            aria-label="Open command palette (Cmd+K)"
            className="group relative flex items-center w-full px-3 py-1.5 text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer select-none"
          >
            <Search className="w-4 h-4 mr-2.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
            <span className="truncate flex-1 text-left">
              {searchQuery ? `Searching: "${searchQuery}"` : 'Search tools, commands (Cmd+K)...'}
            </span>
            <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-300 dark:border-zinc-700">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right actions: Local History + Privacy badge + Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Local History button */}
          <button
            id="navbar-history-btn"
            type="button"
            onClick={onOpenHistory}
            aria-label="Open local history"
            title="Local History (recent calculations and transforms)"
            className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-800/80"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Privacy badge */}
          <div
            title="All operations run 100% locally in your browser. Zero telemetry or network requests."
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium cursor-default"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local & Private</span>
          </div>

          {/* Theme Mode Toggle (System / Light / Dark) */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onCycleTheme}
            aria-label={`Current theme: ${theme}. Click to change.`}
            title={`Theme: ${theme.toUpperCase()} (Click to cycle Light / Dark / System)`}
            className="inline-flex items-center gap-1.5 p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-800/80"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Monitor className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-[11px] font-medium uppercase tracking-wider hidden xl:inline">
              {theme}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
