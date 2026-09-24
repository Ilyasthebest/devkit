import { ToolMeta } from '../types';

export interface ScoredTool {
  tool: ToolMeta;
  score: number;
}

/**
 * Ranks and filters tools based on query relevance across:
 * - Exact name match (highest)
 * - Name prefix / word match
 * - Keyword exact and prefix matches
 * - Category match
 * - Short description and detailed description match
 */
export function searchAndRankTools(tools: ToolMeta[], rawQuery: string): ToolMeta[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return tools;

  const scoredList: ScoredTool[] = [];

  for (const tool of tools) {
    let score = 0;
    const nameLower = tool.name.toLowerCase();
    const catLower = tool.category.toLowerCase();
    const shortDesc = tool.shortDescription.toLowerCase();
    const fullDesc = tool.description.toLowerCase();

    // 1. Exact Name match
    if (nameLower === query) {
      score += 1000;
    } else if (nameLower.startsWith(query)) {
      score += 500;
    } else if (nameLower.includes(query)) {
      score += 200;
    }

    // 2. Exact keyword match
    for (const kw of tool.keywords) {
      const kwLower = kw.toLowerCase();
      if (kwLower === query) {
        score += 400;
      } else if (kwLower.startsWith(query)) {
        score += 150;
      } else if (kwLower.includes(query)) {
        score += 80;
      }
    }

    // 3. Category match
    if (catLower === query) {
      score += 120;
    } else if (catLower.startsWith(query)) {
      score += 60;
    }

    // 4. Description match
    if (shortDesc.includes(query)) {
      score += 50;
    }
    if (fullDesc.includes(query)) {
      score += 30;
    }

    // Special exact mappings for common developer shorthand
    if (query === 'jwt' && tool.id === 'jwt-decoder') score += 800;
    if (query === 'token' && tool.id === 'jwt-decoder') score += 700;
    if (query === 'json' && tool.id === 'json-formatter') score += 800;
    if (query === 'hash' && tool.id === 'hash-generator') score += 800;
    if (query === 'sha' && tool.id === 'hash-generator') score += 700;
    if (query === 'cron' && tool.id === 'cron-generator') score += 800;
    if (query === 'crontab' && tool.id === 'cron-generator') score += 700;
    if (query === '404' && tool.id === 'http-status') score += 800;
    if (query === 'http' && tool.id === 'http-status') score += 600;
    if (query === 'status' && tool.id === 'http-status') score += 600;
    if (query === 'url' && tool.id === 'url-encoder') score += 800;
    if (query === 'uri' && tool.id === 'url-encoder') score += 700;
    if (query === 'base64' && tool.id === 'base64') score += 800;
    if (query === 'b64' && tool.id === 'base64') score += 800;
    if (query === 'binary' && tool.id === 'number-base') score += 600;
    if (query === 'hex' && (tool.id === 'number-base' || tool.id === 'color')) score += 500;
    if (query === 'uuid' && tool.id === 'uuid') score += 800;
    if (query === 'guid' && tool.id === 'uuid') score += 800;
    if (query === 'regex' && tool.id === 'regex') score += 800;
    if (query === 'regexp' && tool.id === 'regex') score += 800;
    if (query === 'epoch' && tool.id === 'timestamp') score += 700;
    if (query === 'unix' && tool.id === 'timestamp') score += 700;
    if (query === 'sql' && tool.id === 'sql-formatter') score += 900;
    if (query === 'query' && tool.id === 'sql-formatter') score += 800;
    if (query === 'postgres' && tool.id === 'sql-formatter') score += 800;
    if (query === 'mysql' && tool.id === 'sql-formatter') score += 800;
    if (query === 'code' && tool.id === 'code-formatter') score += 800;
    if (query === 'css' && tool.id === 'code-formatter') score += 800;
    if (query === 'html' && tool.id === 'code-formatter') score += 800;
    if (query === 'js' && tool.id === 'code-formatter') score += 800;
    if (query === 'beautify' && (tool.id === 'code-formatter' || tool.id === 'json-formatter' || tool.id === 'sql-formatter')) score += 750;
    if (query === 'minify' && (tool.id === 'code-formatter' || tool.id === 'json-formatter' || tool.id === 'sql-formatter')) score += 750;
    if (query === 'csv' && tool.id === 'json-csv') score += 900;
    if (query === 'spreadsheet' && tool.id === 'json-csv') score += 750;
    if (query === 'api' && tool.id === 'api-request') score += 900;
    if (query === 'rest' && tool.id === 'api-request') score += 850;
    if (query === 'curl' && tool.id === 'api-request') score += 800;
    if (query === 'fetch' && tool.id === 'api-request') score += 800;
    if (query === 'request' && tool.id === 'api-request') score += 800;
    if (query === 'endpoint' && tool.id === 'api-request') score += 800;

    if (score > 0) {
      scoredList.push({ tool, score });
    }
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.map((item) => item.tool);
}
