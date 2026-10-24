import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup, showToast } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success) {
        setIsAuthModalOpen(false);
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long');
        return;
      }
      const res = signup(name, email, password);
      if (res.success) {
        setIsAuthModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@aiostream.com');
    setPassword('Admin@AIOStream2026!');
    setErrorMsg('');
    showToast('Admin credentials filled. Click Sign In to enter portal.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--accent-sage)] text-white shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                {mode === 'login' ? 'Sign In to AIOSTREAM' : 'Create User Account'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {mode === 'login'
                  ? 'Access your uploaded media, studio & admin portal'
                  : 'Join as a creator to upload videos and save playlists'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setErrorMsg('');
            }}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-[var(--accent-sage)] text-[var(--accent-sage)] bg-[var(--accent-sage-light)]/20'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-[var(--accent-sage)] text-[var(--accent-sage)] bg-[var(--accent-sage-light)]/20'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body - Autofill disabled per user request */}
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="p-6 space-y-4"
        >
          {/* Hidden inputs to prevent aggressive browser autofill */}
          <input type="text" style={{ display: 'none' }} />
          <input type="password" style={{ display: 'none' }} />

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Full Name / Creator Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fake_signup_name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3 py-2 pl-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                  required
                />
                <UserIcon className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="fake_email_field"
                autoComplete="off"
                data-lpignore="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 pl-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                required
              />
              <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                name="fake_password_field"
                autoComplete="new-password"
                data-lpignore="true"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 pl-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
                required
              />
              <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[var(--accent-sage)] hover:bg-[var(--accent-sage-hover)] shadow-md transition-all active:scale-[0.99]"
          >
            {mode === 'login' ? 'Sign In' : 'Register Account'}
          </button>

          {/* Admin Credentials Helper Callout */}
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <div className="p-3 rounded-xl bg-[var(--accent-sage-light)]/40 border border-[var(--border-subtle)] text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--text-primary)] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                  Default Admin Portal Access
                </span>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="text-[var(--accent-sage)] hover:underline font-semibold"
                >
                  Quick Fill
                </button>
              </div>
              <div className="text-[var(--text-secondary)] font-mono text-[10px] space-y-0.5">
                <div>Email: <span className="font-bold text-[var(--text-primary)]">admin@aiostream.com</span></div>
                <div>Default Password: <span className="font-bold text-[var(--text-primary)]">Admin@AIOStream2026!</span></div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight pt-1">
                You can change this password anytime inside the <strong>Admin Portal &gt; Settings &gt; Change Password</strong> tab.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
