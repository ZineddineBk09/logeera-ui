import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDashboardContent } from '@/components/admin/admin-dashboard-content';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboardContent />
    </AdminLayout>
  );
}
