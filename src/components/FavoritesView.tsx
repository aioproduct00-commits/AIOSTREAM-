import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, Play } from 'lucide-react';
import { VideoCard } from './VideoCard';

export const FavoritesView: React.FC = () => {
  const { favorites, videos, playVideo } = useApp();
  const favoriteVideos = videos.filter((v) => favorites.includes(v.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Favorite Streams</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Your saved collection of ad-free videos ready for instant playback
          </p>
        </div>

        {favoriteVideos.length > 0 && (
          <button
            onClick={() => playVideo(favoriteVideos[0])}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-bold shadow-md transition-colors self-start sm:self-center"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play All Favorites</span>
          </button>
        )}
      </div>

      {favoriteVideos.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No favorite videos yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
            Click the heart icon on any video card or in the three-dot menu to save it here for fast access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {favoriteVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
