import React, { useState, useEffect } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Clock, Play, Pause, RefreshCw, Trash2, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const absSec = Math.abs(diffSec);
  if (absSec < 60) return rtf.format(diffSec, 'second');
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month');
  return rtf.format(Math.round(diffDay / 365), 'year');
}

export const TimestampConverter: React.FC = () => {
  // Live ticker
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());
  const [isTickerRunning, setIsTickerRunning] = useState<boolean>(true);

  // Timestamp -> Date
  const [tsInput, setTsInput] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [dateResult, setDateResult] = useState<{
    iso: string;
    utc: string;
    local: string;
    relative: string;
    timezone: string;
  } | null>(null);
  const [tsError, setTsError] = useState<string | null>(null);

  // Date -> Timestamp
  const [dateInput, setDateInput] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [customTsResult, setCustomTsResult] = useState<{
    seconds: number;
    milliseconds: number;
  } | null>(null);

  // Ticker loop
  useEffect(() => {
    if (!isTickerRunning) return;
    const interval = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isTickerRunning]);

  // Convert timestamp to date
  const convertTimestampToDate = (value: string, inputUnit: 'seconds' | 'milliseconds') => {
    const clean = value.trim();
    if (!clean) {
      setDateResult(null);
      setTsError(null);
      return;
    }

    const num = Number(clean);
    if (isNaN(num) || num < 0) {
      setTsError('Please enter a valid non-negative numeric timestamp.');
      setDateResult(null);
      return;
    }

    setTsError(null);
    const ms = inputUnit === 'seconds' ? num * 1000 : num;
    const d = new Date(ms);

    if (isNaN(d.getTime())) {
      setTsError('The entered timestamp creates an invalid date representation.');
      setDateResult(null);
      return;
    }

    setDateResult({
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'long' }),
      relative: formatRelativeTime(d),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local',
    });
  };

  // Convert custom date to timestamp
  const convertDateToTimestamp = (dateStr: string) => {
    if (!dateStr) {
      setCustomTsResult(null);
      return;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      setCustomTsResult(null);
      return;
    }
    setCustomTsResult({
      seconds: Math.floor(d.getTime() / 1000),
      milliseconds: d.getTime(),
    });
  };

  useEffect(() => {
    convertTimestampToDate(tsInput, unit);
  }, [tsInput, unit]);

  useEffect(() => {
    convertDateToTimestamp(dateInput);
  }, [dateInput]);

  const handleUseCurrentAsInput = () => {
    const val = unit === 'seconds' ? Math.floor(Date.now() / 1000).toString() : Date.now().toString();
    setTsInput(val);
  };

  const handleClearTimestamp = () => {
    setTsInput('');
    setDateResult(null);
    setTsError(null);
  };

  return (
    <div className="space-y-6" id="tool-timestamp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Timestamp Converter
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Convert Unix epoch timestamps to human dates and generate timestamps from custom dates.
          </p>
        </div>
      </div>

      {/* Live Current Epoch Banner */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Current Unix Epoch Time
          </div>
          <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
            <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {Math.floor(currentTimestamp / 1000)}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              ({currentTimestamp} ms)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="ts-ticker-toggle-btn"
            type="button"
            onClick={() => setIsTickerRunning(!isTickerRunning)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            {isTickerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                Pause Ticker
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                Resume Ticker
              </>
            )}
          </button>
          <CopyButton
            id="ts-copy-current-btn"
            text={Math.floor(currentTimestamp / 1000).toString()}
            label="Copy Seconds"
          />
        </div>
      </div>

      {/* Conversion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Timestamp -> Human Date */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs flex flex-col">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Timestamp → Human Date
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentAsInput}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Use Now
              </button>
              <button
                type="button"
                onClick={handleClearTimestamp}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-medium cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Input & Unit */}
            <div className="space-y-1.5">
              <label htmlFor="ts-input" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Enter Timestamp
              </label>
              <div className="flex gap-2">
                <input
                  id="ts-input"
                  type="text"
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                  aria-label="Timestamp input value"
                  placeholder="e.g. 1773754565"
                  className="flex-1 px-3 py-2 text-sm font-mono bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <select
                  id="ts-unit-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'seconds' | 'milliseconds')}
                  aria-label="Timestamp unit selection"
                  className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="seconds">Seconds (s)</option>
                  <option value="milliseconds">Milliseconds (ms)</option>
                </select>
              </div>
            </div>

            {tsError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{tsError}</span>
              </div>
            )}

            {/* Results */}
            {dateResult && !tsError && (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 font-medium">ISO 8601 (UTC)</span>
                    <CopyButton text={dateResult.iso} iconOnly />
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 select-all font-semibold">
                    {dateResult.iso}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 font-medium">Local Time ({dateResult.timezone})</span>
                    <CopyButton text={dateResult.local} iconOnly />
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 select-all font-medium">
                    {dateResult.local}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-medium">Relative</span>
                    <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {dateResult.relative}
                    </div>
                  </div>
                  <CopyButton text={dateResult.relative} iconOnly />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Human Date -> Timestamp */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs flex flex-col">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Date & Time → Timestamp
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1">
            <div className="space-y-1.5">
              <label htmlFor="date-input" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Choose Date & Time
              </label>
              <input
                id="date-input"
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                aria-label="Date and time to convert to timestamp"
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {customTsResult ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 font-medium">Epoch (Seconds)</span>
                    <CopyButton text={customTsResult.seconds.toString()} />
                  </div>
                  <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 select-all">
                    {customTsResult.seconds}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400 font-medium">Epoch (Milliseconds)</span>
                    <CopyButton text={customTsResult.milliseconds.toString()} />
                  </div>
                  <div className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100 select-all">
                    {customTsResult.milliseconds}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-zinc-400">
                Select a valid date to view Unix timestamps.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
