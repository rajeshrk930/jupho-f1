'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, History, BookTemplate, User, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Check if user is admin
  const isAdmin = user?.email && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',')
    .map(email => email.trim().toLowerCase())
    .includes(user.email.toLowerCase());

  const tabs = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analyze', label: 'Analyze', icon: FileText },
    { href: '/history', label: 'History', icon: History },
    { href: '/templates', label: 'Templates', icon: BookTemplate },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Add admin tab for admin users
  if (isAdmin) {
    tabs.splice(4, 0, { href: '/admin', label: 'Admin', icon: Shield });
  }

  const gridCols = isAdmin ? 'grid-cols-6' : 'grid-cols-5';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-surface border-t border-border-default z-50 safe-area-pb">
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
                  ? 'text-signal-primary'
                  : 'text-text-secondary hover:text-text-primary'
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
