import React, { useState, useRef } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  Send,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Layers,
  StopCircle,
} from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface ResponseState {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
  isJson: boolean;
  timeMs: number;
  sizeBytes: number;
  error?: string;
  corsBlocked?: boolean;
}

const COMMON_HEADER_KEYS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'User-Agent',
  'Cache-Control',
  'X-Requested-With',
  'X-Api-Key',
];

const CONTENT_TYPE_PRESETS = [
  'application/json',
  'application/x-www-form-urlencoded',
  'text/plain',
  'text/html',
  'application/xml',
];

export const ApiRequestBuilder: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<KeyValuePair[]>([
    { id: '1', key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [responseView, setResponseView] = useState<'body' | 'headers'>('body');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize query params to URL
  const updateUrlWithParams = (newParams: KeyValuePair[]) => {
    try {
      if (!url.trim()) return;
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      parsedUrl.search = '';
      for (const p of newParams) {
        if (p.enabled && p.key.trim()) {
          parsedUrl.searchParams.append(p.key.trim(), p.value);
        }
      }
      setUrl(parsedUrl.toString());
    } catch {
      // url might be in-progress editing
    }
  };

  const handleAddParam = () => {
    const newParam: KeyValuePair = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    const updated = [...queryParams, newParam];
    setQueryParams(updated);
  };

  const handleUpdateParam = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = queryParams.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    setQueryParams(updated);
    updateUrlWithParams(updated);
  };

  const handleRemoveParam = (id: string) => {
    const updated = queryParams.filter((p) => p.id !== id);
    setQueryParams(updated);
    updateUrlWithParams(updated);
  };

  // Headers management
  const handleAddHeader = () => {
    setHeaders((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), key: '', value: '', enabled: true },
    ]);
  };

  const handleUpdateHeader = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: val } : h)));
  };

  const handleRemoveHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };

  const handleSend = async () => {
    if (!url.trim()) {
      setResponse({
        status: 0,
        statusText: 'Validation Error',
        headers: [],
        body: '',
        isJson: false,
        timeMs: 0,
        sizeBytes: 0,
        error: 'Please enter a target URL.',
      });
      return;
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      new URL(targetUrl);
    } catch {
      setResponse({
        status: 0,
        statusText: 'Invalid URL',
        headers: [],
        body: '',
        isJson: false,
        timeMs: 0,
        sizeBytes: 0,
        error: `The URL "${targetUrl}" is not a valid HTTP/HTTPS web address.`,
      });
      return;
    }

    setIsLoading(true);
    setResponse(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    // Build Headers object
    const reqHeaders = new Headers();
    for (const h of headers) {
      if (h.enabled && h.key.trim()) {
        try {
          reqHeaders.append(h.key.trim(), h.value);
        } catch {
          // skip invalid header names
        }
      }
    }

    const startTime = performance.now();

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: reqHeaders,
        signal: controller.signal,
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body.trim()) {
        fetchOptions.body = body;
      }

      const res = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);

      // Extract response headers
      const resHeaders: [string, string][] = [];
      res.headers.forEach((v, k) => {
        resHeaders.push([k, v]);
      });

      // Extract response text safely
      let text = '';
      if (method !== 'HEAD') {
        text = await res.text();
      }

      let isJson = false;
      let displayBody = text;
      try {
        const parsedJson = JSON.parse(text);
        displayBody = JSON.stringify(parsedJson, null, 2);
        isJson = true;
      } catch {
        isJson = false;
      }

      const sizeBytes = new Blob([text]).size;

      setResponse({
        status: res.status,
        statusText: res.statusText || 'OK',
        headers: resHeaders,
        body: displayBody,
        isJson,
        timeMs,
        sizeBytes,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const timeMs = Math.round(endTime - startTime);
      const error = err as Error;

      if (error.name === 'AbortError') {
        setResponse({
          status: 0,
          statusText: 'Timeout / Aborted',
          headers: [],
          body: '',
          isJson: false,
          timeMs,
          sizeBytes: 0,
          error: 'The request was aborted or timed out after 15 seconds.',
        });
      } else {
        // Typical browser Fetch failure: either network offline or CORS block
        setResponse({
          status: 0,
          statusText: 'Network / CORS Error',
          headers: [],
          body: '',
          isJson: false,
          timeMs,
          sizeBytes: 0,
          corsBlocked: true,
          error:
            'Request failed or blocked by browser CORS policy. Modern browsers restrict cross-origin requests unless the target server responds with "Access-Control-Allow-Origin: *" headers. DevKit communicates directly from your browser without using a backend proxy.',
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleLoadSample = () => {
    setMethod('GET');
    setUrl('https://jsonplaceholder.typicode.com/posts/1');
    setHeaders([
      { id: '1', key: 'Accept', value: 'application/json', enabled: true },
    ]);
    setQueryParams([]);
    setBody('');
    setResponse(null);
  };

  const handleClear = () => {
    setUrl('');
    setBody('');
    setQueryParams([]);
    setHeaders([{ id: '1', key: 'Accept', value: 'application/json', enabled: true }]);
    setResponse(null);
  };

  const handlePrettifyBody = () => {
    if (!body.trim()) return;
    try {
      const parsed = JSON.parse(body);
      setBody(JSON.stringify(parsed, null, 2));
    } catch {
      // keep raw
    }
  };

  return (
    <div className="space-y-6" id="tool-api-request">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-500" />
            API Request Builder
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Construct and send HTTP/REST API requests directly from your browser with headers and body payloads.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="api-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="api-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Prominent CORS & Privacy Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Direct Browser Execution & CORS Notice</p>
          <p className="text-[11.5px] opacity-90 leading-relaxed">
            Requests are sent directly from your browser to the target URL. DevKit does not proxy or store your requests. Some external APIs may block browser requests due to CORS (Cross-Origin Resource Sharing) restrictions.
          </p>
        </div>
      </div>

      {/* URL & Method Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="shrink-0">
          <select
            id="api-method-select"
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            aria-label="HTTP Method"
            className="w-full sm:w-auto h-10 px-3 font-bold text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
        </div>

        <div className="flex-1 relative">
          <input
            id="api-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="https://api.example.com/v1/resource"
            className="w-full h-10 px-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isLoading ? (
            <button
              type="button"
              onClick={handleAbort}
              className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              Cancel
            </button>
          ) : (
            <button
              id="api-send-btn"
              type="button"
              onClick={handleSend}
              className="w-full sm:w-auto h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          )}
        </div>
      </div>

      {/* Request Config Tabs */}
      <div className="space-y-3">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('params')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'params'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>Query Params</span>
            {queryParams.filter((p) => p.enabled && p.key).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                {queryParams.filter((p) => p.enabled && p.key).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'headers'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>Headers</span>
            {headers.filter((h) => h.enabled && h.key).length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                {headers.filter((h) => h.enabled && h.key).length}
              </span>
            )}
          </button>

          {['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
            <button
              type="button"
              onClick={() => setActiveTab('body')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'body'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Body</span>
              {body.trim() && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
            </button>
          )}
        </div>

        {/* Tab 1: Params Editor */}
        {activeTab === 'params' && (
          <div className="space-y-2">
            <div className="space-y-1.5">
              {queryParams.map((param) => (
                <div key={param.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => handleUpdateParam(param.id, 'enabled', e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => handleUpdateParam(param.id, 'key', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => handleUpdateParam(param.id, 'value', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveParam(param.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddParam}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Query Parameter
            </button>
          </div>
        )}

        {/* Tab 2: Headers Editor */}
        {activeTab === 'headers' && (
          <div className="space-y-2">
            <div className="space-y-1.5">
              {headers.map((header) => (
                <div key={header.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => handleUpdateHeader(header.id, 'enabled', e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    list="common-headers"
                    placeholder="Header Key (e.g. Content-Type)"
                    value={header.key}
                    onChange={(e) => handleUpdateHeader(header.id, 'key', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    list="header-presets"
                    placeholder="Header Value"
                    value={header.value}
                    onChange={(e) => handleUpdateHeader(header.id, 'value', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHeader(header.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <datalist id="common-headers">
              {COMMON_HEADER_KEYS.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>

            <datalist id="header-presets">
              {CONTENT_TYPE_PRESETS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>

            <button
              type="button"
              onClick={handleAddHeader}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Request Header
            </button>
          </div>
        )}

        {/* Tab 3: Body Editor */}
        {activeTab === 'body' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Payload Body ({body.length} characters)
              </span>
              <button
                type="button"
                onClick={handlePrettifyBody}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Prettify JSON
              </button>
            </div>
            <textarea
              id="api-body-editor"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"title": "Example", "completed": false}'
              rows={6}
              spellCheck={false}
              className="w-full p-3 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>
        )}
      </div>

      {/* Response Section */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Response
            </h3>
            {response && (
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {/* Status Badge */}
                <span
                  className={`px-2 py-0.5 rounded-full font-mono font-bold ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : response.status >= 300 && response.status < 400
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                      : response.status >= 400 && response.status < 500
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {response.status > 0 ? `${response.status} ${response.statusText}` : response.statusText}
                </span>

                {/* Timing */}
                {response.timeMs > 0 && (
                  <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {response.timeMs} ms
                  </span>
                )}

                {/* Size */}
                {response.sizeBytes > 0 && (
                  <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-mono">
                    <HardDrive className="w-3 h-3" />
                    {response.sizeBytes > 1024
                      ? `${(response.sizeBytes / 1024).toFixed(1)} KB`
                      : `${response.sizeBytes} B`}
                  </span>
                )}
              </div>
            )}
          </div>

          {response && !response.error && (
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setResponseView('body')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    responseView === 'body'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Body
                </button>
                <button
                  type="button"
                  onClick={() => setResponseView('headers')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    responseView === 'headers'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Headers ({response.headers.length})
                </button>
              </div>

              {responseView === 'body' && <CopyButton text={response.body} id="api-copy-response-btn" />}
            </div>
          )}
        </div>

        {/* Error Display */}
        {response?.error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{response.statusText}</span>
            </div>
            <p className="leading-relaxed pl-6 opacity-90">{response.error}</p>
          </div>
        )}

        {/* Response Viewer */}
        {response && !response.error && (
          <div>
            {responseView === 'body' ? (
              <textarea
                id="api-response-body"
                value={response.body}
                readOnly
                rows={12}
                placeholder="Empty response body"
                className="w-full p-3.5 font-mono text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-y"
              />
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-zinc-100 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <tr>
                      <th className="p-2.5">Header</th>
                      <th className="p-2.5">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {response.headers.map(([k, v], idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                        <td className="p-2.5 font-semibold text-zinc-700 dark:text-zinc-300">{k}</td>
                        <td className="p-2.5 text-zinc-600 dark:text-zinc-400 break-all">{v}</td>
                      </tr>
                    ))}
                    {response.headers.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-zinc-400 italic">
                          No exposed headers returned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!response && !isLoading && (
          <div className="p-8 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
            Enter a target URL and click Send to view the response status, headers, and payload.
          </div>
        )}

        {isLoading && (
          <div className="p-8 text-center rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 text-xs text-indigo-500 animate-pulse">
            Sending request directly from browser...
          </div>
        )}
      </div>

      {/* Privacy Guarantee */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Privacy Guarantee:</strong> DevKit has no backend server or tracking. Request credentials, tokens, and payloads are never stored in localStorage, never sent to DevKit servers, and never recorded in history.
        </span>
      </div>
    </div>
  );
};
