'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface MobileTopBarProps {
  title?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

export default function MobileTopBar({ title, showBack, rightContent }: MobileTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auto-generate title from pathname if not provided
  const getTitle = () => {
    if (title) return title;
    
    const path = pathname.split('/')[1] || 'home';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          )}
          <h1 className="text-base font-bold text-gray-900 truncate">
            {getTitle()}
          </h1>
        </div>
        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
