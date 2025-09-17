import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createRequestSchema = z.object({
  tripId: z.string().uuid(),
});

async function createRequest(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { tripId } = createRequestSchema.parse(body);

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.publisherId === req.user!.userId) {
      return NextResponse.json({ error: 'Cannot request your own trip' }, { status: 400 });
    }

    // Check if trip is still available for booking
    if (trip.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Trip is no longer available for booking' }, { status: 400 });
    }

    // Check if there are available seats
    const availableSeats = trip.capacity - (trip.bookedSeats || 0);
    if (availableSeats <= 0) {
      return NextResponse.json({ error: 'No available seats' }, { status: 400 });
    }

    const existingRequest = await prisma.request.findFirst({
      where: { tripId, applicantId: req.user!.userId },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 409 });
    }

    const savedRequest = await prisma.request.create({
      data: {
        tripId,
        applicantId: req.user!.userId,
        status: 'PENDING',
      }
    });
    return NextResponse.json(savedRequest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = withAuth(createRequest);
