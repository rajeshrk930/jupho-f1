'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { settingsApi, authApi, api } from '@/lib/api';
import { User, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Facebook connection
  const [fbStatus, setFbStatus] = useState<any>(null);
  const [fbLoading, setFbLoading] = useState(false);
  
  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/settings');
    }
  }, [isAuthenticated, router]);
  
  useEffect(() => {
    if (!isAuthenticated) return; // Skip if not authenticated
    
    checkFacebookStatus();
    
    // Check if redirected from Facebook OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('facebook') === 'connected') {
      toast.success('Facebook account connected successfully!');
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    } else if (params.get('error')) {
      const errorMsg = params.get('message') || 'Failed to connect Facebook account';
      toast.error(decodeURIComponent(errorMsg));
      window.history.replaceState({}, '', '/settings');
    }
  }, []);
  
  const checkFacebookStatus = async () => {
    try {
      const { data } = await api.get('/facebook/status');
      setFbStatus(data);
    } catch (error) {
      console.error('Failed to check Facebook status:', error);
    }
  };
  
  const connectFacebook = async () => {
    try {
      setFbLoading(true);
      const { data } = await api.get('/facebook/auth-url');
      window.location.href = data.url;
    } catch (error: any) {
      toast.error('Failed to connect Facebook');
      setFbLoading(false);
    }
  };
  
  const disconnectFacebook = async () => {
    if (!confirm('Are you sure you want to disconnect your Facebook account? You will need to reconnect to analyze ads automatically.')) {
      return;
    }
    
    try {
      setFbLoading(true);
      await api.delete('/facebook/disconnect');
      await checkFacebookStatus();
      toast.success('Facebook account disconnected');
    } catch (error: any) {
      toast.error('Failed to disconnect Facebook');
    } finally {
      setFbLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates: { name?: string; email?: string } = {};
      if (name !== user?.name) updates.name = name;
      if (email !== user?.email) updates.email = email;
      
      if (Object.keys(updates).length === 0) {
        toast.error('No changes to save');
        setLoading(false);
        return;
      }

      await settingsApi.updateProfile(updates);
      
      // Refresh user data
      const response = await authApi.getMe();
      useAuthStore.getState().setAuth(response.data);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await settingsApi.changePassword({
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Don't render until auth is checked
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-coral-50 pt-6">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Settings</h1>
          <p className="text-charcoal-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-coral-50 flex items-center justify-center">
              <User size={20} className="text-coral-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900">Profile Information</h2>
              <p className="text-sm text-charcoal-600">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              Save Changes
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-coral-50 flex items-center justify-center">
              <Lock size={20} className="text-coral-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900">Change Password</h2>
              <p className="text-sm text-charcoal-600">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white text-charcoal-900"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Lock size={16} />
              Update Password
            </button>
          </form>
        </div>

        {/* Facebook Account Connection Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900">Facebook Ad Account</h2>
              <p className="text-sm text-charcoal-600">Connect to automatically fetch ad metrics</p>
            </div>
          </div>

          {fbStatus === null ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
            </div>
          ) : fbStatus?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-mint-50 border border-mint-200 rounded-lg">
                <div className="w-3 h-3 bg-mint-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-mint-900">Connected</p>
                  <p className="text-sm text-mint-700">
                    {fbStatus.account?.adAccountName || 'Facebook Ad Account'}
                  </p>
                </div>
              </div>
              
              {fbStatus.account?.lastSyncAt && (
                <p className="text-sm text-charcoal-600">
                  Last synced: {new Date(fbStatus.account.lastSyncAt).toLocaleString()}
                </p>
              )}
              
              {fbStatus.account?.tokenExpiring && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your access token is expiring soon. Please reconnect your account.
                  </p>
                </div>
              )}
              
              <button
                onClick={disconnectFacebook}
                disabled={fbLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {fbLoading ? 'Disconnecting...' : 'Disconnect Facebook'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Why connect Facebook?</strong>
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Automatically fetch ad metrics (CPM, CTR, CPA)</li>
                  <li>No manual data entry required</li>
                  <li>Real-time sync with your ad campaigns</li>
                  <li>View-only access - we never modify your ads</li>
                </ul>
              </div>
              
              <button
                onClick={connectFacebook}
                disabled={fbLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {fbLoading ? 'Connecting...' : 'Connect Facebook'}
              </button>
              
              <p className="text-xs text-charcoal-600">
                We only request view-only access to your ad accounts. Your credentials are encrypted and stored securely.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
