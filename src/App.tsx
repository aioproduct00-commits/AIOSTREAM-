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
import { AddVideoModal } from './components/AddVideoModal';
import { SupabaseModal } from './components/SupabaseModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeTab, activeVideo } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#08090E] text-slate-100">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Cinema Player Stage (Visible when video is active) */}
      {activeVideo && <CinemaPlayer />}

      {/* Primary Page Content */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'categories' && <CategoriesView />}
        {activeTab === 'playlists' && <PlaylistsView />}
        {activeTab === 'favorites' && <FavoritesView />}
        {activeTab === 'downloads' && <DownloadsView />}
        {activeTab === 'history' && <HistoryView />}
      </main>

      {/* Global Interactive Modals */}
      <AddVideoModal />
      <SupabaseModal />
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
