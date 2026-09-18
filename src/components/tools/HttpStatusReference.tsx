import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  Server,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ArrowRightCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface StatusCodeInfo {
  code: number;
  name: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  description: string;
  useCase: string;
  keywords: string[];
}

const STATUS_CODES: StatusCodeInfo[] = [
  // 1xx Informational
  {
    code: 100,
    name: 'Continue',
    category: '1xx',
    description: 'The server has received the initial request headers and the client should proceed to send the request body.',
    useCase: 'Used with the "Expect: 100-continue" header for large uploads.',
    keywords: ['upload', 'interim', 'headers', 'expect'],
  },
  {
    code: 101,
    name: 'Switching Protocols',
    category: '1xx',
    description: 'The requester has asked the server to switch protocols and the server has agreed to do so.',
    useCase: 'Upgrading an HTTP/1.1 connection to WebSockets.',
    keywords: ['websocket', 'upgrade', 'protocol'],
  },
  {
    code: 102,
    name: 'Processing',
    category: '1xx',
    description: 'The server has received and is processing the request, but no response is available yet.',
    useCase: 'WebDAV requests that take significant server processing time.',
    keywords: ['webdav', 'async', 'working'],
  },
  {
    code: 103,
    name: 'Early Hints',
    category: '1xx',
    description: 'Used to return some response headers before final HTTP message to allow preloading of critical assets.',
    useCase: 'Preloading stylesheet or font resources while the server prepares HTML.',
    keywords: ['preload', 'preconnect', 'performance'],
  },

  // 2xx Success
  {
    code: 200,
    name: 'OK',
    category: '2xx',
    description: 'Standard response for successful HTTP requests. The payload depends on the request method.',
    useCase: 'Standard response for successful GET, PUT, or POST requests.',
    keywords: ['success', 'normal', 'good', 'fetch', 'get'],
  },
  {
    code: 201,
    name: 'Created',
    category: '2xx',
    description: 'The request succeeded and a new resource was successfully created as a result.',
    useCase: 'Response to a POST request that creates a new database record or upload.',
    keywords: ['post', 'create', 'new', 'resource', 'database'],
  },
  {
    code: 202,
    name: 'Accepted',
    category: '2xx',
    description: 'The request has been accepted for processing, but processing has not completed or is asynchronous.',
    useCase: 'Queuing background jobs, batch processing, or scheduled tasks.',
    keywords: ['queue', 'batch', 'background', 'async'],
  },
  {
    code: 204,
    name: 'No Content',
    category: '2xx',
    description: 'The server has successfully fulfilled the request and that there is no additional content to send in the response.',
    useCase: 'Successful DELETE requests, form submissions without view changes.',
    keywords: ['delete', 'empty', 'bodyless'],
  },
  {
    code: 206,
    name: 'Partial Content',
    category: '2xx',
    description: 'The server is delivering only part of the resource due to a Range header sent by the client.',
    useCase: 'Streaming audio/video or resumeable multi-part file downloads.',
    keywords: ['range', 'stream', 'video', 'resume', 'chunks'],
  },

  // 3xx Redirection
  {
    code: 301,
    name: 'Moved Permanently',
    category: '3xx',
    description: 'The URL of the requested resource has been changed permanently. The new URL is given in the response Location header.',
    useCase: 'Domain migration, enforcing HTTPS redirection, permanently changed URLs.',
    keywords: ['redirect', 'permanent', 'seo', 'https', 'location'],
  },
  {
    code: 302,
    name: 'Found',
    category: '3xx',
    description: 'The requested resource resides temporarily under a different URI. Future requests should still use the original URI.',
    useCase: 'Temporary redirect, login redirects, landing page AB tests.',
    keywords: ['redirect', 'temporary', 'login'],
  },
  {
    code: 304,
    name: 'Not Modified',
    category: '3xx',
    description: 'Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.',
    useCase: 'Browser and CDN caching for images, scripts, and static assets.',
    keywords: ['cache', 'etag', 'etag match', 'browser cache', 'cdn'],
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    category: '3xx',
    description: 'The request should be repeated with another URI, but future requests should still use the original URI. The request method must NOT change.',
    useCase: 'Temporary redirection while guaranteeing POST body and method preservation.',
    keywords: ['redirect', 'preserve method', 'post redirect'],
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    category: '3xx',
    description: 'The resource is now permanently located at another URI, and the request method and body MUST NOT be altered when the redirected request is made.',
    useCase: 'Permanent redirection where POST requests must remain POST requests.',
    keywords: ['redirect', 'permanent', 'preserve method'],
  },

  // 4xx Client Error
  {
    code: 400,
    name: 'Bad Request',
    category: '4xx',
    description: 'The server cannot or will not process the request due to something that is perceived to be a client error (e.g. malformed syntax or invalid payload).',
    useCase: 'Validation errors, missing required JSON fields, malformed body.',
    keywords: ['validation', 'syntax', 'invalid', 'schema', 'input'],
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: '4xx',
    description: 'The request has not been applied because it lacks valid authentication credentials for the target resource.',
    useCase: 'Missing or expired JWT/session cookie, invalid API key, unauthenticated user.',
    keywords: ['authentication', 'auth', 'jwt', 'token', 'login', 'credentials'],
  },
  {
    code: 403,
    name: 'Forbidden',
    category: '4xx',
    description: 'The server understands the request but refuses to authorize it. The client identity is known but does not have permission.',
    useCase: 'Role-based access control (RBAC), attempting to access admin data as a standard user.',
    keywords: ['authorization', 'permission', 'rbac', 'access denied', 'forbidden'],
  },
  {
    code: 404,
    name: 'Not Found',
    category: '4xx',
    description: 'The server cannot find the requested resource. Either the URL is not recognized or the endpoint does not exist.',
    useCase: 'Non-existent API endpoints, deleted records, typos in route path.',
    keywords: ['missing', 'route', 'endpoint', '404', 'deleted'],
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    category: '4xx',
    description: 'The request method is known by the server but is not supported by the target resource (e.g. POST to a read-only endpoint).',
    useCase: 'Sending a POST or DELETE to an endpoint that only handles GET.',
    keywords: ['method', 'verbs', 'post on get', 'disallowed'],
  },
  {
    code: 408,
    name: 'Request Timeout',
    category: '4xx',
    description: 'The server timed out waiting for the client to finish sending its request.',
    useCase: 'Client network dropped during file upload or stalled connection.',
    keywords: ['timeout', 'slow connection', 'stalled'],
  },
  {
    code: 409,
    name: 'Conflict',
    category: '4xx',
    description: 'Indicates that the request could not be processed because of conflict in the current state of the resource.',
    useCase: 'Duplicate email registration, concurrent edit collisions, optimistic locking.',
    keywords: ['duplicate', 'version', 'collision', 'lock'],
  },
  {
    code: 410,
    name: 'Gone',
    category: '4xx',
    description: 'Indicates that access to the target resource is no longer available at the origin server and that this condition is likely to be permanent.',
    useCase: 'Deprecated API versions permanently decommissioned, deleted user accounts.',
    keywords: ['deprecated', 'permanently removed', 'decommissioned'],
  },
  {
    code: 413,
    name: 'Payload Too Large',
    category: '4xx',
    description: 'The server refuses to process a request because the request payload is larger than the server is willing or able to process.',
    useCase: 'Uploading a file exceeding server body limit (e.g. nginx client_max_body_size).',
    keywords: ['upload limit', 'file size', 'max size', 'too big'],
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    category: '4xx',
    description: 'The origin server refuses to service the request because the payload format is in an unsupported format.',
    useCase: 'Sending XML to an endpoint that only accepts Content-Type: application/json.',
    keywords: ['content-type', 'mime', 'media', 'json', 'xml'],
  },
  {
    code: 422,
    name: 'Unprocessable Entity',
    category: '4xx',
    description: 'The server understands the content type and syntax of the request entity, but was unable to process the contained instructions.',
    useCase: 'Semantic validation failures (e.g. valid JSON but password too short or date in past).',
    keywords: ['semantic validation', 'zod', 'form validation', 'unprocessable'],
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: '4xx',
    description: 'The user has sent too many requests in a given amount of time ("rate limiting").',
    useCase: 'API rate limiting, abuse prevention, brute force mitigation.',
    keywords: ['rate limit', 'throttling', 'ddos', 'retry-after', 'quota'],
  },

  // 5xx Server Error
  {
    code: 500,
    name: 'Internal Server Error',
    category: '5xx',
    description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    useCase: 'Unhandled exceptions, database crash, null pointer exceptions on backend.',
    keywords: ['crash', 'exception', 'unhandled', 'bug', 'failure'],
  },
  {
    code: 501,
    name: 'Not Implemented',
    category: '5xx',
    description: 'The server does not support the functionality required to fulfill the request.',
    useCase: 'Unimplemented REST methods or features in draft APIs.',
    keywords: ['stub', 'unsupported', 'roadmap'],
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: '5xx',
    description: 'The server, while acting as a gateway or proxy, received an invalid response from the inbound server it accessed.',
    useCase: 'Reverse proxy (nginx / Cloudflare) cannot get response from Node/Python server.',
    keywords: ['proxy', 'gateway', 'upstream', 'nginx', 'cloudflare'],
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: '5xx',
    description: 'The server is currently unable to handle the request due to a temporary overload or scheduled maintenance.',
    useCase: 'Server restart, maintenance mode, traffic spike overload.',
    keywords: ['maintenance', 'overload', 'down', 'offline'],
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: '5xx',
    description: 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.',
    useCase: 'Backend query took too long and proxy timed out waiting for it.',
    keywords: ['timeout', 'upstream', 'slow backend', 'proxy timeout'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Codes' },
  { id: '1xx', label: '1xx Info' },
  { id: '2xx', label: '2xx Success' },
  { id: '3xx', label: '3xx Redirection' },
  { id: '4xx', label: '4xx Client Error' },
  { id: '5xx', label: '5xx Server Error' },
];

function getCategoryBadge(category: StatusCodeInfo['category']) {
  switch (category) {
    case '1xx':
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    case '2xx':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case '3xx':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case '4xx':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    case '5xx':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
  }
}

export const HttpStatusReference: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredCodes = useMemo(() => {
    let list = STATUS_CODES;

    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (item) =>
        item.code.toString().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.useCase.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [search, activeCategory]);

  return (
    <div className="space-y-6" id="tool-http-status">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              HTTP Status Codes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Searchable developer reference for HTTP response codes, descriptions, and common use cases.
          </p>
        </div>

        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear Search
          </button>
        )}
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search HTTP status codes"
            placeholder="Search by code (e.g. 404), name (Not Found), or topic (authentication, cache, timeout)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-950/60 border border-zinc-300 dark:border-zinc-700/80 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-zinc-400 font-medium">
            Showing {filteredCodes.length} code{filteredCodes.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Status Code Cards Grid */}
      {filteredCodes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
          <Server className="w-8 h-8 mx-auto text-zinc-400 opacity-40" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            No status codes matching &quot;{search}&quot;
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try searching for &quot;200&quot;, &quot;404&quot;, &quot;redirect&quot;, &quot;rate limit&quot;, or &quot;auth&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setActiveCategory('all');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
          >
            Reset search and filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCodes.map((item) => (
            <div
              key={item.code}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-extrabold text-zinc-900 dark:text-white">
                      {item.code}
                    </span>
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <CopyButton text={item.code.toString()} label="Copy Code" />
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                <strong className="font-semibold shrink-0 text-zinc-700 dark:text-zinc-300">Use case:</strong>
                <span className="leading-normal">{item.useCase}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
