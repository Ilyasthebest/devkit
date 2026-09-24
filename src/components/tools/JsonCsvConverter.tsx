import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  FileSpreadsheet,
  ArrowRightLeft,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';

type Direction = 'json-to-csv' | 'csv-to-json';

const SAMPLE_JSON = `[
  {
    "id": 101,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "Lead Engineer",
    "department": "Infrastructure",
    "active": true
  },
  {
    "id": 102,
    "name": "Bob Smith",
    "email": "bob@example.com",
    "role": "Product Manager",
    "department": "Growth",
    "active": true
  },
  {
    "id": 103,
    "name": "Carol Danvers",
    "email": "carol@example.com",
    "role": "Security Specialist",
    "department": "Security",
    "active": false
  }
]`;

const SAMPLE_CSV = `id,name,email,role,department,active
101,"Alice Johnson",alice@example.com,"Lead Engineer",Infrastructure,true
102,"Bob Smith",bob@example.com,"Product Manager",Growth,true
103,"Carol Danvers",carol@example.com,"Security Specialist",Security,false`;

/**
 * Robust CSV parser that handles quotes, escaped quotes (""), commas, and newlines inside quoted fields.
 */
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  const len = csvText.length;

  while (i < len) {
    const char = csvText[i];
    const nextChar = csvText[i + 1] || '';

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (!inQuotes && char === ',') {
      currentRow.push(currentField);
      currentField = '';
      i++;
      continue;
    }

    if (!inQuotes && (char === '\r' || char === '\n')) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      currentField = '';
      // Only push non-empty rows or if it has columns
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  // Push final field and row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Escapes a single CSV field value
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If string contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts JSON string (array of objects) to CSV text
 */
function jsonToCsv(jsonStr: string): { csv: string; rowCount: number; colCount: number } {
  const parsed = JSON.parse(jsonStr);

  if (!Array.isArray(parsed)) {
    throw new Error('Input must be a JSON array of objects (e.g. [{"id": 1, "name": "Alice"}, ...]).');
  }

  if (parsed.length === 0) {
    return { csv: '', rowCount: 0, colCount: 0 };
  }

  // Check for primitive arrays
  if (typeof parsed[0] !== 'object' || parsed[0] === null) {
    throw new Error('Array elements must be JSON objects with key-value pairs, not primitives.');
  }

  // Check for unsupported deep nested structures
  for (let idx = 0; idx < parsed.length; idx++) {
    const item = parsed[idx];
    if (typeof item !== 'object' || item === null) {
      throw new Error(`Row ${idx + 1} is not a valid JSON object.`);
    }

    for (const [key, val] of Object.entries(item)) {
      if (typeof val === 'object' && val !== null) {
        // Nested array of objects or deep object
        throw new Error(
          `Unsupported nested JSON structure in row ${idx + 1} at property "${key}". CSV format only supports flat scalar values (strings, numbers, booleans, null).`
        );
      }
    }
  }

  // Collect all unique keys across all objects
  const headersSet = new Set<string>();
  for (const item of parsed) {
    Object.keys(item).forEach((k) => headersSet.add(k));
  }
  const headers = Array.from(headersSet);

  // Build CSV rows
  const lines: string[] = [];
  // Header line
  lines.push(headers.map((h) => escapeCsvValue(h)).join(','));

  // Data lines
  for (const item of parsed) {
    const row = headers.map((header) => {
      const val = item[header];
      return escapeCsvValue(val);
    });
    lines.push(row.join(','));
  }

  return {
    csv: lines.join('\n'),
    rowCount: parsed.length,
    colCount: headers.length,
  };
}

/**
 * Converts CSV text to formatted JSON array of objects
 */
function csvToJson(csvStr: string, parseTypes = true): { json: string; rowCount: number; colCount: number } {
  const rows = parseCsv(csvStr.trim());
  if (rows.length === 0) {
    return { json: '[]', rowCount: 0, colCount: 0 };
  }

  const headers = rows[0].map((h) => h.trim());
  if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
    throw new Error('CSV does not contain any valid headers on the first line.');
  }

  const result: Record<string, any>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // Skip empty lines at bottom
    if (row.length === 1 && row[0] === '') continue;

    const obj: Record<string, any> = {};
    for (let c = 0; c < headers.length; c++) {
      const headerName = headers[c] || `col_${c + 1}`;
      const rawVal = row[c] !== undefined ? row[c] : '';

      if (parseTypes) {
        if (rawVal === '') {
          obj[headerName] = null;
        } else if (rawVal.toLowerCase() === 'true') {
          obj[headerName] = true;
        } else if (rawVal.toLowerCase() === 'false') {
          obj[headerName] = false;
        } else if (rawVal.toLowerCase() === 'null') {
          obj[headerName] = null;
        } else if (!isNaN(Number(rawVal)) && rawVal.trim() !== '') {
          obj[headerName] = Number(rawVal);
        } else {
          obj[headerName] = rawVal;
        }
      } else {
        obj[headerName] = rawVal;
      }
    }
    result.push(obj);
  }

  return {
    json: JSON.stringify(result, null, 2),
    rowCount: result.length,
    colCount: headers.length,
  };
}

export const JsonCsvConverter: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('json-to-csv');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parseTypes, setParseTypes] = useState(true);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string; details?: string }>({
    type: 'idle',
    message: '',
  });

  const handleConvert = () => {
    if (!input.trim()) {
      setStatus({
        type: 'error',
        message: 'Input is empty. Please enter data to convert.',
      });
      setOutput('');
      return;
    }

    try {
      if (direction === 'json-to-csv') {
        const { csv, rowCount, colCount } = jsonToCsv(input);
        setOutput(csv);
        setStatus({
          type: 'success',
          message: 'Converted to CSV successfully',
          details: `${rowCount} rows • ${colCount} columns`,
        });
      } else {
        const { json, rowCount, colCount } = csvToJson(input, parseTypes);
        setOutput(json);
        setStatus({
          type: 'success',
          message: 'Converted to JSON successfully',
          details: `${rowCount} objects • ${colCount} properties`,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Conversion failed',
        details: error.message || 'Unable to parse input data.',
      });
    }
  };

  const handleSwitchDirection = () => {
    const nextDir = direction === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv';
    setDirection(nextDir);
    // If output is present, swap it to input
    if (output) {
      setInput(output);
      setOutput('');
    }
    setStatus({ type: 'idle', message: '' });
  };

  const handleLoadSample = () => {
    if (direction === 'json-to-csv') {
      setInput(SAMPLE_JSON);
      try {
        const { csv, rowCount, colCount } = jsonToCsv(SAMPLE_JSON);
        setOutput(csv);
        setStatus({
          type: 'success',
          message: 'Sample JSON Loaded & Converted',
          details: `${rowCount} rows • ${colCount} columns`,
        });
      } catch {
        // noop
      }
    } else {
      setInput(SAMPLE_CSV);
      try {
        const { json, rowCount, colCount } = csvToJson(SAMPLE_CSV, parseTypes);
        setOutput(json);
        setStatus({
          type: 'success',
          message: 'Sample CSV Loaded & Converted',
          details: `${rowCount} objects • ${colCount} properties`,
        });
      } catch {
        // noop
      }
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const isCsv = direction === 'json-to-csv';
    const filename = isCsv ? 'data.csv' : 'data.json';
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="space-y-6" id="tool-json-csv">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            JSON ↔ CSV Converter
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Convert structured JSON arrays to CSV spreadsheets and parse tabular CSV back into clean JSON.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="json-csv-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="json-csv-clear-btn"
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
          {/* Direction Selector */}
          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
            <button
              type="button"
              onClick={() => {
                setDirection('json-to-csv');
                setStatus({ type: 'idle', message: '' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                direction === 'json-to-csv'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              JSON → CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection('csv-to-json');
                setStatus({ type: 'idle', message: '' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                direction === 'csv-to-json'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              CSV → JSON
            </button>
          </div>

          <button
            id="json-csv-switch-btn"
            type="button"
            onClick={handleSwitchDirection}
            title="Switch conversion direction"
            className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <button
            id="json-csv-convert-btn"
            type="button"
            onClick={handleConvert}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Convert
          </button>

          {output && (
            <button
              id="json-csv-download-btn"
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download {direction === 'json-to-csv' ? '.csv' : '.json'}
            </button>
          )}
        </div>

        {/* Options */}
        {direction === 'csv-to-json' && (
          <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={parseTypes}
              onChange={(e) => setParseTypes(e.target.checked)}
              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Auto-detect numbers & booleans</span>
          </label>
        )}
      </div>

      {/* Status Feedback Banner */}
      {status.message && (
        <div
          className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : status.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : status.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            ) : null}
            <span className="font-semibold">{status.message}</span>
            {status.details && <span className="text-zinc-500 dark:text-zinc-400 font-mono">({status.details})</span>}
          </div>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {direction === 'json-to-csv' ? 'JSON Input (Array of Objects)' : 'CSV Input'}
            </span>
            <span className="font-mono">
              {input.length} chars • {input ? input.split('\n').length : 0} lines
            </span>
          </div>
          <textarea
            id="json-csv-input-editor"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (status.message) setStatus({ type: 'idle', message: '' });
            }}
            placeholder={
              direction === 'json-to-csv'
                ? 'Paste a JSON array of objects here: [{"name": "Alice", "age": 25}, ...]'
                : 'Paste comma-separated CSV text here with column headers on the first line...'
            }
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {direction === 'json-to-csv' ? 'CSV Output' : 'JSON Output'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {output.length} chars • {output ? output.split('\n').length : 0} lines
              </span>
              <CopyButton text={output} id="json-csv-copy-btn" />
            </div>
          </div>
          <textarea
            id="json-csv-output-editor"
            value={output}
            readOnly
            placeholder="Converted output will appear here..."
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
          />
        </div>
      </div>

      {/* Local Safety Notice */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Private Conversion:</strong> All JSON and CSV parsing executes 100% locally in your browser memory. Data is never uploaded to any external server.
        </span>
      </div>
    </div>
  );
};
