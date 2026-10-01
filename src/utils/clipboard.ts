/**
 * DevKit Unified Clipboard Utility
 * Safely copies text to the system clipboard using the modern Clipboard API
 * with automatic fallback to document.execCommand in restricted/iframe/headless environments.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern Clipboard API if supported and not blocked
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // In restricted test environments, sandboxed iframes, or unfocused tabs,
      // navigator.clipboard.writeText rejects (e.g. NotAllowedError).
      // Fall through to the supported DOM execCommand fallback.
    }
  }

  // 2. Supported DOM fallback via document.execCommand('copy')
  if (typeof document !== 'undefined') {
    let textarea: HTMLTextAreaElement | null = null;
    try {
      textarea = document.createElement('textarea');
      textarea.value = text;
      // Position offscreen without hiding or making readonly so browser allows copy
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-9999px';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.color = 'transparent';
      textarea.setAttribute('aria-hidden', 'true');
      textarea.tabIndex = -1;

      document.body.appendChild(textarea);
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      textarea = null;

      if (successful) {
        return true;
      }
    } catch {
      if (textarea && textarea.parentNode) {
        textarea.parentNode.removeChild(textarea);
      }
    }
  }

  return false;
}

