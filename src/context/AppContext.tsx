import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Video, Category, Playlist, WatchHistoryItem, DownloadRecord, ActiveTab } from '../types';
import { INITIAL_VIDEOS, INITIAL_CATEGORIES, INITIAL_PLAYLISTS } from '../lib/seedData';
import {
  getActiveSupabaseCredentials,
  saveSupabaseCredentials,
  syncVideosFromSupabase,
  insertVideoToSupabase,
  testSupabaseConnection,
} from '../lib/supabase';
import { extractYouTubeId, getYouTubeThumbnail, triggerDirectDownload } from '../lib/utils';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  videos: Video[];
  categories: Category[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeVideo: Video | null;
  theaterMode: boolean;
  setTheaterMode: (val: boolean) => void;
  miniPlayer: boolean;
  setMiniPlayer: (val: boolean) => void;
  playVideo: (video: Video, startSeconds?: number) => void;
  closePlayer: () => void;
  playlists: Playlist[];
  watchHistory: WatchHistoryItem[];
  favorites: string[];
  downloads: DownloadRecord[];
  supabaseStatus: { url: string; isConnected: boolean };
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  toggleFavorite: (videoId: string) => void;
  isFavorite: (videoId: string) => boolean;
  updateHistoryProgress: (videoId: string, progressSeconds: number, durationSeconds: number) => void;
  clearHistory: () => void;
  startDownload: (video: Video, quality: string) => void;
  removeDownload: (downloadId: string) => void;
  addCustomVideo: (data: {
    urlOrId: string;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  }) => Promise<Video | null>;
  createPlaylist: (title: string, description: string) => Playlist;
  addVideoToPlaylist: (playlistId: string, videoId: string) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  saveSupabaseConfig: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  isAddVideoModalOpen: boolean;
  setIsAddVideoModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VIDEOS: 'aiostream_videos_v1',
  PLAYLISTS: 'aiostream_playlists_v1',
  HISTORY: 'aiostream_history_v1',
  FAVORITES: 'aiostream_favorites_v1',
  DOWNLOADS: 'aiostream_downloads_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State initialization with localStorage fallbacks
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

  // Sync state to LocalStorage
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
          // Attempt remote catalog merge
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
    // increment local view count
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, viewCount: v.viewCount + 1 } : v))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePlayer = () => {
    setActiveVideo(null);
    setTheaterMode(false);
    setMiniPlayer(false);
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
      return [newItem, ...filtered].slice(0, 50); // Keep latest 50
    });
  };

  const clearHistory = () => {
    setWatchHistory([]);
    showToast('Watch history cleared', 'info');
  };

  const startDownload = (video: Video, quality: string) => {
    const isAudio = quality.includes('MP3');
    const ext = isAudio ? 'mp3' : 'mp4';
    const cleanTitle = video.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const filename = `${cleanTitle}_${quality}.${ext}`;

    const newDownloadId = 'dl-' + Date.now();
    const targetUrl = video.downloadUrlOriginal || video.downloadUrl1080p || video.videoUrl;

    const newRecord: DownloadRecord = {
      id: newDownloadId,
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      quality,
      fileFormat: ext,
      fileSizeBytes: video.downloadSizeBytes || 350000000,
      status: 'downloading',
      progress: 10,
      downloadUrl: targetUrl,
      timestamp: new Date().toISOString(),
    };

    setDownloads((prev) => [newRecord, ...prev]);
    showToast(`Starting high-speed download (${quality})...`, 'info');

    // Trigger direct stream download in browser
    if (video.videoType === 'direct_mp4' || targetUrl.endsWith('.mp4')) {
      triggerDirectDownload(targetUrl, filename);
    }

    // Simulate reliable progressive download status
    let currentProgress = 15;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDownloads((prev) =>
          prev.map((d) => (d.id === newDownloadId ? { ...d, progress: 100, status: 'completed' } : d))
        );
        showToast(`Download completed: ${video.title.substring(0, 28)}...`, 'success');
      } else {
        setDownloads((prev) =>
          prev.map((d) => (d.id === newDownloadId ? { ...d, progress: currentProgress } : d))
        );
      }
    }, 700);
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

    if (ytId) {
      videoType = 'youtube';
      cleanUrl = `https://www.youtube.com/watch?v=${ytId}`;
      thumb = getYouTubeThumbnail(ytId);
    } else if (isDirectMp4) {
      videoType = 'direct_mp4';
      thumb = '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg';
    } else if (isWebm) {
      videoType = 'webm';
      thumb = '/src/assets/images/category_sci_fi_cosmos_1792827556784.jpg';
    } else {
      videoType = 'youtube';
      thumb = '/src/assets/images/hero_aiostream_cinema_1792827556593.jpg';
    }

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
      durationFormatted: '5:00',
      qualityLabel: '1080p Original',
      viewCount: 1,
      likeCount: 1,
      channelName: 'Custom Import',
      channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      categoryId: data.category || 'trailers',
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Imported', 'Direct Stream'],
      downloadUrl1080p: cleanUrl,
      downloadUrl720p: cleanUrl,
      downloadUrlOriginal: cleanUrl,
      downloadSizeBytes: 180000000,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };

    setVideos((prev) => [newVideo, ...prev]);

    // Save to Supabase if connected
    if (supabaseStatus.isConnected) {
      insertVideoToSupabase(newVideo);
    }

    showToast(`Video "${newVideo.title.substring(0, 30)}" added to catalog!`, 'success');
    return newVideo;
  };

  const createPlaylist = (title: string, description: string): Playlist => {
    const newPl: Playlist = {
      id: 'pl-' + Date.now(),
      title,
      description,
      thumbnailUrl: '/src/assets/images/category_sci_fi_cosmos_1792827556784.jpg',
      videoIds: [],
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
      // Sync initial data
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
        playlists,
        watchHistory,
        favorites,
        downloads,
        supabaseStatus,
        toasts,
        showToast,
        dismissToast,
        toggleFavorite,
        isFavorite,
        updateHistoryProgress,
        clearHistory,
        startDownload,
        removeDownload,
        addCustomVideo,
        createPlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,
        deletePlaylist,
        saveSupabaseConfig,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        isAddVideoModalOpen,
        setIsAddVideoModalOpen,
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
