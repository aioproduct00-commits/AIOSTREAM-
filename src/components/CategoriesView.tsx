import React from 'react';
import { useApp } from '../context/AppContext';
import { VideoCard } from './VideoCard';
import { Film, Compass, Cpu, Music, Gamepad2, Sparkles, BookOpen } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Film,
  Compass,
  Cpu,
  Music,
  Gamepad2,
  Sparkles,
  BookOpen,
};

export const CategoriesView: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, videos } = useApp();

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory) || categories[0];
  const filteredVideos = videos.filter((v) =>
    selectedCategory ? v.categoryId === selectedCategory : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in text-[var(--text-primary)]">
      {/* Category Hero / Header */}
      <div className="pb-6 border-b border-[var(--border-subtle)]">
        <h1 className="text-2xl font-bold font-display tracking-tight">
          Browse by Genre & Category
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Explore ad-free trailers, 4K nature showcases, live music, and open-source master films
        </p>
      </div>

      {/* Interactive Category Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
            selectedCategory === null
              ? 'bg-[var(--accent-sage)] text-white shadow-xs'
              : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]'
          }`}
        >
          All Genres ({videos.length})
        </button>

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Film;
          const isSelected = selectedCategory === cat.id;
          const count = videos.filter((v) => v.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-[var(--accent-sage)] text-white shadow-xs'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-mono font-normal">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Description banner */}
      {activeCategoryObj && selectedCategory && (
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] mb-6 flex items-center justify-between shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">{activeCategoryObj.name}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{activeCategoryObj.description}</p>
          </div>
          <span className="text-xs font-mono text-[var(--accent-sage)] font-bold tabular-nums">
            {filteredVideos.length} stream{filteredVideos.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[var(--text-muted)]">No videos found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
