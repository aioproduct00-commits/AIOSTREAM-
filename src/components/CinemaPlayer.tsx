import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Heart,
  ListPlus,
  Share2,
  X,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Check,
  Radio,
} from 'lucide-react';
import { formatViews, formatDuration, formatBytes } from '../lib/utils';
import type { Video } from '../types';

export const CinemaPlayer: React.FC = () => {
  const {
    activeVideo,
    closePlayer,
    theaterMode,
    setTheaterMode,
    isFavorite,
    toggleFavorite,
    startDownload,
    updateHistoryProgress,
    videos,
    playVideo,
    showToast,
    playlists,
    addVideoToPlaylist,
    createPlaylist,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!activeVideo) return null;

  const isDirectVideo = activeVideo.videoType === 'direct_mp4' || activeVideo.videoType === 'webm';
  const favorited = isFavorite(activeVideo.id);

  // Suggested videos (same category or popular)
  const upNextVideos = videos
    .filter((v) => v.id !== activeVideo.id)
    .sort((a, b) => (a.categoryId === activeVideo.categoryId ? -1 : 1))
    .slice(0, 5);

  // Direct video controls effect
  useEffect(() => {
    if (isDirectVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.volume = volume;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [activeVideo, isDirectVideo]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || activeVideo.durationSeconds;
      setCurrentTime(cur);
      setDuration(dur);
      updateHistoryProgress(activeVideo.id, cur, dur);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    showToast(`Playback speed set to ${rate}x`, 'info');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeVideo.videoUrl);
      showToast('Stream link copied to clipboard!', 'success');
    }
  };

  const handleAddToExistingPlaylist = (plId: string) => {
    addVideoToPlaylist(plId, activeVideo.id);
    setShowPlaylistMenu(false);
  };

  const handleCreateAndAddPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    const pl = createPlaylist(newPlaylistTitle.trim(), 'Custom playlist in AIOSTREAM');
    addVideoToPlaylist(pl.id, activeVideo.id);
    setNewPlaylistTitle('');
    setShowPlaylistMenu(false);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#08090E] transition-all duration-300 pb-10 border-b border-[#181C2A] ${
        theaterMode ? 'px-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4'
      }`}
    >
      {/* Top Bar inside Player (Controls & Theater mode toggle) */}
      <div className="flex items-center justify-between py-2 px-3 bg-[#0D0F18] border-b border-[#1A1F30] text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 truncate max-w-md">
            {activeVideo.title}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-indigo-400 font-medium">{activeVideo.qualityLabel}</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            Ad-Free Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheaterMode(!theaterMode)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161B2B] hover:bg-[#20273D] text-slate-300 hover:text-white transition-colors"
            title="Toggle Theater Mode"
          >
            {theaterMode ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-medium">
              {theaterMode ? 'Standard View' : 'Theater Mode'}
            </span>
          </button>

          <button
            onClick={closePlayer}
            className="p-1 rounded bg-[#161B2B] hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Player Container */}
      <div
        className={`grid gap-6 ${
          theaterMode ? 'grid-cols-1 max-w-7xl mx-auto px-4 sm:px-6 mt-4' : 'lg:grid-cols-3 mt-2'
        }`}
      >
        {/* Left / Center Video Stage */}
        <div className={theaterMode ? 'w-full' : 'lg:col-span-2'}>
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-[#1E2333] group">
            {isDirectVideo ? (
              // Native HTML5 Direct MP4/WebM Video with custom controls
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeVideo.videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />

                {/* Direct Player Custom Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  {/* Progress bar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
                  />

                  {/* Controls row */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleTogglePlay}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button onClick={toggleMute} className="text-slate-300 hover:text-white">
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-slate-600 rounded appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div className="text-[11px] font-mono tabular-nums text-slate-300">
                        {formatDuration(currentTime)} / {formatDuration(duration || activeVideo.durationSeconds)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Speed selector */}
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                        {[0.75, 1, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => changeSpeed(spd)}
                            className={`px-1 rounded ${
                              playbackSpeed === spd ? 'font-bold text-indigo-400' : 'text-slate-300'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // YouTube Embed without Ads: modestbranding, rel=0, iv_load_policy=3, nocookie
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>

          {/* Action Row and Metadata */}
          <div className="mt-4">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              {activeVideo.title}
            </h1>

            {/* Unboxed Metadata (Rule: No pill enclosures) */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{activeVideo.channelName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatViews(activeVideo.viewCount)} views</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeVideo.durationFormatted}</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-400 font-medium">{activeVideo.qualityLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Zero Disturbance Mode</span>
            </div>

            {/* Interactive Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#181C2A]">
              <div className="flex items-center gap-2">
                {/* Download Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Original</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-[#111422] border border-[#23293F] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Select Download Format
                      </div>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, '4K UHD (Master)');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-[#1A2035] rounded-lg transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-white">4K UHD Original</div>
                          <div className="text-[10px] text-slate-400">Master Bitrate · MP4</div>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-400">
                          {formatBytes(activeVideo.downloadSizeBytes || 450000000)}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, '1080p Full HD');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-[#1A2035] rounded-lg transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-white">1080p Full HD</div>
                          <div className="text-[10px] text-slate-400">High Speed · MP4</div>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-400">
                          {formatBytes(Math.floor((activeVideo.downloadSizeBytes || 450000000) * 0.6))}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, '720p HD');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-[#1A2035] rounded-lg transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-white">720p HD Compact</div>
                          <div className="text-[10px] text-slate-400">Data Saver · MP4</div>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-400">
                          {formatBytes(Math.floor((activeVideo.downloadSizeBytes || 450000000) * 0.35))}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, 'Audio MP3 (320kbps)');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-[#1A2035] rounded-lg transition-colors text-left border-t border-[#1E2438] mt-1 pt-1"
                      >
                        <div>
                          <div className="font-medium text-white">Audio Track Only</div>
                          <div className="text-[10px] text-slate-400">MP3 · 320 kbps Studio</div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {formatBytes(15000000)}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(activeVideo.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    favorited
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-[#10131F] border-[#23293F] text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-400 text-rose-400' : ''}`} />
                  <span>{favorited ? 'Favorited' : 'Favorite'}</span>
                </button>

                {/* Add to Playlist */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#23293F] bg-[#10131F] text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Save to Playlist</span>
                  </button>

                  {showPlaylistMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-[#111422] border border-[#23293F] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in">
                      <div className="text-xs font-semibold text-white mb-2">Save to Playlist</div>

                      <div className="max-h-36 overflow-y-auto space-y-1 mb-3">
                        {playlists.map((pl) => {
                          const hasVideo = pl.videoIds.includes(activeVideo.id);
                          return (
                            <button
                              key={pl.id}
                              onClick={() => handleAddToExistingPlaylist(pl.id)}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-200 hover:bg-[#1A2035] rounded-md transition-colors text-left"
                            >
                              <span className="truncate">{pl.title}</span>
                              {hasVideo && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <form onSubmit={handleCreateAndAddPlaylist} className="border-t border-[#1E2438] pt-2">
                        <input
                          type="text"
                          value={newPlaylistTitle}
                          onChange={(e) => setNewPlaylistTitle(e.target.value)}
                          placeholder="New playlist name..."
                          className="w-full px-2 py-1 bg-[#0A0C14] border border-[#23293F] rounded text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 mb-2"
                        />
                        <button
                          type="submit"
                          className="w-full py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                        >
                          Create & Add
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#23293F] bg-[#10131F] text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  title="Copy Stream Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* YouTube original link fallback */}
              {activeVideo.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Open YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Video Description & Tags Box */}
            <div className="mt-4 p-4 rounded-xl bg-[#0F121E] border border-[#1B2033]">
              <p
                className={`text-xs text-slate-300 leading-relaxed ${
                  showFullDescription ? '' : 'line-clamp-2'
                }`}
              >
                {activeVideo.description}
              </p>
              {activeVideo.description.length > 120 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-1 inline-block"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}

              {/* Tags rendered as clean unboxed text */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#181D2E] text-[11px] text-slate-400">
                <span className="text-slate-500">Tags:</span>
                {activeVideo.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span className="text-slate-300">#{tag}</span>
                    {idx < activeVideo.tags.length - 1 && <span className="text-slate-600">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Up Next Queue */}
        <div className={theaterMode ? 'w-full mt-6' : 'lg:col-span-1'}>
          <div className="bg-[#0C0E17] rounded-xl border border-[#191D2D] p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#181C2A]">
              <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-display">
                Up Next (Zero Ads)
              </h3>
              <span className="text-[11px] text-slate-500">Continuous Stream</span>
            </div>

            <div className="space-y-3">
              {upNextVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => playVideo(video)}
                  className="flex gap-3 group cursor-pointer p-1.5 rounded-lg hover:bg-[#141826] transition-colors"
                >
                  <div className="relative w-28 aspect-video rounded-md overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/85 text-[10px] font-mono tabular-nums text-white">
                      {video.durationFormatted}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-slate-200 group-hover:text-indigo-400 line-clamp-2 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {video.channelName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono tabular-nums">{formatViews(video.viewCount)} views</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-400/90">{video.qualityLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
