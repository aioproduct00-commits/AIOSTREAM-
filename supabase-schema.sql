-- =========================================================
-- AIOSTREAM - Database Schema for Supabase
-- Video Streaming & Direct Download Platform (No Ads)
-- =========================================================

-- Enable uuid-ossp for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'direct_mp4', 'hls', 'webm')),
    video_url TEXT NOT NULL,
    youtube_id TEXT,
    thumbnail_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    duration_formatted TEXT NOT NULL,
    quality_label TEXT DEFAULT '4K Ultra HD',
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    channel_name TEXT NOT NULL,
    channel_avatar TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    download_url_1080p TEXT,
    download_url_720p TEXT,
    download_url_original TEXT,
    download_size_bytes BIGINT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAYLISTS TABLE
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PLAYLIST_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.playlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(playlist_id, video_id)
);

-- 5. WATCH_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    progress_seconds INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(video_id)
);

-- 7. DOWNLOADS RECORD TABLE
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    quality TEXT NOT NULL,
    file_format TEXT NOT NULL DEFAULT 'mp4',
    file_size_bytes BIGINT DEFAULT 0,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMENTS / REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON public.videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON public.videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched ON public.watch_history(last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON public.playlist_items(playlist_id, position);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- POLICIES: Allow public read and write for the AIOSTREAM open streaming catalog
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Write Categories" ON public.categories FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Public Insert Videos" ON public.videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Videos" ON public.videos FOR UPDATE USING (true);
CREATE POLICY "Public Delete Videos" ON public.videos FOR DELETE USING (true);

CREATE POLICY "Public Read Playlists" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Public Insert Playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Playlists" ON public.playlists FOR UPDATE USING (true);
CREATE POLICY "Public Delete Playlists" ON public.playlists FOR DELETE USING (true);

CREATE POLICY "Public Read Playlist Items" ON public.playlist_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Playlist Items" ON public.playlist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Playlist Items" ON public.playlist_items FOR DELETE USING (true);

CREATE POLICY "Public Watch History" ON public.watch_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Favorites" ON public.favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Downloads" ON public.downloads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- INITIAL SEED DATA
-- =========================================================

INSERT INTO public.categories (id, name, slug, description, icon) VALUES
('trailers', 'Movies & Trailers', 'trailers', 'Blockbuster cinema trailers & official 4K teasers', 'Film'),
('nature', '4K Nature & Earth', 'nature', 'Breathtaking 4K/8K drone and wildlife landscapes', 'Compass'),
('tech', 'Tech & Innovation', 'tech', 'Engineering, gadgets, computing, and cutting-edge science', 'Cpu'),
('music', 'Music & Lo-Fi', 'music', '24/7 ad-free music, ambient streams, and high-fidelity sound', 'Music'),
('gaming', 'Gaming & Unreal', 'gaming', 'Next-gen gameplay, 60fps walkthroughs, and cinematic engines', 'Gamepad2'),
('animation', 'Open Cinema & Animation', 'animation', 'Open source Blender films, anime, and creative CGI', 'Sparkles'),
('documentary', 'Documentaries & Science', 'documentary', 'In-depth science, physics, cosmos, and history', 'BookOpen')
ON CONFLICT (id) DO NOTHING;
