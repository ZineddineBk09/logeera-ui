import { AdminAnalyticsPage } from '@/components/admin/admin-analytics-page';
import { AdminLayout } from '@/components/admin/admin-layout';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <AdminAnalyticsPage />
    </AdminLayout>
  );
}
