import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDashboardContent } from '@/components/admin/admin-dashboard-content';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}
