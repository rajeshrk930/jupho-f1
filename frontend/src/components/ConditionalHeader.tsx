'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header on landing page, auth pages, and public pages
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  const isPublicPage = pathname === '/privacy' || pathname === '/terms' || pathname === '/help';
  
  if (isLandingPage || isAuthPage || isPublicPage) {
    return null;
  }
  
  return <Header />;
}
