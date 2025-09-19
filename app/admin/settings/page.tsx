import { AdminSettingsPage } from '@/components/admin/admin-settings-page';
import { AdminLayout } from '@/components/admin/admin-layout';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <AdminSettingsPage />
    </AdminLayout>
  );
}
