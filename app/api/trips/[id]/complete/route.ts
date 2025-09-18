import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function handler(req: AuthenticatedRequest) {
  try {
    const tripId = req.nextUrl.pathname.split('/')[3]; // Extract id from URL: /api/trips/[id]/complete

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Only the publisher can complete their trip
    if (trip.publisherId !== req.user!.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { status: 'COMPLETED' },
      include: {
        publisher: true,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const PATCH = withAuth(handler);
