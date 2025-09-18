import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const getDriversSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  search: z.string().optional(),
  minRating: z.string().optional(),
  vehicleType: z.enum(['CAR', 'VAN', 'TRUCK', 'BIKE']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const { page, limit, search, minRating, vehicleType } =
      getDriversSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '12',
        search: searchParams.get('search') || undefined,
        minRating: searchParams.get('minRating') || undefined,
        vehicleType: searchParams.get('vehicleType') || undefined,
      });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      publishedTrips: {
        some: {
          status: 'COMPLETED',
        },
      },
      status: {
        in: ['TRUSTED', 'PENDING'], // Include both trusted and pending users
      },
    };

    if (search) {
      where.OR = [
        {
          name: { contains: search, mode: 'insensitive' },
        },
        {
          email: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    if (minRating) {
      where.averageRating = { gte: parseFloat(minRating) };
    }

    if (vehicleType) {
      where.publishedTrips.some.vehicleType = vehicleType;
    }

    // Get drivers with pagination
    const [drivers, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 3, // Get up to 3 recent trips for variety
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
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Transform the data for frontend consumption
    const formattedDrivers = drivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      type: driver.type,
      rating: driver.averageRating,
      ratingCount: driver.ratingCount,
      completedTrips: driver._count.publishedTrips,
      recentRoutes: driver.publishedTrips.map(
        (trip) => `${trip.originName} → ${trip.destinationName}`,
      ),
      vehicleTypes: [
        ...new Set(driver.publishedTrips.map((trip) => trip.vehicleType)),
      ],
      trusted: driver.status === 'TRUSTED',
      createdAt: driver.createdAt,
    }));

    return NextResponse.json({
      drivers: formattedDrivers,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Drivers fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
