import React, { useState } from 'react';
import { CopyButton } from '../common/CopyButton';
import { Braces, Wand2, Minimize2, Trash2, ArrowLeftRight, Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

type SupportedLanguage = 'html' | 'css' | 'javascript';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevKit Example</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<header class="site-header">
<h1>Welcome to DevKit</h1>
<nav>
<ul>
<li><a href="#home">Home</a></li>
<li><a href="#tools">Tools</a></li>
<li><a href="#about">About</a></li>
</ul>
</nav>
</header>
<main>
<section class="hero">
<h2>Browser-Based Developer Utilities</h2>
<p>Fast, secure, and private developer tools that run 100% locally.</p>
<button type="button" class="btn btn-primary">Get Started</button>
</section>
</main>
</body>
</html>`;

const SAMPLE_CSS = `:root {
--primary-color: #6366f1;
--secondary-color: #a855f7;
--bg-dark: #09090b;
--text-light: #f4f4f5;
}

body {
margin: 0;
padding: 0;
font-family: system-ui, -apple-system, sans-serif;
background-color: var(--bg-dark);
color: var(--text-light);
line-height: 1.6;
}

.site-header {
display: flex;
align-items: center;
justify-content: space-between;
padding: 1rem 2rem;
border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
.site-header {
flex-direction: column;
padding: 1rem;
}
.hero h2 {
font-size: 1.5rem;
}
}`;

const SAMPLE_JS = `// DevKit Utilities Demo
const appConfig = {
  name: "DevKit",
  version: "4.0.0",
  features: ["Formatting", "Encoding", "Conversion", "Testing"],
  isClientSide: true
};

function processPayload(data, options = {}) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid payload provided to processor");
  }
  
  const entries = Object.entries(data);
  const result = entries.map(([key, value]) => {
    return {
      field: key,
      valueType: typeof value,
      encoded: String(value).toUpperCase()
    };
  });
  
  return {
    processedAt: Date.now(),
    items: result,
    count: result.length
  };
}

console.log("Initialized successfully");`;

// HTML Formatter / Minifier
const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

function formatHtml(html: string, indent: string): string {
  if (!html.trim()) return '';
  // Tokenize tags and text
  const tagRegex = /(<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<[^>]+>|[^<]+)/gi;
  const matches = html.match(tagRegex) || [];
  let formatted = '';
  let level = 0;

  for (let raw of matches) {
    const token = raw.trim();
    if (!token) continue;

    // Doctype or Comment
    if (token.startsWith('<!DOCTYPE') || token.startsWith('<!--')) {
      formatted += (formatted ? '\n' : '') + indent.repeat(level) + token;
      continue;
    }

    // Closing tag: </tag>
    if (/^<\/[a-zA-Z0-9:-]+>$/i.test(token)) {
      level = Math.max(0, level - 1);
      formatted += (formatted ? '\n' : '') + indent.repeat(level) + token;
      continue;
    }

    // Self closing tag: <tag ... />
    if (/\/>$/.test(token)) {
      formatted += (formatted ? '\n' : '') + indent.repeat(level) + token;
      continue;
    }

    // Opening tag: <tag ...>
    const openMatch = token.match(/^<([a-zA-Z0-9:-]+)/);
    if (openMatch) {
      const tagName = openMatch[1].toLowerCase();
      formatted += (formatted ? '\n' : '') + indent.repeat(level) + token;
      // If not a void tag, increment indent level
      if (!VOID_TAGS.has(tagName)) {
        level++;
      }
      continue;
    }

    // Text content
    formatted += (formatted ? '\n' : '') + indent.repeat(level) + token;
  }

  return formatted;
}

function minifyHtml(html: string): string {
  if (!html.trim()) return '';
  // Remove comments (preserve conditional comments if any)
  let min = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
  // Collapse whitespace between tags
  min = min.replace(/>\s+</g, '><');
  // Collapse multiple spaces
  min = min.replace(/\s{2,}/g, ' ');
  return min.trim();
}

// CSS Formatter / Minifier
function formatCss(css: string, indent: string): string {
  if (!css.trim()) return '';
  let output = '';
  let level = 0;
  let inString: string | null = null;
  let inComment = false;

  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    const next = css[i + 1] || '';

    // Handle string literals
    if ((char === '"' || char === "'") && !inComment) {
      if (inString === char) inString = null;
      else if (!inString) inString = char;
      output += char;
      continue;
    }

    if (inString) {
      output += char;
      continue;
    }

    // Comment
    if (char === '/' && next === '*') {
      inComment = true;
      output += '/*';
      i++;
      continue;
    }
    if (char === '*' && next === '/' && inComment) {
      inComment = false;
      output += '*/\n' + indent.repeat(level);
      i++;
      continue;
    }
    if (inComment) {
      output += char;
      continue;
    }

    // Block open '{'
    if (char === '{') {
      level++;
      output = output.trimEnd() + ' {\n' + indent.repeat(level);
      continue;
    }

    // Block close '}'
    if (char === '}') {
      level = Math.max(0, level - 1);
      output = output.trimEnd() + '\n' + indent.repeat(level) + '}\n\n' + indent.repeat(level);
      continue;
    }

    // Semicolon ';'
    if (char === ';') {
      output += ';\n' + indent.repeat(level);
      continue;
    }

    // Colon ':'
    if (char === ':') {
      output += ': ';
      continue;
    }

    // Comma in selectors
    if (char === ',') {
      output += ',\n' + indent.repeat(level);
      continue;
    }

    // Normal whitespace collapse
    if (/\s/.test(char)) {
      if (!output.endsWith(' ') && !output.endsWith('\n') && !output.endsWith('\t')) {
        output += ' ';
      }
      continue;
    }

    output += char;
  }

  return output.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
}

function minifyCss(css: string): string {
  if (!css.trim()) return '';
  let min = css.replace(/\/\*[\s\S]*?\*\//g, ''); // strip comments
  min = min.replace(/\s+/g, ' '); // collapse whitespace
  min = min.replace(/\s*([{}:;,>+~])\s*/g, '$1'); // collapse around operators
  min = min.replace(/;}/g, '}'); // remove redundant final semicolon
  return min.trim();
}

// JavaScript Formatter / Minifier (safe formatting without eval/new Function)
function formatJs(code: string, indent: string): string {
  if (!code.trim()) return '';
  let formatted = '';
  let level = 0;
  let inString: string | null = null;
  let inComment = false;
  let inLineComment = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = code[i + 1] || '';

    // Line comment
    if (char === '/' && next === '/' && !inString && !inComment) {
      inLineComment = true;
      formatted += '//';
      i++;
      continue;
    }
    if (inLineComment) {
      formatted += char;
      if (char === '\n') {
        inLineComment = false;
        formatted += indent.repeat(level);
      }
      continue;
    }

    // Block comment
    if (char === '/' && next === '*' && !inString && !inLineComment) {
      inComment = true;
      formatted += '/*';
      i++;
      continue;
    }
    if (char === '*' && next === '/' && inComment) {
      inComment = false;
      formatted += '*/\n' + indent.repeat(level);
      i++;
      continue;
    }
    if (inComment) {
      formatted += char;
      continue;
    }

    // Strings
    if ((char === '"' || char === "'" || char === '`') && !inLineComment && !inComment) {
      if (inString === char && code[i - 1] !== '\\') {
        inString = null;
      } else if (!inString) {
        inString = char;
      }
      formatted += char;
      continue;
    }

    if (inString) {
      formatted += char;
      continue;
    }

    // Blocks
    if (char === '{' || char === '[') {
      level++;
      formatted = formatted.trimEnd() + (char === '{' ? ' {\n' : ' [\n') + indent.repeat(level);
      continue;
    }

    if (char === '}' || char === ']') {
      level = Math.max(0, level - 1);
      formatted = formatted.trimEnd() + '\n' + indent.repeat(level) + char;
      continue;
    }

    if (char === ';') {
      formatted += ';\n' + indent.repeat(level);
      continue;
    }

    if (char === ',') {
      formatted += ', ';
      continue;
    }

    // Whitespace collapse
    if (/\s/.test(char)) {
      if (!formatted.endsWith(' ') && !formatted.endsWith('\n') && !formatted.endsWith('\t')) {
        formatted += ' ';
      }
      continue;
    }

    formatted += char;
  }

  return formatted.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
}

function minifyJs(code: string): string {
  if (!code.trim()) return '';
  let result = '';
  let inString: string | null = null;
  let inBlockComment = false;
  let inLineComment = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = code[i + 1] || '';

    // Handle line comments
    if (char === '/' && next === '/' && !inString && !inBlockComment) {
      inLineComment = true;
      i++;
      continue;
    }
    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }

    // Handle block comments
    if (char === '/' && next === '*' && !inString && !inLineComment) {
      inBlockComment = true;
      i++;
      continue;
    }
    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    // String literals
    if ((char === '"' || char === "'" || char === '`') && !inBlockComment && !inLineComment) {
      if (inString === char && code[i - 1] !== '\\') {
        inString = null;
      } else if (!inString) {
        inString = char;
      }
      result += char;
      continue;
    }

    if (inString) {
      result += char;
      continue;
    }

    // Normal tokens
    if (/\s/.test(char)) {
      const prev = result[result.length - 1] || '';
      // Only keep space if between two identifier-like characters
      if (/[a-zA-Z0-9_$]/.test(prev) && /[a-zA-Z0-9_$]/.test(next)) {
        result += ' ';
      }
      continue;
    }

    result += char;
  }

  return result.trim();
}

export const CodeFormatter: React.FC = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('html');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState<'2' | '4' | 'tab'>('2');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string; details?: string }>({
    type: 'idle',
    message: '',
  });

  const getIndent = () => {
    if (indentSize === 'tab') return '\t';
    return ' '.repeat(Number(indentSize));
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: `Input is empty. Enter ${language.toUpperCase()} code to format.` });
      setOutput('');
      return;
    }

    try {
      let formatted = '';
      if (language === 'html') formatted = formatHtml(input, getIndent());
      else if (language === 'css') formatted = formatCss(input, getIndent());
      else if (language === 'javascript') formatted = formatJs(input, getIndent());

      setOutput(formatted);
      const lines = formatted.split('\n').length;
      setStatus({
        type: 'success',
        message: `${language.toUpperCase()} Formatted`,
        details: `${lines} lines • ${formatted.length} characters`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({
        type: 'error',
        message: 'Formatting failed',
        details: error.message || 'Unable to parse syntax structure.',
      });
    }
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: `Input is empty. Enter ${language.toUpperCase()} code to minify.` });
      setOutput('');
      return;
    }

    try {
      let minified = '';
      if (language === 'html') minified = minifyHtml(input);
      else if (language === 'css') minified = minifyCss(input);
      else if (language === 'javascript') minified = minifyJs(input);

      setOutput(minified);
      const savedBytes = Math.max(0, input.length - minified.length);
      const pct = input.length > 0 ? Math.round((savedBytes / input.length) * 100) : 0;
      setStatus({
        type: 'success',
        message: `${language.toUpperCase()} Minified`,
        details: `${minified.length} chars (saved ${savedBytes} bytes, -${pct}%)`,
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
    let sample = '';
    if (language === 'html') sample = SAMPLE_HTML;
    else if (language === 'css') sample = SAMPLE_CSS;
    else if (language === 'javascript') sample = SAMPLE_JS;

    setInput(sample);
    try {
      let formatted = '';
      if (language === 'html') formatted = formatHtml(sample, getIndent());
      else if (language === 'css') formatted = formatCss(sample, getIndent());
      else if (language === 'javascript') formatted = formatJs(sample, getIndent());
      setOutput(formatted);
      setStatus({
        type: 'success',
        message: `Sample ${language.toUpperCase()} Loaded`,
        details: 'Ready to edit or reformat',
      });
    } catch {
      // noop
    }
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput('');
    setStatus({
      type: 'idle',
      message: 'Output swapped to input',
    });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="space-y-6" id="tool-code-formatter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Braces className="w-5 h-5 text-indigo-500" />
            Code Formatter & Minifier
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Format or minify HTML markup, CSS stylesheets, and JavaScript client-side safely without executing code.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="code-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="code-clear-btn"
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
          {/* Language Selector */}
          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
            {(['html', 'css', 'javascript'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  setLanguage(lang);
                  setOutput('');
                  setStatus({ type: 'idle', message: '' });
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  language === lang
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {lang === 'javascript' ? 'JavaScript' : lang.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            id="code-format-btn"
            type="button"
            onClick={handleFormat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Format
          </button>

          <button
            id="code-minify-btn"
            type="button"
            onClick={handleMinify}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify
          </button>

          {output && (
            <button
              id="code-swap-btn"
              type="button"
              onClick={handleSwap}
              title="Use output as input"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Swap
            </button>
          )}
        </div>

        {/* Indent Selector */}
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
              Raw {language.toUpperCase()} Input
            </span>
            <span className="font-mono">
              {input.length} chars • {input ? input.split('\n').length : 0} lines
            </span>
          </div>
          <textarea
            id="code-input-editor"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (status.message) setStatus({ type: 'idle', message: '' });
            }}
            placeholder={`Paste your ${language.toUpperCase()} code here...`}
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Processed {language.toUpperCase()} Output
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono">
                {output.length} chars • {output ? output.split('\n').length : 0} lines
              </span>
              <CopyButton text={output} id="code-copy-btn" />
            </div>
          </div>
          <textarea
            id="code-output-editor"
            value={output}
            readOnly
            placeholder="Formatted or minified code output will appear here..."
            rows={14}
            spellCheck={false}
            className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
          />
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Safe Sandbox:</strong> Code formatting and minification are performed entirely with static string tokens. DevKit never executes user scripts, invokes dynamic evaluation, or transmits code.
        </span>
      </div>
    </div>
  );
};
