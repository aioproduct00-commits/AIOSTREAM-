import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Play,
  Database,
  Plus,
  Bookmark,
  Download,
  History,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { extractYouTubeId } from '../lib/utils';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    supabaseStatus,
    setIsSupabaseModalOpen,
    setIsAddVideoModalOpen,
    downloads,
    favorites,
    playVideo,
    videos,
    showToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickPasteInput, setQuickPasteInput] = useState('');

  const activeDownloadsCount = downloads.filter((d) => d.status === 'downloading').length;

  const handleQuickStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasteInput.trim()) return;

    const ytId = extractYouTubeId(quickPasteInput);
    if (ytId) {
      // Find if already exists in videos
      const existing = videos.find((v) => v.youtubeId === ytId);
      if (existing) {
        playVideo(existing);
        setQuickPasteInput('');
        showToast('Now streaming direct without ads', 'success');
        return;
      }

      // Stream immediately as a transient or quick playable item
      playVideo({
        id: 'yt-direct-' + ytId,
        title: `YouTube Direct Stream [${ytId}]`,
        description: 'Ad-free direct YouTube video stream played via AIOSTREAM.',
        videoType: 'youtube',
        videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
        youtubeId: ytId,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        durationSeconds: 300,
        durationFormatted: '05:00',
        qualityLabel: '1080p HD',
        viewCount: 1,
        likeCount: 1,
        channelName: 'YouTube Stream',
        categoryId: 'trailers',
        tags: ['DirectStream'],
        createdAt: new Date().toISOString(),
      });
      setQuickPasteInput('');
      showToast('Direct stream loaded without ads!', 'success');
    } else if (quickPasteInput.endsWith('.mp4') || quickPasteInput.includes('.mp4?')) {
      playVideo({
        id: 'direct-mp4-' + Date.now(),
        title: 'Direct Video Stream',
        description: 'Original quality direct MP4 media stream.',
        videoType: 'direct_mp4',
        videoUrl: quickPasteInput.trim(),
        thumbnailUrl: '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg',
        durationSeconds: 600,
        durationFormatted: '10:00',
        qualityLabel: '4K Original',
        viewCount: 1,
        likeCount: 1,
        channelName: 'Direct Media Source',
        categoryId: 'trailers',
        tags: ['DirectStream', 'MP4'],
        createdAt: new Date().toISOString(),
      });
      setQuickPasteInput('');
      showToast('Direct MP4 video loaded!', 'success');
    } else {
      // Treat as search query
      setSearchQuery(quickPasteInput.trim());
      setActiveTab('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08090E]/90 backdrop-blur-md border-b border-[#181C2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display whitespace-nowrap">
                AIOSTREAM
              </span>
            </button>
          </div>

          {/* Quick Search / Direct Stream Bar */}
          <div className="hidden lg:flex flex-1 max-w-md items-center">
            <form onSubmit={handleQuickStream} className="w-full relative">
              <input
                type="text"
                value={quickPasteInput}
                onChange={(e) => setQuickPasteInput(e.target.value)}
                placeholder="Paste any YouTube URL or search videos..."
                className="w-full bg-[#10131F] border border-[#23293F] text-slate-100 text-xs rounded-lg pl-9 pr-24 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
              >
                Stream Now
              </button>
            </form>
          </div>

          {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'home' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'categories' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'playlists' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'favorites' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'downloads' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <span>Downloads</span>
              {activeDownloadsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Cloud Database Status */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#23293F] bg-[#10131F] text-slate-300 hover:text-white hover:border-slate-600 text-xs transition-colors"
              title={
                supabaseStatus.isConnected
                  ? 'Supabase Cloud Connected'
                  : 'Supabase Cloud: Local Database Active (Click to connect)'
              }
            >
              <Database
                className={`w-3.5 h-3.5 ${
                  supabaseStatus.isConnected ? 'text-emerald-400' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline text-[11px]">
                {supabaseStatus.isConnected ? 'Cloud Synced' : 'Database'}
              </span>
            </button>

            <button
              onClick={() => setIsAddVideoModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/25 transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Stream Any Video</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleQuickStream} className="relative">
            <input
              type="text"
              value={quickPasteInput}
              onChange={(e) => setQuickPasteInput(e.target.value)}
              placeholder="Paste YouTube link or search..."
              className="w-full bg-[#10131F] border border-[#23293F] text-slate-100 text-xs rounded-lg pl-9 pr-20 py-2 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-2.5 py-1 text-[11px] font-medium text-white bg-indigo-600 rounded"
            >
              Stream
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0F17] border-b border-[#1E2333] px-4 py-3 space-y-2 animate-in fade-in">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-200 hover:bg-[#161B2B]"
          >
            Discover All Videos
          </button>
          <button
            onClick={() => {
              setActiveTab('categories');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-200 hover:bg-[#161B2B]"
          >
            Categories & Genres
          </button>
          <button
            onClick={() => {
              setActiveTab('playlists');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-200 hover:bg-[#161B2B]"
          >
            Playlists & Collections
          </button>
          <button
            onClick={() => {
              setActiveTab('favorites');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-200 hover:bg-[#161B2B]"
          >
            Favorite Videos ({favorites.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('downloads');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-200 hover:bg-[#161B2B]"
          >
            Downloads Manager ({downloads.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-md text-xs font-medium text-slate-200 hover:bg-[#161B2B]"
          >
            Watch History
          </button>
        </div>
      )}
    </header>
  );
};
