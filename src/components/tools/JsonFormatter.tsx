import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { CheckCircle2, AlertCircle, FileCode, Trash2, Wand2, Minimize2, Sparkles } from 'lucide-react';

const SAMPLE_JSON = `{
  "app": "DevKit",
  "version": "1.0.0",
  "author": {
    "name": "DevKit Team",
    "status": "online"
  },
  "features": [
    "JSON Formatter",
    "Base64 Converter",
    "UUID Generator",
    "Timestamp Converter"
  ],
  "settings": {
    "darkMode": true,
    "telemetry": false
  }
}`;

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<number | string>(2);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string; details?: string }>({
    type: 'idle',
    message: '',
  });

  const getIndentValue = (currentIndent = indent) => {
    if (currentIndent === 'tab') return '\t';
    return Number(currentIndent);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    // Clear sample banner if present so the UI accurately reflects user modification
    if (status.message === 'Sample JSON Loaded') {
      setStatus({ type: 'idle', message: '' });
    }
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty. Please enter some JSON to format.' });
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, getIndentValue());
      setOutput(formatted);
      const itemCount = Array.isArray(parsed)
        ? `${parsed.length} array items`
        : typeof parsed === 'object' && parsed !== null
        ? `${Object.keys(parsed).length} top-level keys`
        : '1 primitive value';
      setStatus({
        type: 'success',
        message: 'Valid JSON',
        details: `${itemCount} • ${new Blob([formatted]).size} bytes`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Invalid JSON Syntax',
        details: error.message,
      });
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty. Please enter some JSON to minify.' });
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setStatus({
        type: 'success',
        message: 'Valid JSON (Minified)',
        details: `${minified.length} characters • ${new Blob([minified]).size} bytes`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Invalid JSON Syntax',
        details: error.message,
      });
    }
  };

  const handleValidate = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty. Enter JSON to validate.' });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const count = Array.isArray(parsed)
        ? `${parsed.length} array items`
        : typeof parsed === 'object' && parsed !== null
        ? `${Object.keys(parsed).length} object keys`
        : 'primitive value';
      setStatus({
        type: 'success',
        message: 'Valid JSON',
        details: `Syntax is valid • ${count}`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Invalid JSON Syntax',
        details: error.message,
      });
    }
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    try {
      const parsed = JSON.parse(SAMPLE_JSON);
      setOutput(JSON.stringify(parsed, null, getIndentValue()));
      setStatus({
        type: 'success',
        message: 'Sample JSON Loaded',
        details: 'Ready to edit and re-format',
      });
    } catch {
      // noop
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="space-y-6" id="tool-json-formatter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-500" />
            JSON Formatter & Validator
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Prettify, minify, and inspect JSON payloads with real-time error identification.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="json-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="json-clear-btn"
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
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="json-format-btn"
            type="button"
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Format JSON
          </button>

          <button
            id="json-minify-btn"
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify
          </button>

          <button
            id="json-validate-btn"
            type="button"
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Validate
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="json-indent-select" className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Indent:
          </label>
          <select
            id="json-indent-select"
            value={indent}
            onChange={(e) => {
              const val = e.target.value;
              setIndent(val);
              if (output && input.trim()) {
                try {
                  const parsed = JSON.parse(input);
                  setOutput(JSON.stringify(parsed, null, getIndentValue(val)));
                } catch {
                  // Keep current output if invalid
                }
              }
            }}
            className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </div>
      </div>

      {/* Status banner if exists */}
      {status.type !== 'idle' && (
        <div
          id="json-status-banner"
          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          )}
          <div className="text-sm">
            <p className="font-semibold">{status.message}</p>
            {status.details && <p className="text-xs mt-0.5 font-mono opacity-90">{status.details}</p>}
          </div>
        </div>
      )}

      {/* Editor & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Area */}
        <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Input JSON
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {input.length} chars
            </span>
          </div>
          <textarea
            id="json-input-textarea"
            name="json-input"
            value={input}
            onChange={handleInputChange}
            aria-label="JSON input"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleFormat();
              }
            }}
            placeholder="Paste your JSON here or click 'Load Sample'..."
            rows={14}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none focus:ring-0 leading-relaxed"
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Formatted Output
            </span>
            <div className="flex items-center gap-2">
              <CopyButton id="json-copy-output-btn" text={output} disabled={!output} />
            </div>
          </div>
          <textarea
            id="json-output-textarea"
            value={output}
            readOnly
            aria-label="Formatted JSON output"
            placeholder="Formatted or minified output will appear here..."
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-50/50 dark:bg-zinc-950/40 border-0 resize-y focus:outline-none focus:ring-0 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
