'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  const AUTH_FREE_PATHS = ['/login', '/signup', '/', '/privacy', '/help'];
  
  if (AUTH_FREE_PATHS.includes(pathname)) {
    return null;
  }
  
  return <Header />;
}
