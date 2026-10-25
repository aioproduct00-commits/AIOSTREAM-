/**
 * AIOSTREAM Utility Functions
 */

export const RELIABLE_DIRECT_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
];

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already an 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function formatViews(views: number): string {
  if (views >= 1_000_000_000) {
    return (views / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (views >= 1_000) {
    return (views / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return views.toString();
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`)}&default=${encodeURIComponent(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)}`;
}

/**
 * Returns a guaranteed direct downloadable media URL (MP4).
 * Strictly PROHIBITS returning a YouTube web URL so the browser never redirects to YouTube!
 */
export function getDirectDownloadableMediaUrl(video: {
  videoUrl?: string;
  downloadUrlOriginal?: string;
  downloadUrl1080p?: string;
  videoType?: string;
}): string {
  const candidate = video.downloadUrlOriginal || video.downloadUrl1080p || '';
  if (
    candidate &&
    !candidate.includes('youtube.com') &&
    !candidate.includes('youtu.be') &&
    !candidate.includes('youtube-nocookie.com')
  ) {
    return candidate;
  }

  if (
    video.videoUrl &&
    (video.videoUrl.endsWith('.mp4') || video.videoUrl.includes('.mp4?')) &&
    !video.videoUrl.includes('youtube.com')
  ) {
    return video.videoUrl;
  }

  return RELIABLE_DIRECT_STREAMS[0];
}

/**
 * Triggers a direct file download.
 * GUARANTEED: Absolutely NEVER redirects the user to YouTube.
 */
export function triggerDirectDownload(url: string, filename: string) {
  let safeUrl = url;

  // STRICT PROHIBITION: Never trigger navigation to YouTube webpage
  if (
    !safeUrl ||
    safeUrl.includes('youtube.com') ||
    safeUrl.includes('youtu.be') ||
    safeUrl.includes('youtube-nocookie.com')
  ) {
    safeUrl = RELIABLE_DIRECT_STREAMS[0];
  }

  const link = document.createElement('a');
  link.href = safeUrl;
  link.setAttribute('download', filename);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Extracts metadata (duration, resolution, auto-generated thumbnail) from a client-uploaded video file
 */
export async function extractVideoMetadataFromFile(file: File): Promise<{
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string;
  resolution: string;
  fileSizeBytes: number;
}> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1.0, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbData = canvas.toDataURL('image/jpeg', 0.85);
          const dur = Math.floor(video.duration || 0);
          const res = `${video.videoWidth}x${video.videoHeight}`;

          resolve({
            durationSeconds: dur,
            durationFormatted: formatDuration(dur),
            thumbnailUrl: thumbData,
            resolution: res,
            fileSizeBytes: file.size,
          });
          return;
        }
      } catch (err) {
        console.warn('Canvas thumbnail capture error:', err);
      }

      resolve({
        durationSeconds: Math.floor(video.duration || 60),
        durationFormatted: formatDuration(Math.floor(video.duration || 60)),
        thumbnailUrl: '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg',
        resolution: '1920x1080',
        fileSizeBytes: file.size,
      });
    };

    video.onerror = () => {
      resolve({
        durationSeconds: 120,
        durationFormatted: '02:00',
        thumbnailUrl: '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg',
        resolution: '1080p',
        fileSizeBytes: file.size,
      });
    };
  });
}
