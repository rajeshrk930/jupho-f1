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
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <MobileTopBar title="Profile" />
      
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{displayName}</h2>
              <p className="text-sm text-gray-600 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {isPro ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300">
                    <Crown size={14} className="text-purple-600" />
                    <span className="text-xs font-bold text-purple-900">PRO Member</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 border border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">Free Plan</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Account</h3>
          </div>
          
          <button
            onClick={() => router.push('/billing')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isPro ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <CreditCard size={20} className={isPro ? 'text-purple-600' : 'text-gray-600'} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Billing & Plans</p>
                <p className="text-xs text-gray-500">
                  {isPro ? 'Manage your Pro subscription' : 'Upgrade to Pro'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Settings size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Settings</p>
                <p className="text-xs text-gray-500">Account preferences</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Preferences</h3>
          </div>
          
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon size={20} className="text-gray-600" />
                ) : (
                  <Sun size={20} className="text-gray-600" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-500">
                  {theme === 'dark' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-teal-600' : 'bg-gray-300'
            } relative`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Support</h3>
          </div>
          
          <button
            onClick={() => router.push('/help')}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <HelpCircle size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Help Center</p>
                <p className="text-xs text-gray-500">Get support & tutorials</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white hover:bg-red-50 rounded-2xl shadow-sm border border-gray-200 hover:border-red-200 transition-colors"
        >
          <LogOut size={20} className="text-red-600" />
          <span className="text-sm font-semibold text-red-600">Log Out</span>
        </button>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">Jupho v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">
            {user?.createdAt && `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          </p>
        </div>
      </div>
    </div>
  );
}
