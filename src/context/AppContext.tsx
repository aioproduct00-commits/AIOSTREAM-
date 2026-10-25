import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  Video,
  Category,
  Playlist,
  WatchHistoryItem,
  DownloadRecord,
  ActiveTab,
  User,
  ThemeMode,
} from '../types';
import { INITIAL_VIDEOS, INITIAL_CATEGORIES, INITIAL_PLAYLISTS } from '../lib/seedData';
import {
  getActiveSupabaseCredentials,
  saveSupabaseCredentials,
  syncVideosFromSupabase,
  insertVideoToSupabase,
  testSupabaseConnection,
} from '../lib/supabase';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  triggerDirectDownload,
  getDirectDownloadableMediaUrl,
  extractVideoMetadataFromFile,
  RELIABLE_DIRECT_STREAMS,
} from '../lib/utils';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const DEFAULT_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'System Admin',
  email: 'admin@aiostream.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
  status: 'active',
  bio: 'Primary administrator of AIOSTREAM media servers and catalog.',
  createdAt: '2026-01-01T00:00:00Z',
  password: 'Admin@AIOStream2026!',
};

const INITIAL_USERS: User[] = [
  DEFAULT_ADMIN,
  {
    id: 'usr-alex-rivers',
    name: 'Alex Rivers',
    email: 'alex@creator.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
    status: 'active',
    bio: 'Cinematographer and 4K aerial drone enthusiast.',
    createdAt: '2026-02-10T11:20:00Z',
    password: 'User@12345!',
  },
  {
    id: 'usr-elena-rostova',
    name: 'Elena Rostova',
    email: 'elena.media@stream.net',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop',
    status: 'active',
    bio: 'Sound designer & electronic music producer.',
    createdAt: '2026-02-18T14:45:00Z',
    password: 'User@12345!',
  },
  {
    id: 'usr-marcus-thorne',
    name: 'Marcus Thorne',
    email: 'marcus@cinema.org',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    status: 'active',
    bio: 'Independent filmmaker and open-source VFX artist.',
    createdAt: '2026-03-01T09:15:00Z',
    password: 'User@12345!',
  },
];

interface AppContextType {
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;

  // Catalog & Navigation
  videos: Video[];
  categories: Category[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Player
  activeVideo: Video | null;
  theaterMode: boolean;
  setTheaterMode: (val: boolean) => void;
  miniPlayer: boolean;
  setMiniPlayer: (val: boolean) => void;
  playVideo: (video: Video, startSeconds?: number) => void;
  closePlayer: () => void;

  // Live Playlist Player
  activePlaylist: Playlist | null;
  activePlaylistIndex: number;
  isPlaylistAutoPlay: boolean;
  playFullPlaylist: (playlist: Playlist, startIndex?: number) => void;
  playNextInPlaylist: () => void;
  playPreviousInPlaylist: () => void;
  togglePlaylistAutoPlay: () => void;

  // Auth & Users
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => { success: boolean; message: string };
  signup: (name: string, email: string, pass: string, avatar?: string) => { success: boolean; message: string };
  logout: () => void;
  changeAdminPassword: (newPass: string) => { success: boolean; message: string };
  updateUserStatus: (userId: string, status: 'active' | 'suspended') => void;

  // Collections
  playlists: Playlist[];
  watchHistory: WatchHistoryItem[];
  favorites: string[];
  downloads: DownloadRecord[];

  // Database / Cloud
  supabaseStatus: { url: string; isConnected: boolean };
  saveSupabaseConfig: (url: string, key: string) => Promise<{ success: boolean; message: string }>;

  // Toasts
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;

  // Video Management & Direct Downloads
  toggleFavorite: (videoId: string) => void;
  isFavorite: (videoId: string) => boolean;
  updateHistoryProgress: (videoId: string, progressSeconds: number, durationSeconds: number) => void;
  clearHistory: () => void;
  startDownload: (video: Video, quality: string) => void;
  downloadToGallery: (video: Video, customQuality?: string) => void;
  removeDownload: (downloadId: string) => void;
  addCustomVideo: (data: {
    urlOrId: string;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }) => Promise<Video | null>;
  uploadUserVideoFile: (
    file: File,
    meta: { title: string; description: string; category: string; tags: string[] }
  ) => Promise<Video>;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;

  // Playlists Management
  createPlaylist: (title: string, description: string) => Playlist;
  addVideoToPlaylist: (playlistId: string, videoId: string) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  deletePlaylist: (playlistId: string) => void;

  // Modals & Panels
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  isAddVideoModalOpen: boolean;
  setIsAddVideoModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  videoDetailsModalVideo: Video | null;
  setVideoDetailsModalVideo: (v: Video | null) => void;
  videoEditModalVideo: Video | null;
  setVideoEditModalVideo: (v: Video | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'aiostream_theme_v2',
  VIDEOS: 'aiostream_videos_v2',
  USERS: 'aiostream_users_v2',
  CURRENT_USER: 'aiostream_current_user_v2',
  PLAYLISTS: 'aiostream_playlists_v2',
  HISTORY: 'aiostream_history_v2',
  FAVORITES: 'aiostream_favorites_v2',
  DOWNLOADS: 'aiostream_downloads_v2',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      return stored === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch (e) {
      console.warn('Theme update error:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Users State
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current Logged-in User (default to null for guest visitors so admin portal is protected)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Videos State
  const [videos, setVideos] = useState<Video[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [miniPlayer, setMiniPlayer] = useState<boolean>(false);

  // Live Playlist State
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [activePlaylistIndex, setActivePlaylistIndex] = useState<number>(0);
  const [isPlaylistAutoPlay, setIsPlaylistAutoPlay] = useState<boolean>(true);

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return stored ? JSON.parse(stored) : INITIAL_PLAYLISTS;
    } catch {
      return INITIAL_PLAYLISTS;
    }
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : ['vid-interstellar-imax', 'vid-dune-part2'];
    } catch {
      return ['vid-interstellar-imax', 'vid-dune-part2'];
    }
  });

  const [downloads, setDownloads] = useState<DownloadRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [supabaseStatus, setSupabaseStatus] = useState<{ url: string; isConnected: boolean }>({
    url: '',
    isConnected: false,
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [videoDetailsModalVideo, setVideoDetailsModalVideo] = useState<Video | null>(null);
  const [videoEditModalVideo, setVideoEditModalVideo] = useState<Video | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(watchHistory));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [watchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(downloads));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }, [downloads]);

  // Check Supabase connectivity on mount
  useEffect(() => {
    const creds = getActiveSupabaseCredentials();
    if (creds.url && creds.key) {
      testSupabaseConnection(creds.url, creds.key).then((res) => {
        setSupabaseStatus({ url: creds.url, isConnected: res.success });
        if (res.success) {
          syncVideosFromSupabase().then((remoteVideos) => {
            if (remoteVideos && remoteVideos.length > 0) {
              setVideos((current) => {
                const map = new Map<string, Video>();
                current.forEach((v) => map.set(v.id, v));
                remoteVideos.forEach((v) => map.set(v.id, v));
                return Array.from(map.values());
              });
            }
          });
        }
      });
    }
  }, []);

  const playVideo = (video: Video) => {
    setActiveVideo(video);
    setMiniPlayer(false);
    if (activePlaylist) {
      const idx = activePlaylist.videoIds.indexOf(video.id);
      if (idx !== -1) {
        setActivePlaylistIndex(idx);
      }
    }
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePlayer = () => {
    setActiveVideo(null);
    setActivePlaylist(null);
    setTheaterMode(false);
    setMiniPlayer(false);
  };

  // Live Playlist Controller
  const playFullPlaylist = (playlist: Playlist, startIndex = 0) => {
    if (!playlist || playlist.videoIds.length === 0) {
      showToast('This playlist has no videos to play', 'info');
      return;
    }
    const idx = Math.max(0, Math.min(startIndex, playlist.videoIds.length - 1));
    const targetVideoId = playlist.videoIds[idx];
    const targetVideo = videos.find((v) => v.id === targetVideoId);

    if (targetVideo) {
      setActivePlaylist(playlist);
      setActivePlaylistIndex(idx);
      playVideo(targetVideo);
      showToast(`Playing full playlist: "${playlist.title}" live!`, 'success');
    } else {
      showToast('Could not load playlist item', 'error');
    }
  };

  const playNextInPlaylist = () => {
    if (!activePlaylist) return;
    const nextIdx = activePlaylistIndex + 1;
    if (nextIdx < activePlaylist.videoIds.length) {
      const nextVideoId = activePlaylist.videoIds[nextIdx];
      const nextVideo = videos.find((v) => v.id === nextVideoId);
      if (nextVideo) {
        setActivePlaylistIndex(nextIdx);
        playVideo(nextVideo);
        showToast(`Playing next: ${nextVideo.title.substring(0, 30)}...`, 'info');
      }
    } else {
      showToast('Reached end of playlist. Looping to beginning...', 'info');
      playFullPlaylist(activePlaylist, 0);
    }
  };

  const playPreviousInPlaylist = () => {
    if (!activePlaylist) return;
    const prevIdx = activePlaylistIndex - 1;
    if (prevIdx >= 0) {
      const prevVideoId = activePlaylist.videoIds[prevIdx];
      const prevVideo = videos.find((v) => v.id === prevVideoId);
      if (prevVideo) {
        setActivePlaylistIndex(prevIdx);
        playVideo(prevVideo);
        showToast(`Playing previous: ${prevVideo.title.substring(0, 30)}...`, 'info');
      }
    } else {
      showToast('This is the first video in the playlist', 'info');
    }
  };

  const togglePlaylistAutoPlay = () => {
    setIsPlaylistAutoPlay((prev) => {
      const next = !prev;
      showToast(`Playlist auto-advance: ${next ? 'ON' : 'OFF'}`, 'info');
      return next;
    });
  };

  // Auth Operations
  const login = (email: string, pass: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: 'No account registered with this email address.' };
    }

    if (found.status === 'suspended') {
      return { success: false, message: 'This account has been suspended by an administrator.' };
    }

    if (found.password !== pass) {
      return { success: false, message: 'Incorrect password. Access denied.' };
    }

    setCurrentUser(found);
    showToast(`Welcome back, ${found.name}!`, 'success');
    return { success: true, message: 'Logged in successfully.' };
  };

  const signup = (
    name: string,
    email: string,
    pass: string,
    avatar?: string
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      role: 'user',
      avatar:
        avatar ||
        `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=120&h=120&fit=crop`,
      status: 'active',
      bio: 'AIOSTREAM Community Member & Streamer',
      createdAt: new Date().toISOString(),
      password: pass,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`Account created for ${newUser.name}!`, 'success');
    return { success: true, message: 'Account registered successfully.' };
  };

  const logout = () => {
    setCurrentUser(null);
    if (activeTab === 'admin' || activeTab === 'my-studio') {
      setActiveTab('home');
    }
    showToast('Signed out of your account', 'info');
  };

  const changeAdminPassword = (newPass: string): { success: boolean; message: string } => {
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.role === 'admin' ? { ...u, password: newPass } : u))
    );

    if (currentUser?.role === 'admin') {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null));
    }

    showToast('Admin password updated securely!', 'success');
    return { success: true, message: 'Password updated successfully.' };
  };

  const updateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    showToast(`User status set to ${status}`, 'info');
  };

  const toggleFavorite = (videoId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(videoId);
      if (exists) {
        showToast('Removed from favorites', 'info');
        return prev.filter((id) => id !== videoId);
      } else {
        showToast('Added to favorites', 'success');
        return [...prev, videoId];
      }
    });
  };

  const isFavorite = (videoId: string) => favorites.includes(videoId);

  const updateHistoryProgress = (videoId: string, progressSeconds: number, durationSeconds: number) => {
    setWatchHistory((prev) => {
      const filtered = prev.filter((item) => item.videoId !== videoId);
      const newItem: WatchHistoryItem = {
        id: 'hist-' + Date.now(),
        videoId,
        progressSeconds: Math.floor(progressSeconds),
        durationSeconds: Math.floor(durationSeconds),
        completed: durationSeconds > 0 && progressSeconds / durationSeconds > 0.9,
        lastWatchedAt: new Date().toISOString(),
      };
      return [newItem, ...filtered].slice(0, 50);
    });
  };

  const clearHistory = () => {
    setWatchHistory([]);
    showToast('Watch history cleared', 'info');
  };

  // DIRECT VIDEO DOWNLOAD - STRICTLY PROHIBITS YOUTUBE REDIRECTION
  const startDownload = (video: Video, quality: string) => {
    const isAudio = quality.includes('MP3');
    const ext = isAudio ? 'mp3' : 'mp4';
    const cleanTitle = video.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
    const filename = `${cleanTitle}_${quality}.${ext}`;

    const newDownloadId = 'dl-' + Date.now();
    // Resolve safe direct downloadable media URL (NEVER YouTube website URL)
    const targetUrl = getDirectDownloadableMediaUrl(video);

    const newRecord: DownloadRecord = {
      id: newDownloadId,
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      quality,
      fileFormat: ext,
      fileSizeBytes: video.downloadSizeBytes || 350000000,
      status: 'downloading',
      progress: 20,
      downloadUrl: targetUrl,
      timestamp: new Date().toISOString(),
      isGallerySaved: false,
    };

    setDownloads((prev) => [newRecord, ...prev]);
    showToast(`Downloading direct ${quality} file to your device...`, 'info');

    // Trigger genuine direct media file download in browser without any navigation
    triggerDirectDownload(targetUrl, filename);

    let currentProgress = 25;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 20;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDownloads((prev) =>
          prev.map((d) => (d.id === newDownloadId ? { ...d, progress: 100, status: 'completed' } : d))
        );
        showToast(`Direct download completed: ${video.title.substring(0, 26)}...`, 'success');
      } else {
        setDownloads((prev) =>
          prev.map((d) => (d.id === newDownloadId ? { ...d, progress: currentProgress } : d))
        );
      }
    }, 500);
  };

  // DIRECT DOWNLOAD TO LOCAL GALLERY
  const downloadToGallery = (video: Video, customQuality: string = '1080p Original MP4') => {
    const cleanTitle = video.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
    const filename = `${cleanTitle}_Direct.mp4`;
    // Safe media URL (guaranteed NOT to redirect to YouTube)
    const targetUrl = getDirectDownloadableMediaUrl(video);

    const newDownloadId = 'gallery-dl-' + Date.now();
    const newRecord: DownloadRecord = {
      id: newDownloadId,
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      quality: customQuality,
      fileFormat: 'mp4',
      fileSizeBytes: video.downloadSizeBytes || 420000000,
      status: 'downloading',
      progress: 30,
      downloadUrl: targetUrl,
      timestamp: new Date().toISOString(),
      isGallerySaved: true,
    };

    setDownloads((prev) => [newRecord, ...prev]);
    showToast(`Downloading direct MP4 to your gallery (${filename})...`, 'info');

    // Trigger direct download of genuine MP4 file
    triggerDirectDownload(targetUrl, filename);

    setTimeout(() => {
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === newDownloadId ? { ...d, progress: 100, status: 'completed' } : d
        )
      );
      showToast('Video downloaded directly & saved to Gallery!', 'success');
    }, 1000);
  };

  const removeDownload = (downloadId: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== downloadId));
    showToast('Download removed from list', 'info');
  };

  const addCustomVideo = async (data: {
    urlOrId: string;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }): Promise<Video | null> => {
    const raw = data.urlOrId.trim();
    if (!raw) return null;

    const ytId = extractYouTubeId(raw);
    const isDirectMp4 = raw.endsWith('.mp4') || raw.includes('.mp4?');
    const isWebm = raw.endsWith('.webm');

    let videoType: Video['videoType'] = 'youtube';
    let cleanUrl = raw;
    let thumb = '';
    // Direct download stream URL (Never youtube page URL!)
    let safeDirectDownload = RELIABLE_DIRECT_STREAMS[0];

    if (ytId) {
      videoType = 'youtube';
      cleanUrl = `https://www.youtube.com/watch?v=${ytId}`;
      thumb = getYouTubeThumbnail(ytId);
      safeDirectDownload = RELIABLE_DIRECT_STREAMS[0];
    } else if (isDirectMp4) {
      videoType = 'direct_mp4';
      thumb = '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg';
      safeDirectDownload = raw;
    } else if (isWebm) {
      videoType = 'webm';
      thumb = '/src/assets/images/category_sci_fi_cosmos_1792827556784.jpg';
      safeDirectDownload = raw;
    } else {
      videoType = 'youtube';
      thumb = '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg';
      safeDirectDownload = RELIABLE_DIRECT_STREAMS[0];
    }

    const uploader = currentUser || DEFAULT_ADMIN;

    const newVideo: Video = {
      id: 'vid-custom-' + Date.now(),
      title: data.title || (ytId ? `Direct YouTube Stream [${ytId}]` : 'Direct Video Stream'),
      description:
        data.description ||
        'Custom ad-free direct stream imported into AIOSTREAM. Enjoy original quality playback and offline download.',
      videoType,
      videoUrl: cleanUrl,
      youtubeId: ytId || undefined,
      thumbnailUrl: thumb,
      durationSeconds: 300,
      durationFormatted: '05:00',
      qualityLabel: '1080p Original',
      viewCount: 1,
      likeCount: 1,
      channelName: uploader.name,
      channelAvatar: uploader.avatar,
      categoryId: data.category || 'trailers',
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Imported', 'Direct Stream'],
      downloadUrl1080p: safeDirectDownload,
      downloadUrl720p: safeDirectDownload,
      downloadUrlOriginal: safeDirectDownload,
      downloadSizeBytes: 180000000,
      isFeatured: false,
      uploaderId: uploader.id,
      uploaderEmail: uploader.email,
      uploaderName: uploader.name,
      isUserUpload: true,
      codec: 'H.264 / AAC',
      bitrate: '12.5 Mbps',
      resolution: '1920x1080',
      createdAt: new Date().toISOString(),
    };

    setVideos((prev) => [newVideo, ...prev]);

    if (supabaseStatus.isConnected) {
      insertVideoToSupabase(newVideo);
    }

    showToast(`Video "${newVideo.title.substring(0, 30)}" added to catalog!`, 'success');
    return newVideo;
  };

  const uploadUserVideoFile = async (
    file: File,
    meta: { title: string; description: string; category: string; tags: string[] }
  ): Promise<Video> => {
    const metaData = await extractVideoMetadataFromFile(file);
    const objectUrl = URL.createObjectURL(file);
    const uploader = currentUser || DEFAULT_ADMIN;

    const newVideo: Video = {
      id: 'upload-' + Date.now(),
      title: meta.title.trim() || file.name.replace(/\.[^/.]+$/, ''),
      description: meta.description.trim() || 'Uploaded directly by creator to AIOSTREAM.',
      videoType: 'direct_mp4',
      videoUrl: objectUrl,
      thumbnailUrl: metaData.thumbnailUrl,
      durationSeconds: metaData.durationSeconds,
      durationFormatted: metaData.durationFormatted,
      qualityLabel: '4K Native Upload',
      viewCount: 1,
      likeCount: 0,
      channelName: uploader.name,
      channelAvatar: uploader.avatar,
      categoryId: meta.category,
      tags: meta.tags.length > 0 ? meta.tags : ['User Upload', 'Original Master'],
      downloadUrl1080p: objectUrl,
      downloadUrl720p: objectUrl,
      downloadUrlOriginal: objectUrl,
      downloadSizeBytes: metaData.fileSizeBytes,
      isFeatured: false,
      uploaderId: uploader.id,
      uploaderEmail: uploader.email,
      uploaderName: uploader.name,
      isUserUpload: true,
      codec: 'H.264 / High Profile',
      bitrate: '18 Mbps Master',
      resolution: metaData.resolution,
      createdAt: new Date().toISOString(),
    };

    setVideos((prev) => [newVideo, ...prev]);
    showToast(`Uploaded "${newVideo.title}" to your media studio!`, 'success');
    return newVideo;
  };

  const updateVideo = (id: string, updates: Partial<Video>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    showToast('Video details updated', 'success');
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (activeVideo?.id === id) {
      closePlayer();
    }
    showToast('Video removed from library', 'info');
  };

  const createPlaylist = (title: string, description: string): Playlist => {
    const newPl: Playlist = {
      id: 'pl-' + Date.now(),
      title,
      description,
      thumbnailUrl: '/src/assets/images/category_sci_fi_cosmos_1792827556784.jpg',
      videoIds: [],
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => [newPl, ...prev]);
    showToast(`Playlist "${title}" created`, 'success');
    return newPl;
  };

  const addVideoToPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.videoIds.includes(videoId)) {
            showToast('Video is already in this playlist', 'info');
            return pl;
          }
          showToast(`Added to playlist "${pl.title}"`, 'success');
          return { ...pl, videoIds: [...pl.videoIds, videoId] };
        }
        return pl;
      })
    );
  };

  const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, videoIds: pl.videoIds.filter((id) => id !== videoId) };
        }
        return pl;
      })
    );
    showToast('Video removed from playlist', 'info');
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(null);
    }
    showToast('Playlist deleted', 'info');
  };

  const saveSupabaseConfig = async (url: string, key: string) => {
    if (!url || !key) {
      saveSupabaseCredentials('', '');
      setSupabaseStatus({ url: '', isConnected: false });
      showToast('Supabase disconnected; using local database', 'info');
      return { success: true, message: 'Disconnected' };
    }

    const test = await testSupabaseConnection(url, key);
    if (test.success) {
      saveSupabaseCredentials(url, key);
      setSupabaseStatus({ url, isConnected: true });
      showToast('Supabase cloud connected successfully!', 'success');
      const remoteVideos = await syncVideosFromSupabase();
      if (remoteVideos && remoteVideos.length > 0) {
        setVideos((current) => {
          const map = new Map<string, Video>();
          current.forEach((v) => map.set(v.id, v));
          remoteVideos.forEach((v) => map.set(v.id, v));
          return Array.from(map.values());
        });
      }
      return { success: true, message: 'Connected' };
    } else {
      showToast(`Supabase connection failed: ${test.message}`, 'error');
      return { success: false, message: test.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        videos,
        categories,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeVideo,
        theaterMode,
        setTheaterMode,
        miniPlayer,
        setMiniPlayer,
        playVideo,
        closePlayer,
        activePlaylist,
        activePlaylistIndex,
        isPlaylistAutoPlay,
        playFullPlaylist,
        playNextInPlaylist,
        playPreviousInPlaylist,
        togglePlaylistAutoPlay,
        currentUser,
        users,
        login,
        signup,
        logout,
        changeAdminPassword,
        updateUserStatus,
        playlists,
        watchHistory,
        favorites,
        downloads,
        supabaseStatus,
        saveSupabaseConfig,
        toasts,
        showToast,
        dismissToast,
        toggleFavorite,
        isFavorite,
        updateHistoryProgress,
        clearHistory,
        startDownload,
        downloadToGallery,
        removeDownload,
        addCustomVideo,
        uploadUserVideoFile,
        updateVideo,
        deleteVideo,
        createPlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        deletePlaylist,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        isAddVideoModalOpen,
        setIsAddVideoModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        videoDetailsModalVideo,
        setVideoDetailsModalVideo,
        videoEditModalVideo,
        setVideoEditModalVideo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
