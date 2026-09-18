import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  Link,
  ArrowUpDown,
  Trash2,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const SAMPLE_ENCODE = 'https://example.com/search?q=hello world & category=dev tools # section 1';
const SAMPLE_DECODE = 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%20%26%20category%3Ddev%20tools%20%23%20section%201';

export const UrlEncoderDecoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component');
  const [error, setError] = useState<string | null>(null);

  const handleProcess = (overrideInput?: string, overrideMode?: 'encode' | 'decode') => {
    const text = overrideInput !== undefined ? overrideInput : input;
    const currentMode = overrideMode !== undefined ? overrideMode : mode;

    if (!text) {
      setOutput('');
      setError(null);
      return;
    }

    setError(null);
    try {
      if (currentMode === 'encode') {
        const res =
          encodeType === 'component'
            ? encodeURIComponent(text)
            : encodeURI(text);
        setOutput(res);
      } else {
        // Normalize + signs to spaces if decoding query params
        const res = decodeURIComponent(text);
        setOutput(res);
      }
    } catch (err: unknown) {
      const e = err as Error;
      if (currentMode === 'decode') {
        setError(
          'Unable to decode this value. The input contains malformed percent-encoding sequences (e.g. an incomplete "%" or invalid hex digits).'
        );
      } else {
        setError(`Failed to encode string: ${e.message}`);
      }
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (error) setError(null);
    handleProcess(val, mode);
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    setError(null);
    handleProcess(input, newMode);
  };

  const handleSwap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    if (output) {
      const newIn = output;
      setInput(newIn);
      setOutput('');
      setError(null);
      handleProcess(newIn, newMode);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleLoadSample = () => {
    const sample = mode === 'encode' ? SAMPLE_ENCODE : SAMPLE_DECODE;
    setInput(sample);
    setError(null);
    handleProcess(sample, mode);
  };

  return (
    <div className="space-y-6" id="tool-url-encoder">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Link className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              URL Encoder / Decoder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Encode special characters into percent-escaped URI sequences or decode encoded web links.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            id="url-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="url-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Mode Controls Bar */}
      <div className="w-full max-w-full box-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 w-full sm:w-auto max-w-full">
          <div className="flex flex-1 sm:flex-initial p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 min-w-0">
            <button
              id="url-mode-encode-btn"
              type="button"
              onClick={() => handleModeChange('encode')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 sm:py-1 text-xs font-medium rounded-md transition-all cursor-pointer text-center whitespace-nowrap min-w-0 ${
                mode === 'encode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Encode (URL)
            </button>
            <button
              id="url-mode-decode-btn"
              type="button"
              onClick={() => handleModeChange('decode')}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 sm:py-1 text-xs font-medium rounded-md transition-all cursor-pointer text-center whitespace-nowrap min-w-0 ${
                mode === 'decode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Decode (URL)
            </button>
          </div>

          <button
            id="url-swap-btn"
            type="button"
            onClick={handleSwap}
            title="Swap input and output"
            aria-label="Swap input and output"
            className="p-2 sm:p-1.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shrink-0 min-h-[34px] min-w-[34px] flex items-center justify-center"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {mode === 'encode' && (
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto max-w-full min-w-0">
            <span className="text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">Mode:</span>
            <select
              value={encodeType}
              onChange={(e) => {
                const val = e.target.value as 'component' | 'full';
                setEncodeType(val);
                if (input) {
                  try {
                    setOutput(val === 'component' ? encodeURIComponent(input) : encodeURI(input));
                  } catch {
                    // Ignore
                  }
                }
              }}
              aria-label="URL encoding mode"
              className="w-full sm:w-auto min-w-0 max-w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 sm:py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none truncate cursor-pointer"
            >
              <option value="component">encodeURIComponent (Standard query/path)</option>
              <option value="full">encodeURI (Full URL with protocol/host intact)</option>
            </select>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id="url-error-banner"
          className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* Input / Output Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="url-input-textarea"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
            >
              <span>{mode === 'encode' ? 'Plaintext / URL' : 'Encoded URL String'}</span>
              {input && (
                <span className="text-[10px] text-zinc-400 font-mono font-normal">
                  ({input.length} chars)
                </span>
              )}
            </label>
            {input && <CopyButton text={input} label="Copy Input" />}
          </div>

          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-950/60 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
            <textarea
              id="url-input-textarea"
              value={input}
              onChange={handleInputChange}
              aria-label={mode === 'encode' ? 'URL input to encode' : 'Encoded URL input to decode'}
              placeholder={
                mode === 'encode'
                  ? 'Type or paste text/URL to encode (e.g. https://example.com?query=hello world)...'
                  : 'Type or paste percent-encoded string to decode (e.g. hello%20world)...'
              }
              rows={10}
              className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Output Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="url-output-textarea"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
            >
              <span>{mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}</span>
              {output && (
                <span className="text-[10px] text-zinc-400 font-mono font-normal">
                  ({output.length} chars)
                </span>
              )}
            </label>
            {output && <CopyButton text={output} label="Copy Result" />}
          </div>

          <div className="rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-950/40 overflow-hidden">
            <textarea
              id="url-output-textarea"
              value={output}
              readOnly
              aria-label={mode === 'encode' ? 'Encoded URL result' : 'Decoded URL result'}
              placeholder="Processed result will appear here..."
              rows={10}
              className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Informational Tip */}
      <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>100% Client-Side Encoding:</strong> DevKit encodes and decodes strings directly in your browser without transmitting any payload over the network.
        </div>
      </div>
    </div>
  );
};
