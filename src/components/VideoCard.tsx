import React, { useState } from 'react';
import { Play, Download, Heart, ListPlus, Check } from 'lucide-react';
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
    startDownload,
    playlists,
    addVideoToPlaylist,
    showToast,
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const favorited = isFavorite(video.id);

  return (
    <div className="group relative flex flex-col bg-[#0E111C] rounded-xl overflow-hidden border border-[#1B2032] hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200">
      {/* Video Thumbnail Stage */}
      <div
        onClick={() => playVideo(video)}
        className="relative aspect-video w-full bg-[#131726] overflow-hidden cursor-pointer"
      >
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#121626] to-[#0A0D17] text-center">
            <Play className="w-8 h-8 text-indigo-400 mb-2" />
            <span className="text-xs font-medium text-slate-300 line-clamp-2">{video.title}</span>
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

        {/* Quality indicator overlay (quiet corner) */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-medium text-indigo-300 border border-white/10">
          {video.qualityLabel}
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[11px] font-mono tabular-nums text-white">
          {video.durationFormatted}
        </div>

        {/* Hover quick play icon */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3
            onClick={() => playVideo(video)}
            className="text-sm font-semibold text-white group-hover:text-indigo-400 line-clamp-2 cursor-pointer transition-colors leading-snug"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Clean Unboxed Metadata (Rule: No pill enclosures) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 truncate">
            <span className="font-medium text-slate-300 truncate">{video.channelName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatViews(video.viewCount)} views</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#181D2E] text-slate-400">
          <div className="flex items-center gap-1">
            {/* Quick Favorite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(video.id);
              }}
              className={`p-1.5 rounded hover:bg-[#1A2033] transition-colors ${
                favorited ? 'text-rose-400' : 'hover:text-white'
              }`}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-400' : ''}`} />
            </button>

            {/* Quick Save to Playlist */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistMenu(!showPlaylistMenu);
                }}
                className="p-1.5 rounded hover:bg-[#1A2033] hover:text-white transition-colors"
                title="Add to playlist"
              >
                <ListPlus className="w-3.5 h-3.5" />
              </button>

              {showPlaylistMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-8 left-0 w-48 bg-[#111422] border border-[#23293F] rounded-lg shadow-2xl p-2 z-30 animate-in fade-in"
                >
                  <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1">
                    Add to Playlist
                  </div>
                  {playlists.map((pl) => {
                    const isAdded = pl.videoIds.includes(video.id);
                    return (
                      <button
                        key={pl.id}
                        onClick={() => {
                          addVideoToPlaylist(pl.id, video.id);
                          setShowPlaylistMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1 text-xs text-slate-200 hover:bg-[#1A2035] rounded transition-colors text-left"
                      >
                        <span className="truncate">{pl.title}</span>
                        {isAdded && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Direct Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              startDownload(video, '1080p Full HD');
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:text-white bg-[#141928] hover:bg-indigo-600 rounded transition-colors"
            title="Download in original quality"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
