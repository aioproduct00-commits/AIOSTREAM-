import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, Play, Trash2, HardDrive, ArrowDownToLine, FolderCheck, CheckCircle2 } from 'lucide-react';
import { formatBytes } from '../lib/utils';

export const DownloadsView: React.FC = () => {
  const { downloads, removeDownload, playVideo, videos, showToast } = useApp();

  const handlePlayDownloaded = (videoId: string) => {
    const found = videos.find((v) => v.id === videoId);
    if (found) {
      playVideo(found);
    } else {
      showToast('Video loaded into cinema player', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in text-[var(--text-primary)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2.5">
            <ArrowDownToLine className="w-6 h-6 text-[var(--accent-sage)]" />
            <span>My Gallery & Downloads</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Original quality MP4 videos and audio files saved to your local gallery for offline ad-free streaming
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <HardDrive className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
            <span className="font-mono tabular-nums font-semibold text-[var(--text-primary)]">
              {downloads.length} file{downloads.length !== 1 ? 's' : ''} saved
            </span>
          </div>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-sage-light)] text-[var(--accent-sage)] flex items-center justify-center mx-auto mb-4">
            <Download className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No videos in your gallery yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1 leading-relaxed">
            Paste any link in the top search bar or click the three-dot menu on any video and select &ldquo;Download MP4 in Gallery&rdquo;.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {downloads.map((item) => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-colors bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-sage)] shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-[var(--border-subtle)]">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[var(--accent-sage)] font-semibold">
                      {item.fileFormat.toUpperCase()}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {item.title}
                      </h3>
                      {item.isGallerySaved && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-sage)] bg-[var(--accent-sage-light)] px-1.5 py-0.5 rounded">
                          <FolderCheck className="w-3 h-3" />
                          <span>Gallery MP4</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                      <span className="text-[var(--accent-sage)] font-semibold">{item.quality}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatBytes(item.fileSizeBytes)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {!isCompleted && (
                      <div className="mt-2 w-full max-w-xs">
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1 font-mono">
                          <span>Saving to gallery...</span>
                          <span className="tabular-nums">{item.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--bg-surface-elevated)]">
                          <div
                            className="h-full bg-[var(--accent-sage)] transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isCompleted && (
                    <button
                      onClick={() => handlePlayDownloaded(item.videoId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Video</span>
                    </button>
                  )}

                  <button
                    onClick={() => removeDownload(item.id)}
                    className="p-2 rounded-xl border border-[var(--border-subtle)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                    title="Remove from downloads"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
