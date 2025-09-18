'use client';

import { PublishWizard } from '@/components/publish-wizard';
import { useRequireAuth } from '@/lib/hooks/use-auth';

export default function PublishPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return <PublishWizard />;
}
