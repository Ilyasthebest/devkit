import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToolId, ToolMeta, ThemeMode } from '../../types';
import { TOOLS } from '../../data/tools';
import { ToolIcon } from './ToolIcon';
import { searchAndRankTools } from '../../utils/search';
import {
  Search,
  Command,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Star,
  Clock,
  History,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: ToolId | 'home') => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
  recentTools: ToolId[];
  onClearRecent: () => void;
  favorites: ToolId[];
  onClearFavorites: () => void;
  onOpenHistory: () => void;
}

type PaletteItem =
  | {
      type: 'tool';
      id: ToolId;
      tool: ToolMeta;
      isFavorite: boolean;
    }
  | {
      type: 'command';
      id: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      action: () => void;
    };

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  theme,
  onSetTheme,
  recentTools,
  onClearRecent,
  favorites,
  onClearFavorites,
  onOpenHistory,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus search input and prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      // Lock body scroll
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Compute items list based on query
  const items: PaletteItem[] = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const resultItems: PaletteItem[] = [];

    // System commands
    const systemCommands: PaletteItem[] = [
      {
        type: 'command',
        id: 'cmd-theme-toggle',
        title: `Theme: ${theme === 'dark' ? 'Light' : theme === 'light' ? 'System' : 'Dark'} Mode`,
        subtitle: `Currently using ${theme} theme. Press to switch.`,
        icon:
          theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : theme === 'light' ? (
            <Monitor className="w-4 h-4 text-indigo-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          ),
        action: () => {
          const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
          onSetTheme(nextTheme);
          onClose();
        },
      },
      {
        type: 'command',
        id: 'cmd-history',
        title: 'View Local History',
        subtitle: 'Inspect recent local calculations, hashes, and transformations.',
        icon: <History className="w-4 h-4 text-indigo-400" />,
        action: () => {
          onClose();
          onOpenHistory();
        },
      },
    ];

    if (recentTools.length > 0) {
      systemCommands.push({
        type: 'command',
        id: 'cmd-clear-recent',
        title: 'Clear Recently Used Tools',
        subtitle: `Remove all ${recentTools.length} recently opened tools from history.`,
        icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
        action: () => {
          onClearRecent();
          onClose();
        },
      });
    }

    if (favorites.length > 0) {
      systemCommands.push({
        type: 'command',
        id: 'cmd-clear-favorites',
        title: 'Clear All Starred Favorites',
        subtitle: `Remove all ${favorites.length} starred tools.`,
        icon: <Star className="w-4 h-4 text-amber-400" />,
        action: () => {
          onClearFavorites();
          onClose();
        },
      });
    }

    // Filter tools using ranked search algorithm
    const matchedTools = searchAndRankTools(TOOLS, trimmed);

    // Add matched tools
    for (const tool of matchedTools) {
      resultItems.push({
        type: 'tool',
        id: tool.id,
        tool,
        isFavorite: favorites.includes(tool.id),
      });
    }

    // Filter system commands if query is typed
    if (!trimmed) {
      // Prepend system commands when query is empty
      return [...resultItems, ...systemCommands];
    } else {
      const matchedCmds = systemCommands.filter(
        (cmd) =>
          cmd.type === 'command' &&
          (cmd.title.toLowerCase().includes(trimmed) || cmd.subtitle.toLowerCase().includes(trimmed))
      );
      return [...resultItems, ...matchedCmds];
    }
  }, [
    query,
    theme,
    onSetTheme,
    onClose,
    onOpenHistory,
    recentTools.length,
    onClearRecent,
    favorites,
    onClearFavorites,
  ]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Global key navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = items[selectedIndex];
      if (current) {
        if (current.type === 'tool') {
          onSelectTool(current.id);
          onClose();
        } else {
          current.action();
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a tool name, command, or keyword (e.g. JSON, JWT, Hash, 404, Base64)..."
            aria-label="Search tools and commands"
            className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 focus:outline-none"
          tabIndex={-1}
        >
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-medium">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-zinc-400">
                Try searching for &quot;token&quot;, &quot;format&quot;, &quot;encode&quot;, or &quot;theme&quot;
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              if (item.type === 'tool') {
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    type="button"
                    onClick={() => {
                      onSelectTool(item.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium shadow-xs'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-500/30 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        <ToolIcon name={item.tool.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                          >
                            {item.tool.name}
                          </span>
                          {item.isFavorite && (
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          )}
                          <span
                            className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {item.tool.category}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            isSelected ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {item.tool.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      <span
                        className={`text-xs flex items-center gap-1 opacity-0 ${
                          isSelected ? 'opacity-100' : ''
                        }`}
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              }

              // System Command item
              return (
                <button
                  key={item.id}
                  data-index={idx}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-500/30 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-sm font-semibold truncate block ${
                          isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {item.title}
                      </span>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isSelected ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs shrink-0 flex items-center gap-1 opacity-0 ${
                      isSelected ? 'opacity-100' : ''
                    }`}
                  >
                    <span>Run</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span className="hidden sm:inline">14 Tools • 100% Client-side</span>
        </div>
      </div>
    </div>
  );
};
