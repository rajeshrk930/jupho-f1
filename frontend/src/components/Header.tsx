'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Plus, History, Folder } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  const handleCreateAd = () => {
    localStorage.removeItem('agent_flow_state');
    window.location.href = '/agent';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-coral-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-coral-600">
              Jupho
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={handleCreateAd}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isActive('/agent')
                  ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-coral-50'
              }`}
            >
              <Plus className="w-5 h-5" />
              Create Ad
            </button>
            <Link
              href="/projects"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isActive('/projects')
                  ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-coral-50'
              }`}
            >
              <Folder className="w-5 h-5" />
              Projects
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-coral-50'
              }`}
            >
              <History className="w-5 h-5" />
              Dashboard
            </Link>
          </nav>

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-coral-100 px-4 py-2 flex gap-2">
        <button
          onClick={handleCreateAd}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
            isActive('/agent')
              ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
              : 'text-gray-700 bg-coral-50'
          }`}
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </button>
        <Link
          href="/projects"
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
            isActive('/projects')
              ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
              : 'text-gray-700 bg-coral-50'
          }`}
        >
          <Folder className="w-4 h-4" />
          Projects
        </Link>
        <Link
          href="/dashboard"
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
            isActive('/dashboard')
              ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white shadow-lg'
              : 'text-gray-700 bg-coral-50'
          }`}
        >
          <History className="w-4 h-4" />
          Dashboard
        </Link>
      </div>
    </header>
  );
}
