import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload,
  Film,
  Play,
  Trash2,
  Edit3,
  CheckCircle2,
  FileVideo,
  Sparkles,
  Layers,
} from 'lucide-react';
import { formatViews, formatDuration, formatBytes } from '../lib/utils';
import type { Video } from '../types';

export const MyStudioView: React.FC = () => {
  const {
    currentUser,
    videos,
    categories,
    uploadUserVideoFile,
    deleteVideo,
    playVideo,
    setVideoEditModalVideo,
    setIsAuthModalOpen,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'trailers');
  const [tagsInput, setTagsInput] = useState('Creator, 4K, Master');
  const [isUploading, setIsUploading] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-sage-light)] text-[var(--accent-sage)] flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
          Creator Studio & Uploads
        </h2>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-2 leading-relaxed">
          Please sign in to your personal creator account to upload videos and manage your uploaded media.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 px-5 py-2.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md transition-colors"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  // Filter videos uploaded by this specific user
  const myVideos = videos.filter(
    (v) => v.uploaderId === currentUser.id || v.uploaderEmail === currentUser.email
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a video file to upload', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await uploadUserVideoFile(selectedFile, {
        title: title || selectedFile.name,
        description: description || 'Direct creator video upload in AIOSTREAM.',
        category,
        tags,
      });

      // Reset form
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover border border-[var(--border-subtle)]"
          />
          <div>
            <h1 className="text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
              {currentUser.name}&rsquo;s Studio
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Upload original videos from your device and manage your ad-free stream catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
            <span className="font-mono font-bold text-[var(--text-primary)]">{myVideos.length}</span> videos uploaded
          </div>
        </div>
      </div>

      {/* Grid: Upload Pane + My Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Upload Form Pane */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--accent-sage)]" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-display">
                Upload Video File
              </h2>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
                  selectedFile
                    ? 'border-[var(--accent-sage)] bg-[var(--accent-sage-light)]/20'
                    : 'border-[var(--border-subtle)] hover:border-[var(--accent-sage)] bg-[var(--bg-surface-elevated)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileVideo className="w-8 h-8 text-[var(--accent-sage)] mx-auto" />
                    <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono">
                      {formatBytes(selectedFile.size)} · Click to change file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      Click to browse or drop video file
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Supports MP4, WebM, MOV, MKV up to original 4K
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Preview if file selected */}
              {filePreviewUrl && (
                <div className="rounded-xl overflow-hidden aspect-video bg-black border border-[var(--border-subtle)]">
                  <video
                    src={filePreviewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Category / Genre
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. 4K, Drone, Cinematic, Music"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] shadow-md transition-all disabled:opacity-50"
              >
                {isUploading ? 'Processing & Uploading...' : 'Publish Video to AIOSTREAM'}
              </button>
            </form>
          </div>
        </div>

        {/* My Uploaded Videos List */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-display">
                My Uploaded Videos ({myVideos.length})
              </h2>
              <span className="text-[11px] text-[var(--text-muted)]">
                Stored in account database
              </span>
            </div>

            {myVideos.length === 0 ? (
              <div className="py-16 text-center">
                <FileVideo className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  No uploads yet
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto mt-1">
                  Use the upload form on the left to add your first video file in pristine original quality.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-sage)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        onClick={() => playVideo(video)}
                        className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer group"
                      >
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4
                          onClick={() => playVideo(video)}
                          className="font-semibold text-xs text-[var(--text-primary)] truncate cursor-pointer hover:text-[var(--accent-sage)]"
                        >
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-1">
                          <span className="font-mono tabular-nums">{video.durationFormatted}</span>
                          <span aria-hidden="true">·</span>
                          <span>{video.qualityLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{formatViews(video.viewCount)} views</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => playVideo(video)}
                        className="p-1.5 rounded-lg bg-[var(--accent-sage)] text-white hover:bg-[var(--accent-sage-hover)] shadow-sm"
                        title="Stream Video"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => setVideoEditModalVideo(video)}
                        className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete "${video.title}"?`)) {
                            deleteVideo(video.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
