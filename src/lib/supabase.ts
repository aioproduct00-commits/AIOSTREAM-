import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Video, Playlist, WatchHistoryItem, DownloadRecord } from '../types';

// Read from Vite environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage keys for runtime configuration overrides
const STORAGE_KEY_URL = 'aiostream_supabase_url';
const STORAGE_KEY_KEY = 'aiostream_supabase_key';

export function getActiveSupabaseCredentials(): { url: string; key: string } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : '';

  return {
    url: localUrl || envUrl || '',
    key: localKey || envAnonKey || '',
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem(STORAGE_KEY_URL, url);
      localStorage.setItem(STORAGE_KEY_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
  }
}

let cachedClient: SupabaseClient | null = null;
let lastKnownUrl = '';
let lastKnownKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getActiveSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  // Check if credentials changed or not yet initialized
  if (!cachedClient || lastKnownUrl !== url || lastKnownKey !== key) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      lastKnownUrl = url;
      lastKnownKey = key;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key);
    const { error } = await testClient.from('categories').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

// Remote DB sync helpers with graceful fallbacks
export async function syncVideosFromSupabase(): Promise<Video[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch videos error:', error?.message);
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      videoType: item.video_type,
      videoUrl: item.video_url,
      youtubeId: item.youtube_id,
      thumbnailUrl: item.thumbnail_url,
      durationSeconds: item.duration_seconds || 0,
      durationFormatted: item.duration_formatted,
      qualityLabel: item.quality_label || '4K UHD',
      viewCount: Number(item.view_count || 0),
      likeCount: Number(item.like_count || 0),
      channelName: item.channel_name,
      channelAvatar: item.channel_avatar,
      categoryId: item.category_id || 'trailers',
      tags: item.tags || [],
      downloadUrl1080p: item.download_url_1080p,
      downloadUrl720p: item.download_url_720p,
      downloadUrlOriginal: item.download_url_original,
      downloadSizeBytes: item.download_size_bytes,
      isFeatured: Boolean(item.is_featured),
      createdAt: item.created_at,
    }));
  } catch (e) {
    console.warn('Supabase sync error:', e);
    return null;
  }
}

export async function insertVideoToSupabase(video: Video): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('videos').insert({
      id: video.id,
      title: video.title,
      description: video.description,
      video_type: video.videoType,
      video_url: video.videoUrl,
      youtube_id: video.youtubeId,
      thumbnail_url: video.thumbnailUrl,
      duration_seconds: video.durationSeconds,
      duration_formatted: video.durationFormatted,
      quality_label: video.qualityLabel,
      view_count: video.viewCount,
      like_count: video.likeCount,
      channel_name: video.channelName,
      channel_avatar: video.channelAvatar,
      category_id: video.categoryId,
      tags: video.tags,
      download_url_1080p: video.downloadUrl1080p,
      download_url_720p: video.downloadUrl720p,
      download_url_original: video.downloadUrlOriginal,
      download_size_bytes: video.downloadSizeBytes,
      is_featured: video.isFeatured,
    });

    if (error) {
      console.error('Error inserting video to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase video insert exception:', err);
    return false;
  }
}
