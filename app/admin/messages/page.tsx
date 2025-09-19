import { AdminMessagesPage } from '@/components/admin/admin-messages-page';
import { AdminLayout } from '@/components/admin/admin-layout';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <AdminLayout>
      <AdminMessagesPage />
    </AdminLayout>
  );
}
