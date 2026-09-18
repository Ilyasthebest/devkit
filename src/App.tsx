import React, { useState, useEffect, useMemo } from 'react';
import { ToolId } from './types';
import { TOOLS } from './data/tools';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ToolCard } from './components/layout/ToolCard';
import { JsonFormatter } from './components/tools/JsonFormatter';
import { Base64Tool } from './components/tools/Base64Tool';
import { UuidGenerator } from './components/tools/UuidGenerator';
import { TimestampConverter } from './components/tools/TimestampConverter';
import { ColorConverter } from './components/tools/ColorConverter';
import { RegexTester } from './components/tools/RegexTester';
import { MarkdownPreviewer } from './components/tools/MarkdownPreviewer';
import { LoremIpsumGenerator } from './components/tools/LoremIpsumGenerator';
import { JwtDecoder } from './components/tools/JwtDecoder';
import { HashGenerator } from './components/tools/HashGenerator';
import { UrlEncoderDecoder } from './components/tools/UrlEncoderDecoder';
import { NumberBaseConverter } from './components/tools/NumberBaseConverter';
import { CronGenerator } from './components/tools/CronGenerator';
import { HttpStatusReference } from './components/tools/HttpStatusReference';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId | 'home'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('devkit_theme');
        if (saved === 'light' || saved === 'dark') return saved;
      } catch {
        // Fallback if localStorage is disabled
      }
    }
    return 'dark';
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Synchronize theme with document root & local storage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('devkit_theme', theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [theme]);

  // Read / write hash routing (e.g. #/json-formatter or #json-formatter)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const validTool = TOOLS.find((t) => t.id === hash);
      if (validTool) {
        setActiveTool(validTool.id);
      } else {
        setActiveTool('home');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleSelectTool = (tool: ToolId | 'home') => {
    setActiveTool(tool);
    if (tool === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = `/${tool}`;
    }
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Active tool metadata
  const currentToolMeta = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        theme={theme}
        onToggleTheme={toggleTheme}
        isMobileNavOpen={isMobileNavOpen}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTool={activeTool}
            onSelectTool={handleSelectTool}
            searchQuery={searchQuery}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {activeTool === 'home' ? (
            <div className="space-y-8" id="home-view">
              {/* Hero Section */}
              <div className="pt-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast. Offline-Capable. Zero Tracking.</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  Developer tools. One place.
                </h1>

                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mt-2 font-normal">
                  Fast, private utilities for developers.
                </p>

                {/* Privacy Badge */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Your data stays in your browser.
                  </span>
                  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    No server calls or analytics
                  </span>
                  <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    Runs 100% locally
                  </span>
                </div>
              </div>

              {/* Search Active Notification if filtered */}
              {searchQuery.trim() && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>
                      Filtering by: <strong className="font-mono">&quot;{searchQuery}&quot;</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="underline hover:text-indigo-900 dark:hover:text-white font-medium cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Tools Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Available Utilities ({filteredTools.length})
                  </h2>
                </div>

                {filteredTools.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
                    <Search className="w-8 h-8 mx-auto text-zinc-400" />
                    <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
                      No matching tools found
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      We couldn&apos;t find any tool matching &quot;{searchQuery}&quot;. Try searching for &quot;JSON&quot;, &quot;UUID&quot;, &quot;Base64&quot;, or &quot;Regex&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                    >
                      Show All Tools
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onOpen={() => handleSelectTool(tool.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Active Tool View */
            <div className="space-y-6" id="tool-view-container">
              {/* Back to all tools header bar */}
              <div className="flex items-center justify-between pb-3">
                <button
                  id="back-to-overview-btn"
                  type="button"
                  onClick={() => handleSelectTool('home')}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to all tools</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Local browser session
                </div>
              </div>

              {/* Tool Renderer */}
              <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-xs">
                {activeTool === 'json-formatter' && <JsonFormatter />}
                {activeTool === 'base64' && <Base64Tool />}
                {activeTool === 'uuid' && <UuidGenerator />}
                {activeTool === 'timestamp' && <TimestampConverter />}
                {activeTool === 'color' && <ColorConverter />}
                {activeTool === 'regex' && <RegexTester />}
                {activeTool === 'markdown' && <MarkdownPreviewer />}
                {activeTool === 'lorem-ipsum' && <LoremIpsumGenerator />}
                {activeTool === 'jwt-decoder' && <JwtDecoder />}
                {activeTool === 'hash-generator' && <HashGenerator />}
                {activeTool === 'url-encoder' && <UrlEncoderDecoder />}
                {activeTool === 'number-base' && <NumberBaseConverter />}
                {activeTool === 'cron-generator' && <CronGenerator />}
                {activeTool === 'http-status' && <HttpStatusReference />}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            DevKit — Private, client-side utility toolkit for developers.
          </p>
          <p className="text-zinc-400">
            All transformations occur 100% locally. Zero telemetry.
          </p>
        </div>
      </footer>
    </div>
  );
}
