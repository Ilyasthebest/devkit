import { ToolId, ThemeMode, HistoryEntry } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'devkit_favorites',
  RECENT: 'devkit_recent',
  THEME: 'devkit_theme',
  HISTORY: 'devkit_history',
} as const;

const MAX_RECENT_TOOLS = 10;
const MAX_HISTORY_ENTRIES = 30;

// Safe localStorage access wrapper
function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    // Storage quota exceeded or disabled in iframe/incognito
  }
}

function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    // ignore
  }
}

// ---------------- FAVORITES ----------------
export function getStoredFavorites(): ToolId[] {
  const data = safeGetItem(STORAGE_KEYS.FAVORITES);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is ToolId => typeof id === 'string');
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredFavorites(favorites: ToolId[]): void {
  safeSetItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

// ---------------- RECENT TOOLS ----------------
export function getStoredRecentTools(): ToolId[] {
  const data = safeGetItem(STORAGE_KEYS.RECENT);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is ToolId => typeof id === 'string').slice(0, MAX_RECENT_TOOLS);
    }
  } catch {
    // ignore
  }
  return [];
}

export function addRecentTool(toolId: ToolId): ToolId[] {
  const current = getStoredRecentTools().filter((id) => id !== toolId);
  const updated = [toolId, ...current].slice(0, MAX_RECENT_TOOLS);
  safeSetItem(STORAGE_KEYS.RECENT, JSON.stringify(updated));
  return updated;
}

export function clearStoredRecentTools(): void {
  safeRemoveItem(STORAGE_KEYS.RECENT);
}

// ---------------- THEME PREFERENCE ----------------
export function getStoredTheme(): ThemeMode {
  const stored = safeGetItem(STORAGE_KEYS.THEME);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export function saveStoredTheme(theme: ThemeMode): void {
  safeSetItem(STORAGE_KEYS.THEME, theme);
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

// ---------------- LOCAL HISTORY ----------------
export function getStoredHistory(): HistoryEntry[] {
  const data = safeGetItem(STORAGE_KEYS.HISTORY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>
): HistoryEntry[] {
  // Security guard: never automatically save sensitive token records
  if (entry.toolId === 'jwt-decoder') {
    return getStoredHistory();
  }

  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
  };

  const current = getStoredHistory();
  // Filter out any identical recent entry within 3 seconds to avoid duplicate clicks
  const filtered = current.filter(
    (e) => !(e.toolId === entry.toolId && e.summary === entry.summary && Date.now() - e.timestamp < 3000)
  );

  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ENTRIES);
  safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}

export function deleteStoredHistoryEntry(id: string): HistoryEntry[] {
  const current = getStoredHistory();
  const updated = current.filter((e) => e.id !== id);
  safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}

export function clearStoredHistory(): void {
  safeRemoveItem(STORAGE_KEYS.HISTORY);
}
