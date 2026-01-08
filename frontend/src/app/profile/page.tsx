'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { 
  User, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Crown,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';
import MobileTopBar from '@/components/MobileTopBar';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
    setTheme(saved === 'dark' ? 'dark' : 'light');
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('theme-dark', newTheme === 'dark');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', newTheme);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isPro = user?.proExpiresAt && new Date(user.proExpiresAt) > new Date();
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-base-surface pb-20 lg:pb-0">
      <MobileTopBar title="Profile" />
      
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-base-elevated rounded-md p-6 shadow-sm border border-border-default">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-signal-primary/10 flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-signal-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-text-primary truncate">{displayName}</h2>
              <p className="text-sm text-text-secondary truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {isPro ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-signal-primary/10 border border-signal-primary/20">
                    <Crown size={14} className="text-signal-primary" />
                    <span className="text-xs font-bold text-signal-primary">PRO Member</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-sm bg-base-surface border border-border-default">
                    <span className="text-xs font-semibold text-text-secondary">Free Plan</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-base-elevated rounded-md shadow-sm border border-border-default overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Account</h3>
          </div>
          
          <button
            onClick={() => router.push('/billing')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-base-surface transition-colors border-b border-border-default"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                isPro ? 'bg-signal-primary/10' : 'bg-base-surface'
              }`}>
                <CreditCard size={20} className={isPro ? 'text-signal-primary' : 'text-text-secondary'} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Billing & Plans</p>
                <p className="text-xs text-text-tertiary">
                  {isPro ? 'Manage your Pro subscription' : 'Upgrade to Pro'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-tertiary" />
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-base-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-base-surface flex items-center justify-center">
                <Settings size={20} className="text-text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Settings</p>
                <p className="text-xs text-text-tertiary">Account preferences</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-tertiary" />
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-base-elevated rounded-md shadow-sm border border-border-default overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Preferences</h3>
          </div>
          
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-base-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-base-surface flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon size={20} className="text-text-secondary" />
                ) : (
                  <Sun size={20} className="text-text-secondary" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Dark Mode</p>
                <p className="text-xs text-text-tertiary">
                  {theme === 'dark' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-sm transition-colors ${
              theme === 'dark' ? 'bg-signal-primary' : 'bg-base-surface border border-border-default'
            } relative`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-sm bg-white shadow-sm transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Support */}
        <div className="bg-base-elevated rounded-md shadow-sm border border-border-default overflow-hidden">
          <div className="px-4 py-3 border-b border-border-default">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Support</h3>
          </div>
          
          <button
            onClick={() => router.push('/help')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-base-surface transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-base-surface flex items-center justify-center">
                <HelpCircle size={20} className="text-text-secondary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">Help Center</p>
                <p className="text-xs text-text-tertiary">Get support & tutorials</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-text-tertiary" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-base-elevated hover:bg-signal-danger/10 rounded-md shadow-sm border border-border-default hover:border-signal-danger/20 transition-colors"
        >
          <LogOut size={20} className="text-signal-danger" />
          <span className="text-sm font-semibold text-signal-danger">Log Out</span>
        </button>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-text-tertiary">Jupho v1.0.0</p>
          <p className="text-xs text-text-tertiary mt-1">
            {user?.createdAt && `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          </p>
        </div>
      </div>
    </div>
  );
}
