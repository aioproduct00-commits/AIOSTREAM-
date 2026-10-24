import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Play, Download, Sparkles, Youtube, Link as LinkIcon, Film } from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../lib/utils';

export const AddVideoModal: React.FC = () => {
  const {
    isAddVideoModalOpen,
    setIsAddVideoModalOpen,
    addCustomVideo,
    playVideo,
    startDownload,
    categories,
    showToast,
  } = useApp();

  const [inputUrl, setInputUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'trailers');
  const [customTags, setCustomTags] = useState('YouTube, AdFree, Streaming');

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
        channelName: 'Direct YouTube Stream',
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
        channelName: 'Direct Media Source',
        categoryId: selectedCategory,
        tags: ['DirectStream', 'MP4'],
        createdAt: new Date().toISOString(),
      });
      setIsAddVideoModalOpen(false);
      showToast('Direct video loaded!', 'success');
    } else {
      showToast('Could not recognize video format. Paste a valid YouTube link or MP4 URL.', 'error');
    }
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
      <div className="relative w-full max-w-lg bg-[#0F121E] border border-[#23293F] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A2033]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-display">
                Stream or Download Any Video
              </h2>
              <p className="text-xs text-slate-400">
                Direct ad-free streaming for all YouTube & direct MP4 videos
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddVideoModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A2033] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSaveToCatalog} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              YouTube Video URL / ID or Direct MP4 Link
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                className="w-full px-3 py-2.5 bg-[#08090E] border border-[#23293F] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              {detectedYtId && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Valid ID</span>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-slate-500">Quick Test:</span>
              {sampleStreams.map((sample) => (
                <button
                  type="button"
                  key={sample.name}
                  onClick={() => {
                    setInputUrl(sample.url);
                    setCustomTitle(sample.name);
                  }}
                  className="px-2 py-0.5 rounded bg-[#161B2B] hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Preview Stage */}
          {previewThumbnail && (
            <div className="flex gap-3 p-3 rounded-xl bg-[#080A12] border border-[#1A1F30]">
              <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                <img
                  src={previewThumbnail}
                  alt="Video preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {detectedYtId ? `YouTube ID: ${detectedYtId}` : 'Direct Video Stream'}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">
                  Ready for instant ad-free playback & download
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Leave blank for auto title"
                className="w-full px-3 py-2 bg-[#08090E] border border-[#23293F] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#08090E] border border-[#23293F] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              placeholder="e.g. 4K, Trailer, Music, Gaming"
              className="w-full px-3 py-2 bg-[#08090E] border border-[#23293F] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleStreamDirectly}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Direct (No Ads)</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#161B2B] hover:bg-[#20273D] text-slate-200 text-xs font-medium border border-[#23293F] transition-colors"
            >
              Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
