'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // On app load, try to populate client auth state from the server-side cookie.
  useEffect(() => {
    let mounted = true;
    authApi
      .getMe()
      .then((res) => {
        if (!mounted) return;
        if (res?.success && res.data) {
          try {
            useAuthStore.getState().setAuth(res.data, res.data.token ?? null);
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {
        // ignore failures silently (user not logged in)
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
