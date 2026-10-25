import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Database, Shield, Cloud, FolderDown } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsSupabaseModalOpen, setIsAddVideoModalOpen, setIsAuthModalOpen, currentUser } = useApp();

  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[var(--accent-sage)] text-white flex items-center justify-center">
                <Play className="w-3 h-3 fill-white ml-0.5" />
              </div>
              <span className="text-base font-bold font-display tracking-tight text-[var(--text-primary)]">
                AIOSTREAM
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              A modern, ad-free streaming and original-quality download platform. Styled in natural sage green with dark and light themes, online storage database, creator accounts, and direct MP4 gallery downloads.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                No Ad Injections
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <FolderDown className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                MP4 Gallery Downloads
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-blue-500" />
                Cloudflare Pages Ready
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider font-display text-[var(--text-primary)]">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Discover Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Categories & Genres
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('playlists')}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Playlists & Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  My Gallery & Downloads
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('my-studio')}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Creator Studio & Uploads
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Integrations */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider font-display text-[var(--text-primary)]">
              Admin & Cloud
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              {currentUser?.role === 'admin' ? (
                <li>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-[var(--accent-sage)] font-semibold"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Admin Control Portal</span>
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-[var(--text-muted)]"
                  >
                    <Shield className="w-3 h-3 text-[var(--accent-sage)]" />
                    <span>Admin Access</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign In / Register Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                  <span>Supabase Database Sync</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsAddVideoModalOpen(true)}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Stream Any YouTube Link
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div>© {new Date().getFullYear()} AIOSTREAM. Free & Open Streaming Architecture.</div>
          <div className="flex items-center gap-4">
            <span>Sage Green Edition</span>
            <span>·</span>
            <span>Dark & Light Themes</span>
            <span>·</span>
            <span>All YouTube Links Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
