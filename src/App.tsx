import React, { useState, useEffect, useMemo } from 'react';
import { ToolId, ToolMeta, ThemeMode, HistoryEntry } from './types';
import { TOOLS } from './data/tools';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToolCard } from './components/layout/ToolCard';
import { CommandPalette } from './components/common/CommandPalette';
import { HistoryModal } from './components/common/HistoryModal';
import { ToolIcon } from './components/common/ToolIcon';
import { searchAndRankTools } from './utils/search';
import {
  getStoredFavorites,
  saveStoredFavorites,
  getStoredRecentTools,
  addRecentTool,
  clearStoredRecentTools,
  getStoredTheme,
  saveStoredTheme,
  getSystemPrefersDark,
  getStoredHistory,
  deleteStoredHistoryEntry,
  clearStoredHistory,
} from './utils/storage';

// 14 Tools
import { JsonFormatter } from './components/tools/JsonFormatter';
import { Base64Tool } from './components/tools/Base64Tool';
import { UuidGenerator } from './components/tools/UuidGenerator';
import { TimestampConverter } from './components/tools/TimestampConverter';
import { ColorConverter } from './components/tools/ColorConverter';
import { RegexTester } from './components/tools/RegexTester';
import { MarkdownPreviewer } from './components/tools/MarkdownPreviewer';
import { LoremIpsumGenerator } from './components/tools/LoremIpsumGenerator';
import { JwtDecoder } from './components/tools/JwtDecoder';
import { HashGenerator } from './components/tools/HashGenerator';
import { UrlEncoderDecoder } from './components/tools/UrlEncoderDecoder';
import { NumberBaseConverter } from './components/tools/NumberBaseConverter';
import { CronGenerator } from './components/tools/CronGenerator';
import { HttpStatusReference } from './components/tools/HttpStatusReference';

import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Search,
  Star,
  Clock,
  RotateCcw,
  Sparkles,
  Command,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'format', label: 'Format' },
  { id: 'encode', label: 'Encode' },
  { id: 'generate', label: 'Generate' },
  { id: 'convert', label: 'Convert' },
  { id: 'text', label: 'Text' },
  { id: 'reference', label: 'Reference' },
] as const;

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId | 'home'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Favorites & Recents state
  const [favorites, setFavorites] = useState<ToolId[]>(() => getStoredFavorites());
  const [recentTools, setRecentTools] = useState<ToolId[]>(() => getStoredRecentTools());

  // Command Palette & History modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => getStoredHistory());

  // Theme management (System / Light / Dark)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getStoredTheme());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => getSystemPrefersDark());

  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Listen to system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Effective dark determination
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemPrefersDark);

  // Synchronize theme with document root & local storage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Keep browser theme-color meta tag synchronized for mobile browser chrome
    const themeColor = isDark ? '#09090b' : '#fafafa';
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', themeColor);

    saveStoredTheme(themeMode);
  }, [themeMode, isDark]);

  const cycleTheme = () => {
    const next: ThemeMode =
      themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark';
    setThemeMode(next);
  };

  // Keyboard shortcut listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'k' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Read / write hash routing (e.g. #/json-formatter)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const validTool = TOOLS.find((t) => t.id === hash);
      if (validTool) {
        setActiveTool(validTool.id);
      } else {
        setActiveTool('home');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Track recently opened tools
  useEffect(() => {
    if (activeTool !== 'home') {
      const updated = addRecentTool(activeTool);
      setRecentTools(updated);
    }
  }, [activeTool]);

  const handleSelectTool = (tool: ToolId | 'home') => {
    setActiveTool(tool);
    if (tool === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = `/${tool}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (toolId: ToolId) => {
    setFavorites((prev) => {
      const updated = prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId];
      saveStoredFavorites(updated);
      return updated;
    });
  };

  const handleClearFavorites = () => {
    setFavorites([]);
    saveStoredFavorites([]);
  };

  const handleClearRecent = () => {
    clearStoredRecentTools();
    setRecentTools([]);
  };

  const handleDeleteHistoryEntry = (id: string) => {
    const updated = deleteStoredHistoryEntry(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearStoredHistory();
    setHistory([]);
  };

  const handleRestoreHistory = (entry: HistoryEntry) => {
    handleSelectTool(entry.toolId);
  };

  // Filter tools based on search query and category
  const filteredTools = useMemo(() => {
    let list = TOOLS;
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      return searchAndRankTools(list, searchQuery);
    }
    return list;
  }, [searchQuery, selectedCategory]);

  // Favorite tools list
  const favoriteTools = useMemo(() => {
    return TOOLS.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  // Recent tools list
  const recentToolItems = useMemo(() => {
    return recentTools
      .map((id) => TOOLS.find((t) => t.id === id))
      .filter((t): t is ToolMeta => !!t);
  }, [recentTools]);

  const currentToolMeta = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="flex-1 min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors overflow-x-hidden">
      {/* Header Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        theme={themeMode}
        onCycleTheme={cycleTheme}
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        favorites={favorites}
        recentTools={recentTools}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
        theme={themeMode}
        onSetTheme={setThemeMode}
        recentTools={recentTools}
        onClearRecent={handleClearRecent}
        favorites={favorites}
        onClearFavorites={handleClearFavorites}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Local History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDeleteEntry={handleDeleteHistoryEntry}
        onClearHistory={handleClearHistory}
        onRestoreEntry={handleRestoreHistory}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row min-w-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar
            activeTool={activeTool}
            onSelectTool={handleSelectTool}
            searchQuery={searchQuery}
            favorites={favorites}
            recentTools={recentTools}
          />
        </div>

        {/* Main Workspace Area */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 max-w-5xl">
          {activeTool === 'home' ? (
            <div className="space-y-8 w-full min-w-0" id="home-view">
              {/* Hero Section */}
              <div className="pt-2 pb-6 border-b border-zinc-200 dark:border-zinc-800 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold max-w-full">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span className="sm:hidden truncate">DevKit v3.0 • Workspace</span>
                    <span className="hidden sm:inline">DevKit v3.0 • Fast, Private Developer Workspace</span>
                  </div>

                  {/* Quick Cmd+K Pill */}
                  <button
                    type="button"
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                  >
                    <Command className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>Command Palette</span>
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      ⌘K
                    </kbd>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white break-words">
                  Developer tools. One place.
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 mt-2 font-normal">
                  Fast, private utilities for developers.
                </p>

                {/* Privacy Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Your data stays in your browser.</span>
                  </span>
                  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>No server calls or analytics</span>
                  </span>
                  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                    <span>Runs 100% locally</span>
                  </span>
                </div>
              </div>

              {/* Favorites Section (Feature 1 & Feature 7) */}
              {!searchQuery.trim() && selectedCategory === 'all' && (
                <div className="space-y-3 w-full min-w-0" id="home-favorites-section">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" />
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Favorite Tools
                      </h2>
                      <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full shrink-0">
                        {favoriteTools.length}
                      </span>
                    </div>

                    {favoriteTools.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearFavorites}
                        className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        Clear favorites
                      </button>
                    )}
                  </div>

                  {favoriteTools.length === 0 ? (
                    <div className="p-4 sm:p-5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 flex items-center justify-between gap-4 w-full min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                          <Star className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            Star your frequently used tools
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
                            Click the star icon on any tool card to pin it here for instant 1-click access.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
                      {favoriteTools.map((tool) => (
                        <ToolCard
                          key={`fav-${tool.id}`}
                          tool={tool}
                          onOpen={() => handleSelectTool(tool.id)}
                          isFavorite={true}
                          onToggleFavorite={() => toggleFavorite(tool.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recently Used Section (Feature 2 & Feature 7) */}
              {!searchQuery.trim() && selectedCategory === 'all' && recentToolItems.length > 0 && (
                <div className="space-y-3 w-full min-w-0" id="home-recent-section">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Recently Used
                      </h2>
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full shrink-0">
                        {recentToolItems.length}
                      </span>
                    </div>

                    <button
                      id="clear-recent-tools-btn"
                      type="button"
                      onClick={handleClearRecent}
                      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear recent</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {recentToolItems.map((tool) => (
                      <button
                        key={`recent-${tool.id}`}
                        type="button"
                        onClick={() => handleSelectTool(tool.id)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-medium text-zinc-800 dark:text-zinc-200 shadow-2xs transition-all cursor-pointer group"
                      >
                        <ToolIcon
                          name={tool.icon}
                          className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500 transition-colors shrink-0"
                        />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories & Search Filter Bar */}
              <div className="space-y-4 pt-2 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none w-full min-w-0 max-w-full">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count =
                        cat.id === 'all'
                          ? TOOLS.length
                          : TOOLS.filter((t) => t.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                              : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              isSelected
                                ? 'bg-zinc-700 dark:bg-zinc-200 text-zinc-200 dark:text-zinc-800'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-zinc-400 font-mono self-end sm:self-center shrink-0">
                    {filteredTools.length} tool{filteredTools.length === 1 ? '' : 's'}
                  </div>
                </div>

                {/* Active Search Banner if filtered */}
                {searchQuery.trim() && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300 w-full min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Search className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        Matching: <strong className="font-mono">&quot;{searchQuery}&quot;</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="underline hover:text-indigo-900 dark:hover:text-white font-medium cursor-pointer shrink-0 ml-2"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* All Tools Grid */}
                {filteredTools.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3 w-full min-w-0">
                    <Search className="w-8 h-8 mx-auto text-zinc-400 opacity-40" />
                    <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                      No matching tools found
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try searching for &quot;JSON&quot;, &quot;JWT&quot;, &quot;Hash&quot;, or &quot;Timestamp&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
                    {filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onOpen={() => handleSelectTool(tool.id)}
                        isFavorite={favorites.includes(tool.id)}
                        onToggleFavorite={() => toggleFavorite(tool.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Active Tool View */
            <div className="space-y-6 w-full min-w-0" id="tool-view-container">
              {/* Back to all tools header bar & Quick Star / Status bar */}
              <div className="flex items-center justify-between pb-3 flex-wrap gap-3">
                <button
                  id="back-to-overview-btn"
                  type="button"
                  onClick={() => handleSelectTool('home')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to all tools</span>
                </button>

                {currentToolMeta && (
                  <div className="flex items-center gap-2">
                    {/* Favorite Toggle Button inside active tool */}
                    <button
                      id={`tool-view-fav-btn-${currentToolMeta.id}`}
                      type="button"
                      onClick={() => toggleFavorite(currentToolMeta.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                        favorites.includes(currentToolMeta.id)
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                      aria-label={
                        favorites.includes(currentToolMeta.id)
                          ? 'Remove tool from favorites'
                          : 'Star tool as favorite'
                      }
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          favorites.includes(currentToolMeta.id)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-zinc-400'
                        }`}
                      />
                      <span>
                        {favorites.includes(currentToolMeta.id) ? 'Favorited' : 'Add to Favorites'}
                      </span>
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Local Execution</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tool Renderer */}
              <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-xs">
                {activeTool === 'json-formatter' && <JsonFormatter />}
                {activeTool === 'base64' && <Base64Tool />}
                {activeTool === 'uuid' && <UuidGenerator />}
                {activeTool === 'timestamp' && <TimestampConverter />}
                {activeTool === 'color' && <ColorConverter />}
                {activeTool === 'regex' && <RegexTester />}
                {activeTool === 'markdown' && <MarkdownPreviewer />}
                {activeTool === 'lorem-ipsum' && <LoremIpsumGenerator />}
                {activeTool === 'jwt-decoder' && <JwtDecoder />}
                {activeTool === 'hash-generator' && <HashGenerator />}
                {activeTool === 'url-encoder' && <UrlEncoderDecoder />}
                {activeTool === 'number-base' && <NumberBaseConverter />}
                {activeTool === 'cron-generator' && <CronGenerator />}
                {activeTool === 'http-status' && <HttpStatusReference />}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            DevKit — Private, client-side utility workspace for developers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-zinc-400">
            <span>All operations occur 100% locally</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            >
              Command Palette (⌘K)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            >
              History
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
