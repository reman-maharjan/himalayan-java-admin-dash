"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = !!authService.getAuthToken();
      
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login...');
        // Store the current URL to redirect back after login
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== '/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Optionally show a loading state while checking auth
  if (!authService.getAuthToken()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function withAuth(Component: React.ComponentType) {
  return function WithAuth(props: any) {
    return (
      <RequireAuth>
        <Component {...props} />
      </RequireAuth>
    );
  };
}
