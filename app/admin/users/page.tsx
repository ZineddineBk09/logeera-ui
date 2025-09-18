import { AdminUsersPage } from '@/components/admin/admin-users-page';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function UsersPage() {
  return (
    <AdminLayout>
      <AdminUsersPage />
    </AdminLayout>
  );
}
