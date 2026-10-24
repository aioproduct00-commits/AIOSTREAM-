import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Database, Github, Cloud, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setIsSupabaseModalOpen, setIsAddVideoModalOpen } = useApp();

  return (
    <footer className="mt-20 border-t border-[#161B2B] bg-[#07080D] text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white">
                <Play className="w-3 h-3 fill-white ml-0.5" />
              </div>
              <span className="text-base font-bold text-white font-display tracking-tight">
                AIOSTREAM
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A modern, ad-free streaming and original-quality download platform. Built with React,
              TypeScript, Vite, and Supabase, optimized for continuous playback with zero advertising
              or disturbance.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                No Ad Injections
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                Cloudflare Pages Ready
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-white transition-colors"
                >
                  Discover Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="hover:text-white transition-colors"
                >
                  Categories & Genres
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('playlists')}
                  className="hover:text-white transition-colors"
                >
                  Playlists
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className="hover:text-white transition-colors"
                >
                  Downloads Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('history')}
                  className="hover:text-white transition-colors"
                >
                  Watch History
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Integrations */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-display">
              Cloud & Tools
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => setIsAddVideoModalOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Stream Any YouTube Video
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Supabase Database Sync</span>
                </button>
              </li>
              <li className="text-slate-500">Cloudflare Pages SPA Deployment</li>
              <li className="text-slate-500">Zero Commercial Interruptions</li>
            </ul>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="pt-8 border-t border-[#141826] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} AIOSTREAM. Free & Open Streaming Architecture.</div>
          <div className="flex items-center gap-4">
            <span>Original Bitrate Streaming</span>
            <span>·</span>
            <span>All YouTube Links Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
