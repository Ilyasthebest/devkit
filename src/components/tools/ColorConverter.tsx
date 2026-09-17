import React, { useState, useEffect } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Palette, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

// Conversions
function hexToRgb(hex: string): RGB | null {
  let clean = hex.replace(/^#/, '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(rgb: RGB): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

// Relative luminance for contrast
function getLuminance(rgb: RGB): number {
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

const PRESETS = [
  { name: 'Indigo 600', hex: '#4F46E5' },
  { name: 'Sky 500', hex: '#0EA5E9' },
  { name: 'Emerald 500', hex: '#10B981' },
  { name: 'Amber 500', hex: '#F59E0B' },
  { name: 'Rose 500', hex: '#F43F5E' },
  { name: 'Violet 500', hex: '#8B5CF6' },
  { name: 'Zinc 900', hex: '#18181B' },
];

export const ColorConverter: React.FC = () => {
  const [hexInput, setHexInput] = useState('#4F46E5');
  const [rgb, setRgb] = useState<RGB>({ r: 79, g: 70, b: 229 });
  const [hsl, setHsl] = useState<HSL>({ h: 243, s: 75, l: 59 });
  const [error, setError] = useState<string | null>(null);

  const updateFromRgb = (newRgb: RGB) => {
    setRgb(newRgb);
    setHexInput(rgbToHex(newRgb));
    setHsl(rgbToHsl(newRgb));
    setError(null);
  };

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const parsed = hexToRgb(value);
    if (parsed) {
      setRgb(parsed);
      setHsl(rgbToHsl(parsed));
      setError(null);
    } else {
      setError('Invalid HEX color code (must be #RGB or #RRGGBB).');
    }
  };

  const handleRgbChange = (channel: keyof RGB, val: number) => {
    const clamped = Math.max(0, Math.min(255, isNaN(val) ? 0 : val));
    const next = { ...rgb, [channel]: clamped };
    updateFromRgb(next);
  };

  const handleHslChange = (channel: keyof HSL, val: number) => {
    const max = channel === 'h' ? 360 : 100;
    const clamped = Math.max(0, Math.min(max, isNaN(val) ? 0 : val));
    const nextHsl = { ...hsl, [channel]: clamped };
    setHsl(nextHsl);
    const nextRgb = hslToRgb(nextHsl);
    setRgb(nextRgb);
    setHexInput(rgbToHex(nextRgb));
    setError(null);
  };

  const handleRandomColor = () => {
    const randomHex =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
    handleHexChange(randomHex);
  };

  const currentHex = rgbToHex(rgb);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;

  const contrastWhite = getContrast(rgb, { r: 255, g: 255, b: 255 });
  const contrastBlack = getContrast(rgb, { r: 0, g: 0, b: 0 });

  return (
    <div className="space-y-6" id="tool-color">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-500" />
            Color Converter & Inspector
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Convert seamlessly between HEX, RGB, RGBA, and HSL formats with live color preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="color-random-btn"
            type="button"
            onClick={handleRandomColor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Random Color
          </button>
        </div>
      </div>

      {/* Preset Swatches */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-zinc-400 shrink-0 font-medium">Presets:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset.hex}
            type="button"
            onClick={() => handleHexChange(preset.hex)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 cursor-pointer transition-all"
          >
            <span
              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: preset.hex }}
            />
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Preview & Picker */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="h-48 rounded-2xl border border-black/10 shadow-inner flex flex-col items-center justify-center relative overflow-hidden transition-colors"
            style={{ backgroundColor: currentHex }}
          >
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <label
                htmlFor="color-native-picker"
                className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all"
              >
                Pick Color
                <input
                  id="color-native-picker"
                  type="color"
                  value={currentHex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>

            <span
              className="font-mono text-xl font-bold tracking-wider px-3 py-1 rounded-lg backdrop-blur-xs select-all"
              style={{
                color: contrastWhite >= contrastBlack ? '#FFFFFF' : '#000000',
              }}
            >
              {currentHex}
            </span>
          </div>

          {/* WCAG Contrast check */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-xs text-zinc-400 font-medium">White Contrast</div>
              <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {contrastWhite}:1
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${
                  contrastWhite >= 4.5
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {contrastWhite >= 4.5 ? 'WCAG AA Pass' : 'Low Contrast'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-xs text-zinc-400 font-medium">Black Contrast</div>
              <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {contrastBlack}:1
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${
                  contrastBlack >= 4.5
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {contrastBlack >= 4.5 ? 'WCAG AA Pass' : 'Low Contrast'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Formats & Sliders */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formats Copy List */}
          <div className="space-y-2.5">
            {/* HEX */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  HEX Code
                </span>
                <input
                  id="color-hex-input"
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  aria-label="Hex color code"
                  className="w-full font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                />
              </div>
              <CopyButton id="color-copy-hex-btn" text={currentHex} label="Copy HEX" />
            </div>

            {/* RGB */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  RGB Format
                </span>
                <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {rgbString}
                </div>
              </div>
              <CopyButton id="color-copy-rgb-btn" text={rgbString} label="Copy RGB" />
            </div>

            {/* HSL */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  HSL Format
                </span>
                <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {hslString}
                </div>
              </div>
              <CopyButton id="color-copy-hsl-btn" text={hslString} label="Copy HSL" />
            </div>

            {/* CSS RGBA */}
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  RGBA (CSS)
                </span>
                <div className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {rgbaString}
                </div>
              </div>
              <CopyButton id="color-copy-rgba-btn" text={rgbaString} label="Copy RGBA" />
            </div>
          </div>

          {/* Sliders for fine tuning */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Channel Sliders
            </span>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono w-4 text-rose-500 font-bold">R</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-lg accent-rose-500 bg-zinc-200 dark:bg-zinc-700"
                />
                <span className="text-xs font-mono w-8 text-right text-zinc-500">{rgb.r}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono w-4 text-emerald-500 font-bold">G</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-lg accent-emerald-500 bg-zinc-200 dark:bg-zinc-700"
                />
                <span className="text-xs font-mono w-8 text-right text-zinc-500">{rgb.g}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono w-4 text-blue-500 font-bold">B</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-lg accent-blue-500 bg-zinc-200 dark:bg-zinc-700"
                />
                <span className="text-xs font-mono w-8 text-right text-zinc-500">{rgb.b}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
