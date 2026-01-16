'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setClerkTokenGetter } from '@/lib/api';

/**
 * ClerkTokenProvider - Connects Clerk auth to API client
 * Must be rendered inside ClerkProvider
 */
export function ClerkTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set the token getter for the API client
    setClerkTokenGetter(async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}
