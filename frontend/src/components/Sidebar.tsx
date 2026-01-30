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
  FileText,
  Target,
  Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useClerk } from '@clerk/nextjs';
import DisconnectConfirmationModal from './DisconnectConfirmationModal';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { signOut } = useClerk();
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [adAccountName, setAdAccountName] = useState<string>('');
  const [connecting, setConnecting] = useState(false);
  // Read collapsed state immediately from localStorage to prevent flash
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [metaBoxExpanded, setMetaBoxExpanded] = useState(false);
  const [loadingMetaStatus, setLoadingMetaStatus] = useState(true);

  // No longer need useEffect for initial collapsed state since we read it immediately

  // Check Facebook connection status
  useEffect(() => {
    const checkFacebookStatus = async () => {
      try {
        setLoadingMetaStatus(true);
        const response = await api.get('/facebook/status');
        setFacebookConnected(response.data.connected || false);
        if (response.data.connected && response.data.account?.adAccountName) {
          setAdAccountName(response.data.account.adAccountName);
        }
      } catch (error: any) {
        // Silently handle auth errors (user not logged in yet or session expired)
        if (error.response?.status === 401) {
          console.log('User not authenticated - skipping Facebook status check');
        } else {
          console.error('Failed to check Facebook status:', error);
        }
        setFacebookConnected(false);
        setAdAccountName('');
      } finally {
        setLoadingMetaStatus(false);
      }
    };
    
    // Only check if user exists (avoid calling API before Clerk initializes)
    if (user) {
      checkFacebookStatus();
    }
  }, [user]);

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
    // Check if user has GROWTH plan
    const plan = user?.plan || 'FREE';
    if (plan !== 'GROWTH') {
      // Show upgrade modal or alert for locked feature
      alert('🔒 AI Agent is available only on GROWTH plan. Upgrade to unlock AI-powered ad creation!');
      return;
    }
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
      setShowDisconnectModal(false);
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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent', label: 'AI Agent', icon: Sparkles, onClick: handleCreateAd },
    { href: '/templates', label: 'Templates', icon: BookMarked },
    { href: '/agent/tasks', label: 'Campaigns', icon: Target },
    { href: '/recent-ads', label: 'Recent Ads', icon: History },
  ];

  // Add admin link for admin users
  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/agent') return pathname === '/agent'; // Exact match for agent page only
    if (href === '/agent/tasks') return pathname.startsWith('/agent/tasks');
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black text-purple-600">
              Jupho
            </span>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="px-3 py-2">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-purple-600"
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
          const plan = user?.plan || 'FREE';
          const isAiAgentLocked = item.href === '/agent' && plan !== 'GROWTH';
          
          if (item.onClick) {
            return (
              <button
                key={item.href}
                onClick={item.onClick}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-md transition-all ${
                  active
                    ? 'bg-purple-50 text-purple-600 font-medium'
                    : isAiAgentLocked
                    ? 'text-gray-400 hover:bg-gray-50 cursor-pointer'
                    : 'text-charcoal-600 hover:bg-gray-50'
                }`}
                title={isCollapsed ? (isAiAgentLocked ? `${item.label} (GROWTH only)` : item.label) : undefined}
              >
                <Icon size={20} className={active ? 'text-purple-600' : isAiAgentLocked ? 'text-gray-400' : 'text-charcoal-400'} />
                {!isCollapsed && (
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm">{item.label}</span>
                    {item.href === '/agent' && !isAiAgentLocked && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                        AI
                      </span>
                    )}
                    {isAiAgentLocked && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Lock size={14} className="text-gray-400" />
                        <span className="text-[10px] font-medium text-gray-500">GROWTH</span>
                      </div>
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
                  ? 'bg-purple-50 text-purple-600 font-medium'
                  : 'text-charcoal-600 hover:bg-gray-50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className={active ? 'text-purple-600' : 'text-charcoal-400'} />
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

        {/* Meta Connection Status - Collapsible */}
        {!isCollapsed && (
          loadingMetaStatus ? (
            // Skeleton placeholder to prevent layout shift
            <div className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gray-300"></div>
                <div className="flex-1">
                  <div className="h-3 w-16 bg-gray-300 rounded mb-1"></div>
                  <div className="h-2 w-20 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
            {/* Compact Header */}
            <button
              onClick={() => setMetaBoxExpanded(!metaBoxExpanded)}
              className="w-full flex items-center justify-between hover:bg-gray-100 rounded px-1 py-1 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  facebookConnected 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  <Facebook className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-700">Meta Ads</p>
                  {facebookConnected ? (
                    <p className="text-[10px] text-green-600 font-medium">✓ Connected</p>
                  ) : (
                    <p className="text-[10px] text-gray-400">Not connected</p>
                  )}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                metaBoxExpanded ? 'rotate-90' : ''
              }`} />
            </button>

            {/* Expanded Details */}
            {metaBoxExpanded && (
              <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                {facebookConnected ? (
                  <>
                    {adAccountName && (
                      <p className="text-xs text-gray-600 truncate px-1" title={adAccountName}>
                        {adAccountName}
                      </p>
                    )}
                    <button
                      onClick={() => setShowDisconnectModal(true)}
                      disabled={connecting}
                      className="w-full px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectMeta}
                    disabled={connecting}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-md bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-60 transition-colors"
                  >
                    {connecting ? 'Connecting...' : 'Connect Meta'}
                  </button>
                )}
              </div>
            )}
          </div>
          )
        )}

        {/* Action Buttons */}
        <div className="space-y-1">
          {facebookConnected && (
            <Link
              href="/forms"
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg transition-colors ${
                pathname === '/forms'
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-charcoal-600 hover:bg-gray-50'
              }`}
              title={isCollapsed ? 'Lead Forms' : undefined}
            >
              <FileText size={18} className={pathname === '/forms' ? 'text-purple-600' : 'text-charcoal-400'} />
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
                ? 'bg-purple-50 text-purple-600'
                : 'text-charcoal-600 hover:bg-gray-50'
            }`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings size={18} className={pathname === '/settings' ? 'text-purple-600' : 'text-charcoal-400'} />
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

      {/* Disconnect Confirmation Modal */}
      <DisconnectConfirmationModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleDisconnectMeta}
        accountName={adAccountName}
        isLoading={connecting}
      />
    </>
  );
}
