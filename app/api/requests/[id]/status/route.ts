import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { status } = updateStatusSchema.parse(body);
    const requestId = req.nextUrl.pathname.split('/')[3]; // Extract id from URL: /api/requests/[id]/status

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only the trip publisher can accept/reject requests
    if (request.trip.publisherId !== req.user!.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if trip is still available for booking
    if (request.trip.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Trip is no longer available for booking' },
        { status: 400 },
      );
    }

    // If accepting a request, check if there are available seats
    if (status === 'ACCEPTED') {
      const availableSeats =
        request.trip.capacity - (request.trip.bookedSeats || 0);
      if (availableSeats <= 0) {
        return NextResponse.json(
          { error: 'No available seats' },
          { status: 400 },
        );
      }

      // Update both request and trip in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update request status
        const updatedRequest = await tx.request.update({
          where: { id: requestId },
          data: { status },
          include: {
            trip: true,
            applicant: true,
          },
        });

        // Increment booked seats
        await tx.trip.update({
          where: { id: request.tripId },
          data: {
            bookedSeats: {
              increment: 1,
            },
          },
        });

        return updatedRequest;
      });

      return NextResponse.json(result);
    } else {
      // For rejection or other status changes, just update the request
      const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: { status },
        include: {
          trip: true,
          applicant: true,
        },
      });

      return NextResponse.json(updatedRequest);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const PATCH = withAuth(handler);
