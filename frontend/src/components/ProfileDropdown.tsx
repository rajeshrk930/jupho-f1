'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, CreditCard, Facebook, Mail, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useClerk } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { signOut } = useClerk();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check Facebook connection status
  useEffect(() => {
    const checkFacebookStatus = async () => {
      try {
        const response = await api.get('/facebook/status');
        setFacebookConnected(response.data.connected || false);
      } catch (error) {
        console.error('Failed to check Facebook status:', error);
        setFacebookConnected(false);
      }
    };
    checkFacebookStatus();
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Clerk to avoid auth-loop when visiting /sign-in
      await signOut();
    } catch {}
    logout();
    router.push('/sign-in');
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleConnectMeta = async () => {
    try {
      setConnecting(true);
      const response = await api.get('/facebook/auth-url');
      const authUrl = (response.data as any)?.url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        console.error('No auth URL returned');
      }
    } catch (error) {
      console.error('Failed to start Meta connect:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectMeta = async () => {
    try {
      setConnecting(true);
      await api.delete('/facebook/disconnect');
      setFacebookConnected(false);
    } catch (error) {
      console.error('Failed to disconnect Meta:', error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border-2 border-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {user?.email ? getInitials(user.email) : 'U'}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-5 py-4 bg-purple-50 border-b-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {user?.email ? getInitials(user.email) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-600">Account Settings</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Meta Connection Status */}
            <div className="px-5 py-3 space-y-3 hover:bg-purple-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  facebookConnected 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Meta Ads</p>
                  <p className={`text-xs ${facebookConnected ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {facebookConnected ? '✓ Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {!facebookConnected ? (
                <button
                  onClick={handleConnectMeta}
                  disabled={connecting}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {connecting ? 'Connecting…' : 'Connect Meta Ads'}
                </button>
              ) : (
                <button
                  onClick={handleDisconnectMeta}
                  disabled={connecting}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {connecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              )}
            </div>

            {/* Billing */}
            <button
              onClick={() => {
                router.push('/billing');
                setIsOpen(false);
              }}
              className="w-full px-5 py-3 hover:bg-purple-50 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">Billing</p>
                <p className="text-xs text-gray-500">Manage subscription</p>
              </div>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-gray-100" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-5 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">Logout</p>
                <p className="text-xs opacity-75">Sign out of account</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
