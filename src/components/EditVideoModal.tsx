import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Edit3, Save } from 'lucide-react';
import type { Video } from '../types';

export const EditVideoModal: React.FC = () => {
  const { videoEditModalVideo, setVideoEditModalVideo, updateVideo, categories } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [qualityLabel, setQualityLabel] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (videoEditModalVideo) {
      setTitle(videoEditModalVideo.title);
      setDescription(videoEditModalVideo.description);
      setCategory(videoEditModalVideo.categoryId);
      setQualityLabel(videoEditModalVideo.qualityLabel);
      setTagsInput(videoEditModalVideo.tags.join(', '));
    }
  }, [videoEditModalVideo]);

  if (!videoEditModalVideo) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    updateVideo(videoEditModalVideo.id, {
      title: title.trim(),
      description: description.trim(),
      categoryId: category,
      qualityLabel: qualityLabel.trim(),
      tags,
    });

    setVideoEditModalVideo(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[var(--accent-sage)]" />
            <h2 className="text-sm font-bold font-display">Edit Video Metadata</h2>
          </div>
          <button
            onClick={() => setVideoEditModalVideo(null)}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Category
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
                Quality Label
              </label>
              <input
                type="text"
                value={qualityLabel}
                onChange={(e) => setQualityLabel(e.target.value)}
                placeholder="e.g. 4K UHD, 1080p 60FPS"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
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
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setVideoEditModalVideo(null)}
              className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
