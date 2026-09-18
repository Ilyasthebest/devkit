import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  Calculator,
  Trash2,
  Sparkles,
  AlertCircle,
  Binary,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';

type BaseType = 2 | 8 | 10 | 16;

interface BaseDef {
  radix: BaseType;
  name: string;
  shortName: string;
  prefix: string;
  regex: RegExp;
  cleanRegex: RegExp;
  placeholder: string;
  sample: string;
}

const BASES: Record<BaseType, BaseDef> = {
  10: {
    radix: 10,
    name: 'Decimal (Base 10)',
    shortName: 'Decimal',
    prefix: '',
    regex: /^-?[0-9]+$/,
    cleanRegex: /^-?[0-9]+$/,
    placeholder: 'e.g. 255 or 1048576',
    sample: '255',
  },
  2: {
    radix: 2,
    name: 'Binary (Base 2)',
    shortName: 'Binary',
    prefix: '0b',
    regex: /^-?[01]+$/,
    cleanRegex: /^-?[01]+$/,
    placeholder: 'e.g. 11111111',
    sample: '11111111',
  },
  16: {
    radix: 16,
    name: 'Hexadecimal (Base 16)',
    shortName: 'Hexadecimal',
    prefix: '0x',
    regex: /^-?[0-9a-fA-F]+$/,
    cleanRegex: /^-?[0-9a-fA-F]+$/,
    placeholder: 'e.g. FF or 1A3F',
    sample: 'FF',
  },
  8: {
    radix: 8,
    name: 'Octal (Base 8)',
    shortName: 'Octal',
    prefix: '0o',
    regex: /^-?[0-7]+$/,
    cleanRegex: /^-?[0-7]+$/,
    placeholder: 'e.g. 377',
    sample: '377',
  },
};

// Format binary into 4-bit nibbles for readability
function formatBinary(bin: string): string {
  const isNeg = bin.startsWith('-');
  const raw = isNeg ? bin.slice(1) : bin;
  const reversed = raw.split('').reverse();
  const chunks: string[] = [];
  for (let i = 0; i < reversed.length; i += 4) {
    chunks.push(reversed.slice(i, i + 4).reverse().join(''));
  }
  const formatted = chunks.reverse().join(' ');
  return isNeg ? `-${formatted}` : formatted;
}

// Format decimal with commas
function formatDecimal(dec: string): string {
  const isNeg = dec.startsWith('-');
  const raw = isNeg ? dec.slice(1) : dec;
  const parts = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return isNeg ? `-${parts}` : parts;
}

// Format hex in pairs of two characters
function formatHex(hex: string): string {
  const isNeg = hex.startsWith('-');
  const raw = (isNeg ? hex.slice(1) : hex).toUpperCase();
  const reversed = raw.split('').reverse();
  const chunks: string[] = [];
  for (let i = 0; i < reversed.length; i += 2) {
    chunks.push(reversed.slice(i, i + 2).reverse().join(''));
  }
  const formatted = chunks.reverse().join(' ');
  return isNeg ? `-${formatted}` : formatted;
}

export const NumberBaseConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [fromBase, setFromBase] = useState<BaseType>(10);
  const [toBase, setToBase] = useState<BaseType>(2);
  const [groupDigits, setGroupDigits] = useState<boolean>(true);

  // Conversion engine with BigInt
  const conversion = useMemo(() => {
    const raw = inputValue.trim();
    if (!raw) {
      return {
        isEmpty: true,
        error: null,
        decimal: '',
        binary: '',
        octal: '',
        hex: '',
        bigIntValue: null,
        bitsCount: 0,
      };
    }

    // Strip common prefixes like 0x, 0b, 0o if user pasted them
    let clean = raw;
    let isNegative = false;
    if (clean.startsWith('-')) {
      isNegative = true;
      clean = clean.slice(1);
    }

    if (fromBase === 16 && (clean.startsWith('0x') || clean.startsWith('0X'))) {
      clean = clean.slice(2);
    } else if (fromBase === 2 && (clean.startsWith('0b') || clean.startsWith('0B'))) {
      clean = clean.slice(2);
    } else if (fromBase === 8 && (clean.startsWith('0o') || clean.startsWith('0O'))) {
      clean = clean.slice(2);
    }

    // Remove internal spaces/underscores users might type for formatting
    clean = clean.replace(/[\s_,]/g, '');

    if (!clean) {
      return {
        isEmpty: false,
        error: 'Please enter a number.',
        decimal: '',
        binary: '',
        octal: '',
        hex: '',
        bigIntValue: null,
        bitsCount: 0,
      };
    }

    const signedClean = isNegative ? `-${clean}` : clean;

    // Validate characters against current base
    const baseInfo = BASES[fromBase];
    if (!baseInfo.regex.test(signedClean)) {
      let specificError = '';
      if (fromBase === 2) {
        specificError = "Invalid binary number: only digits '0' and '1' are allowed.";
      } else if (fromBase === 8) {
        specificError = "Invalid octal number: only digits '0' through '7' are allowed.";
      } else if (fromBase === 10) {
        specificError = "Invalid decimal number: only digits '0' through '9' are allowed.";
      } else if (fromBase === 16) {
        specificError = "Invalid hexadecimal number: only '0-9' and 'a-f' (or 'A-F') are allowed.";
      }
      return {
        isEmpty: false,
        error: specificError,
        decimal: '',
        binary: '',
        octal: '',
        hex: '',
        bigIntValue: null,
        bitsCount: 0,
      };
    }

    try {
      // Parse with BigInt using appropriate prefix
      let bigIntVal: bigint;
      if (fromBase === 10) {
        bigIntVal = BigInt(signedClean);
      } else if (fromBase === 16) {
        bigIntVal = BigInt(`${isNegative ? '-' : ''}0x${clean}`);
      } else if (fromBase === 2) {
        bigIntVal = BigInt(`${isNegative ? '-' : ''}0b${clean}`);
      } else {
        bigIntVal = BigInt(`${isNegative ? '-' : ''}0o${clean}`);
      }

      // Format to all 4 bases
      const decStr = bigIntVal.toString(10);
      const binStr = bigIntVal.toString(2);
      const octStr = bigIntVal.toString(8);
      const hexStr = bigIntVal.toString(16).toUpperCase();

      // Estimate bit length (absolute value)
      const absBigInt = bigIntVal < 0n ? -bigIntVal : bigIntVal;
      const bitsCount = absBigInt === 0n ? 1 : absBigInt.toString(2).length;

      return {
        isEmpty: false,
        error: null,
        decimal: decStr,
        binary: binStr,
        octal: octStr,
        hex: hexStr,
        bigIntValue: bigIntVal,
        bitsCount,
      };
    } catch {
      return {
        isEmpty: false,
        error: `Could not parse ${signedClean} as ${baseInfo.shortName}.`,
        decimal: '',
        binary: '',
        octal: '',
        hex: '',
        bigIntValue: null,
        bitsCount: 0,
      };
    }
  }, [inputValue, fromBase]);

  const handleClear = () => {
    setInputValue('');
  };

  const handleLoadSample = () => {
    setInputValue(BASES[fromBase].sample);
  };

  const handleSwapBases = () => {
    const prevFrom = fromBase;
    const prevTo = toBase;
    setFromBase(prevTo);
    setToBase(prevFrom);

    // If we have a valid converted value for the new fromBase, populate it!
    if (!conversion.isEmpty && !conversion.error) {
      if (prevTo === 10) setInputValue(conversion.decimal);
      else if (prevTo === 2) setInputValue(conversion.binary);
      else if (prevTo === 16) setInputValue(conversion.hex);
      else if (prevTo === 8) setInputValue(conversion.octal);
    }
  };

  // Get result for the dedicated "To Base" view
  const toBaseResult = useMemo(() => {
    if (conversion.isEmpty || conversion.error) return '';
    switch (toBase) {
      case 10:
        return groupDigits ? formatDecimal(conversion.decimal) : conversion.decimal;
      case 2:
        return groupDigits ? formatBinary(conversion.binary) : conversion.binary;
      case 8:
        return conversion.octal;
      case 16:
        return groupDigits ? formatHex(conversion.hex) : conversion.hex;
      default:
        return '';
    }
  }, [conversion, toBase, groupDigits]);

  return (
    <div className="space-y-6" id="tool-number-base">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Number Base Converter
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Convert numbers across Binary, Decimal, Octal, and Hexadecimal with arbitrary BigInt precision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="base-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="base-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* From / To Base Selectors and Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="from-base-select" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              From:
            </label>
            <select
              id="from-base-select"
              value={fromBase}
              onChange={(e) => setFromBase(Number(e.target.value) as BaseType)}
              aria-label="From number base"
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value={10}>Decimal (10)</option>
              <option value={2}>Binary (2)</option>
              <option value={16}>Hexadecimal (16)</option>
              <option value={8}>Octal (8)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwapBases}
            title="Swap source and target base"
            aria-label="Swap source and target base"
            className="p-1.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="to-base-select" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              To:
            </label>
            <select
              id="to-base-select"
              value={toBase}
              onChange={(e) => setToBase(Number(e.target.value) as BaseType)}
              aria-label="To number base"
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value={2}>Binary (2)</option>
              <option value={10}>Decimal (10)</option>
              <option value={16}>Hexadecimal (16)</option>
              <option value={8}>Octal (8)</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={groupDigits}
            onChange={(e) => setGroupDigits(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Group digits (nibbles / commas)</span>
        </label>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="number-base-input"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
          >
            <span>Input Value ({BASES[fromBase].name})</span>
            {BASES[fromBase].prefix && (
              <span className="text-[10px] text-zinc-400 font-mono">
                Prefix: {BASES[fromBase].prefix}
              </span>
            )}
          </label>
        </div>

        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-950/60 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
          <input
            id="number-base-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label={`Input number in ${BASES[fromBase].shortName}`}
            placeholder={BASES[fromBase].placeholder}
            className="w-full p-3.5 font-mono text-base sm:text-lg text-zinc-900 dark:text-zinc-100 bg-transparent border-0 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Validation Error */}
      {conversion.error && (
        <div
          id="number-base-error-banner"
          className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 font-medium">{conversion.error}</div>
        </div>
      )}

      {/* Dedicated Target Base Card */}
      {!conversion.error && !conversion.isEmpty && (
        <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Target Output: {BASES[toBase].name}
            </span>
            <CopyButton text={toBaseResult.replace(/\s+/g, '')} label={`Copy ${BASES[toBase].shortName}`} />
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold text-zinc-900 dark:text-white break-all select-all">
            {toBaseResult}
          </div>
        </div>
      )}

      {/* Simultaneous 4-Base Conversion Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Simultaneous Base Matrix
          </h3>
          {!conversion.isEmpty && !conversion.error && (
            <span className="text-[11px] text-zinc-400 font-mono">
              Integer bit width: {conversion.bitsCount} bits
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Decimal */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Decimal (Base 10)
              </span>
              {conversion.decimal && (
                <CopyButton text={conversion.decimal} label="Copy Dec" />
              )}
            </div>
            <div className="font-mono text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 break-all select-all min-h-[28px]">
              {conversion.decimal ? (
                groupDigits ? formatDecimal(conversion.decimal) : conversion.decimal
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600 font-normal italic text-xs">Waiting for input...</span>
              )}
            </div>
          </div>

          {/* Hexadecimal */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <span>Hexadecimal (Base 16)</span>
                <span className="text-[10px] text-zinc-400 font-mono">0x</span>
              </span>
              {conversion.hex && (
                <CopyButton text={conversion.hex} label="Copy Hex" />
              )}
            </div>
            <div className="font-mono text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 break-all select-all min-h-[28px]">
              {conversion.hex ? (
                groupDigits ? formatHex(conversion.hex) : conversion.hex
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600 font-normal italic text-xs">Waiting for input...</span>
              )}
            </div>
          </div>

          {/* Binary */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <span>Binary (Base 2)</span>
                <span className="text-[10px] text-zinc-400 font-mono">0b</span>
              </span>
              {conversion.binary && (
                <CopyButton text={conversion.binary} label="Copy Bin" />
              )}
            </div>
            <div className="font-mono text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 break-all select-all min-h-[28px]">
              {conversion.binary ? (
                groupDigits ? formatBinary(conversion.binary) : conversion.binary
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600 font-normal italic text-xs">Waiting for input...</span>
              )}
            </div>
          </div>

          {/* Octal */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <span>Octal (Base 8)</span>
                <span className="text-[10px] text-zinc-400 font-mono">0o</span>
              </span>
              {conversion.octal && (
                <CopyButton text={conversion.octal} label="Copy Oct" />
              )}
            </div>
            <div className="font-mono text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 break-all select-all min-h-[28px]">
              {conversion.octal || (
                <span className="text-zinc-400 dark:text-zinc-600 font-normal italic text-xs">Waiting for input...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
