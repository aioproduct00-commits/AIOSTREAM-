import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CinemaPlayer } from './components/CinemaPlayer';
import { HomeView } from './components/HomeView';
import { CategoriesView } from './components/CategoriesView';
import { PlaylistsView } from './components/PlaylistsView';
import { FavoritesView } from './components/FavoritesView';
import { DownloadsView } from './components/DownloadsView';
import { HistoryView } from './components/HistoryView';
import { MyStudioView } from './components/MyStudioView';
import { AdminPortalView } from './components/AdminPortalView';
import { AddVideoModal } from './components/AddVideoModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AuthModal } from './components/AuthModal';
import { VideoDetailsModal } from './components/VideoDetailsModal';
import { EditVideoModal } from './components/EditVideoModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeTab, activeVideo } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Cinema Player Stage (Visible when a video is active) */}
      {activeVideo && <CinemaPlayer />}

      {/* Primary Page Content Router */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'categories' && <CategoriesView />}
        {activeTab === 'playlists' && <PlaylistsView />}
        {activeTab === 'favorites' && <FavoritesView />}
        {activeTab === 'downloads' && <DownloadsView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'my-studio' && <MyStudioView />}
        {activeTab === 'admin' && <AdminPortalView />}
      </main>

      {/* Global Interactive Modals */}
      <AddVideoModal />
      <SupabaseModal />
      <AuthModal />
      <VideoDetailsModal />
      <EditVideoModal />
      <Toast />

      {/* Site Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
