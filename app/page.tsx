import type { Metadata } from 'next';
import { SearchHero } from '@/components/search-hero';
import { HowItWorks } from '@/components/how-it-works';
import { TrustedPublishers } from '@/components/trusted-publishers';
import {
  StructuredData,
  organizationStructuredData,
  websiteStructuredData,
  serviceStructuredData,
} from '@/components/structured-data';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Find trusted rides and share journeys with Logeera. Connect with verified drivers, split costs, and travel sustainably.',
  openGraph: {
    title: 'Logeera - Find Trusted Rides',
    description:
      'Connect with verified drivers and travelers. Share rides, split costs, and travel sustainably.',
    url: '/',
  },
  twitter: {
    title: 'Logeera - Find Trusted Rides',
    description:
      'Connect with verified drivers and travelers. Share rides, split costs, and travel sustainably.',
  },
};

export default function HomePage() {
  return (
    <>
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={serviceStructuredData} />
      <div className="container mx-auto space-y-16 px-4 py-8">
        <SearchHero />
        <HowItWorks />
        <TrustedPublishers />
      </div>
    </>
  );
}
