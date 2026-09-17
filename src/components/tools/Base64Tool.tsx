import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Binary, ArrowUpDown, Trash2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

// Helper for UTF-8 safe Base64 encoding
function utf8ToBase64(str: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return base64;
}

// Helper for UTF-8 safe Base64 decoding
function base64ToUtf8(base64: string): string {
  let clean = base64.trim().replace(/\s+/g, '');
  // Normalize URL-safe characters
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if missing
  while (clean.length % 4 !== 0) {
    clean += '=';
  }
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = (overrideInput?: string, overrideMode?: 'encode' | 'decode') => {
    const textToProcess = overrideInput !== undefined ? overrideInput : input;
    const currentMode = overrideMode !== undefined ? overrideMode : mode;

    if (!textToProcess.trim()) {
      setError('Input cannot be empty. Please enter text to process.');
      setOutput('');
      return;
    }

    setError(null);
    try {
      if (currentMode === 'encode') {
        const encoded = utf8ToBase64(textToProcess, urlSafe);
        setOutput(encoded);
      } else {
        const decoded = base64ToUtf8(textToProcess);
        setOutput(decoded);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError(
        currentMode === 'decode'
          ? 'Invalid Base64 string. Ensure the input is valid Base64 encoded data.'
          : `Failed to encode text: ${e.message}`
      );
      setOutput('');
    }
  };

  const handleSwap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    if (output) {
      const newIn = output;
      setInput(newIn);
      setOutput('');
      handleProcess(newIn, newMode);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleLoadSample = () => {
    if (mode === 'encode') {
      const sample = 'Hello, Developer! 🚀 DevKit provides 100% private browser tools.';
      setInput(sample);
      setError(null);
      setOutput(utf8ToBase64(sample, urlSafe));
    } else {
      const sample = 'SGVsbG8sIERldmVsb3BlciEg8J+agCBEZXZLaXQgcHJvdmlkZXMgMTAwJSBwcml2YXRlIGJyb3dzZXIgdG9vbHMu';
      setInput(sample);
      setError(null);
      setOutput(base64ToUtf8(sample));
    }
  };

  return (
    <div className="space-y-6" id="tool-base64">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-500" />
            Base64 Encoder / Decoder
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Safely convert plain text to Base64 or decode Base64 strings with UTF-8 support.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="base64-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="base64-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60">
            <button
              id="base64-mode-encode-btn"
              type="button"
              onClick={() => {
                setMode('encode');
                if (input) handleProcess(input, 'encode');
              }}
              className={`px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                mode === 'encode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Encode to Base64
            </button>
            <button
              id="base64-mode-decode-btn"
              type="button"
              onClick={() => {
                setMode('decode');
                if (input) handleProcess(input, 'decode');
              }}
              className={`px-3.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                mode === 'decode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Decode from Base64
            </button>
          </div>

          <button
            id="base64-swap-btn"
            type="button"
            onClick={handleSwap}
            title="Swap input and output"
            className="p-1.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'encode' && (
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
              <input
                id="base64-url-safe-checkbox"
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => {
                  setUrlSafe(e.target.checked);
                  if (input) {
                    setTimeout(() => handleProcess(input, mode), 0);
                  }
                }}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              URL-safe Base64 (- and _)
            </label>
          )}

          <button
            id="base64-action-btn"
            type="button"
            onClick={() => handleProcess()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            {mode === 'encode' ? 'Encode' : 'Decode'} Now
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div id="base64-error-banner" className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Conversion Error</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Grid for Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {mode === 'encode' ? 'Plaintext Input' : 'Base64 Encoded Input'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">{input.length} chars</span>
          </div>
          <textarea
            id="base64-input-textarea"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError(null);
            }}
            aria-label={mode === 'encode' ? 'Plaintext input to encode' : 'Base64 input to decode'}
            placeholder={
              mode === 'encode'
                ? 'Type or paste text to encode (supports UTF-8 emojis, symbols, unicode)...'
                : 'Paste Base64 string to decode...'
            }
            rows={12}
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {mode === 'encode' ? 'Base64 Result' : 'Decoded Plaintext'}
            </span>
            <div className="flex items-center gap-2">
              <CopyButton id="base64-copy-btn" text={output} disabled={!output} />
            </div>
          </div>
          <textarea
            id="base64-output-textarea"
            value={output}
            readOnly
            aria-label={mode === 'encode' ? 'Base64 encoded output' : 'Decoded plaintext output'}
            placeholder="Result will appear here..."
            rows={12}
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-50/50 dark:bg-zinc-950/40 border-0 resize-y focus:outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
