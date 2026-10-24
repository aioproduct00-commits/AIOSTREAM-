import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Database, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';
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
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-sage)] text-white shadow-sm">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                Supabase Cloud Database Sync
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Persistent cloud storage for videos, playlists, history, and downloads
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              supabaseStatus.isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              {supabaseStatus.isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <div className="font-bold text-[var(--text-primary)]">
                  {supabaseStatus.isConnected ? 'Cloud Connected & Synchronized' : 'Local Storage Mode'}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {supabaseStatus.isConnected
                    ? `Live synced with ${supabaseStatus.url}`
                    : 'All records, user accounts, and playlists are safely stored in browser database.'}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleConnect} autoComplete="off" className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                autoComplete="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)] font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect & Sync'}
              </button>

              {supabaseStatus.isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>

          {/* SQL Schema helper */}
          <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">Database Setup (supabase-schema.sql)</span>
              <button
                onClick={copySqlSnippet}
                className="flex items-center gap-1 text-[11px] text-[var(--accent-sage)] hover:underline font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Instruction'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              To initialize your remote cloud database, open your Supabase SQL Editor and execute the schema file in{' '}
              <code className="text-[var(--accent-sage)] font-mono font-bold">/supabase-schema.sql</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
