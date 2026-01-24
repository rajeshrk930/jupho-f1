'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Zap, 
  BookMarked, 
  History, 
  User, 
  Settings, 
  LogOut,
  Crown,
  Shield,
  Sparkles,
  Folder,
  Plus,
  Facebook,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useClerk } from '@clerk/nextjs';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { signOut } = useClerk();
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [adAccountName, setAdAccountName] = useState<string>('');
  const [connecting, setConnecting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Check Facebook connection status
  useEffect(() => {
    const checkFacebookStatus = async () => {
      try {
        const response = await api.get('/facebook/status');
        setFacebookConnected(response.data.connected || false);
        if (response.data.connected && response.data.account?.adAccountName) {
          setAdAccountName(response.data.account.adAccountName);
        }
      } catch (error) {
        console.error('Failed to check Facebook status:', error);
        setFacebookConnected(false);
        setAdAccountName('');
      }
    };
    checkFacebookStatus();
  }, []);

  // Hide sidebar on public pages (unauthenticated)
  const publicPages = ['/', '/sign-in', '/sign-up', '/privacy', '/terms', '/help'];
  const isPublicPage = publicPages.includes(pathname);
  
  if (isPublicPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      // Sign out from Clerk to avoid auth-loop when visiting /sign-in
      await signOut();
    } catch {}
    logout();
    router.push('/sign-in');
  };

  const handleCreateAd = () => {
    localStorage.removeItem('agent_flow_state');
    window.location.href = '/agent';
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
      setAdAccountName('');
    } catch (error) {
      console.error('Failed to disconnect Meta:', error);
    } finally {
      setConnecting(false);
    }
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    // Trigger event for MainContent to update
    window.dispatchEvent(new Event('sidebar-toggle'));
  };

  const isPro = user?.proExpiresAt && new Date(user.proExpiresAt) > new Date();

  // Check if user is admin (based on ADMIN_EMAILS env variable)
  const isAdmin = user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
    .map(email => email.trim().toLowerCase())
    .includes(user.email.toLowerCase());

  const navItems = [
    { href: '/agent', label: 'Create Ad', icon: Plus, onClick: handleCreateAd },
    { href: '/projects', label: 'Projects', icon: Folder },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  // Add admin link for admin users
  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black text-coral-600">
              Jupho
            </span>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="px-3 py-2">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-coral-600"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.onClick) {
            return (
              <button
                key={item.href}
                onClick={item.onClick}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-md transition-all ${
                  active
                    ? 'bg-coral-50 text-coral-600 font-medium'
                    : 'text-charcoal-600 hover:bg-gray-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={active ? 'text-coral-600' : 'text-charcoal-400'} />
                {!isCollapsed && (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm">{item.label}</span>
                    {item.href === '/agent' && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                        AI
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-md transition-all ${
                active
                  ? 'bg-coral-50 text-coral-600 font-medium'
                  : 'text-charcoal-600 hover:bg-gray-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className={active ? 'text-coral-600' : 'text-charcoal-400'} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {/* PRO Badge */}
        {isPro && !isCollapsed && (
          <Link
            href="/billing"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-mint-50 border border-mint-200 hover:border-mint-300 transition-colors"
          >
            <Crown className="w-4 h-4 text-mint-600" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-signal-primary">Jupho Pro</p>
              <p className="text-xs text-text-secondary">Unlimited access</p>
            </div>
          </Link>
        )}

        {/* User Info */}
        <div className={`px-3 py-3 rounded-xl bg-coral-50 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? '' : 'gap-3 mb-2'}`}>
            <div className="w-10 h-10 rounded-full bg-coral-500 flex items-center justify-center text-white font-bold shadow-sm">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.email || 'User'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Meta Connection Status */}
        {!isCollapsed && (
          <div className="px-3 py-3 rounded-xl bg-white border border-gray-200 space-y-2">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              facebookConnected 
                ? 'bg-blue-50 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <Facebook className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900">Meta Ads</p>
              {facebookConnected ? (
                <>
                  <p className="text-xs text-green-600 font-medium">✓ Connected</p>
                  {adAccountName && (
                    <p className="text-xs text-gray-600 truncate" title={adAccountName}>
                      {adAccountName}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500">Not connected</p>
              )}
            </div>
          </div>

          {!facebookConnected ? (
            <button
              onClick={handleConnectMeta}
              disabled={connecting}
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-coral-500 hover:bg-coral-600 text-white shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {connecting ? 'Connecting…' : 'Connect Meta'}
            </button>
          ) : (
            <button
              onClick={handleDisconnectMeta}
              disabled={connecting}
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {connecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          )}
        </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-1">
          {facebookConnected && (
            <Link
              href="/forms"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-colors ${
                pathname === '/forms'
                  ? 'bg-coral-50 text-coral-600'
                  : 'text-charcoal-600 hover:bg-gray-50'
              }`}
              title={isCollapsed ? 'Lead Forms' : undefined}
            >
              <FileText size={18} className={pathname === '/forms' ? 'text-coral-600' : 'text-charcoal-400'} />
              {!isCollapsed && <span className="text-sm font-medium">Lead Forms</span>}
            </Link>
          )}
          <Link
            href="/billing"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-charcoal-600 hover:bg-gray-50 transition-colors`}
            title={isCollapsed ? 'Billing & Plans' : undefined}
          >
            <CreditCard size={18} className="text-charcoal-400" />
            {!isCollapsed && <span className="text-sm font-medium">Billing & Plans</span>}
          </Link>
          <Link
            href="/settings"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-colors ${
              pathname === '/settings'
                ? 'bg-coral-50 text-coral-600'
                : 'text-charcoal-600 hover:bg-gray-50'
            }`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings size={18} className={pathname === '/settings' ? 'text-coral-600' : 'text-charcoal-400'} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <a
            href="mailto:support@jupho.com"
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-charcoal-600 hover:bg-gray-50 transition-colors`}
            title={isCollapsed ? 'Help Center' : undefined}
          >
            <HelpCircle size={18} className="text-charcoal-400" />
            {!isCollapsed && <span className="text-sm font-medium">Help Center</span>}
          </a>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-charcoal-600 hover:bg-red-50 hover:text-red-600 transition-colors`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="text-charcoal-400" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar - Desktop only, hidden on mobile (bottom nav used instead) */}
      <aside className={`hidden lg:flex fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-base-surface border-r border-border-default flex-col z-40 transition-all duration-300`}>
        <SidebarContent />
      </aside>
    </>
  );
}
