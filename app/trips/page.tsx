import type { Metadata } from 'next';
import { TripsResults } from '@/components/trips-results';

export const metadata: Metadata = {
  title: 'Browse Trips',
  description:
    'Discover available rides. Search by destination, date, and vehicle type. Book your next journey with trusted drivers on Logeera.',
  openGraph: {
    title: 'Browse Available Trips - Logeera',
    description:
      'Discover available rides. Search by destination, date, and vehicle type.',
    url: '/trips',
  },
  twitter: {
    title: 'Browse Available Trips - Logeera',
    description:
      'Discover available rides. Search by destination, date, and vehicle type.',
  },
};

export default function TripsPage() {
  return <TripsResults />;
}
