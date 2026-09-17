import React from 'react';
import { TOOLS } from '../../data/tools';
import { ToolIcon } from '../common/ToolIcon';
import { ToolId } from '../../types';
import { LayoutGrid, X, ShieldCheck } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: ToolId | 'home';
  onSelectTool: (tool: ToolId | 'home') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTool,
  onSelectTool,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-zinc-950 h-full flex flex-col justify-between p-4 shadow-xl z-10 border-r border-zinc-200 dark:border-zinc-800">
        <div className="space-y-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-base text-zinc-900 dark:text-white">DevKit Tools</span>
            <button
              id="mobile-nav-close-btn"
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
              activeTool === 'home'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Tools (Home)</span>
          </button>

          {/* Tool list */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Utilities
            </div>
            {TOOLS.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
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
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Your data stays in your browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
