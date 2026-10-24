import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Play,
  Database,
  Plus,
  Download,
  Menu,
  X,
  Sun,
  Moon,
  User as UserIcon,
  Shield,
  Upload,
  LogOut,
  FolderDown,
  Layers,
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
    isAuthModalOpen,
    setIsAuthModalOpen,
    downloads,
    favorites,
    playVideo,
    downloadToGallery,
    videos,
    theme,
    toggleTheme,
    currentUser,
    logout,
    showToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickPasteInput, setQuickPasteInput] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const activeDownloadsCount = downloads.filter((d) => d.status === 'downloading').length;

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleQuickStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasteInput.trim()) return;

    const ytId = extractYouTubeId(quickPasteInput);
    if (ytId) {
      const existing = videos.find((v) => v.youtubeId === ytId);
      if (existing) {
        playVideo(existing);
        setQuickPasteInput('');
        showToast('Now streaming direct without ads', 'success');
        return;
      }

      playVideo({
        id: 'yt-direct-' + ytId,
        title: `YouTube Direct Stream [${ytId}]`,
        description: 'Ad-free direct YouTube video stream playing via AIOSTREAM.',
        videoType: 'youtube',
        videoUrl: `https://www.youtube.com/watch?v=${ytId}`,
        youtubeId: ytId,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        durationSeconds: 300,
        durationFormatted: '05:00',
        qualityLabel: '1080p HD',
        viewCount: 1,
        likeCount: 1,
        channelName: 'YouTube Direct',
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
      setSearchQuery(quickPasteInput.trim());
      setActiveTab('home');
    }
  };

  const handleQuickDownloadGallery = () => {
    if (!quickPasteInput.trim()) {
      showToast('Paste a video URL first to download MP4 to your gallery', 'error');
      return;
    }
    const ytId = extractYouTubeId(quickPasteInput);
    const targetUrl = quickPasteInput.trim();

    downloadToGallery({
      id: 'gallery-direct-' + Date.now(),
      title: ytId ? `Stream_${ytId}` : 'AIOSTREAM_Video',
      description: 'Saved from pasted link to gallery.',
      videoType: ytId ? 'youtube' : 'direct_mp4',
      videoUrl: targetUrl,
      thumbnailUrl: ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg',
      durationSeconds: 300,
      durationFormatted: '05:00',
      qualityLabel: '1080p Original MP4',
      viewCount: 1,
      likeCount: 0,
      channelName: 'Pasted Stream',
      categoryId: 'trailers',
      tags: ['GalleryDownload'],
      createdAt: new Date().toISOString(),
    });
    setQuickPasteInput('');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b transition-colors bg-[var(--bg-base)]/90 border-[var(--border-subtle)] text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark in Display font */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('home');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-sage)] text-white flex items-center justify-center shadow-md shadow-[var(--accent-sage-glow)] group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight font-display whitespace-nowrap text-[var(--text-primary)]">
                AIOSTREAM
              </span>
            </button>
          </div>

          {/* Center Search / Paste Link Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg items-center">
            <form onSubmit={handleQuickStream} className="w-full relative flex items-center">
              <input
                type="text"
                value={quickPasteInput}
                onChange={(e) => setQuickPasteInput(e.target.value)}
                placeholder="Paste any YouTube URL or search videos..."
                className="w-full rounded-xl border pl-9 pr-36 py-2 text-xs transition-colors bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3" />

              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleQuickDownloadGallery}
                  className="px-2 py-1 text-[10px] font-semibold text-[var(--accent-sage)] hover:bg-[var(--accent-sage-light)] rounded transition-colors"
                  title="Download MP4 to Gallery"
                >
                  Save MP4
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] rounded-lg transition-colors"
                >
                  Stream
                </button>
              </div>
            </form>
          </div>

          {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-[var(--text-secondary)]">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'home' ? 'text-[var(--accent-sage)] font-bold' : ''
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'categories' ? 'text-[var(--accent-sage)] font-bold' : ''
              }`}
            >
              Genres
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'playlists' ? 'text-[var(--accent-sage)] font-bold' : ''
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'downloads' ? 'text-[var(--accent-sage)] font-bold' : ''
              }`}
            >
              <span>Gallery & Downloads</span>
              {activeDownloadsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[var(--accent-sage)] animate-pulse" />
              )}
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('my-studio')}
                className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'my-studio' ? 'text-[var(--accent-sage)] font-bold' : ''
                }`}
              >
                My Studio
              </button>
            )}

            <button
              onClick={() => setActiveTab('admin')}
              className={`hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 ${
                activeTab === 'admin' ? 'text-[var(--accent-sage)] font-bold' : ''
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Theme switch, Account, Stream Any Video) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle dark/light theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--accent-sage)]" />
              )}
            </button>

            {/* Cloud Database shortcut */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs text-[var(--text-secondary)] transition-colors"
              title={supabaseStatus.isConnected ? 'Supabase Connected' : 'Local Storage Mode'}
            >
              <Database
                className={`w-3.5 h-3.5 ${
                  supabaseStatus.isConnected ? 'text-emerald-500' : 'text-[var(--text-muted)]'
                }`}
              />
              <span className="text-[11px] font-medium hidden md:inline">
                {supabaseStatus.isConnected ? 'Cloud Sync' : 'Database'}
              </span>
            </button>

            {/* Stream Any Video Primary Button */}
            <button
              onClick={() => setIsAddVideoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stream Any Video</span>
            </button>

            {/* User Account Button / Menu */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <span className="text-xs font-semibold text-[var(--text-primary)] max-w-[90px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown */}
              {userDropdownOpen && currentUser && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                    <div className="font-bold text-xs truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{currentUser.email}</div>
                    {currentUser.role === 'admin' && (
                      <span className="inline-block text-[9px] font-bold text-white bg-[var(--accent-sage)] px-1.5 py-0.5 rounded mt-1">
                        ADMINISTRATOR
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('my-studio');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                  >
                    <Upload className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                    <span>My Studio & Uploads</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                  >
                    <Shield className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                    <span>Admin Control Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('downloads');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>My Gallery & Downloads</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-rose-500/10 text-left font-medium text-rose-500 border-t border-[var(--border-subtle)] mt-1 pt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleQuickStream} className="relative flex items-center">
            <input
              type="text"
              value={quickPasteInput}
              onChange={(e) => setQuickPasteInput(e.target.value)}
              placeholder="Paste YouTube link or search..."
              className="w-full rounded-xl border pl-9 pr-28 py-2 text-xs bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3" />
            <div className="absolute right-1 flex items-center gap-1">
              <button
                type="button"
                onClick={handleQuickDownloadGallery}
                className="px-2 py-1 text-[10px] font-semibold text-[var(--accent-sage)]"
              >
                Save
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[var(--accent-sage)] rounded-lg"
              >
                Stream
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-2 animate-in fade-in text-[var(--text-primary)]">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface-hover)]"
          >
            Discover All Videos
          </button>
          <button
            onClick={() => {
              setActiveTab('categories');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface-hover)]"
          >
            Categories & Genres
          </button>
          <button
            onClick={() => {
              setActiveTab('playlists');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface-hover)]"
          >
            Playlists & Collections
          </button>
          <button
            onClick={() => {
              setActiveTab('downloads');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface-hover)] flex items-center justify-between"
          >
            <span>My Gallery & Downloads</span>
            <span className="font-mono text-[10px] text-[var(--accent-sage)] font-bold">
              {downloads.length} files
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('my-studio');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface-hover)] text-[var(--accent-sage)]"
          >
            Creator Studio & Uploads
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl text-xs font-semibold hover:bg-[var(--bg-surface-hover)] text-[var(--accent-sage)] flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Portal</span>
          </button>
        </div>
      )}
    </header>
  );
};
