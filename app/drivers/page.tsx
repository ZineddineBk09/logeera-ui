import type { Metadata } from 'next';
import { DriversListing } from '@/components/drivers-listing';

export const metadata: Metadata = {
  title: 'Trusted Drivers',
  description:
    'Browse verified drivers. View ratings, completed trips, and vehicle information. Connect with trusted drivers for your next journey.',
  openGraph: {
    title: 'Trusted Drivers - Logeera',
    description:
      'Browse verified drivers. View ratings, completed trips, and vehicle information.',
    url: '/drivers',
  },
  twitter: {
    title: 'Trusted Drivers - Logeera',
    description:
      'Browse verified drivers. View ratings, completed trips, and vehicle information.',
  },
};

export default function DriversPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DriversListing />
    </div>
  );
}
