import { MetadataRoute } from 'next';
import { prisma } from '@/lib/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://logeera.com';

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/trips`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/drivers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Dynamic routes - Active trips
    const trips = await prisma.trip.findMany({
      where: {
        status: 'PUBLISHED',
        departureAt: {
          gte: new Date(), // Only future trips
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent large sitemaps
      orderBy: {
        departureAt: 'asc',
      },
    });

    const tripRoutes = trips.map((trip) => ({
      url: `${baseUrl}/trips/${trip.id}`,
      lastModified: trip.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // Dynamic routes - Trusted drivers
    const drivers = await prisma.user.findMany({
      where: {
        status: 'TRUSTED',
        publishedTrips: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 500, // Limit to prevent large sitemaps
      orderBy: {
        averageRating: 'desc',
      },
    });

    const driverRoutes = drivers.map((driver) => ({
      url: `${baseUrl}/drivers/${driver.id}`,
      lastModified: driver.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...tripRoutes, ...driverRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes only if database query fails
    return staticRoutes;
  }
}
