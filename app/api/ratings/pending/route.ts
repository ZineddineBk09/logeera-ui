import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function getPendingRatings(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;

    // Get completed trips where user was a passenger and hasn't rated yet
    const completedTripsAsPassenger = await prisma.trip.findMany({
      where: {
        status: 'COMPLETED',
        departureAt: {
          lt: new Date(), // Trip date has passed
        },
        requests: {
          some: {
            applicantId: userId,
            status: 'ACCEPTED',
          },
        },
        NOT: {
          ratings: {
            some: {
              reviewerUserId: userId,
            },
          },
        },
      },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            averageRating: true,
            ratingCount: true,
          },
        },
        requests: {
          where: {
            applicantId: userId,
            status: 'ACCEPTED',
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        departureAt: 'desc',
      },
    });

    return NextResponse.json(
      completedTripsAsPassenger.map((trip) => ({
        id: trip.id,
        originName: trip.originName,
        destinationName: trip.destinationName,
        departureAt: trip.departureAt,
        vehicleType: trip.vehicleType,
        pricePerSeat: trip.pricePerSeat,
        publisher: trip.publisher,
        canRate: true,
      }))
    );
  } catch (error) {
    console.error('Error fetching pending ratings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(getPendingRatings);
