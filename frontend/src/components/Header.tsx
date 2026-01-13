'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Plus, History } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Jupho
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/agent"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isActive('/agent')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              <Plus className="w-5 h-5" />
              Create Ad
            </Link>
            <Link
              href="/agent/tasks"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isActive('/agent/tasks')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-purple-50'
              }`}
            >
              <History className="w-5 h-5" />
              History
            </Link>
          </nav>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-purple-100 px-4 py-2 flex gap-2">
        <Link
          href="/agent"
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
            isActive('/agent')
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-gray-700 bg-purple-50'
          }`}
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </Link>
        <Link
          href="/agent/tasks"
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
            isActive('/agent/tasks')
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-gray-700 bg-purple-50'
          }`}
        >
          <History className="w-4 h-4" />
          History
        </Link>
      </div>
    </header>
  );
}
