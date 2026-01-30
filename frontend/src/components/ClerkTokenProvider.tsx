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
    // Sync Clerk session AND fetch user data from backend (including correct plan)
    if (isSignedIn && user) {
      const clerkEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '';
      
      // Fetch full user data from backend to get correct plan from database
      getToken()
        .then((token) => {
          if (!token) throw new Error('No token available');
          return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        })
        .then((res) => {
          if (!res.ok) throw new Error(`Backend returned ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.success && data.data) {
            // ✅ Use backend data (has correct plan from database)
            useAuthStore.getState().setAuth(
              {
                id: data.data.id,
                email: data.data.email,
                name: data.data.name || null,
                plan: data.data.plan || 'FREE', // ✅ Real plan from database
                createdAt: data.data.createdAt || new Date().toISOString(),
              },
              null
            );
          } else {
            throw new Error('Invalid backend response');
          }
        })
        .catch((error) => {
          console.error('Failed to fetch user data from backend:', error);
          // Fallback to Clerk data with FREE as safe default
          useAuthStore.getState().setAuth(
            {
              id: user.id,
              email: clerkEmail,
              name: user.fullName || user.firstName || user.username || null,
              plan: 'FREE', // ✅ Safe default instead of hardcoded GROWTH
              createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
            },
            null
          );
        });
    } else {
      useAuthStore.getState().logout();
    }
  }, [isSignedIn, user, getToken]);

  return <>{children}</>;
}
