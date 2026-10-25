import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Film,
  Users,
  Database,
  KeyRound,
  Search,
  Plus,
  Trash2,
  Edit3,
  Play,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HardDrive,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { formatViews, formatBytes, formatDuration } from '../lib/utils';
import type { Video, User } from '../types';

export const AdminPortalView: React.FC = () => {
  const {
    videos,
    users,
    currentUser,
    deleteVideo,
    playVideo,
    setIsAddVideoModalOpen,
    setIsSupabaseModalOpen,
    setIsAuthModalOpen,
    setActiveTab,
    supabaseStatus,
    updateUserStatus,
    changeAdminPassword,
    setVideoEditModalVideo,
    showToast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'media' | 'users' | 'storage' | 'settings'>('media');
  const [mediaSearch, setMediaSearch] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Change Password Form State (Autofill disabled per user request)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const filteredVideos = videos.filter((v) => {
    if (selectedUserFilter && v.uploaderId !== selectedUserFilter) return false;
    if (!mediaSearch.trim()) return true;
    const q = mediaSearch.toLowerCase();
    return (
      v.title.toLowerCase().includes(q) ||
      v.channelName.toLowerCase().includes(q) ||
      (v.uploaderEmail && v.uploaderEmail.toLowerCase().includes(q))
    );
  });

  const totalStorageBytes = videos.reduce((acc, v) => acc + (v.downloadSizeBytes || 250000000), 0);
  const userUploadsCount = videos.filter((v) => v.isUserUpload).length;
  const youtubeCount = videos.filter((v) => v.videoType === 'youtube').length;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match. Please verify.' });
      return;
    }

    const res = changeAdminPassword(newPassword);
    if (res.success) {
      setPasswordStatus({ type: 'success', message: 'Your admin password was changed successfully! It is saved persistently.' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ type: 'error', message: res.message });
    }
  };

  // RESTRICT ACCESS TO AUTHORIZED ADMINISTRATORS ONLY
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-sage)] shadow-sm mb-5">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
          Administrator Access Only
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
          The Admin Portal and media storage control center are restricted strictly to the site owner. Master credentials and admin controls are protected and hidden from the public.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md transition-colors"
          >
            Admin Sign In
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-primary)] transition-colors"
          >
            Return to Discover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-sage)] uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>AIOSTREAM Administrative Console</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight mt-1">
            Media Library & Database Control Center
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Manage online storage database, view registered user accounts and uploaded videos, and configure admin security.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddVideoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Media</span>
          </button>

          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium text-[var(--text-primary)] transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
            <span>Cloud Database</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex border-b border-[var(--border-subtle)] mt-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveAdminTab('media')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeAdminTab === 'media'
              ? 'border-[var(--accent-sage)] text-[var(--accent-sage)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Media Library ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeAdminTab === 'users'
              ? 'border-[var(--accent-sage)] text-[var(--accent-sage)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Creator Data ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('storage')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeAdminTab === 'storage'
              ? 'border-[var(--accent-sage)] text-[var(--accent-sage)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Online Storage & Cloud Sync</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeAdminTab === 'settings'
              ? 'border-[var(--accent-sage)] text-[var(--accent-sage)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Admin Security & Password</span>
        </button>
      </div>

      {/* TAB 1: MEDIA LIBRARY */}
      {activeAdminTab === 'media' && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                placeholder="Search media by title, uploader, or tag..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            </div>

            {selectedUserFilter && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-muted)]">Filtering by creator uploads:</span>
                <button
                  onClick={() => setSelectedUserFilter(null)}
                  className="px-2.5 py-1 rounded bg-[var(--accent-sage-light)] text-[var(--accent-sage)] font-medium hover:underline"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>

          {/* Media Table */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Video & Media</th>
                    <th className="py-3 px-4">Uploader / Creator</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Quality</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                  {filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <div
                            onClick={() => playVideo(video)}
                            className="relative w-16 aspect-video rounded-md overflow-hidden bg-black shrink-0 cursor-pointer group"
                          >
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-3.5 h-3.5 fill-white text-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div
                              onClick={() => playVideo(video)}
                              className="font-semibold truncate max-w-xs cursor-pointer hover:text-[var(--accent-sage)] transition-colors"
                            >
                              {video.title}
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">
                              Category: {video.categoryId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[var(--text-primary)]">
                          {video.uploaderName || video.channelName}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)]">
                          {video.uploaderEmail || (video.isUserUpload ? 'User Upload' : 'Catalog Master')}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-[var(--accent-sage)]">
                          {video.videoType.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium">{video.qualityLabel}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums">
                        {video.durationFormatted}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums">
                        {formatViews(video.viewCount)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => playVideo(video)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--accent-sage)]"
                            title="Play Video"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            onClick={() => setVideoEditModalVideo(video)}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            title="Edit Media"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete "${video.title}" from media database?`)) {
                                deleteVideo(video.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & CREATOR DATA */}
      {activeAdminTab === 'users' && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <h2 className="text-sm font-bold text-[var(--text-primary)] font-display">
              Registered Accounts & Creator Records
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Every user who creates an account on AIOSTREAM appears here. You can inspect their uploaded videos, join date, and account status.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => {
              const userVideos = videos.filter((v) => v.uploaderId === user.id || v.uploaderEmail === user.email);
              const isActive = user.status === 'active';

              return (
                <div
                  key={user.id}
                  className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-sage)] transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-[var(--border-subtle)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">
                            {user.name}
                          </h3>
                          {user.role === 'admin' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-sage)] text-white font-semibold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-2">
                      {user.bio || 'Registered AIOSTREAM user.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)]">Videos Uploaded</div>
                        <div className="font-mono font-bold text-[var(--text-primary)] tabular-nums">
                          {userVideos.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)]">Registered</div>
                        <div className="text-[11px] text-[var(--text-primary)]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedUserFilter(user.id);
                        setActiveAdminTab('media');
                        showToast(`Showing videos uploaded by ${user.name}`, 'info');
                      }}
                      className="text-xs font-semibold text-[var(--accent-sage)] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Uploads</span>
                    </button>

                    {user.role !== 'admin' && (
                      <button
                        onClick={() => updateUserStatus(user.id, isActive ? 'suspended' : 'active')}
                        className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isActive ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ONLINE STORAGE & CLOUD DATABASE */}
      {activeAdminTab === 'storage' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Total Media Records</span>
                <Film className="w-4 h-4 text-[var(--accent-sage)]" />
              </div>
              <div className="text-2xl font-bold font-display text-[var(--text-primary)] mt-2 font-mono tabular-nums">
                {videos.length}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                {youtubeCount} YouTube streams · {userUploadsCount} user uploads
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Storage Footprint</span>
                <HardDrive className="w-4 h-4 text-[var(--accent-sage)]" />
              </div>
              <div className="text-2xl font-bold font-display text-[var(--text-primary)] mt-2 font-mono tabular-nums">
                {formatBytes(totalStorageBytes)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">High-bitrate original streams</div>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Database Status</span>
                <Database className="w-4 h-4 text-[var(--accent-sage)]" />
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)] mt-2 flex items-center gap-1.5">
                {supabaseStatus.isConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Supabase Connected</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-sage)] shrink-0" />
                    <span>Local Database Active</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                {supabaseStatus.isConnected ? supabaseStatus.url : 'Persistent browser storage engine'}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Registered Creators</span>
                <Users className="w-4 h-4 text-[var(--accent-sage)]" />
              </div>
              <div className="text-2xl font-bold font-display text-[var(--text-primary)] mt-2 font-mono tabular-nums">
                {users.length}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Accounts in database</div>
            </div>
          </div>

          {/* Database Synchronization Controller */}
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Cloud Database & Media Storage Connection
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Synchronize your media catalog, user accounts, and playlists with Supabase PostgreSQL cloud storage.
                </p>
              </div>

              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md transition-colors"
              >
                Configure Supabase
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs space-y-2">
              <div className="font-semibold text-[var(--text-primary)]">SQL Database Schema Included</div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                The full SQL migration script is located in the root repository as <code className="text-[var(--accent-sage)] font-mono font-bold">/supabase-schema.sql</code>. It creates all tables (<code className="font-mono">videos</code>, <code className="font-mono">categories</code>, <code className="font-mono">playlists</code>, <code className="font-mono">watch_history</code>, <code className="font-mono">favorites</code>, <code className="font-mono">downloads</code>) with Row Level Security.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN SETTINGS & CHANGE PASSWORD */}
      {activeAdminTab === 'settings' && (
        <div className="mt-6 max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--accent-sage)] text-white shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] font-display">
                  Admin Credentials & Password Management
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Autofill credentials have been disabled. You can review your default password below and immediately update it.
                </p>
              </div>
            </div>

            {/* Security and Credentials Card */}
            <div className="p-4 rounded-xl bg-[var(--accent-sage-light)]/30 border border-[var(--border-subtle)] text-xs space-y-3">
              <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Admin Portal Security Status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--text-muted)] text-[10px] block">Authorized Admin</span>
                  <span className="font-bold text-[var(--text-primary)]">{currentUser.email}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[var(--text-muted)] text-[10px] block">Master Password</span>
                    <span className="font-bold text-[var(--text-primary)] tracking-widest">
                      {showCurrentPassword ? 'Admin@AIOStream2026!' : '••••••••••••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    title={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[var(--accent-sage)]" />}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Autofill credentials have been disabled. Your admin password is kept confidential. Enter your new password below to update it anytime.
              </p>
            </div>

            {/* Change Password Form */}
            <form
              onSubmit={handlePasswordChange}
              autoComplete="off"
              className="space-y-4 pt-2"
            >
              {/* Hidden dummy fields to prevent aggressive browser autofill */}
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />

              {passwordStatus.type !== 'idle' && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  New Admin Password
                </label>
                <input
                  type="password"
                  name="fake_new_admin_password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new custom password (min 6 chars)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Confirm New Admin Password
                </label>
                <input
                  type="password"
                  name="fake_confirm_admin_password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password to confirm..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                  required
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] text-white text-xs font-semibold shadow-md transition-all active:scale-[0.99]"
              >
                Save My Custom Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
