import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Database, Wand2, Minimize2, Trash2, Sparkles, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const SAMPLE_SQL = `SELECT 
  u.id AS user_id, 
  u.username, 
  u.email, 
  COUNT(o.id) AS total_orders, 
  COALESCE(SUM(o.total_amount), 0) AS lifetime_spent, 
  CASE 
    WHEN COUNT(o.id) >= 10 THEN 'VIP' 
    WHEN COUNT(o.id) >= 3 THEN 'Regular' 
    ELSE 'New' 
  END AS customer_tier 
FROM users AS u 
LEFT JOIN orders AS o ON o.user_id = u.id AND o.status != 'cancelled' 
WHERE u.is_active = 1 
  AND u.created_at >= '2025-01-01' 
  AND u.country IN ('US', 'CA', 'GB', 'DE') 
GROUP BY u.id, u.username, u.email 
HAVING COUNT(o.id) > 0 
ORDER BY lifetime_spent DESC, total_orders DESC 
LIMIT 25;`;

type KeywordCasing = 'uppercase' | 'lowercase' | 'preserve';

// Keywords to recognize and format
const SQL_KEYWORDS = [
  'SELECT', 'DISTINCT', 'ALL', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'BETWEEN', 'EXISTS',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'VIEW', 'INDEX', 'ALTER', 'DROP', 'TRUNCATE', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'DEFAULT', 'CHECK', 'UNIQUE',
  'UNION', 'EXCEPT', 'INTERSECT',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AS', 'CAST',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'ROUND', 'LOWER', 'UPPER', 'TRIM', 'LENGTH', 'NOW',
  'WITH', 'RECURSIVE'
];

// Major clauses that trigger a new line
const MAJOR_CLAUSES = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'INSERT', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'DELETE',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'UNION ALL', 'UNION'
]);

// Join clauses that trigger a new line
const JOIN_CLAUSES = new Set([
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN'
]);

interface Token {
  type: 'word' | 'string' | 'comment' | 'punct' | 'whitespace';
  value: string;
}

function tokenizeSql(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const char = sql[i];

    // Single-line comment (-- ...)
    if (char === '-' && sql[i + 1] === '-') {
      let end = sql.indexOf('\n', i + 2);
      if (end === -1) end = len;
      tokens.push({ type: 'comment', value: sql.slice(i, end) });
      i = end;
      continue;
    }

    // Multi-line comment (/* ... */)
    if (char === '/' && sql[i + 1] === '*') {
      let end = sql.indexOf('*/', i + 2);
      if (end === -1) {
        end = len;
      } else {
        end += 2;
      }
      tokens.push({ type: 'comment', value: sql.slice(i, end) });
      i = end;
      continue;
    }

    // String literals ('...' or "..." or `...`)
    if (char === "'" || char === '"' || char === '`') {
      const quote = char;
      let val = quote;
      i++;
      while (i < len) {
        if (sql[i] === quote) {
          if (quote === "'" && sql[i + 1] === "'") {
            // Escaped quote in SQL
            val += "''";
            i += 2;
            continue;
          }
          val += quote;
          i++;
          break;
        }
        val += sql[i];
        i++;
      }
      tokens.push({ type: 'string', value: val });
      continue;
    }

    // Whitespace
    if (/\s/.test(char)) {
      let ws = '';
      while (i < len && /\s/.test(sql[i])) {
        ws += sql[i];
        i++;
      }
      tokens.push({ type: 'whitespace', value: ws });
      continue;
    }

    // Punctuation & Operators
    if (/[(),;=<>!+*/-]/.test(char)) {
      // Check for multi-char operators like !=, <=, >=, <>
      const next = sql[i + 1] || '';
      const two = char + next;
      if (['!=', '<=', '>=', '<>'].includes(two)) {
        tokens.push({ type: 'punct', value: two });
        i += 2;
        continue;
      }
      tokens.push({ type: 'punct', value: char });
      i++;
      continue;
    }

    // Word (Identifier or Keyword)
    let word = '';
    while (i < len && /[a-zA-Z0-9_.]/.test(sql[i])) {
      word += sql[i];
      i++;
    }
    if (word) {
      tokens.push({ type: 'word', value: word });
      continue;
    }

    // Fallback single character
    tokens.push({ type: 'punct', value: char });
    i++;
  }

  return tokens;
}

function formatSqlString(sql: string, indentUnit: string, casing: KeywordCasing): string {
  if (!sql.trim()) return '';

  const rawTokens = tokenizeSql(sql);
  // Filter out pure whitespace tokens for controlled indentation
  const tokens: Token[] = [];
  for (const t of rawTokens) {
    if (t.type !== 'whitespace') {
      tokens.push(t);
    }
  }

  const keywordMap = new Map<string, string>();
  for (const kw of SQL_KEYWORDS) {
    keywordMap.set(kw.toUpperCase(), kw);
  }

  let formatted = '';
  let indentLevel = 0;
  let inParentheses = 0;
  let newlinePending = false;
  let needSpace = false;

  const getIndent = (lvl = indentLevel) => indentUnit.repeat(Math.max(0, lvl));

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    if (token.type === 'comment') {
      if (formatted.length > 0 && !formatted.endsWith('\n')) {
        formatted += '\n';
      }
      formatted += getIndent() + token.value.trim() + '\n';
      newlinePending = true;
      needSpace = false;
      continue;
    }

    if (token.type === 'word') {
      let wordUpper = token.value.toUpperCase();
      let nextUpper = nextToken?.type === 'word' ? nextToken.value.toUpperCase() : '';

      // Check compound clauses: e.g. "GROUP BY", "ORDER BY", "LEFT JOIN", "INNER JOIN", "INSERT INTO", "UNION ALL"
      let compound = '';
      if (['GROUP', 'ORDER', 'PARTITION'].includes(wordUpper) && nextUpper === 'BY') {
        compound = `${wordUpper} BY`;
      } else if (['LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS'].includes(wordUpper) && nextUpper === 'JOIN') {
        compound = `${wordUpper} JOIN`;
      } else if (wordUpper === 'INSERT' && nextUpper === 'INTO') {
        compound = 'INSERT INTO';
      } else if (wordUpper === 'DELETE' && nextUpper === 'FROM') {
        compound = 'DELETE FROM';
      } else if (wordUpper === 'UNION' && nextUpper === 'ALL') {
        compound = 'UNION ALL';
      } else if (['CREATE', 'ALTER', 'DROP'].includes(wordUpper) && ['TABLE', 'VIEW', 'INDEX'].includes(nextUpper)) {
        compound = `${wordUpper} ${nextUpper}`;
      }

      // Determine casing for the word
      let displayWord = token.value;
      if (keywordMap.has(wordUpper)) {
        if (casing === 'uppercase') displayWord = wordUpper;
        else if (casing === 'lowercase') displayWord = wordUpper.toLowerCase();
      }

      // Check if this triggers a major clause newline
      if (MAJOR_CLAUSES.has(compound || wordUpper)) {
        if (formatted.length > 0) {
          formatted = formatted.trimEnd() + '\n';
        }
        formatted += getIndent();
        formatted += displayWord;
        needSpace = true;
        continue;
      }

      if (JOIN_CLAUSES.has(compound || wordUpper)) {
        if (formatted.length > 0) {
          formatted = formatted.trimEnd() + '\n';
        }
        formatted += getIndent(indentLevel) + displayWord;
        needSpace = true;
        continue;
      }

      if (wordUpper === 'AND' || wordUpper === 'OR') {
        if (inParentheses === 0 && formatted.length > 0) {
          formatted = formatted.trimEnd() + '\n' + getIndent(indentLevel + 1);
        } else if (needSpace) {
          formatted += ' ';
        }
        formatted += displayWord;
        needSpace = true;
        continue;
      }

      if (wordUpper === 'CASE') {
        if (needSpace) formatted += ' ';
        formatted += displayWord;
        indentLevel++;
        needSpace = true;
        continue;
      }

      if (wordUpper === 'END') {
        indentLevel = Math.max(0, indentLevel - 1);
        if (needSpace) formatted += ' ';
        formatted += displayWord;
        needSpace = true;
        continue;
      }

      if (wordUpper === 'WHEN' || wordUpper === 'ELSE') {
        if (formatted.length > 0) {
          formatted = formatted.trimEnd() + '\n' + getIndent(indentLevel);
        }
        formatted += displayWord;
        needSpace = true;
        continue;
      }

      if (newlinePending) {
        formatted += getIndent();
        newlinePending = false;
      } else if (needSpace) {
        formatted += ' ';
      }

      formatted += displayWord;
      needSpace = true;
      continue;
    }

    if (token.type === 'string') {
      if (newlinePending) {
        formatted += getIndent();
        newlinePending = false;
      } else if (needSpace) {
        formatted += ' ';
      }
      formatted += token.value;
      needSpace = true;
      continue;
    }

    if (token.type === 'punct') {
      if (token.value === '(') {
        if (needSpace && !formatted.endsWith('(') && !formatted.endsWith(' ')) {
          formatted += ' ';
        }
        formatted += '(';
        inParentheses++;
        needSpace = false;
        continue;
      }

      if (token.value === ')') {
        inParentheses = Math.max(0, inParentheses - 1);
        formatted += ')';
        needSpace = true;
        continue;
      }

      if (token.value === ',') {
        formatted += ',';
        if (inParentheses === 0) {
          formatted += '\n' + getIndent(indentLevel + 1);
          needSpace = false;
        } else {
          formatted += ' ';
          needSpace = false;
        }
        continue;
      }

      if (token.value === ';') {
        formatted += ';';
        formatted += '\n';
        newlinePending = true;
        needSpace = false;
        continue;
      }

      // Operators (=, !=, <, >, <=, >=, etc.)
      if (['=', '!=', '<>', '<', '>', '<=', '>='].includes(token.value)) {
        if (!formatted.endsWith(' ')) formatted += ' ';
        formatted += token.value + ' ';
        needSpace = false;
        continue;
      }

      if (needSpace && token.value !== '.') {
        formatted += ' ';
      }
      formatted += token.value;
      needSpace = token.value !== '.';
    }
  }

  return formatted.trim();
}

function minifySqlString(sql: string): string {
  if (!sql.trim()) return '';
  const tokens = tokenizeSql(sql);
  let minified = '';
  let prevType: Token['type'] | null = null;
  let prevVal = '';

  for (const token of tokens) {
    // Strip comments completely
    if (token.type === 'comment' || token.type === 'whitespace') {
      continue;
    }

    if (token.type === 'word' || token.type === 'string') {
      if (prevType === 'word' || prevType === 'string') {
        minified += ' ';
      }
      minified += token.value;
      prevType = token.type;
      prevVal = token.value;
      continue;
    }

    if (token.type === 'punct') {
      // Only add space if needed to avoid token merging (e.g. word followed by another word)
      if (['=', '!=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/'].includes(token.value)) {
        minified += token.value;
      } else {
        minified += token.value;
      }
      prevType = token.type;
      prevVal = token.value;
    }
  }

  return minified.trim();
}

export const SqlFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState<'2' | '4' | 'tab'>('2');
  const [casing, setCasing] = useState<KeywordCasing>('uppercase');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string; details?: string }>({
    type: 'idle',
    message: '',
  });

  const getIndentString = () => {
    if (indentSize === 'tab') return '\t';
    return ' '.repeat(Number(indentSize));
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty. Please enter some SQL to format.' });
      setOutput('');
      return;
    }

    try {
      const formatted = formatSqlString(input, getIndentString(), casing);
      setOutput(formatted);
      const lineCount = formatted.split('\n').length;
      setStatus({
        type: 'success',
        message: 'SQL Formatted',
        details: `${lineCount} lines • ${formatted.length} characters`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Formatting failed',
        details: error.message || 'Check your SQL syntax for unclosed strings or quotes.',
      });
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty. Please enter some SQL to minify.' });
      setOutput('');
      return;
    }

    try {
      const minified = minifySqlString(input);
      setOutput(minified);
      const savings = Math.max(0, input.length - minified.length);
      const percent = input.length > 0 ? Math.round((savings / input.length) * 100) : 0;
      setStatus({
        type: 'success',
        message: 'SQL Minified',
        details: `${minified.length} chars (saved ${savings} bytes, -${percent}%)`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Minification failed',
        details: error.message,
      });
    }
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_SQL);
    try {
      const formatted = formatSqlString(SAMPLE_SQL, getIndentString(), casing);
      setOutput(formatted);
      setStatus({
        type: 'success',
        message: 'Sample Query Loaded',
        details: 'Ready to edit or reformat',
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
    <div className="space-y-6" id="tool-sql-formatter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            SQL Formatter & Minifier
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Format, beautify, and minify SQL queries with keyword casing and clause indentation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="sql-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="sql-clear-btn"
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
            id="sql-format-btn"
            type="button"
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Format SQL
          </button>

          <button
            id="sql-minify-btn"
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify SQL
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Keywords:</span>
            <select
              value={casing}
              onChange={(e) => setCasing(e.target.value as KeywordCasing)}
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
            >
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="preserve">Preserve</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span>Indent:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(e.target.value as '2' | '4' | 'tab')}
              className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-zinc-200"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>
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
            <span className="font-semibold uppercase tracking-wider text-[11px]">SQL Input</span>
            <span className="font-mono">
              {input.length} chars • {input ? input.split('\n').length : 0} lines
            </span>
          </div>
          <textarea
            id="sql-input-editor"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (status.message) setStatus({ type: 'idle', message: '' });
            }}
            placeholder="Paste your raw SQL query here (SELECT, INSERT, UPDATE, DELETE, CREATE, JOIN, etc.)..."
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Formatted Output</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {output.length} chars • {output ? output.split('\n').length : 0} lines
              </span>
              <CopyButton text={output} id="sql-copy-btn" />
            </div>
          </div>
          <textarea
            id="sql-output-editor"
            value={output}
            readOnly
            placeholder="Formatted SQL output will appear here..."
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
          />
        </div>
      </div>

      {/* Safety & Privacy Notice */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Local SQL Formatter:</strong> Queries are formatted entirely client-side. DevKit does not connect to any database or transmit your queries over the network.
        </span>
      </div>
    </div>
  );
};
