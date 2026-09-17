import React, { useRef, useEffect } from 'react';
import { Search, Sun, Moon, Terminal, X, Menu, ShieldCheck } from 'lucide-react';
import { ToolId } from '../../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTool: ToolId | 'home';
  onSelectTool: (tool: ToolId | 'home') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isMobileNavOpen: boolean;
  onToggleMobileNav: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeTool,
  onSelectTool,
  theme,
  onToggleTheme,
  isMobileNavOpen,
  onToggleMobileNav,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global key listener for '/' and 'Ctrl+K' / 'Cmd+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (searchQuery) {
          onSearchChange('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile menu trigger & Brand */}
        <div className="flex items-center gap-3">
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
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-500 transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                DevKit
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded">
                  v1.0
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search tools"
              placeholder="Search tools (JSON, Base64, UUID...)"
              className="w-full pl-9 pr-14 py-1.5 text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery ? (
              <button
                id="global-search-clear-btn"
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 hidden sm:flex items-center pointer-events-none">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded border border-zinc-300 dark:border-zinc-700">
                  /
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right actions: Privacy badge + Theme toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            title="All operations run 100% locally in your browser. No data leaves your machine."
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium cursor-default"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local & Private</span>
          </div>

          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-800/80"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
