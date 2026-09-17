import React, { useState, useEffect } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Fingerprint, RefreshCw, Trash2, Sliders, Check } from 'lucide-react';

function generateV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback if needed
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);

  const generateBatch = (count = quantity) => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = generateV4();
      if (!hyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      else id = id.toLowerCase();
      list.push(id);
    }
    setUuids(list);
  };

  useEffect(() => {
    generateBatch();
  }, [quantity, uppercase, hyphens]);

  const handleClear = () => {
    setUuids([]);
  };

  const allUuidsText = uuids.join('\n');

  return (
    <div className="space-y-6" id="tool-uuid">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-500" />
            UUID v4 Generator
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Generate cryptographically secure version-4 universally unique identifiers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="uuid-generate-btn"
            type="button"
            onClick={() => generateBatch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
          <button
            id="uuid-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Settings / Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <label htmlFor="uuid-quantity-select" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            Count:
          </label>
          <select
            id="uuid-quantity-select"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={1}>1 UUID</option>
            <option value={5}>5 UUIDs</option>
            <option value={10}>10 UUIDs</option>
            <option value={20}>20 UUIDs</option>
            <option value={50}>50 UUIDs</option>
          </select>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              id="uuid-hyphens-checkbox"
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
            />
            Include Hyphens
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              id="uuid-uppercase-checkbox"
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
            />
            Uppercase Letters
          </label>

          {uuids.length > 0 && (
            <CopyButton
              id="uuid-copy-all-btn"
              text={allUuidsText}
              label={`Copy All (${uuids.length})`}
              copiedLabel="All Copied!"
            />
          )}
        </div>
      </div>

      {/* Generated list */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Generated UUIDs ({uuids.length})
          </span>
          <span className="text-xs text-zinc-400">RFC 4122 Compliant</span>
        </div>

        {uuids.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-400">
            No UUIDs generated. Click &ldquo;Regenerate&rdquo; above to create new tokens.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {uuids.map((uuid, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 px-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="text-xs text-zinc-400 font-mono w-6 text-right shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 select-all truncate">
                    {uuid}
                  </span>
                </div>
                <CopyButton
                  id={`uuid-copy-item-${idx}`}
                  text={uuid}
                  label="Copy"
                  iconOnly={false}
                  className="opacity-90 group-hover:opacity-100"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
