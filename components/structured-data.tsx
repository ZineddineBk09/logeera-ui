import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization structured data for Logeera
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Logeera',
  alternateName: 'Logistics Era',
  description: 'Trusted rideshare platform connecting travelers',
  url: 'https://logeera.com',
  logo: 'https://logeera.com/logo.png',
  sameAs: [
    // Add social media URLs when available
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-XXX-XXX-XXXX', // Replace with actual number
    contactType: 'customer service',
    availableLanguage: ['English', 'French', 'Arabic'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'Africa',
    addressRegion: 'Multiple',
  },
  foundingDate: '2024',
  numberOfEmployees: '10-50',
  knowsAbout: [
    'Ridesharing',
    'Transportation',
    'Logistics',
    'Travel',
    'Carpooling',
  ],
};

// Website structured data
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Logeera',
  url: 'https://logeera.com',
  description: 'Trusted rideshare platform connecting travelers',
  publisher: {
    '@type': 'Organization',
    name: 'Logeera',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://logeera.com/trips?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// Service structured data
export const serviceStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Rideshare Service',
  description: 'Connect with trusted drivers and share rides',
  provider: {
    '@type': 'Organization',
    name: 'Logeera',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Africa',
  },
  category: 'Transportation',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Rideshare Options',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Shared Rides',
          description: 'Share rides with other passengers',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Private Rides',
          description: 'Book entire vehicle for private travel',
        },
      },
    ],
  },
};
