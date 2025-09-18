import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 2]; // Get ID from /api/users/[id]/public

    // Get user details (public information only)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        type: true,
        status: true,
        averageRating: true,
        ratingCount: true,
        createdAt: true,
        // Don't expose email, phoneNumber, or other sensitive info
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only show public info for non-trusted users
    if (user.status === 'BLOCKED') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's published trips (only published ones)
    const trips = await prisma.trip.findMany({
      where: {
        publisherId: userId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        originName: true,
        destinationName: true,
        departureAt: true,
        capacity: true,
        bookedSeats: true,
        vehicleType: true,
        pricePerSeat: true,
        status: true,
      },
      orderBy: { departureAt: 'asc' },
    });

    // Get user's received ratings (public reviews)
    const ratings = await prisma.rating.findMany({
      where: { ratedUserId: userId },
      include: {
        reviewerUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      user,
      trips,
      ratings,
    });
  } catch (error) {
    console.error('Error fetching public user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
