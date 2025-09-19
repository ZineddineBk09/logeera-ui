import { AdminRequestsPage } from '@/components/admin/admin-requests-page';
import { AdminLayout } from '@/components/admin/admin-layout';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function RequestsPage() {
  return (
    <AdminLayout>
      <AdminRequestsPage />
    </AdminLayout>
  );
}
