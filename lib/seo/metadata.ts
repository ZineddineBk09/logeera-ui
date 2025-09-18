import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://logeera.com';

export const defaultMetadata: Metadata = {
  title: {
    default: 'Logeera - Logistics Era | Trusted Rideshare',
    template: '%s | Logeera',
  },
  description:
    'Connect, Share, Travel - Your trusted rideshare platform. Find rides, share journeys, and travel sustainably with verified drivers.',
  keywords: [
    'rideshare Africa',
    'carpooling Africa',
    'travel Africa',
    'logistics Africa',
    'transportation Africa',
    'ride sharing',
    'trusted drivers',
    'sustainable travel',
    'journey sharing',
    'Logeera',
    'Lagos rideshare',
    'Cairo rideshare',
    'Nairobi rideshare',
    'Casablanca rideshare',
    'Accra rideshare',
  ],
  authors: [{ name: 'Logeera Team' }],
  creator: 'Logeera',
  publisher: 'Logeera',
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'Logeera - Logistics Era | Trusted Rideshare',
    description:
      'Connect, Share, Travel - Your trusted rideshare platform. Find rides, share journeys, and travel sustainably with verified drivers.',
    siteName: 'Logeera',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Logeera - Logistics Era',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logeera - Logistics Era | Trusted Rideshare',
    description: 'Connect, Share, Travel - Your trusted rideshare platform.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export function generatePageMetadata({
  title,
  description,
  path = '',
  keywords = [],
  noIndex = false,
  ogImage,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = `${baseUrl}${path}`;
  const image = ogImage || '/og-image.png';
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: [...(defaultMetadata.keywords as string[]), ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} - Logeera`,
      description,
      url,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title: `${title} - Logeera`,
      description,
      images: [fullImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
