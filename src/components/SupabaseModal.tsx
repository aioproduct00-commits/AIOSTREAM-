import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Database, CheckCircle2, AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react';
import { getActiveSupabaseCredentials } from '../lib/supabase';

export const SupabaseModal: React.FC = () => {
  const { isSupabaseModalOpen, setIsSupabaseModalOpen, supabaseStatus, saveSupabaseConfig, showToast } =
    useApp();

  const creds = getActiveSupabaseCredentials();
  const [url, setUrl] = useState(creds.url);
  const [anonKey, setAnonKey] = useState(creds.key);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isSupabaseModalOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await saveSupabaseConfig(url.trim(), anonKey.trim());
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    await saveSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setIsLoading(false);
  };

  const copySqlSnippet = () => {
    const snippet = `-- Run the contents of /supabase-schema.sql inside your Supabase SQL Editor:
-- It creates the 'videos', 'playlists', 'playlist_items', 'watch_history', 'favorites', and 'downloads' tables with Row Level Security.`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('SQL hint copied! Check supabase-schema.sql for the full script.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0F121E] border border-[#23293F] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A2033]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-display">
                Supabase Cloud Database Sync
              </h2>
              <p className="text-xs text-slate-400">
                Persistent cloud storage for videos, playlists, history, and downloads
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2033] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              supabaseStatus.isConnected
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-[#141926] border-[#20273D] text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {supabaseStatus.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div>
                <div className="font-semibold text-white">
                  {supabaseStatus.isConnected ? 'Cloud Connected & Synchronized' : 'Local Storage Mode'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {supabaseStatus.isConnected
                    ? `Live synced with ${supabaseStatus.url}`
                    : 'All records, favorites, and playlists are saved safely in your browser storage.'}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2 bg-[#08090E] border border-[#23293F] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 bg-[#08090E] border border-[#23293F] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect & Sync'}
              </button>

              {supabaseStatus.isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium border border-rose-800/40 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>

          {/* SQL Schema helper */}
          <div className="pt-3 border-t border-[#1A2033] text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Database Setup (supabase-schema.sql)</span>
              <button
                onClick={copySqlSnippet}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Instruction'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To initialize your Supabase cloud database, open your Supabase dashboard SQL Editor and
              execute the comprehensive schema included in the project root{' '}
              <code className="text-indigo-300 font-mono">/supabase-schema.sql</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
