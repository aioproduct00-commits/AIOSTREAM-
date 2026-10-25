import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ListPlus, Play, Trash2, ArrowLeft, Plus, Layers, X, Radio, ListMusic } from 'lucide-react';
import { VideoCard } from './VideoCard';
import type { Playlist } from '../types';

export const PlaylistsView: React.FC = () => {
  const {
    playlists,
    videos,
    createPlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
    playFullPlaylist,
    activePlaylist,
  } = useApp();

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createPlaylist(newTitle.trim(), newDesc.trim() || 'Custom curated video playlist');
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  if (selectedPlaylist) {
    const activePl = playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;
    const playlistVideos = videos.filter((v) => activePl.videoIds.includes(v.id));
    const isCurrentlyPlayingLive = activePlaylist?.id === activePl.id;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in text-[var(--text-primary)]">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-sage)] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Playlists</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display tracking-tight">
                {activePl.title}
              </h1>
              {isCurrentlyPlayingLive && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[var(--accent-sage)] px-2 py-0.5 rounded-full">
                  <Radio className="w-3 h-3 text-white animate-pulse" />
                  Playing Live
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{activePl.description}</p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-2">
              <span className="font-mono tabular-nums font-semibold text-[var(--accent-sage)]">
                {playlistVideos.length} videos
              </span>
              <span aria-hidden="true">·</span>
              <span>Continuous Ad-Free Stream</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {playlistVideos.length > 0 && (
              <button
                onClick={() => playFullPlaylist(activePl, 0)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-bold shadow-md shadow-[var(--accent-sage-glow)] transition-all active:scale-[0.99]"
                title="Play entire playlist continuously on site"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Full Playlist Live</span>
              </button>
            )}

            <button
              onClick={() => {
                deletePlaylist(activePl.id);
                setSelectedPlaylist(null);
              }}
              className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {playlistVideos.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[var(--text-muted)]">This playlist has no videos yet.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add videos to this playlist while watching or via the three-dot menu on any card.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {playlistVideos.map((video, idx) => (
              <div key={video.id} className="relative group">
                <VideoCard video={video} />
                <button
                  onClick={() => removeVideoFromPlaylist(activePl.id, video.id)}
                  className="absolute top-2 right-10 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-white text-xs transition-colors shadow-lg opacity-0 group-hover:opacity-100 z-10"
                  title="Remove from playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="absolute top-2 left-2 z-10 pointer-events-none px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-white">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[var(--accent-sage)]" />
            <span>Playlists & Collections</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Stream full playlists continuously live on site with zero ads or manual skips
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-bold shadow-md transition-colors self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-sage-light)] text-[var(--accent-sage)] flex items-center justify-center mx-auto mb-4">
            <ListPlus className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No playlists created</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
            Create custom playlists to stream continuous trailers, lo-fi beats, or documentaries live without interruption.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {playlists.map((playlist) => {
            const count = playlist.videoIds.length;
            const previewVideo = videos.find((v) => playlist.videoIds.includes(v.id));
            const thumbnail =
              playlist.thumbnailUrl ||
              previewVideo?.thumbnailUrl ||
              '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg';

            return (
              <div
                key={playlist.id}
                className="group rounded-2xl overflow-hidden border transition-all bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-sage)] hover:shadow-lg shadow-xs flex flex-col justify-between"
              >
                <div
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer"
                >
                  <img
                    src={thumbnail}
                    alt={playlist.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs font-semibold">
                      {count} video{count !== 1 ? 's' : ''}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-sage)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div onClick={() => setSelectedPlaylist(playlist)} className="cursor-pointer">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors truncate">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {playlist.description}
                    </p>
                  </div>

                  {/* Play Full Playlist Live button */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <button
                      onClick={() => playFullPlaylist(playlist, 0)}
                      disabled={count === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                      title="Play entire playlist live on site"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Full Playlist Live</span>
                    </button>

                    <button
                      onClick={() => setSelectedPlaylist(playlist)}
                      className="px-3 py-2 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-secondary)]"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6 bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <h2 className="text-base font-bold font-display">Create New Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 4K Cinema Nights"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional brief description..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-bold shadow-md"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
