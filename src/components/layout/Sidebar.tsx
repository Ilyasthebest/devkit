import React from 'react';
import { TOOLS } from '../../data/tools';
import { ToolIcon } from '../common/ToolIcon';
import { ToolId } from '../../types';
import { LayoutGrid, ShieldCheck, Star, Clock, Sparkles } from 'lucide-react';
import { searchAndRankTools } from '../../utils/search';

interface SidebarProps {
  activeTool: ToolId | 'home';
  onSelectTool: (tool: ToolId | 'home') => void;
  searchQuery?: string;
  favorites: ToolId[];
  recentTools: ToolId[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  searchQuery = '',
  favorites,
  recentTools,
}) => {
  const filteredTools = searchQuery.trim()
    ? searchAndRankTools(TOOLS, searchQuery)
    : TOOLS;

  const favoriteTools = TOOLS.filter((t) => favorites.includes(t.id));
  const recentToolItems = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is (typeof TOOLS)[0] => !!t);

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-4 select-none">
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* Navigation Section */}
        <div className="space-y-1">
          <button
            id="nav-home-btn"
            type="button"
            onClick={() => onSelectTool('home')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeTool === 'home'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>All Utilities Overview</span>
          </button>
        </div>

        {/* Favorites Section (if any exist) */}
        {favoriteTools.length > 0 && !searchQuery.trim() && (
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-amber-500">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>Favorites</span>
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">
                {favoriteTools.length}
              </span>
            </div>

            <div className="space-y-0.5">
              {favoriteTools.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={`fav-${tool.id}`}
                    id={`nav-fav-tool-${tool.id}`}
                    type="button"
                    onClick={() => onSelectTool(tool.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ToolIcon
                        name={tool.icon}
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-zinc-400 group-hover:text-amber-500 dark:text-zinc-500'
                        }`}
                      />
                      <span className="truncate">{tool.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Used Section (if any exist and not searching) */}
        {recentToolItems.length > 0 && !searchQuery.trim() && (
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent</span>
              </span>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">
                {recentToolItems.length}
              </span>
            </div>

            <div className="space-y-0.5">
              {recentToolItems.slice(0, 5).map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={`recent-${tool.id}`}
                    id={`nav-recent-tool-${tool.id}`}
                    type="button"
                    onClick={() => onSelectTool(tool.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ToolIcon
                        name={tool.icon}
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500'
                        }`}
                      />
                      <span className="truncate">{tool.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Tools List */}
        <div className="space-y-1">
          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <span>All Tools</span>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">
              {filteredTools.length}
            </span>
          </div>

          <div className="space-y-0.5">
            {filteredTools.map((tool) => {
              const isActive = activeTool === tool.id;
              const isFav = favorites.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  id={`nav-tool-${tool.id}`}
                  type="button"
                  onClick={() => onSelectTool(tool.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ToolIcon
                      name={tool.icon}
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-zinc-400 group-hover:text-indigo-500 dark:text-zinc-500'
                      }`}
                    />
                    <span className="truncate">{tool.name}</span>
                  </div>
                  {isFav && !isActive && (
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredTools.length === 0 && (
              <div className="p-3 text-xs text-zinc-400 italic">
                No tools matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice Footer */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>100% Client-Side Privacy</span>
          </div>
          <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal">
            No server calls. No cookies. Runs locally on your device.
          </p>
        </div>
      </div>
    </aside>
  );
};
