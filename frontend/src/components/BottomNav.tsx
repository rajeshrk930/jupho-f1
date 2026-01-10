'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, History, BookTemplate, User, Shield, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Hide bottom nav on public pages (unauthenticated)
  const publicPages = ['/', '/login', '/signup', '/privacy', '/terms'];
  if (publicPages.includes(pathname)) {
    return null;
  }

  // Check if user is admin
  const isAdmin = user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
    .map(email => email.trim().toLowerCase())
    .includes(user.email.toLowerCase());

  const tabs = [
    { href: '/agent', label: 'Create Ad', icon: Sparkles },
    { href: '/dashboard', label: 'History', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Add admin tab for admin users
  if (isAdmin) {
    tabs.splice(2, 0, { href: '/admin', label: 'Admin', icon: Shield });
  }

  const gridCols = isAdmin ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb shadow-lg">
      <div className={`grid ${gridCols} h-16`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-coral-600'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
