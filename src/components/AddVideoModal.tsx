import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Download, Youtube, Film, FolderDown, Sparkles } from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../lib/utils';

export const AddVideoModal: React.FC = () => {
  const {
    isAddVideoModalOpen,
    setIsAddVideoModalOpen,
    addCustomVideo,
    playVideo,
    downloadToGallery,
    categories,
    currentUser,
    showToast,
  } = useApp();

  const [inputUrl, setInputUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'trailers');
  const [customTags, setCustomTags] = useState('Stream, 4K, AdFree');

  if (!isAddVideoModalOpen) return null;

  const detectedYtId = extractYouTubeId(inputUrl);
  const isDirectMp4 = inputUrl.trim().endsWith('.mp4') || inputUrl.trim().includes('.mp4?');
  const previewThumbnail = detectedYtId
    ? getYouTubeThumbnail(detectedYtId)
    : isDirectMp4
    ? '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg'
    : null;

  const handleStreamDirectly = () => {
    if (!inputUrl.trim()) {
      showToast('Please enter a YouTube video URL or ID', 'error');
      return;
    }

    if (detectedYtId) {
      playVideo({
        id: 'yt-' + detectedYtId,
        title: customTitle.trim() || `YouTube Video [${detectedYtId}]`,
        description:
          customDescription.trim() ||
          'Ad-free direct YouTube video stream playing in AIOSTREAM cinema engine.',
        videoType: 'youtube',
        videoUrl: `https://www.youtube.com/watch?v=${detectedYtId}`,
        youtubeId: detectedYtId,
        thumbnailUrl: getYouTubeThumbnail(detectedYtId),
        durationSeconds: 300,
        durationFormatted: '05:00',
        qualityLabel: 'Original HD',
        viewCount: 1,
        likeCount: 1,
        channelName: currentUser?.name || 'Direct YouTube Stream',
        channelAvatar: currentUser?.avatar,
        categoryId: selectedCategory,
        tags: customTags.split(',').map((t) => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
      });
      setIsAddVideoModalOpen(false);
      showToast('Loaded into Cinema Player without ads!', 'success');
    } else if (isDirectMp4) {
      playVideo({
        id: 'mp4-' + Date.now(),
        title: customTitle.trim() || 'Direct MP4 Stream',
        description: customDescription.trim() || 'Original quality direct video stream.',
        videoType: 'direct_mp4',
        videoUrl: inputUrl.trim(),
        thumbnailUrl: '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg',
        durationSeconds: 600,
        durationFormatted: '10:00',
        qualityLabel: '4K Master',
        viewCount: 1,
        likeCount: 1,
        channelName: currentUser?.name || 'Direct Media Source',
        channelAvatar: currentUser?.avatar,
        categoryId: selectedCategory,
        tags: ['DirectStream', 'MP4'],
        createdAt: new Date().toISOString(),
      });
      setIsAddVideoModalOpen(false);
      showToast('Direct video loaded!', 'success');
    } else {
      showToast('Please enter a valid YouTube link or direct video URL.', 'error');
    }
  };

  const handleDownloadMp4ToGallery = () => {
    if (!inputUrl.trim()) {
      showToast('Please enter a video URL first', 'error');
      return;
    }

    const videoTitle = customTitle.trim() || (detectedYtId ? `YouTube_${detectedYtId}` : 'AIOSTREAM_Video');
    const targetUrl = inputUrl.trim();

    downloadToGallery(
      {
        id: 'dl-gallery-' + Date.now(),
        title: videoTitle,
        description: customDescription.trim() || 'Downloaded from pasted link.',
        videoType: detectedYtId ? 'youtube' : 'direct_mp4',
        videoUrl: targetUrl,
        youtubeId: detectedYtId || undefined,
        thumbnailUrl: previewThumbnail || '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg',
        durationSeconds: 300,
        durationFormatted: '05:00',
        qualityLabel: '1080p Original MP4',
        viewCount: 1,
        likeCount: 0,
        channelName: currentUser?.name || 'Pasted Stream',
        categoryId: selectedCategory,
        tags: ['GalleryDownload'],
        createdAt: new Date().toISOString(),
      },
      '1080p Original MP4'
    );

    setIsAddVideoModalOpen(false);
  };

  const handleSaveToCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      showToast('Please enter a video URL', 'error');
      return;
    }

    const tags = customTags.split(',').map((t) => t.trim()).filter(Boolean);
    const video = await addCustomVideo({
      urlOrId: inputUrl.trim(),
      title: customTitle.trim() || undefined,
      description: customDescription.trim() || undefined,
      category: selectedCategory,
      tags,
    });

    if (video) {
      setIsAddVideoModalOpen(false);
      setInputUrl('');
      setCustomTitle('');
      setCustomDescription('');
    }
  };

  const sampleStreams = [
    { name: 'Oppenheimer 4K Trailer', url: 'https://www.youtube.com/watch?v=uYPbbksJxIg' },
    { name: 'Lofi Girl 24/7 Chill', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { name: 'BBC Earth 4K Wildlife', url: 'https://www.youtube.com/watch?v=c8aFcHEu0Yw' },
    { name: 'Big Buck Bunny 4K MP4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-sage)] text-white shadow-sm">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                Stream or Download Any Video
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Direct ad-free streaming & MP4 download to your gallery
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddVideoModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - autofill disabled */}
        <form onSubmit={handleSaveToCatalog} autoComplete="off" className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Paste Any YouTube Video URL / ID or MP4 Link
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="off"
                data-lpignore="true"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                autoFocus
              />
              {detectedYtId && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] text-[var(--accent-sage)] font-mono font-semibold">
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Valid ID</span>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <span>Quick Test:</span>
              {sampleStreams.map((sample) => (
                <button
                  type="button"
                  key={sample.name}
                  onClick={() => {
                    setInputUrl(sample.url);
                    setCustomTitle(sample.name);
                  }}
                  className="px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--accent-sage-light)] text-[var(--text-secondary)] hover:text-[var(--accent-sage)] transition-colors"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview Stage */}
          {previewThumbnail && (
            <div className="flex gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
              <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-[var(--border-subtle)]">
                <img
                  src={previewThumbnail}
                  alt="Video preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {detectedYtId ? `YouTube ID: ${detectedYtId}` : 'Direct Video Stream'}
                </div>
                <div className="text-[11px] text-[var(--accent-sage)] font-semibold mt-1">
                  Ready for instant streaming & MP4 gallery download
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                autoComplete="off"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Leave blank for auto title"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-sage)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              autoComplete="off"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              placeholder="e.g. 4K, Trailer, Music, Gaming"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleStreamDirectly}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-bold shadow-md shadow-[var(--accent-sage-glow)] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Direct (No Ads)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMp4ToGallery}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] text-xs font-semibold transition-colors"
              title="Download MP4 to Gallery"
            >
              <FolderDown className="w-4 h-4 text-[var(--accent-sage)]" />
              <span>Download MP4</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors"
            >
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
