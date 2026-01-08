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
  Shield
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Hide sidebar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  
  if (isAuthPage) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isPro = user?.proExpiresAt && new Date(user.proExpiresAt) > new Date();

  // Check if user is admin (based on ADMIN_EMAILS env variable)
  const isAdmin = user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
    .map(email => email.trim().toLowerCase())
    .includes(user.email.toLowerCase());

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analyze', label: 'Analyze', icon: Zap },
    { href: '/templates', label: 'Saved Templates', icon: BookMarked },
    { href: '/history', label: 'History', icon: History },
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
      <div className="px-6 py-5 border-b border-border-default">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-signal-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-text-primary">Jupho</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
                active
                  ? 'bg-signal-primary/10 text-signal-primary font-medium'
                  : 'text-text-secondary hover:bg-base-elevated'
              }`}
            >
              <Icon size={20} className={active ? 'text-signal-primary' : 'text-text-tertiary'} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border-default p-4 space-y-2">
        {/* PRO Badge */}
        {isPro && (
          <Link
            href="/billing"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-signal-primary/10 border border-signal-primary/20 hover:border-signal-primary/30 transition-colors"
          >
            <Crown className="w-4 h-4 text-signal-primary" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-signal-primary">Jupho Pro</p>
              <p className="text-xs text-text-secondary">Unlimited access</p>
            </div>
          </Link>
        )}

        {/* User Info */}
        <div className="px-3 py-2 rounded-md bg-base-elevated">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-signal-primary/10 flex items-center justify-center">
              <User size={16} className="text-signal-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="space-y-1">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === '/settings'
                ? 'bg-base-elevated text-text-primary'
                : 'text-text-secondary hover:bg-base-elevated'
            }`}
          >
            <Settings size={18} className="text-text-tertiary" />
            <span className="text-sm">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-text-secondary hover:bg-signal-danger/10 hover:text-signal-danger transition-colors"
          >
            <LogOut size={18} className="text-text-tertiary" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar - Desktop only, hidden on mobile (bottom nav used instead) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-base-surface border-r border-border-default flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
