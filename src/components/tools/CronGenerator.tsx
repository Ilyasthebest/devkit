import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  CalendarClock,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Clock,
  Calendar,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

const PRESETS: CronPreset[] = [
  { name: 'Every minute', expression: '* * * * *', description: 'Runs every minute' },
  { name: 'Every 5 minutes', expression: '*/5 * * * *', description: 'At every 5th minute' },
  { name: 'Every 15 minutes', expression: '*/15 * * * *', description: 'At minute 0, 15, 30, and 45' },
  { name: 'Every hour', expression: '0 * * * *', description: 'At minute 0 past every hour' },
  { name: 'Every day at midnight', expression: '0 0 * * *', description: 'At 00:00 (12:00 AM) every day' },
  { name: 'Every day at 9:00', expression: '0 9 * * *', description: 'At 09:00 AM every day' },
  { name: 'Every Monday at 9:00', expression: '0 9 * * 1', description: 'At 09:00 AM on Monday' },
  { name: 'Every weekday at 9:00', expression: '0 9 * * 1-5', description: 'At 09:00 AM, Monday through Friday' },
  { name: 'Every weekend at 10:00', expression: '0 10 * * 0,6', description: 'At 10:00 AM on Saturday and Sunday' },
  { name: '1st of month at midnight', expression: '0 0 1 * *', description: 'At 00:00 on day 1 of every month' },
];

const DOW_NAMES: Record<string, string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  '7': 'Sunday',
};

const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function explainCron(expr: string): { text: string; isValid: boolean; error: string | null } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      text: '',
      isValid: false,
      error: `Standard cron expressions must have exactly 5 fields (minute, hour, day-of-month, month, day-of-week). Found ${parts.length} field${parts.length === 1 ? '' : 's'}.`,
    };
  }

  const [min, hour, dom, mon, dow] = parts;

  // Validate characters
  const validPattern = /^[\d\*\,\-\/]+$/;
  for (let i = 0; i < parts.length; i++) {
    if (!validPattern.test(parts[i])) {
      const fieldNames = ['Minute', 'Hour', 'Day of Month', 'Month', 'Day of Week'];
      return {
        text: '',
        isValid: false,
        error: `Invalid character in ${fieldNames[i]} field: "${parts[i]}". Allowed characters: 0-9, *, ,, -, /`,
      };
    }
  }

  // Generate readable explanation
  try {
    const timeParts: string[] = [];

    // Exact time check (e.g. 0 9 * * *)
    if (/^\d+$/.test(min) && /^\d+$/.test(hour)) {
      const h = parseInt(hour, 10);
      const m = parseInt(min, 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        timeParts.push(`At ${hh}:${mm}`);
      } else {
        return { text: '', isValid: false, error: 'Hour must be 0-23 and minute must be 0-59.' };
      }
    } else if (min === '*' && hour === '*') {
      timeParts.push('Every minute');
    } else if (min.startsWith('*/') && hour === '*') {
      const step = min.slice(2);
      timeParts.push(`Every ${step} minutes`);
    } else if (/^\d+$/.test(min) && hour === '*') {
      timeParts.push(`At minute ${min} past every hour`);
    } else if (min === '0' && hour.startsWith('*/')) {
      const step = hour.slice(2);
      timeParts.push(`Every ${step} hours`);
    } else {
      timeParts.push(`At minute ${min}, hour ${hour}`);
    }

    // Day of week
    if (dow === '1-5') {
      timeParts.push('Monday through Friday');
    } else if (dow === '0,6' || dow === '6,0') {
      timeParts.push('Saturday and Sunday');
    } else if (dow !== '*') {
      const dows = dow.split(',').map((d) => DOW_NAMES[d] || `Day ${d}`);
      timeParts.push(`on ${dows.join(' and ')}`);
    }

    // Day of month
    if (dom !== '*') {
      timeParts.push(`on day ${dom} of the month`);
    }

    // Month
    if (mon !== '*') {
      const months = mon.split(',').map((m) => {
        const idx = parseInt(m, 10);
        return MONTH_NAMES[idx] || `Month ${m}`;
      });
      timeParts.push(`in ${months.join(', ')}`);
    }

    let summary = timeParts.join(', ');
    summary = summary.charAt(0).toUpperCase() + summary.slice(1);
    if (!summary.endsWith('.')) summary += '.';

    return { text: summary, isValid: true, error: null };
  } catch {
    return { text: '', isValid: false, error: 'Invalid cron format.' };
  }
}

export const CronGenerator: React.FC = () => {
  const [expression, setExpression] = useState<string>('* * * * *');
  const [activeBuilderTab, setActiveBuilderTab] = useState<'presets' | 'custom'>('presets');

  // Interactive field states
  const [minuteField, setMinuteField] = useState<string>('*');
  const [hourField, setHourField] = useState<string>('*');
  const [domField, setDomField] = useState<string>('*');
  const [monField, setMonField] = useState<string>('*');
  const [dowField, setDowField] = useState<string>('*');

  // Synchronize interactive fields when expression changes
  const handleApplyPreset = (preset: CronPreset) => {
    setExpression(preset.expression);
    const parts = preset.expression.split(' ');
    if (parts.length === 5) {
      setMinuteField(parts[0]);
      setHourField(parts[1]);
      setDomField(parts[2]);
      setMonField(parts[3]);
      setDowField(parts[4]);
    }
  };

  const handleFieldUpdate = (field: 'min' | 'hour' | 'dom' | 'mon' | 'dow', val: string) => {
    let m = minuteField;
    let h = hourField;
    let d = domField;
    let mo = monField;
    let dw = dowField;

    if (field === 'min') {
      m = val;
      setMinuteField(val);
    } else if (field === 'hour') {
      h = val;
      setHourField(val);
    } else if (field === 'dom') {
      d = val;
      setDomField(val);
    } else if (field === 'mon') {
      mo = val;
      setMonField(val);
    } else if (field === 'dow') {
      dw = val;
      setDowField(val);
    }

    setExpression(`${m} ${h} ${d} ${mo} ${dw}`);
  };

  const handleReset = () => {
    setExpression('* * * * *');
    setMinuteField('*');
    setHourField('*');
    setDomField('*');
    setMonField('*');
    setDowField('*');
  };

  const explanation = useMemo(() => explainCron(expression), [expression]);
  const parts = expression.trim().split(/\s+/);

  return (
    <div className="space-y-6" id="tool-cron-generator">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Cron Expression Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Build and inspect standard 5-field cron schedules with human-readable descriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="cron-reset-btn"
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Expression & Explanation Display Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Generated Cron Expression
            </span>
            <div className="mt-1 flex items-center gap-3">
              <code
                id="cron-expression-display"
                className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-indigo-300 select-all"
              >
                {expression}
              </code>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <CopyButton text={expression} label="Copy Expression" />
          </div>
        </div>

        {/* Human Readable Translation */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Schedule Meaning
          </span>
          {explanation.isValid ? (
            <p
              id="cron-explanation-text"
              className="text-sm sm:text-base font-medium text-emerald-400 leading-relaxed flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{explanation.text}</span>
            </p>
          ) : (
            <p className="text-xs text-rose-400 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{explanation.error}</span>
            </p>
          )}
        </div>
      </div>

      {/* Direct Expression Input Field */}
      <div className="space-y-2">
        <label
          htmlFor="cron-raw-input"
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          Custom Cron String (5 fields: min hour dom mon dow)
        </label>
        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-950/60 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
          <input
            id="cron-raw-input"
            type="text"
            value={expression}
            onChange={(e) => {
              const val = e.target.value;
              setExpression(val);
              const p = val.trim().split(/\s+/);
              if (p.length === 5) {
                setMinuteField(p[0]);
                setHourField(p[1]);
                setDomField(p[2]);
                setMonField(p[3]);
                setDowField(p[4]);
              }
            }}
            aria-label="Direct cron expression input"
            placeholder="e.g. 0 9 * * 1-5"
            className="w-full p-3 font-mono text-sm sm:text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-0 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      {/* 5-Field Breakdown Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          5-Field Structure
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-center space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Minute</span>
            <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {parts[0] || '*'}
            </div>
            <span className="text-[10px] text-zinc-400">0 - 59</span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-center space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Hour</span>
            <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {parts[1] || '*'}
            </div>
            <span className="text-[10px] text-zinc-400">0 - 23</span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-center space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Day (Month)</span>
            <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {parts[2] || '*'}
            </div>
            <span className="text-[10px] text-zinc-400">1 - 31</span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-center space-y-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Month</span>
            <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {parts[3] || '*'}
            </div>
            <span className="text-[10px] text-zinc-400">1 - 12</span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-center space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Day (Week)</span>
            <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {parts[4] || '*'}
            </div>
            <span className="text-[10px] text-zinc-400">0 - 6 (Sun - Sat)</span>
          </div>
        </div>
      </div>

      {/* Common Presets Selector */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Common Schedule Presets</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRESETS.map((preset) => {
            const isSelected = expression === preset.expression;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {preset.description}
                  </div>
                </div>
                <code className="shrink-0 text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {preset.expression}
                </code>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variation Disclaimer Note */}
      <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Cron syntax can vary between systems:</strong> Unix/Linux crontab and standard cron use standard 5-field syntax (<code className="font-mono">min hour dom mon dow</code>). Extended engines like AWS EventBridge or Quartz may include seconds or year fields.
        </div>
      </div>
    </div>
  );
};
