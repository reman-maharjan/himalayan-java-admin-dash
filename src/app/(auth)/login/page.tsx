'use client';

import { LoginForm } from "@/components/auth/LoginForm"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = !!authService.getAuthToken();
      if (isAuthenticated) {
        // Redirect to the stored URL or default to /admin
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
