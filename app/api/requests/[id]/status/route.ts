import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
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

    // Handle different status updates
    if (status === 'ACCEPTED') {
      const availableSeats =
        request.trip.capacity - (request.trip.bookedSeats || 0);
      if (availableSeats <= 0) {
        return NextResponse.json(
          { error: 'No available seats' },
          { status: 400 },
        );
      }

      // Update both request and trip in a transaction with increased timeout
      const result = await prisma.$transaction(async (tx) => {
        // Update request status with acceptedAt timestamp
        const updatedRequest = await tx.request.update({
          where: { id: requestId },
          data: { 
            status,
            acceptedAt: new Date(),
          },
          include: {
            trip: true,
            applicant: true,
          },
        });

        // Increment booked seats
        const updatedTrip = await tx.trip.update({
          where: { id: request.tripId },
          data: {
            bookedSeats: {
              increment: 1,
            },
          },
        });

        // Check if trip is now at full capacity
        if (updatedTrip.bookedSeats >= updatedTrip.capacity) {
          // Cancel all remaining pending requests for this trip
          await tx.request.updateMany({
            where: {
              tripId: request.tripId,
              status: 'PENDING',
              id: {
                not: requestId, // Don't cancel the one we just accepted
              },
            },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
            },
          });
        }

        return updatedRequest;
      }, {
        timeout: 10000, // Increase timeout to 10 seconds
      });

      return NextResponse.json(result);
    } else if (status === 'IN_TRANSIT') {
      // Only allow IN_TRANSIT if current status is ACCEPTED
      if (request.status !== 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Request must be accepted before marking as in transit' },
          { status: 400 },
        );
      }

      const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: { 
          status,
          receivedAt: new Date(),
        },
        include: {
          trip: true,
          applicant: true,
        },
      });

      return NextResponse.json(updatedRequest);
    } else if (status === 'DELIVERED') {
      // Only allow DELIVERED if current status is IN_TRANSIT
      if (request.status !== 'IN_TRANSIT') {
        return NextResponse.json(
          { error: 'Request must be in transit before marking as delivered' },
          { status: 400 },
        );
      }

      const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: { 
          status,
          deliveredAt: new Date(),
        },
        include: {
          trip: true,
          applicant: true,
        },
      });

      return NextResponse.json(updatedRequest);
    } else if (status === 'COMPLETED') {
      // Only allow COMPLETED if current status is DELIVERED
      if (request.status !== 'DELIVERED') {
        return NextResponse.json(
          { error: 'Request must be delivered before marking as completed' },
          { status: 400 },
        );
      }

      const updatedRequest = await prisma.request.update({
        where: { id: requestId },
        data: { status },
        include: {
          trip: true,
          applicant: true,
        },
      });

      return NextResponse.json(updatedRequest);
    } else if (status === 'CANCELLED') {
      // Allow cancellation from any status except COMPLETED
      if (request.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Cannot cancel a completed request' },
          { status: 400 },
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.request.update({
          where: { id: requestId },
          data: { 
            status,
            cancelledAt: new Date(),
          },
          include: {
            trip: true,
            applicant: true,
          },
        });

        // If the request was accepted, decrement booked seats
        if (request.status === 'ACCEPTED') {
          await tx.trip.update({
            where: { id: request.tripId },
            data: {
              bookedSeats: {
                decrement: 1,
              },
            },
          });
        }

        return updatedRequest;
      }, {
        timeout: 10000, // Increase timeout to 10 seconds
      });

      return NextResponse.json(result);
    } else {
      // For PENDING, REJECTED, or other status changes, just update the request
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
