'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setClerkTokenGetter } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

/**
 * ClerkTokenProvider - Connects Clerk auth to API client
 * Must be rendered inside ClerkProvider
 */
export function ClerkTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();

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

  useEffect(() => {
    // Sync Clerk session into the legacy auth store so pages using useAuthStore stay logged-in
    if (isSignedIn && user) {
      useAuthStore.getState().setAuth(
        {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName || user.firstName || user.username || null,
          plan: 'GROWTH',
          createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
        },
        null
      );
    } else {
      useAuthStore.getState().logout();
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}
