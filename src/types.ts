export type VideoType = 'youtube' | 'direct_mp4' | 'webm' | 'hls' | 'local_upload';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
  status: 'active' | 'suspended';
  bio?: string;
  createdAt: string;
  password?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoType: VideoType;
  videoUrl: string;
  youtubeId?: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  qualityLabel: string; // e.g. '4K UHD', '1080p 60fps', '1440p'
  viewCount: number;
  likeCount: number;
  channelName: string;
  channelAvatar?: string;
  categoryId: string;
  tags: string[];
  downloadUrl1080p?: string;
  downloadUrl720p?: string;
  downloadUrlOriginal?: string;
  downloadSizeBytes?: number;
  isFeatured?: boolean;
  uploaderId?: string;
  uploaderEmail?: string;
  uploaderName?: string;
  isUserUpload?: boolean;
  codec?: string;
  bitrate?: string;
  resolution?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoIds: string[];
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WatchHistoryItem {
  id: string;
  videoId: string;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface DownloadRecord {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  quality: string;
  fileFormat: string;
  fileSizeBytes: number;
  status: 'downloading' | 'completed' | 'failed';
  progress: number; // 0 to 100
  downloadUrl: string;
  timestamp: string;
  isGallerySaved?: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  rating?: number;
  createdAt: string;
}

export type ActiveTab =
  | 'home'
  | 'trending'
  | 'categories'
  | 'direct-stream'
  | 'playlists'
  | 'downloads'
  | 'history'
  | 'favorites'
  | 'my-studio'
  | 'admin';

export type ThemeMode = 'dark' | 'light';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
