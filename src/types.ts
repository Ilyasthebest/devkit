export type ToolId =
  | 'json-formatter'
  | 'base64'
  | 'uuid'
  | 'timestamp'
  | 'color'
  | 'regex'
  | 'markdown'
  | 'lorem-ipsum';

export interface ToolMeta {
  id: ToolId;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  category: 'format' | 'encode' | 'generate' | 'convert' | 'text';
  keywords: string[];
}
