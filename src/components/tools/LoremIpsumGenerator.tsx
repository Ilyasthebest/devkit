import React, { useState, useEffect } from 'react';
import { CopyButton } from '../common/CopyButton';
import { AlignLeft, RefreshCw, Trash2, FileText, Sliders } from 'lucide-react';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium', 'tincidunt',
  'lacus', 'nulla', 'gravida', 'orci', 'a', 'odio', 'nullam', 'varius', 'turpis', 'et',
  'commodo', 'pharetra', 'est', 'eros', 'bibendum', 'elit', 'nec', 'luctus', 'magna', 'felis',
  'sollicitudin', 'mauris', 'integer', 'in', 'mauris', 'eu', 'nibh', 'euismod', 'gravida',
  'duis', 'ac', 'tellus', 'et', 'risus', 'vulputate', 'vehicula', 'donec', 'lobortis', 'risus'
];

function generateSentence(startWithLorem = false): string {
  const length = Math.floor(Math.random() * 10) + 8; // 8-17 words
  const words: string[] = [];

  if (startWithLorem) {
    words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit.');
    return words.join(' ');
  }

  for (let i = 0; i < length; i++) {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    words.push(randomWord);
  }

  const capitalized = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  words[0] = capitalized;
  return words.join(' ') + '.';
}

function generateParagraph(sentencesCount = 5, startWithLorem = false): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentencesCount; i++) {
    sentences.push(generateSentence(i === 0 && startWithLorem));
  }
  return sentences.join(' ');
}

export const LoremIpsumGenerator: React.FC = () => {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [output, setOutput] = useState<string>('');

  const generate = () => {
    let result = '';

    if (type === 'paragraphs') {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        paras.push(generateParagraph(5, i === 0 && startWithLorem));
      }
      result = paras.join('\n\n');
    } else if (type === 'sentences') {
      const sents: string[] = [];
      for (let i = 0; i < count; i++) {
        sents.push(generateSentence(i === 0 && startWithLorem));
      }
      result = sents.join(' ');
    } else {
      // Words
      const wordsList: string[] = [];
      const prefix = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];
      let startIndex = 0;

      if (startWithLorem) {
        for (let i = 0; i < Math.min(count, prefix.length); i++) {
          wordsList.push(prefix[i]);
          startIndex++;
        }
      }

      for (let i = startIndex; i < count; i++) {
        wordsList.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      result = wordsList.join(' ');
    }

    setOutput(result);
  };

  useEffect(() => {
    generate();
  }, [type, count, startWithLorem]);

  const handleClear = () => {
    setOutput('');
  };

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <div className="space-y-6" id="tool-lorem-ipsum">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-indigo-500" />
            Lorem Ipsum Dummy Text Generator
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Quickly generate placeholder text by paragraph, sentence, or word counts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="lorem-generate-btn"
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
          <button
            id="lorem-clear-btn"
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
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Unit Type */}
          <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60">
            {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all cursor-pointer ${
                  type === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Count input */}
          <div className="flex items-center gap-2">
            <label htmlFor="lorem-count-input" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Count:
            </label>
            <input
              id="lorem-count-input"
              type="number"
              min={1}
              max={type === 'words' ? 500 : 50}
              value={count}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setCount(isNaN(val) ? 1 : Math.max(1, Math.min(type === 'words' ? 500 : 50, val)));
              }}
              aria-label="Number of items to generate"
              className="w-16 px-2.5 py-1 text-xs font-mono bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              id="lorem-start-prefix-checkbox"
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500"
            />
            Start with &quot;Lorem ipsum...&quot;
          </label>

          <CopyButton id="lorem-copy-btn" text={output} disabled={!output} />
        </div>
      </div>

      {/* Output Display */}
      <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Generated Placeholder Text
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {wordCount} words • {charCount} characters
          </span>
        </div>

        <textarea
          id="lorem-output-textarea"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          aria-label="Generated lorem ipsum output text"
          rows={14}
          placeholder="Generated text will appear here..."
          className="w-full p-4 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 bg-transparent border-0 resize-y focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
};
