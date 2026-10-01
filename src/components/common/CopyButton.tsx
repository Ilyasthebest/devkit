import React, { useState, useRef, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  statusMessage?: string;
  className?: string;
  iconOnly?: boolean;
  disabled?: boolean;
  id?: string;
  title?: string;
  onCopy?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  statusMessage,
  className = '',
  iconOnly = false,
  disabled = false,
  id,
  title,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text || disabled) return;

    try {
      const success = await copyToClipboard(text);
      if (success) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setCopied(true);
        if (onCopy) onCopy();
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, 1800);
      }
    } catch {
      // Do not show copied if clipboard operation explicitly fails
    }
  };

  const buttonContent = (
    <button
      id={id}
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={title || (copied ? (iconOnly ? 'Copied to clipboard' : copiedLabel) : label)}
      title={title || (copied ? (iconOnly ? 'Copied to clipboard!' : copiedLabel) : label)}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        copied
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold'
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:text-white'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          {!iconOnly ? <span>{copiedLabel}</span> : <span className="sr-only">Copied</span>}
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {!iconOnly && <span>{label}</span>}
        </>
      )}
    </button>
  );

  if (statusMessage) {
    return (
      <div className="inline-flex items-center gap-2">
        {buttonContent}
        <span
          role="status"
          aria-live="polite"
          className={
            copied
              ? 'text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none'
              : 'sr-only'
          }
        >
          {copied ? statusMessage : ''}
        </span>
      </div>
    );
  }

  return buttonContent;
};

