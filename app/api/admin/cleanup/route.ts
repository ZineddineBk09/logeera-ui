import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function cleanupExpiredRequests(req: AuthenticatedRequest) {
  try {
    // Only allow admins to run cleanup
    if (req.user!.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();

    // Find expired requests (requests for trips that have already departed)
    const expiredRequests = await prisma.request.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED'],
        },
        trip: {
          departureAt: {
            lt: now,
          },
        },
      },
      include: {
        trip: true,
      },
    });

    let deletedCount = 0;
    let updatedCount = 0;

    // Process expired requests
    for (const request of expiredRequests) {
      if (request.status === 'ACCEPTED') {
        // If accepted, mark as cancelled and free up the seat
        await prisma.$transaction(async (tx) => {
          await tx.request.update({
            where: { id: request.id },
            data: {
              status: 'CANCELLED',
              cancelledAt: now,
            },
          });

          await tx.trip.update({
            where: { id: request.tripId },
            data: {
              bookedSeats: {
                decrement: 1,
              },
            },
          });
        });
        updatedCount++;
      } else {
        // If pending, just delete the request
        await prisma.request.delete({
          where: { id: request.id },
        });
        deletedCount++;
      }
    }

    // Also clean up old completed/cancelled requests (older than 30 days)
    const oldRequests = await prisma.request.deleteMany({
      where: {
        status: {
          in: ['COMPLETED', 'CANCELLED', 'REJECTED'],
        },
        updatedAt: {
          lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    });

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      expiredRequests: {
        deleted: deletedCount,
        cancelled: updatedCount,
      },
      oldRequestsDeleted: oldRequests.count,
      totalProcessed: expiredRequests.length + oldRequests.count,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(cleanupExpiredRequests);
