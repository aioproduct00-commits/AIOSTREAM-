import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, Play, Trash2, CheckCircle, Clock, HardDrive, ArrowDownToLine } from 'lucide-react';
import { formatBytes } from '../lib/utils';

export const DownloadsView: React.FC = () => {
  const { downloads, removeDownload, playVideo, videos, showToast } = useApp();

  const handlePlayDownloaded = (videoId: string) => {
    const found = videos.find((v) => v.id === videoId);
    if (found) {
      playVideo(found);
    } else {
      showToast('Video source ready in cinema player', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1A2033]">
        <div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
            <ArrowDownToLine className="w-6 h-6 text-indigo-400" />
            <span>Downloads & Offline Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Original quality video & audio files downloaded for ad-free offline playback
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111422] border border-[#20273D]">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono tabular-nums text-slate-200">
              {downloads.length} file{downloads.length !== 1 ? 's' : ''} stored
            </span>
          </div>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#121626] border border-[#20273D] text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Download className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No downloads yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Choose any video in AIOSTREAM and click the "Download Original" button to save it in 4K, 1080p, or high-definition audio.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {downloads.map((item) => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D101C] border border-[#1C2136] hover:border-[#28304D] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1 rounded bg-black/80 text-[10px] font-mono text-indigo-300">
                      {item.fileFormat.toUpperCase()}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>

                    {/* Unboxed Metadata (Rule: No pill enclosures) */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="text-indigo-400 font-medium">{item.quality}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatBytes(item.fileSizeBytes)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress bar if downloading */}
                    {!isCompleted && (
                      <div className="mt-2 w-full max-w-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                          <span>Downloading high bitrate stream...</span>
                          <span className="tabular-nums">{item.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#181D2E] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isCompleted && (
                    <button
                      onClick={() => handlePlayDownloaded(item.videoId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Offline</span>
                    </button>
                  )}

                  <button
                    onClick={() => removeDownload(item.id)}
                    className="p-2 rounded-lg bg-[#141826] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove from download manager"
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
