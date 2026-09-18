import React, { useState, useEffect } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  Hash,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from 'lucide-react';

type Algorithm = 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1';

interface AlgoInfo {
  id: Algorithm;
  name: string;
  bitLength: number;
  isLegacy?: boolean;
  desc: string;
}

const ALGORITHMS: AlgoInfo[] = [
  {
    id: 'SHA-256',
    name: 'SHA-256',
    bitLength: 256,
    desc: 'Industry standard 256-bit cryptographic digest. Recommended for general hashing.',
  },
  {
    id: 'SHA-512',
    name: 'SHA-512',
    bitLength: 512,
    desc: 'High-security 512-bit digest with superior collision resistance.',
  },
  {
    id: 'SHA-384',
    name: 'SHA-384',
    bitLength: 384,
    desc: 'Truncated SHA-512 variant yielding 384 bits. Often used in TLS suites.',
  },
  {
    id: 'SHA-1',
    name: 'SHA-1',
    bitLength: 160,
    isLegacy: true,
    desc: 'Older 160-bit algorithm with known collision vulnerabilities. Not recommended for new applications.',
  },
];

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

export const HashGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm>('SHA-256');
  const [format, setFormat] = useState<'lower' | 'upper'>('lower');
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({
    'SHA-256': '',
    'SHA-512': '',
    'SHA-384': '',
    'SHA-1': '',
  });
  const [isComputing, setIsComputing] = useState<boolean>(false);

  // Compute hashes using Web Crypto API
  useEffect(() => {
    let isCancelled = false;

    if (!inputText) {
      setHashes({
        'SHA-256': '',
        'SHA-512': '',
        'SHA-384': '',
        'SHA-1': '',
      });
      return;
    }

    const computeAll = async () => {
      setIsComputing(true);
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(inputText);

        const results: Record<string, string> = {};

        for (const algo of ALGORITHMS) {
          const buffer = await crypto.subtle.digest(algo.id, data);
          const hashArray = Array.from(new Uint8Array(buffer));
          const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          results[algo.id] = hex;
        }

        if (!isCancelled) {
          setHashes(results as Record<Algorithm, string>);
        }
      } catch (err) {
        console.error('Crypto error:', err);
      } finally {
        if (!isCancelled) {
          setIsComputing(false);
        }
      }
    };

    computeAll();

    return () => {
      isCancelled = true;
    };
  }, [inputText]);

  const handleClear = () => {
    setInputText('');
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_TEXT);
  };

  const currentHashRaw = hashes[selectedAlgo] || '';
  const currentHashFormatted =
    format === 'upper' ? currentHashRaw.toUpperCase() : currentHashRaw.toLowerCase();

  const selectedAlgoInfo = ALGORITHMS.find((a) => a.id === selectedAlgo);

  return (
    <div className="space-y-6" id="tool-hash-generator">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Hash className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Hash Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Generate cryptographic hashes in your browser using the native Web Crypto API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="hash-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="hash-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Hash generated locally in your browser.</strong>
          <span className="ml-1 text-emerald-800/90 dark:text-emerald-300/80">
            Powered by the browser's hardware-accelerated Web Crypto API (<code className="font-mono">crypto.subtle</code>). Your text is never transmitted over the network.
          </span>
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="hash-input-text"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
          >
            <span>Input String</span>
            {inputText && (
              <span className="text-[10px] text-zinc-400 font-mono font-normal">
                ({inputText.length} chars, {new TextEncoder().encode(inputText).length} bytes)
              </span>
            )}
          </label>
        </div>

        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-950/60 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
          <textarea
            id="hash-input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-label="Text to hash"
            rows={4}
            placeholder="Type or paste text here to compute cryptographic hashes..."
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Algorithm Selector & Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Primary Algorithm:
          </span>
          <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.id}
                id={`hash-algo-${algo.id.toLowerCase()}-btn`}
                type="button"
                onClick={() => setSelectedAlgo(algo.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  selectedAlgo === algo.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {algo.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 text-xs">
            <button
              type="button"
              onClick={() => setFormat('lower')}
              className={`px-2.5 py-0.5 rounded transition-all cursor-pointer font-mono ${
                format === 'lower'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={() => setFormat('upper')}
              className={`px-2.5 py-0.5 rounded transition-all cursor-pointer font-mono ${
                format === 'upper'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              UPPERCASE
            </button>
          </div>
        </div>
      </div>

      {/* Legacy Warning if SHA-1 is active */}
      {selectedAlgo === 'SHA-1' && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <strong>SHA-1 Notice:</strong> SHA-1 is an older algorithm vulnerable to hash collisions. It is provided for legacy checksum verification and is not recommended for new security-sensitive applications. Prefer <strong>SHA-256</strong> or <strong>SHA-512</strong>.
          </div>
        </div>
      )}

      {/* Primary Hash Result Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {selectedAlgo} Digest ({selectedAlgoInfo?.bitLength} bits)
            </span>
            {isComputing && (
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-500">
                <RefreshCw className="w-3 h-3 animate-spin" /> Computing...
              </span>
            )}
          </div>
          {currentHashFormatted && (
            <CopyButton text={currentHashFormatted} label={`Copy ${selectedAlgo}`} />
          )}
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-xs min-h-[64px] flex items-center">
          {currentHashFormatted ? (
            <p
              id="hash-primary-output"
              className="font-mono text-xs sm:text-sm break-all select-all leading-relaxed text-indigo-300 dark:text-indigo-200 font-medium"
            >
              {currentHashFormatted}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              Type text above to compute the {selectedAlgo} hash in real-time...
            </p>
          )}
        </div>
      </div>

      {/* Multi-Algorithm Comparison Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            All Supported Hash Digests
          </h3>
          <span className="text-[11px] text-zinc-400">Computed in parallel</span>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-hidden">
          {ALGORITHMS.map((algo) => {
            const rawHash = hashes[algo.id] || '';
            const formatted =
              format === 'upper' ? rawHash.toUpperCase() : rawHash.toLowerCase();

            return (
              <div
                key={algo.id}
                className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <div className="sm:w-32 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                      {algo.name}
                    </span>
                    {algo.isLegacy && (
                      <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">
                        Legacy
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {algo.bitLength} bits / {algo.bitLength / 8} bytes
                  </span>
                </div>

                <div className="flex-1 min-w-0 font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all select-all">
                  {formatted || (
                    <span className="text-zinc-400 dark:text-zinc-600 italic">No input</span>
                  )}
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {formatted ? (
                    <CopyButton text={formatted} label={`Copy ${algo.name}`} />
                  ) : (
                    <div className="w-16"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
