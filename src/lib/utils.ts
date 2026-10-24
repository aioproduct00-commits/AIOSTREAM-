/**
 * AIOSTREAM Utility Functions
 */

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If it's already an 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle various YouTube URL formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID
  // - https://youtube.com/shorts/VIDEO_ID
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

export function triggerDirectDownload(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
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
      // Seek to 1 second (or 10% for short videos) to grab a clean frame
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

      // Fallback
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
