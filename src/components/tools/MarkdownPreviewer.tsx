import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import { FileText, Sparkles, Trash2, Eye, Edit3, Code } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

const SAMPLE_MARKDOWN = `# DevKit — Developer Utilities

DevKit provides **fast**, *reliable*, and **private** developer tools right inside your browser.

## Key Features
- **Zero Backend**: 100% runs on your device
- **Fast Execution**: Instant transformation
- **Keyboard Friendly**: Built for developer productivity

### Code Example
\`\`\`typescript
interface User {
  id: string;
  name: string;
  active: boolean;
}

const greet = (u: User): string => {
  return \`Hello, \${u.name}!\`;
};
\`\`\`

### Comparison Table
| Feature | DevKit | Other Sites |
| :--- | :--- | :--- |
| Privacy | Client-side | Cloud Logs |
| Speed | Instant | Network Lag |
| Ads | Zero | Invasive |

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

Check out [DevKit Documentation](https://github.com) or start writing your markdown on the left!
`;

export const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  const renderedHtml = useMemo(() => {
    if (!markdown.trim()) return '';
    try {
      const rawHtml = marked.parse(markdown) as string;
      return DOMPurify.sanitize(rawHtml);
    } catch {
      return '<p class="text-rose-500">Error parsing Markdown</p>';
    }
  }, [markdown]);

  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = markdown.length;
    const lines = markdown.split('\n').length;
    return { words, chars, lines };
  }, [markdown]);

  const handleClear = () => {
    setMarkdown('');
  };

  const handleLoadSample = () => {
    setMarkdown(SAMPLE_MARKDOWN);
  };

  return (
    <div className="space-y-6" id="tool-markdown">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Markdown Live Previewer
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Write markdown notes and documentation with instant rendered HTML preview.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="markdown-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="markdown-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {/* View Mode Toggle */}
        <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            Editor Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview Only
          </button>
        </div>

        {/* Word / Char Counters & Copy options */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            {stats.words} words • {stats.chars} chars • {stats.lines} lines
          </div>
          <div className="flex items-center gap-2">
            <CopyButton id="markdown-copy-raw-btn" text={markdown} label="Copy Markdown" />
            <CopyButton id="markdown-copy-html-btn" text={renderedHtml} label="Copy HTML" />
          </div>
        </div>
      </div>

      {/* Editor & Preview Split Area */}
      <div
        className={`grid gap-4 ${
          viewMode === 'split'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {/* Editor */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                Markdown Input
              </span>
              <span className="text-[11px] text-zinc-400">GFM enabled</span>
            </div>
            <textarea
              id="markdown-input-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              aria-label="Markdown input text"
              placeholder="Type or paste Markdown here, or click 'Load Sample' above to test..."
              rows={16}
              className="w-full p-4 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>
        )}

        {/* Live Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                Live HTML Preview
              </span>
              <span className="text-[11px] text-zinc-400">Real-time</span>
            </div>
            {markdown.trim() ? (
              <div
                id="markdown-preview-output"
                className="w-full p-5 min-h-[380px] max-h-[500px] overflow-y-auto leading-relaxed text-zinc-800 dark:text-zinc-200 prose dark:prose-invert prose-sm sm:prose-base max-w-none 
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-2 [&_h1]:text-zinc-900 [&_h1]:dark:text-white
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-zinc-900 [&_h2]:dark:text-white
                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-3 [&_h3]:mb-1
                [&_p]:mb-3 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                [&_li]:mb-1
                [&_a]:text-indigo-600 [&_a]:dark:text-indigo-400 [&_a]:underline
                [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:bg-zinc-100 [&_code]:dark:bg-zinc-800 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
                [&_pre]:p-3.5 [&_pre]:bg-zinc-950 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0
                [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-zinc-500
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-3
                [&_th]:border [&_th]:border-zinc-300 [&_th]:dark:border-zinc-700 [&_th]:p-2 [&_th]:bg-zinc-100 [&_th]:dark:bg-zinc-800 [&_th]:font-semibold [&_th]:text-left
                [&_td]:border [&_td]:border-zinc-300 [&_td]:dark:border-zinc-700 [&_td]:p-2"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div
                id="markdown-preview-empty"
                className="w-full p-8 min-h-[380px] flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-500 space-y-2"
              >
                <FileText className="w-8 h-8 opacity-40" />
                <p className="text-sm">Live HTML preview will appear here as you type.</p>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline pt-1 cursor-pointer font-medium"
                >
                  Click here to load a sample document
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
