import { AdminMessagesPage } from '@/components/admin/admin-messages-page';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function MessagesPage() {
  return (
    <AdminLayout>
      <AdminMessagesPage />
    </AdminLayout>
  );
}
