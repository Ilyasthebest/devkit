import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import { SearchCode, AlertCircle, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import DOMPurify from 'dompurify';

interface MatchItem {
  index: number;
  text: string;
  groups: string[];
}

const REGEX_PRESETS = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: 'Contact support@devkit.dev or sales@example.org for assistance.',
  },
  {
    name: 'URL (HTTP/HTTPS)',
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)',
    flags: 'gi',
    sample: 'Visit https://ai.studio/build and https://vitejs.dev for great tools.',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Localhost is 127.0.0.1 and gateway is 192.168.1.1 or 10.0.0.254.',
  },
  {
    name: 'Hex Color',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'gi',
    sample: 'Colors used are #4F46E5, #10B981, #FFF, and #18181B.',
  },
];

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean; u: boolean }>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });
  const [testText, setTestText] = useState<string>('');

  const activeFlagsString = useMemo(() => {
    let res = '';
    if (flags.g) res += 'g';
    if (flags.i) res += 'i';
    if (flags.m) res += 'm';
    if (flags.s) res += 's';
    if (flags.u) res += 'u';
    return res;
  }, [flags]);

  const { matches, error, highlightedHtml } = useMemo(() => {
    const escapeHtml = (str: string): string =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (!pattern) {
      return { matches: [], error: null, highlightedHtml: escapeHtml(testText) };
    }

    try {
      const regex = new RegExp(pattern, activeFlagsString);
      const list: MatchItem[] = [];

      if (!testText) {
        return { matches: [], error: null, highlightedHtml: '' };
      }

      if (flags.g) {
        let match: RegExpExecArray | null;
        let lastIdx = 0;
        let htmlParts: string[] = [];

        // Safety limit to avoid catastrophic backtracking / infinite loops
        let iterations = 0;
        const maxIterations = 5000;

        while ((match = regex.exec(testText)) !== null && iterations < maxIterations) {
          iterations++;
          const matchIndex = match.index;
          const matchText = match[0];

          // Capture preceding text
          htmlParts.push(escapeHtml(testText.slice(lastIdx, matchIndex)));

          // Highlight matching text
          htmlParts.push(
            `<mark class="bg-amber-300 dark:bg-amber-500/30 text-zinc-950 dark:text-amber-200 px-0.5 rounded font-mono font-medium">${escapeHtml(
              matchText
            )}</mark>`
          );

          lastIdx = matchIndex + matchText.length;

          list.push({
            index: matchIndex,
            text: matchText,
            groups: match.slice(1),
          });

          // Prevent infinite zero-length matches
          if (matchText.length === 0) {
            regex.lastIndex++;
          }
        }

        htmlParts.push(escapeHtml(testText.slice(lastIdx)));

        const raw = htmlParts.join('');
        return {
          matches: list,
          error: null,
          highlightedHtml: DOMPurify.sanitize(raw, {
            ALLOWED_TAGS: ['mark'],
            ALLOWED_ATTR: ['class'],
          }),
        };
      } else {
        // Non-global regex
        const match = regex.exec(testText);
        if (match) {
          list.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          });

          const before = testText.slice(0, match.index);
          const matched = match[0];
          const after = testText.slice(match.index + matched.length);

          const raw = `${escapeHtml(before)}<mark class="bg-amber-300 dark:bg-amber-500/30 text-zinc-950 dark:text-amber-200 px-0.5 rounded font-mono font-medium">${escapeHtml(
            matched
          )}</mark>${escapeHtml(after)}`;

          return {
            matches: list,
            error: null,
            highlightedHtml: DOMPurify.sanitize(raw, {
              ALLOWED_TAGS: ['mark'],
              ALLOWED_ATTR: ['class'],
            }),
          };
        } else {
          return {
            matches: [],
            error: null,
            highlightedHtml: escapeHtml(testText),
          };
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      return {
        matches: [],
        error: e.message,
        highlightedHtml: escapeHtml(testText),
      };
    }
  }, [pattern, activeFlagsString, testText, flags.g]);

  const handleClear = () => {
    setPattern('');
    setTestText('');
  };

  const handleApplyPreset = (preset: (typeof REGEX_PRESETS)[0]) => {
    setPattern(preset.pattern);
    setTestText(preset.sample);
    setFlags({
      g: preset.flags.includes('g'),
      i: preset.flags.includes('i'),
      m: preset.flags.includes('m'),
      s: preset.flags.includes('s'),
      u: preset.flags.includes('u'),
    });
  };

  const allMatchesText = matches.map((m) => m.text).join('\n');

  return (
    <div className="space-y-6" id="tool-regex">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-indigo-500" />
            Regular Expression Tester
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Test and evaluate regular expressions in real-time with instant match highlighting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="regex-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-zinc-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
        </span>
        {REGEX_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shrink-0 border border-zinc-200 dark:border-zinc-700/60"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Regex Pattern Input & Flags */}
      <div className="p-4 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400 text-lg select-none font-bold">/</span>
          <input
            id="regex-pattern-input"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            aria-label="Regular expression pattern"
            placeholder="Enter regex pattern here..."
            className="flex-1 font-mono text-sm px-3 py-2 bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="font-mono text-zinc-400 text-lg select-none font-bold">/</span>
          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 w-8">
            {activeFlagsString || ' '}
          </span>
        </div>

        {/* Flag toggles */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-1 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Flags:</span>
            {[
              { id: 'g', label: 'g (global)', desc: 'Find all matches' },
              { id: 'i', label: 'i (case insensitive)', desc: 'Ignore case' },
              { id: 'm', label: 'm (multiline)', desc: '^ and $ match start/end of lines' },
              { id: 's', label: 's (dotAll)', desc: '. matches newlines' },
              { id: 'u', label: 'u (unicode)', desc: 'Unicode pattern support' },
            ].map((f) => (
              <label
                key={f.id}
                title={f.desc}
                className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none font-mono"
              >
                <input
                  type="checkbox"
                  checked={flags[f.id as keyof typeof flags]}
                  onChange={(e) =>
                    setFlags({
                      ...flags,
                      [f.id]: e.target.checked,
                    })
                  }
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                />
                {f.id}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                error
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}
            >
              {error ? 'Invalid Regex' : `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Error alert if syntax invalid */}
      {error && (
        <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">RegExp Compilation Error</p>
            <p className="text-xs font-mono mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Editor & Highlight Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Test Text Input */}
        <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Test String
            </span>
            <span className="text-xs text-zinc-400 font-mono">{testText.length} chars</span>
          </div>
          <textarea
            id="regex-test-text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            aria-label="Test string for regular expression"
            placeholder="Type or paste text to test against the regular expression..."
            rows={10}
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed"
          />
        </div>

        {/* Live Highlight Preview */}
        <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Highlighted Matches
            </span>
            {matches.length > 0 && (
              <CopyButton id="regex-copy-matches-btn" text={allMatchesText} label="Copy Matches" />
            )}
          </div>
          <div
            id="regex-highlight-preview"
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-50/50 dark:bg-zinc-950/40 min-h-[220px] max-h-[320px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text"
            dangerouslySetInnerHTML={{ __html: highlightedHtml || '<span class="text-zinc-400 italic">No text provided</span>' }}
          />
        </div>
      </div>

      {/* Matches List & Capture Groups */}
      {matches.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Match Details ({matches.length})
            </span>
            <span className="text-xs text-zinc-400">Index & Groups</span>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-60 overflow-y-auto">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="text-xs font-mono text-zinc-400 w-6">#{idx + 1}</span>
                  <span className="font-mono text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold truncate select-all">
                    {m.text}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">index: {m.index}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {m.groups.length > 0 && (
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded font-mono">
                      {m.groups.length} {m.groups.length === 1 ? 'group' : 'groups'}
                    </span>
                  )}
                  <CopyButton text={m.text} iconOnly />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
