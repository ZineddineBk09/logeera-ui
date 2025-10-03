'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { ROUTES } from '@/constants';

interface AuthRedirectHandlerProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthRedirectHandler({
  children,
  redirectTo = ROUTES.DASHBOARD,
}: AuthRedirectHandlerProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if user is authenticated and not loading
    if (!isLoading && user) {
      console.log('User is already authenticated, redirecting to:', redirectTo);
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // If user is authenticated, don't render children (will redirect)
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // Render children if user is not authenticated
  return <>{children}</>;
}
