export type ToolId =
  | 'json-formatter'
  | 'base64'
  | 'uuid'
  | 'timestamp'
  | 'color'
  | 'regex'
  | 'markdown'
  | 'lorem-ipsum'
  | 'jwt-decoder'
  | 'hash-generator'
  | 'url-encoder'
  | 'number-base'
  | 'cron-generator'
  | 'http-status';

export interface ToolMeta {
  id: ToolId;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  category: 'format' | 'encode' | 'generate' | 'convert' | 'text' | 'reference';
  keywords: string[];
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface HistoryEntry {
  id: string;
  toolId: ToolId;
  toolName: string;
  timestamp: number;
  summary: string;
  payload: Record<string, any>;
}
