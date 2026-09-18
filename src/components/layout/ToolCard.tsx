import React from 'react';
import { ToolMeta } from '../../types';
import { ToolIcon } from '../common/ToolIcon';
import { ArrowRight, Star } from 'lucide-react';

interface ToolCardProps {
  tool: ToolMeta;
  onOpen: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onOpen,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div
      id={`tool-card-${tool.id}`}
      onClick={onOpen}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="space-y-3">
        {/* Icon & Category tag & Favorite Button */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200">
            <ToolIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400">
              {tool.category}
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                id={`tool-card-fav-${tool.id}`}
                aria-label={
                  isFavorite
                    ? `Remove ${tool.name} from favorites`
                    : `Add ${tool.name} to favorites`
                }
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                    : 'text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-60 group-hover:opacity-100'
                }`}
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-amber-400 text-amber-500' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {tool.name}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      {/* Footer Open Button */}
      <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400">
          Client-side
        </span>
        <button
          id={`tool-card-open-${tool.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer group-hover:bg-indigo-600 group-hover:text-white"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
