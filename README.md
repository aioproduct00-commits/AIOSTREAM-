# AIOSTREAM - Ad-Free Video Streaming & Direct Download Platform

A complete, modern, responsive web application built for streaming and downloading online videos in original high-bitrate quality without any advertising interruptions or disturbances.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**, with zero-configuration deployment to **Cloudflare Pages** and complete **GitHub** compatibility.

---

## Key Features

- **Zero Ads or Disturbances**: Stream any video without banner popups, pre-roll video ads, or tracking interruptions.
- **YouTube Direct Streaming Integration**: Paste any YouTube video link, shorts link, or ID to stream directly with custom player controls and theater mode.
- **Original Quality Downloads**: Download in 4K UHD Master, 1080p Full HD, 720p, or high-bitrate MP3 audio extraction.
- **Cinema-Grade Player**:
  - Full theater mode and picture-in-picture.
  - Multi-speed playback selector (0.75x, 1x, 1.5x, 2x).
  - Time scrubbing with tabular numerals and duration tracking.
  - Continuous "Up Next" queue without commercial breaks.
- **Curated High-Definition Catalog**:
  - Blockbuster 4K movie trailers.
  - 4K & 8K nature and wildlife aerial footage.
  - 24/7 Lo-Fi study beats and orchestra performances.
  - Blender Studio open-source 4K master films (*Big Buck Bunny*, *Tears of Steel*, *Sintel*).
  - Deep space astronomy and science documentaries.
- **Offline Downloads Manager**: Track active and completed downloads with size calculations, format tags, and direct offline playback.
- **Playlists & Collections**: Create, edit, and organize custom streaming playlists.
- **Watch History & Resume**: Keeps track of last-watched timestamps so you can resume where you left off.
- **Favorites**: One-click bookmarking of top streams.
- **Supabase Cloud Database**:
  - Full relational schema in `supabase-schema.sql` (videos, playlists, playlist_items, watch_history, downloads, favorites).
  - Row Level Security (RLS) policies and indexes included.
  - Seamless fallback to persistent local storage when offline or before database connection.

---

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend & Database**: Supabase (`@supabase/supabase-js`)
- **Version Control**: GitHub
- **Hosting / Deployment**: Cloudflare Pages (Static SPA)

---

## Project Structure

```
project-root/
├── public/
│   ├── _headers            # Cloudflare Pages security & caching headers
├── src/
│   ├── assets/             # Generated visual assets & posters
│   ├── components/
│   │   ├── Navbar.tsx      # Top bar navigation (3-zone contract)
│   │   ├── CinemaPlayer.tsx# Ad-free cinema streaming engine
│   │   ├── VideoCard.tsx   # Video card with unboxed metadata
│   │   ├── HomeView.tsx    # Split-screen hero, KPI strip & video catalog
│   │   ├── CategoriesView.tsx # Genre & category browser
│   │   ├── PlaylistsView.tsx # Custom playlists manager
│   │   ├── DownloadsView.tsx # Offline downloads tracking
│   │   ├── FavoritesView.tsx # Saved videos
│   │   ├── HistoryView.tsx   # Watch progress & resume
│   │   ├── AddVideoModal.tsx # YouTube & MP4 import modal
│   │   ├── SupabaseModal.tsx # Cloud sync & database credentials
│   │   ├── Toast.tsx         # Notification toasts
│   │   └── Footer.tsx        # Editorial footer
│   ├── context/
│   │   └── AppContext.tsx  # Global state & offline persistence
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client & sync helpers
│   │   ├── seedData.ts     # Pre-seeded catalog of 4K streams
│   │   └── utils.ts        # YouTube URL parser & formatters
│   ├── types.ts            # TypeScript domain interfaces
│   ├── App.tsx             # Root application component
│   ├── index.css           # Tailwind CSS & custom scrollbar
│   └── main.tsx            # Application entry point
├── supabase-schema.sql     # Complete Supabase PostgreSQL schema
├── .env.example            # Environment variables blueprint
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point with metadata
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── DEPLOYMENT.md           # Step-by-step Cloudflare Pages deployment guide
└── README.md               # Project documentation
```

---

## Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/aiostream.git
   cd aiostream
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials if you want cloud database persistence:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
   *(Note: The application works out of the box with local browser storage if Supabase credentials are not provided.)*

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready static assets will be generated in the `dist` folder.

---

## Supabase Database Setup

To provision your remote database in Supabase:
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, open the **SQL Editor**.
3. Copy and run the entire contents of `supabase-schema.sql`.
4. Copy your **Project URL** and **anon public API key** from Project Settings > API.
5. Paste them into your `.env` file or click the **Database** button in the AIOSTREAM navbar to sync live.

---

## License

Apache-2.0 License.
