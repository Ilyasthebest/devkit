import React, { useState, useMemo } from 'react';
import { CopyButton } from '../common/CopyButton';
import {
  KeyRound,
  Trash2,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyMDgwMDAwMDAwfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function base64UrlDecode(str: string): string {
  let clean = str.trim().replace(/-/g, '+').replace(/_/g, '/');
  while (clean.length % 4 !== 0) {
    clean += '=';
  }
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export const JwtDecoder: React.FC = () => {
  const [jwtInput, setJwtInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'payload' | 'header'>('all');

  const handleClear = () => {
    setJwtInput('');
  };

  const handleLoadSample = () => {
    setJwtInput(SAMPLE_JWT);
  };

  const decodedResult = useMemo(() => {
    const raw = jwtInput.trim();
    if (!raw) {
      return {
        isEmpty: true,
        header: null,
        payload: null,
        signature: '',
        headerRaw: '',
        payloadRaw: '',
        error: null,
      };
    }

    const parts = raw.split('.');
    if (parts.length !== 3) {
      return {
        isEmpty: false,
        header: null,
        payload: null,
        signature: '',
        headerRaw: '',
        payloadRaw: '',
        error: `Invalid JWT. A valid JWT must contain three parts separated by dots (header.payload.signature). Found ${parts.length} part${parts.length === 1 ? '' : 's'}.`,
      };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let headerObj: Record<string, unknown> | null = null;
    let payloadObj: Record<string, unknown> | null = null;
    let headerDecodedStr = '';
    let payloadDecodedStr = '';

    // Decode header
    try {
      headerDecodedStr = base64UrlDecode(headerB64);
    } catch {
      return {
        isEmpty: false,
        header: null,
        payload: null,
        signature: signatureB64,
        headerRaw: '',
        payloadRaw: '',
        error: 'Invalid Base64URL in JWT Header.',
      };
    }

    try {
      headerObj = JSON.parse(headerDecodedStr);
    } catch {
      return {
        isEmpty: false,
        header: null,
        payload: null,
        signature: signatureB64,
        headerRaw: headerDecodedStr,
        payloadRaw: '',
        error: 'JWT Header contains malformed JSON.',
      };
    }

    // Decode payload
    try {
      payloadDecodedStr = base64UrlDecode(payloadB64);
    } catch {
      return {
        isEmpty: false,
        header: headerObj,
        payload: null,
        signature: signatureB64,
        headerRaw: headerDecodedStr,
        payloadRaw: '',
        error: 'Invalid Base64URL in JWT Payload.',
      };
    }

    try {
      payloadObj = JSON.parse(payloadDecodedStr);
    } catch {
      return {
        isEmpty: false,
        header: headerObj,
        payload: null,
        signature: signatureB64,
        headerRaw: headerDecodedStr,
        payloadRaw: payloadDecodedStr,
        error: 'JWT Payload contains malformed JSON.',
      };
    }

    return {
      isEmpty: false,
      header: headerObj,
      payload: payloadObj,
      signature: signatureB64,
      headerRaw: JSON.stringify(headerObj, null, 2),
      payloadRaw: JSON.stringify(payloadObj, null, 2),
      error: null,
    };
  }, [jwtInput]);

  // Token claims helper
  const claimsInfo = useMemo(() => {
    if (!decodedResult.payload) return null;
    const p = decodedResult.payload as Record<string, unknown>;
    const exp = typeof p.exp === 'number' ? p.exp : null;
    const iat = typeof p.iat === 'number' ? p.iat : null;
    const nbf = typeof p.nbf === 'number' ? p.nbf : null;

    const now = Math.floor(Date.now() / 1000);
    const isExpired = exp !== null ? exp < now : null;

    return {
      exp,
      expDate: exp ? new Date(exp * 1000).toLocaleString() : null,
      isExpired,
      iat,
      iatDate: iat ? new Date(iat * 1000).toLocaleString() : null,
      nbf,
      nbfDate: nbf ? new Date(nbf * 1000).toLocaleString() : null,
      issuer: typeof p.iss === 'string' ? p.iss : null,
      subject: typeof p.sub === 'string' ? p.sub : null,
      audience: typeof p.aud === 'string' ? p.aud : null,
    };
  }, [decodedResult.payload]);

  return (
    <div className="space-y-6" id="tool-jwt-decoder">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              JWT Decoder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Inspect JSON Web Tokens (Header, Payload, and Signature) completely client-side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="jwt-load-sample-btn"
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Load Sample
          </button>
          <button
            id="jwt-clear-btn"
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:bg-rose-500/20 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Decoded locally — signature not verified.</strong>
          <span className="ml-1 text-amber-800/90 dark:text-amber-300/80">
            This utility decodes the Base64URL claims for local inspection in your browser. It does not verify cryptographic signatures. Never share sensitive private credentials.
          </span>
        </div>
      </div>

      {/* JWT Input Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="jwt-token-input"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
          >
            <span>Encoded JWT Token</span>
            {jwtInput && (
              <span className="text-[10px] text-zinc-400 normal-case font-mono font-normal">
                ({jwtInput.length} chars)
              </span>
            )}
          </label>
          {jwtInput && <CopyButton text={jwtInput} label="Copy Token" />}
        </div>

        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-950/60 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all overflow-hidden">
          <textarea
            id="jwt-token-input"
            value={jwtInput}
            onChange={(e) => setJwtInput(e.target.value)}
            aria-label="JWT token input"
            rows={4}
            placeholder="Paste your encoded JWT here (e.g. eyJhbGciOi...)"
            className="w-full p-3.5 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 bg-transparent border-0 resize-y focus:outline-none leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {decodedResult.error && (
        <div
          id="jwt-error-banner"
          className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 font-medium">{decodedResult.error}</div>
        </div>
      )}

      {/* Empty State */}
      {decodedResult.isEmpty && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 space-y-2">
          <KeyRound className="w-8 h-8 mx-auto opacity-40" />
          <p className="text-xs sm:text-sm">Paste a JSON Web Token above to inspect its Header, Payload, and Signature.</p>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
          >
            Click here to load a sample token
          </button>
        </div>
      )}

      {/* Decoded Sections */}
      {!decodedResult.isEmpty && !decodedResult.error && (
        <div className="space-y-6">
          {/* Claims Overview / Expiration Helper */}
          {claimsInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {claimsInfo.exp !== null && (
                <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Expiration (exp)
                    </span>
                    <p className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {claimsInfo.expDate}
                    </p>
                  </div>
                  {claimsInfo.isExpired ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-3 h-3" /> Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              )}

              {claimsInfo.iat !== null && (
                <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Issued At (iat)
                  </span>
                  <p className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {claimsInfo.iatDate}
                  </p>
                </div>
              )}

              {claimsInfo.subject && (
                <div className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Subject (sub)
                  </span>
                  <p className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                    {claimsInfo.subject}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              All Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('payload')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'payload'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Payload Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('header')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'header'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Header Only
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Header (ALGORITHM & TOKEN TYPE) */}
            {(activeTab === 'all' || activeTab === 'header') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Header (Algorithm & Token Type)
                    </span>
                  </div>
                  {decodedResult.headerRaw && (
                    <CopyButton text={decodedResult.headerRaw} label="Copy Header" />
                  )}
                </div>

                <div className="rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/20 dark:bg-rose-950/10 overflow-hidden">
                  <pre
                    id="jwt-header-output"
                    className="p-4 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto leading-relaxed"
                  >
                    {decodedResult.headerRaw}
                  </pre>
                </div>
              </div>
            )}

            {/* Payload (DATA & CLAIMS) */}
            {(activeTab === 'all' || activeTab === 'payload') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Payload (Claims & Data)
                    </span>
                  </div>
                  {decodedResult.payloadRaw && (
                    <CopyButton text={decodedResult.payloadRaw} label="Copy Payload" />
                  )}
                </div>

                <div className="rounded-xl border border-purple-200 dark:border-purple-950/80 bg-purple-50/20 dark:bg-purple-950/10 overflow-hidden">
                  <pre
                    id="jwt-payload-output"
                    className="p-4 font-mono text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto leading-relaxed max-h-[360px]"
                  >
                    {decodedResult.payloadRaw}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Signature Section */}
          {activeTab === 'all' && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Signature (Base64URL)
                  </span>
                </div>
                {decodedResult.signature && (
                  <CopyButton text={decodedResult.signature} label="Copy Signature" />
                )}
              </div>

              <div className="rounded-xl border border-sky-200 dark:border-sky-950/80 bg-sky-50/20 dark:bg-sky-950/10 p-3.5 overflow-hidden">
                <p
                  id="jwt-signature-output"
                  className="font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all leading-relaxed"
                >
                  {decodedResult.signature}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
