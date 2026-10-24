import React from 'react';
import { useApp } from '../context/AppContext';
import { History, Play, Trash2 } from 'lucide-react';
import { formatDuration, formatViews } from '../lib/utils';

export const HistoryView: React.FC = () => {
  const { watchHistory, videos, playVideo, clearHistory } = useApp();

  const historyWithVideos = watchHistory
    .map((item) => {
      const video = videos.find((v) => v.id === item.videoId);
      return { item, video };
    })
    .filter((entry): entry is { item: typeof entry.item; video: NonNullable<typeof entry.video> } =>
      Boolean(entry.video)
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-[var(--accent-sage)]" />
            <span>Watch History</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pick up right where you left off across all streamed videos
          </p>
        </div>

        {historyWithVideos.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 text-xs font-medium transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {historyWithVideos.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-sage-light)] text-[var(--accent-sage)] flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No watch history</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
            Videos you stream in AIOSTREAM will automatically appear here with progress tracking.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {historyWithVideos.map(({ item, video }) => {
            const pct =
              item.durationSeconds > 0
                ? Math.min(100, Math.floor((item.progressSeconds / item.durationSeconds) * 100))
                : 0;

            return (
              <div
                key={item.id}
                onClick={() => playVideo(video, item.progressSeconds)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-sage)] shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-[var(--border-subtle)]">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                      <div className="h-full bg-[var(--accent-sage)]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="absolute top-1 right-1 px-1 rounded bg-black/80 text-[10px] font-mono text-white">
                      {video.durationFormatted}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-sage)] transition-colors truncate">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                      <span className="text-[var(--text-secondary)] font-medium">{video.channelName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatViews(video.viewCount)} views</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[var(--accent-sage)] font-mono font-semibold tabular-nums">
                        {item.progressSeconds > 0
                          ? `Stopped at ${formatDuration(item.progressSeconds)} (${pct}%)`
                          : 'Watched'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-sage)] text-white text-xs font-semibold shadow-xs transition-colors">
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
