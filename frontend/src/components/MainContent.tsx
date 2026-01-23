'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Sync with sidebar collapse state from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    setIsCollapsed(collapsed);
    
    // Listen for storage changes
    const handleStorage = () => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsCollapsed(collapsed);
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sidebar-toggle', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebar-toggle', handleStorage);
    };
  }, []);
  
  // Public pages without sidebar
  const publicPages = ['/', '/sign-in', '/sign-up', '/privacy', '/terms', '/help'];
  const isPublicPage = publicPages.includes(pathname);
  
  // Calculate padding based on sidebar state
  const paddingClass = isPublicPage ? '' : isCollapsed ? 'lg:pl-20' : 'lg:pl-64';
  
  return (
    <main className={`w-full ${paddingClass} transition-all duration-300`}>
      {children}
    </main>
  );
}
