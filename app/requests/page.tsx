'use client';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

import { RequestsManagement } from '@/components/requests-management';
import { useRequireAuth } from '@/lib/hooks/use-auth';

export default function RequestsPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return <RequestsManagement />;
}
