import { AdminTripsPage } from '@/components/admin/admin-trips-page';
import { AdminLayout } from '@/components/admin/admin-layout';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function TripsPage() {
  return (
    <AdminLayout>
      <AdminTripsPage />
    </AdminLayout>
  );
}
