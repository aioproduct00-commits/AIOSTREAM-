import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import {
  Play,
  Download,
  Plus,
  Radio,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  FolderDown,
  Layers,
} from 'lucide-react';
import type { Video } from '../types';

export const HomeView: React.FC = () => {
  const {
    videos,
    categories,
    playVideo,
    downloadToGallery,
    searchQuery,
    setSearchQuery,
    setIsAddVideoModalOpen,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'newest' | 'duration'>('views');

  // Featured hero video
  const heroVideo = videos.find((v) => v.id === 'vid-interstellar-imax') || videos[0];

  // Filtered and sorted videos
  const displayedVideos = videos
    .filter((v) => {
      if (activeCategoryFilter !== 'all' && v.categoryId !== activeCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(query);
        const matchesChannel = v.channelName.toLowerCase().includes(query);
        const matchesTags = v.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesChannel || matchesTags;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return b.viewCount - a.viewCount;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'duration') return b.durationSeconds - a.durationSeconds;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in text-[var(--text-primary)]">
      {/* Search Header if actively searching */}
      {searchQuery && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--accent-sage)]" />
            <span className="text-xs text-[var(--text-secondary)]">
              Showing results for &ldquo;<span className="text-[var(--text-primary)] font-bold">{searchQuery}</span>&rdquo;
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[var(--accent-sage)] hover:underline font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Split-Screen Hero Showcase (Design Constitution Section 2.B) */}
      {!searchQuery && heroVideo && (
        <section className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 lg:p-8 overflow-hidden shadow-sm">
            {/* Left Column: Typographic Hierarchy */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Quiet 1-line text kicker */}
                <div className="flex items-center gap-2 text-xs text-[var(--accent-sage)] font-semibold tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[var(--accent-sage)] animate-pulse" />
                    Cinema-Grade Ad-Free Streaming
                  </span>
                  <span aria-hidden="true" className="text-[var(--text-muted)]">·</span>
                  <span className="text-[var(--text-muted)] font-normal">Original 4K Master Audio</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] font-display tracking-tight mt-3 text-balance leading-tight">
                  Stream & Download in Original Quality.
                </h1>

                <p className="text-sm text-[var(--text-secondary)] max-w-xl mt-4 leading-relaxed font-normal">
                  Enjoy zero ads, zero commercial breaks, and zero tracking. Stream any YouTube video
                  or high-bitrate media file with cinema audio and direct MP4 gallery downloads.
                </p>
              </div>

              {/* Primary Call to Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => playVideo(heroVideo)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-[var(--accent-sage-glow)] transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Stream Featured Trailer</span>
                </button>

                <button
                  onClick={() => downloadToGallery(heroVideo, '4K UHD Master MP4')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-semibold transition-colors"
                >
                  <FolderDown className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span>Download MP4 in Gallery</span>
                </button>
              </div>
            </div>

            {/* Right Column: Large Visual Media Container */}
            <div className="lg:col-span-6 relative aspect-video lg:aspect-auto rounded-2xl overflow-hidden border border-[var(--border-subtle)] group shadow-inner">
              <img
                src="/src/assets/images/hero_aiostream_cinema_1792827556593.jpg"
                alt="AIOSTREAM Cinema"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5">
                <div className="text-xs font-semibold text-white/90">Featured Presentation</div>
                <div className="text-base font-bold text-white tracking-tight mt-0.5 line-clamp-1">
                  {heroVideo.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70 mt-1">
                  <span>{heroVideo.channelName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{heroVideo.qualityLabel}</span>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <button
                onClick={() => playVideo(heroVideo)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center shadow-xl hover:scale-110 hover:bg-[var(--accent-sage-hover)] transition-all"
                aria-label="Play featured video"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            </div>
          </div>

          {/* Full-width KPI Strip below the hero split */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)] text-xs">
            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">100% Ad-Free</div>
                <div className="text-[11px] text-[var(--text-muted)]">Zero banners or pre-rolls</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--accent-sage)] shrink-0" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">Original Bitrate</div>
                <div className="text-[11px] text-[var(--text-muted)]">Uncompressed 4K visuals</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-3">
              <FolderDown className="w-5 h-5 text-[var(--accent-sage)] shrink-0" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">Gallery MP4 Downloads</div>
                <div className="text-[11px] text-[var(--text-muted)]">Save any pasted stream</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">YouTube Integration</div>
                <div className="text-[11px] text-[var(--text-muted)]">Paste any link to watch live</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Filter Controls & Sorting Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          {/* Functional Segmented Controls for Category Filtering */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                activeCategoryFilter === 'all'
                  ? 'bg-[var(--accent-sage)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]'
              }`}
            >
              All Streams ({videos.length})
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[var(--accent-sage)] text-white shadow-xs'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-xs text-[var(--text-muted)]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
            >
              <option value="views">Most Viewed</option>
              <option value="newest">Newest Added</option>
              <option value="duration">Longest Duration</option>
            </select>
          </div>
        </div>

        {/* Video Catalog Grid */}
        {displayedVideos.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[var(--text-muted)]">No videos match your criteria.</p>
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-[var(--accent-sage)] hover:underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
