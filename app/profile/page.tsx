'use client';

import { UserProfile } from '@/components/user-profile';
import { useRequireAuth } from '@/lib/hooks/use-auth';

export default function ProfilePage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return <UserProfile />;
}
