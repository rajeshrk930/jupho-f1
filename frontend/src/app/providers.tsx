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

  // On app load, check localStorage for token and validate with /auth/me
  useEffect(() => {
    let mounted = true;
    
    // Check if token exists in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      return; // No token, user not authenticated
    }
    
    // Validate token with backend
    authApi.getMe()
      .then((res) => {
        if (!mounted) return;
        if (res?.success && res.data) {
          useAuthStore.getState().setAuth(res.data, token);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
      
    return () => { mounted = false; };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
