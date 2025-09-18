import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const getTrustedDriversSchema = z.object({
  limit: z.string().optional().default('6'),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const { limit } = getTrustedDriversSchema.parse({
      limit: searchParams.get('limit') || '6',
    });

    const limitNum = parseInt(limit);

    // Get users who have completed trips, ordered by rating and trip count
    const trustedDrivers = await prisma.user.findMany({
      where: {
        publishedTrips: {
          some: {
            status: 'COMPLETED',
          },
        },
        status: 'TRUSTED', // Only trusted users
        averageRating: {
          gte: 4.0, // Minimum rating of 4.0
        },
      },
      include: {
        publishedTrips: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
            originName: true,
            destinationName: true,
            vehicleType: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1, // Get the most recent completed trip for route info
        },
        _count: {
          select: {
            publishedTrips: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: [
        {
          averageRating: 'desc',
        },
        {
          ratingCount: 'desc',
        },
      ],
      take: limitNum,
    });

    // Transform the data for frontend consumption
    const formattedDrivers = trustedDrivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      rating: driver.averageRating,
      ratingCount: driver.ratingCount,
      completedTrips: driver._count.publishedTrips,
      recentRoute: driver.publishedTrips[0]
        ? `${driver.publishedTrips[0].originName} → ${driver.publishedTrips[0].destinationName}`
        : null,
      vehicleType: driver.publishedTrips[0]?.vehicleType || null,
      trusted: driver.status === 'TRUSTED',
      createdAt: driver.createdAt,
    }));

    return NextResponse.json({
      drivers: formattedDrivers,
      total: formattedDrivers.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Trusted drivers fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
