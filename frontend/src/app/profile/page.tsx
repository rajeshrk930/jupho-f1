'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useClerk } from '@clerk/nextjs';
import { 
  User, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import MobileTopBar from '@/components/MobileTopBar';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      // Sign out from Clerk to avoid auth-loop when visiting /sign-in
      await signOut();
    } catch {}
    logout();
    router.push('/sign-in');
  };

  const isPro = user?.proExpiresAt && new Date(user.proExpiresAt) > new Date();
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const proExpiryDate = user?.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <MobileTopBar title="Profile" />
      
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        {/* User Info Card - Clean SaaS Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-purple-500 h-24 sm:h-32" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-purple-500 flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-gray-600 mt-1">{user?.email}</p>
                <div className="mt-3">
                  {isPro ? (
                    <div className="inline-flex flex-col items-center sm:items-start">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500 text-white font-semibold shadow-sm">
                        <Sparkles size={16} />
                        <span>Pro Member</span>
                      </span>
                      {proExpiryDate && (
                        <span className="text-xs text-gray-500 mt-2">Active until {proExpiryDate}</span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium">
                      Free Plan
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Account</h3>
          </div>
          
          <button
            onClick={() => router.push('/billing')}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPro ? 'bg-purple-500' : 'bg-gray-100'
              }`}>
                <CreditCard size={22} className={isPro ? 'text-white' : 'text-gray-600'} />
              </div>
              <div className="text-left">
                <p className="text-base font-medium text-gray-900">Billing & Plans</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isPro ? 'Manage your Pro subscription' : 'Upgrade to unlock all features'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Settings size={22} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-base font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500 mt-0.5">Facebook account & preferences</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Support</h3>
          </div>
          
          <button
            onClick={() => window.open('mailto:support@jupho.com', '_blank')}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <HelpCircle size={22} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-base font-medium text-gray-900">Help & Support</p>
                <p className="text-sm text-gray-500 mt-0.5">Get help with your campaigns</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-red-50 rounded-2xl shadow-sm border border-gray-200 hover:border-red-200 transition-all active:scale-98"
        >
          <LogOut size={22} className="text-red-600" />
          <span className="text-base font-semibold text-red-600">Log Out</span>
        </button>

        {/* App Info */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">Jupho - Agency in a Box</p>
          <p className="text-xs text-gray-400 mt-2">
            {user?.createdAt && `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          </p>
        </div>
      </div>
    </div>
  );
}
