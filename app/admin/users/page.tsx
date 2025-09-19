import { AdminUsersPage } from '@/components/admin/admin-users-page';
import { AdminLayout } from '@/components/admin/admin-layout';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <AdminLayout>
      <AdminUsersPage />
    </AdminLayout>
  );
}
