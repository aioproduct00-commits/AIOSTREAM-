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
  ExternalLink,
  ChevronDown,
  MoreVertical,
  Info,
  Edit3,
  Check,
  Radio,
  FolderDown,
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
    downloadToGallery,
    updateHistoryProgress,
    videos,
    playVideo,
    showToast,
    playlists,
    addVideoToPlaylist,
    createPlaylist,
    currentUser,
    setVideoDetailsModalVideo,
    setVideoEditModalVideo,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!activeVideo) return null;

  const isDirectVideo =
    activeVideo.videoType === 'direct_mp4' ||
    activeVideo.videoType === 'webm' ||
    activeVideo.videoType === 'local_upload';
  const favorited = isFavorite(activeVideo.id);

  const canManage =
    currentUser?.role === 'admin' ||
    (currentUser &&
      (currentUser.id === activeVideo.uploaderId || currentUser.email === activeVideo.uploaderEmail));

  // Suggested videos
  const upNextVideos = videos
    .filter((v) => v.id !== activeVideo.id)
    .sort((a, b) => (a.categoryId === activeVideo.categoryId ? -1 : 1))
    .slice(0, 5);

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
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
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
      className={`w-full transition-all duration-300 pb-10 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] ${
        theaterMode ? 'px-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4'
      }`}
    >
      {/* Top Bar inside Player */}
      <div className="flex items-center justify-between py-2 px-3 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-[var(--text-primary)] truncate max-w-md">
            {activeVideo.title}
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--accent-sage)] font-semibold">{activeVideo.qualityLabel}</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-emerald-500 font-medium flex items-center gap-1 shrink-0">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            Zero Disturbance Mode
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setTheaterMode(!theaterMode)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Toggle Theater Mode"
          >
            {theaterMode ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-medium">
              {theaterMode ? 'Standard' : 'Theater'}
            </span>
          </button>

          <button
            onClick={closePlayer}
            className="p-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
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
        {/* Left Video Stage */}
        <div className={theaterMode ? 'w-full' : 'lg:col-span-2'}>
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] group">
            {isDirectVideo ? (
              // HTML5 Direct Video Player with Sage accents
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeVideo.videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-[var(--accent-sage)] mb-3"
                  />

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
                          className="w-16 h-1 bg-slate-600 rounded appearance-none cursor-pointer accent-[var(--accent-sage)]"
                        />
                      </div>

                      <div className="text-[11px] font-mono tabular-nums text-slate-300">
                        {formatDuration(currentTime)} / {formatDuration(duration || activeVideo.durationSeconds)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                        {[0.75, 1, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => changeSpeed(spd)}
                            className={`px-1 rounded ${
                              playbackSpeed === spd ? 'font-bold text-[var(--accent-sage)]' : 'text-slate-300'
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
              // YouTube Embed without Ads
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
            <h1 className="text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
              {activeVideo.title}
            </h1>

            {/* Unboxed Metadata (Zero-pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text-secondary)]">{activeVideo.channelName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formatViews(activeVideo.viewCount)} views</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeVideo.durationFormatted}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--accent-sage)] font-semibold">{activeVideo.qualityLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Direct Ad-Free Stream</span>
            </div>

            {/* Interactive Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center gap-2">
                {/* PRIMARY ACTION: Download MP4 in Gallery */}
                <button
                  onClick={() => downloadToGallery(activeVideo, '1080p Original MP4')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] active:scale-[0.99] rounded-xl shadow-md transition-all"
                >
                  <FolderDown className="w-4 h-4" />
                  <span>Download MP4 in Gallery</span>
                </button>

                {/* Multi-Quality Download Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                    <span>Quality Options</span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute left-0 mt-2 w-64 rounded-xl border shadow-2xl p-2 z-50 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in">
                      <div className="px-3 py-1 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Select Stream Format
                      </div>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, '4K UHD (Master)');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] rounded-lg text-left"
                      >
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">4K UHD Master</div>
                          <div className="text-[10px] text-[var(--text-muted)]">Original High Bitrate · MP4</div>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--accent-sage)]">
                          {formatBytes(activeVideo.downloadSizeBytes || 450000000)}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, '1080p Full HD');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] rounded-lg text-left"
                      >
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">1080p Full HD</div>
                          <div className="text-[10px] text-[var(--text-muted)]">High Speed · MP4</div>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--accent-sage)]">
                          {formatBytes(Math.floor((activeVideo.downloadSizeBytes || 450000000) * 0.6))}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          startDownload(activeVideo, 'Audio MP3 (320kbps)');
                          setShowDownloadMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] rounded-lg text-left border-t border-[var(--border-subtle)] mt-1 pt-1"
                      >
                        <div>
                          <div className="font-semibold text-[var(--text-primary)]">Audio Track Only</div>
                          <div className="text-[10px] text-[var(--text-muted)]">MP3 · 320 kbps Studio</div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-500">
                          {formatBytes(15000000)}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(activeVideo.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    favorited
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
                  <span>{favorited ? 'Favorited' : 'Favorite'}</span>
                </button>

                {/* Add to Playlist */}
                <div className="relative">
                  <button
                    onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-secondary)]"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Save to Playlist</span>
                  </button>

                  {showPlaylistMenu && (
                    <div className="absolute left-0 mt-2 w-64 rounded-xl border shadow-2xl p-3 z-50 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in">
                      <div className="text-xs font-bold mb-2">Save to Playlist</div>
                      <div className="max-h-36 overflow-y-auto space-y-1 mb-3">
                        {playlists.map((pl) => {
                          const hasVideo = pl.videoIds.includes(activeVideo.id);
                          return (
                            <button
                              key={pl.id}
                              onClick={() => handleAddToExistingPlaylist(pl.id)}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] rounded-md text-left"
                            >
                              <span className="truncate">{pl.title}</span>
                              {hasVideo && <Check className="w-3.5 h-3.5 text-[var(--accent-sage)] shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      <form onSubmit={handleCreateAndAddPlaylist} className="border-t border-[var(--border-subtle)] pt-2">
                        <input
                          type="text"
                          value={newPlaylistTitle}
                          onChange={(e) => setNewPlaylistTitle(e.target.value)}
                          placeholder="New playlist name..."
                          className="w-full px-2 py-1 border border-[var(--border-subtle)] bg-[var(--bg-base)] rounded text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)] mb-2"
                        />
                        <button
                          type="submit"
                          className="w-full py-1 text-xs font-semibold text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] rounded"
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-secondary)]"
                  title="Copy Stream Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                {/* THREE-DOT MENU BUTTON ON PLAYER */}
                <div className="relative">
                  <button
                    onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
                    className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showThreeDotMenu && (
                    <div className="absolute left-0 mt-2 w-56 rounded-xl border shadow-2xl p-1.5 z-50 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] animate-in fade-in">
                      <button
                        onClick={() => {
                          setVideoDetailsModalVideo(activeVideo);
                          setShowThreeDotMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                      >
                        <Info className="w-4 h-4 text-[var(--accent-sage)]" />
                        <span>Technical Specs & Codec</span>
                      </button>

                      {canManage && (
                        <button
                          onClick={() => {
                            setVideoEditModalVideo(activeVideo);
                            setShowThreeDotMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[var(--bg-surface-hover)] text-left font-medium text-[var(--text-secondary)]"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit Video Metadata</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {activeVideo.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <span>Open YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Video Description Box */}
            <div className="mt-4 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <p
                className={`text-xs text-[var(--text-secondary)] leading-relaxed ${
                  showFullDescription ? '' : 'line-clamp-2'
                }`}
              >
                {activeVideo.description}
              </p>
              {activeVideo.description.length > 120 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-[var(--accent-sage)] hover:underline font-semibold mt-1 inline-block"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                <span className="font-semibold text-[var(--text-secondary)]">Tags:</span>
                {activeVideo.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span className="text-[var(--text-primary)] font-medium">#{tag}</span>
                    {idx < activeVideo.tags.length - 1 && <span>·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Up Next Queue */}
        <div className={theaterMode ? 'w-full mt-6' : 'lg:col-span-1'}>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wider uppercase font-display">
                Up Next (Zero Ads)
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">Continuous Stream</span>
            </div>

            <div className="space-y-3">
              {upNextVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => playVideo(video)}
                  className="flex gap-3 group cursor-pointer p-1.5 rounded-xl hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border-subtle)]">
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
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] line-clamp-2 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-1">
                      {video.channelName}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] mt-0.5">
                      <span className="font-mono tabular-nums">{formatViews(video.viewCount)} views</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[var(--accent-sage)] font-semibold">{video.qualityLabel}</span>
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
