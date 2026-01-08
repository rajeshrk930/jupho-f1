'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { settingsApi, authApi } from '@/lib/api';
import { User, Mail, Lock, Bell, Shield, Download, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

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

  const handleExportData = async () => {
    try {
      toast.loading('Preparing your data export...');
      const blob = await settingsApi.exportData();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jupho-data-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Data exported successfully');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will delete all your data permanently.'
    );
    if (!confirmed) return;
    
    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }
    
    try {
      setLoading(true);
      await settingsApi.deleteAccount();
      toast.success('Account deleted successfully. Goodbye!');
      logout();
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-surface pt-6">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-base-elevated rounded-md border border-border-default p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-signal-primary/10 flex items-center justify-center">
              <User size={20} className="text-signal-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Profile Information</h2>
              <p className="text-sm text-text-secondary">Update your personal details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-base-elevated rounded-md border border-border-default p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-signal-primary/10 flex items-center justify-center">
              <Lock size={20} className="text-signal-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>
              <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Lock size={16} />
              Update Password
            </button>
          </form>
        </div>

        {/* Notifications Section */}
        <div className="bg-base-elevated rounded-md border border-border-default p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-base-surface flex items-center justify-center">
              <Bell size={20} className="text-text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
              <p className="text-sm text-gray-600">Manage how you receive updates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Email Notifications</p>
                <p className="text-sm text-text-secondary">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-base-elevated peer-focus:ring-2 peer-focus:ring-signal-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-base after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-surface after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-signal-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Analysis Complete</p>
                <p className="text-sm text-text-secondary">Get notified when analysis is done</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analysisComplete}
                  onChange={(e) => setAnalysisComplete(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-base-elevated peer-focus:ring-2 peer-focus:ring-signal-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-base after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-surface after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-signal-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Usage Alerts</p>
                <p className="text-sm text-text-secondary">Alert when reaching usage limits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={usageAlerts}
                  onChange={(e) => setUsageAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-base-elevated peer-focus:ring-2 peer-focus:ring-signal-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-base after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-surface after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-signal-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">Weekly Report</p>
                <p className="text-sm text-text-secondary">Summary of your activity each week</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyReport}
                  onChange={(e) => setWeeklyReport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-base-elevated peer-focus:ring-2 peer-focus:ring-signal-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-base after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-surface after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-signal-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy Section */}
        <div className="bg-base-elevated rounded-md border border-border-default p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-signal-warning/10 flex items-center justify-center">
              <Shield size={20} className="text-signal-warning" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Data & Privacy</h2>
              <p className="text-sm text-gray-600">Manage your data and account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-border-default rounded-md p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1">Export Your Data</h3>
                  <p className="text-sm text-text-secondary">Download all your analyses, conversations, and account data</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="btn-secondary inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            <div className="border border-signal-danger/20 rounded-md p-4 bg-signal-danger/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-signal-danger mb-1">Delete Account</h3>
                  <p className="text-sm text-signal-danger">Permanently delete your account and all associated data</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-signal-danger text-white rounded-md hover:bg-signal-danger/90 transition-colors font-medium inline-flex items-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
