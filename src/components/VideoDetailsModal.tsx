import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Film, Download, Play, Heart, Share2, Check, Radio } from 'lucide-react';
import { formatViews, formatDuration, formatBytes } from '../lib/utils';

export const VideoDetailsModal: React.FC = () => {
  const {
    videoDetailsModalVideo,
    setVideoDetailsModalVideo,
    playVideo,
    downloadToGallery,
    toggleFavorite,
    isFavorite,
    showToast,
  } = useApp();

  if (!videoDetailsModalVideo) return null;

  const video = videoDetailsModalVideo;
  const favorited = isFavorite(video.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.videoUrl);
    showToast('Ad-free stream link copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[var(--accent-sage)]" />
            <h2 className="text-sm font-bold font-display">Video Specifications & Media Details</h2>
          </div>
          <button
            onClick={() => setVideoDetailsModalVideo(null)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="relative w-36 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-[var(--border-subtle)]">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                {video.durationFormatted}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-[var(--text-primary)] leading-snug">
                {video.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Channel: <span className="font-semibold text-[var(--text-primary)]">{video.channelName}</span>
              </p>
              <div className="text-[11px] text-[var(--accent-sage)] font-semibold mt-1">
                {video.qualityLabel} · Ad-Free Stream
              </div>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Format / Stream Type</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {video.videoType.toUpperCase()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Resolution</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {video.resolution || '3840x2160 (4K UHD)'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Total Views</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                {formatViews(video.viewCount)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Download Size</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {formatBytes(video.downloadSizeBytes || 350000000)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-secondary)] leading-relaxed">
            {video.description}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                playVideo(video);
                setVideoDetailsModalVideo(null);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Stream Now</span>
            </button>

            <button
              onClick={() => {
                downloadToGallery(video, '1080p MP4');
                setVideoDetailsModalVideo(null);
              }}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-primary)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Save MP4 to Gallery</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Copy stream link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleFavorite(video.id)}
              className={`p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] ${
                favorited ? 'text-rose-500' : 'text-[var(--text-muted)]'
              }`}
              title="Favorite"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
