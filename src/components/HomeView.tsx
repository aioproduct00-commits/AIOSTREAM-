import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import {
  Play,
  Download,
  Plus,
  Radio,
  SlidersHorizontal,
  Compass,
  Film,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
} from 'lucide-react';
import type { Video } from '../types';

export const HomeView: React.FC = () => {
  const {
    videos,
    categories,
    playVideo,
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
      // Category filter
      if (activeCategoryFilter !== 'all' && v.categoryId !== activeCategoryFilter) {
        return false;
      }
      // Search query filter
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-in fade-in">
      {/* Search Header if actively searching */}
      {searchQuery && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F1322] border border-[#23293F]">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-300">
              Showing results for &ldquo;<span className="text-white font-semibold">{searchQuery}</span>&rdquo;
            </span>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Split-Screen Hero Showcase (Design Constitution Section 2.B) */}
      {!searchQuery && heroVideo && (
        <section className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-2xl bg-gradient-to-br from-[#0F121E] via-[#0B0D17] to-[#07080D] border border-[#1C2136] p-6 lg:p-8 overflow-hidden shadow-2xl">
            {/* Left Column: Typographic Hierarchy */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Quiet 1-line text kicker (Rule: No pill enclosures) */}
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium tracking-wide">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    Cinema-Grade Ad-Free Streaming
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">Master 4K Visuals</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight mt-3 text-balance leading-tight">
                  Stream & Download in Original Quality.
                </h1>

                <p className="text-sm text-slate-300 max-w-xl mt-4 leading-relaxed font-normal">
                  Enjoy zero ads, zero commercial breaks, and zero tracking. Stream any YouTube video
                  or high-bitrate media file with cinema audio and original 4K resolution downloads.
                </p>
              </div>

              {/* Primary Call to Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => playVideo(heroVideo)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Stream Featured Trailer</span>
                </button>

                <button
                  onClick={() => setIsAddVideoModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141828] hover:bg-[#1E243A] text-slate-200 text-xs font-medium border border-[#23293F] transition-colors"
                >
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>Direct Stream Any Video</span>
                </button>
              </div>
            </div>

            {/* Right Column: Large Visual Media Container */}
            <div className="lg:col-span-6 relative aspect-video lg:aspect-auto rounded-xl overflow-hidden border border-[#22283E] group shadow-inner">
              <img
                src="/src/assets/images/hero_aiostream_cinema_1792827556593.jpg"
                alt="AIOSTREAM IMAX Theater"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
                <div className="text-xs font-medium text-indigo-300">Featured Presentation</div>
                <div className="text-base font-bold text-white tracking-tight mt-0.5 line-clamp-1">
                  {heroVideo.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{heroVideo.channelName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{heroVideo.qualityLabel}</span>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <button
                onClick={() => playVideo(heroVideo)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 hover:bg-indigo-500 transition-all"
                aria-label="Play featured video"
              >
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </button>
            </div>
          </div>

          {/* Full-width KPI Strip below the hero split (Section 2.B rule) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#181D2E] text-xs">
            <div className="p-3 rounded-xl bg-[#0C0E17] border border-[#181D2E] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">100% Ad-Free</div>
                <div className="text-[11px] text-slate-400">Zero banner or pre-roll ads</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0C0E17] border border-[#181D2E] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Original 4K Bitrate</div>
                <div className="text-[11px] text-slate-400">Uncompressed audio & visual</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0C0E17] border border-[#181D2E] flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">Direct Downloads</div>
                <div className="text-[11px] text-slate-400">Save 4K, 1080p or audio MP3</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0C0E17] border border-[#181D2E] flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">YouTube Integration</div>
                <div className="text-[11px] text-slate-400">Paste any link to watch live</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Filter Controls & Sorting Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#181D2E]">
          {/* Functional Segmented Controls for Category Filtering */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeCategoryFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#10131F] text-slate-300 hover:text-white hover:bg-[#181D2E] border border-[#20273D]'
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#10131F] text-slate-300 hover:text-white hover:bg-[#181D2E] border border-[#20273D]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#10131F] border border-[#20273D] text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
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
            <p className="text-sm text-slate-400">No videos match your criteria.</p>
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-indigo-400 hover:underline"
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
