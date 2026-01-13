'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, CreditCard, Facebook, Mail, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/facebook/status`, {
          withCredentials: true
        });
        setFacebookConnected(response.data.connected || false);
      } catch (error) {
        console.error('Failed to check Facebook status:', error);
        setFacebookConnected(false);
      }
    };
    checkFacebookStatus();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleConnectMeta = async () => {
    try {
      setConnecting(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/facebook/auth-url`, {
        withCredentials: true,
      });
      const authUrl = response.data?.url;
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border-2 border-white shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          {user?.email ? getInitials(user.email) : 'U'}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-5 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b-2 border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
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

              {!facebookConnected && (
                <button
                  onClick={handleConnectMeta}
                  disabled={connecting}
                  className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {connecting ? 'Connecting…' : 'Connect Meta Ads'}
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
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
