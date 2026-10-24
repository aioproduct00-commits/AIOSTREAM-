import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Download,
  Heart,
  ListPlus,
  Check,
  MoreVertical,
  Share2,
  Info,
  Edit3,
  Trash2,
  FolderDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatViews } from '../lib/utils';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const {
    playVideo,
    isFavorite,
    toggleFavorite,
    downloadToGallery,
    playlists,
    addVideoToPlaylist,
    currentUser,
    deleteVideo,
    setVideoDetailsModalVideo,
    setVideoEditModalVideo,
    showToast,
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const favorited = isFavorite(video.id);

  const canManage =
    currentUser?.role === 'admin' ||
    (currentUser && (currentUser.id === video.uploaderId || currentUser.email === video.uploaderEmail));

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowThreeDotMenu(false);
        setShowPlaylistMenu(false);
      }
    };
    if (showThreeDotMenu || showPlaylistMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThreeDotMenu, showPlaylistMenu]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.videoUrl);
    showToast('Stream link copied to clipboard!', 'success');
    setShowThreeDotMenu(false);
  };

  const handleDownloadGallery = () => {
    downloadToGallery(video, '1080p MP4');
    setShowThreeDotMenu(false);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-sage)] hover:shadow-xl hover:shadow-[var(--accent-sage-glow)]">
      {/* Video Thumbnail Stage */}
      <div
        onClick={() => playVideo(video)}
        className="relative aspect-video w-full bg-[var(--bg-surface-elevated)] overflow-hidden cursor-pointer"
      >
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[var(--bg-surface-elevated)] text-center">
            <Play className="w-8 h-8 text-[var(--accent-sage)] mb-2" />
            <span className="text-xs font-medium text-[var(--text-secondary)] line-clamp-2">
              {video.title}
            </span>
          </div>
        ) : (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {/* Quality indicator overlay */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-semibold text-white border border-white/10">
          {video.qualityLabel}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[11px] font-mono tabular-nums text-white">
          {video.durationFormatted}
        </div>

        {/* Hover quick play icon */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => playVideo(video)}
              className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] line-clamp-2 cursor-pointer transition-colors leading-snug flex-1"
              title={video.title}
            >
              {video.title}
            </h3>

            {/* THREE-DOT MENU BUTTON (MoreVertical) */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThreeDotMenu(!showThreeDotMenu);
                }}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                title="More Options"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* THREE-DOT DROPDOWN MENU */}
              {showThreeDotMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 w-56 rounded-xl border shadow-2xl p-1.5 z-40 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in"
                >
                  <button
                    onClick={handleDownloadGallery}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--accent-sage)]"
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>Download MP4 to Gallery</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPlaylistMenu(true);
                      setShowThreeDotMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>Save to Playlist</span>
                  </button>

                  <button
                    onClick={() => {
                      toggleFavorite(video.id);
                      setShowThreeDotMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                  >
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{favorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Stream Link</span>
                  </button>

                  <button
                    onClick={() => {
                      setVideoDetailsModalVideo(video);
                      setShowThreeDotMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)] border-t border-[var(--border-subtle)] mt-1 pt-2"
                  >
                    <Info className="w-4 h-4" />
                    <span>Video Specs & Tech Info</span>
                  </button>

                  {canManage && (
                    <>
                      <button
                        onClick={() => {
                          setVideoEditModalVideo(video);
                          setShowThreeDotMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Video Details</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${video.title}"?`)) {
                            deleteVideo(video.id);
                          }
                          setShowThreeDotMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 text-left font-medium text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Video</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Nested Playlist picker */}
              {showPlaylistMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 w-52 rounded-xl border shadow-2xl p-2 z-40 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in"
                >
                  <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-2 py-1">
                    Select Playlist
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {playlists.map((pl) => {
                      const isAdded = pl.videoIds.includes(video.id);
                      return (
                        <button
                          key={pl.id}
                          onClick={() => {
                            addVideoToPlaylist(pl.id, video.id);
                            setShowPlaylistMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors text-left"
                        >
                          <span className="truncate">{pl.title}</span>
                          {isAdded && <Check className="w-3.5 h-3.5 text-[var(--accent-sage)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clean Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-2 truncate">
            <span className="font-semibold text-[var(--text-secondary)] truncate">
              {video.channelName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatViews(video.viewCount)} views</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border-subtle)] text-[var(--text-muted)]">
          <button
            onClick={() => toggleFavorite(video.id)}
            className={`p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] transition-colors ${
              favorited ? 'text-rose-500' : 'hover:text-[var(--text-primary)]'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Download MP4 in Gallery Button */}
          <button
            onClick={handleDownloadGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] rounded-xl shadow-xs transition-colors"
            title="Download MP4 to Gallery"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download MP4</span>
          </button>
        </div>
      </div>
    </div>
  );
};
