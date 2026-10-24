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
