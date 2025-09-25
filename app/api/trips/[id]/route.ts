import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Function to parse WKT POINT format and extract coordinates
function parseWKTPoint(wkt: string): { lat: number; lng: number } | null {
  if (!wkt) return null;

  // Match POINT(longitude latitude) format
  const match = wkt.match(/POINT\(([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\)/);
  if (match) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return { lat, lng };
  }
  return null;
}

const updateTripSchema = z.object({
  status: z.enum(['PUBLISHED', 'COMPLETED', 'CANCELLED']),
});

async function updateTrip(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { status } = updateTripSchema.parse(body);
    const tripId = req.nextUrl.pathname.split('/')[3];

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        requests: {
          where: {
            status: {
              in: ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED']
            }
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Only the trip publisher can update the trip
    if (trip.publisherId !== req.user!.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status === 'CANCELLED') {
      // Cancel all active requests and update trip status
      const result = await prisma.$transaction(async (tx) => {
        // Cancel all active requests
        await tx.request.updateMany({
          where: {
            tripId: tripId,
            status: {
              in: ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED']
            }
          },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date()
          }
        });

        // Update trip status
        const updatedTrip = await tx.trip.update({
          where: { id: tripId },
          data: { status: 'CANCELLED' }
        });

        return updatedTrip;
      });

      return NextResponse.json(result);
    } else {
      // For other status updates
      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: { status }
      });

      return NextResponse.json(updatedTrip);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tripId = req.nextUrl.pathname.split('/')[3];

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            averageRating: true,
            ratingCount: true,
          },
        },
        requests: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Parse WKT coordinates
    const originCoords = parseWKTPoint(trip.originGeom);
    const destinationCoords = parseWKTPoint(trip.destinationGeom);

    // Calculate request counts
    const acceptedRequests = trip.requests.filter(
      (r) => r.status === 'ACCEPTED',
    ).length;
    const pendingRequests = trip.requests.filter(
      (r) => r.status === 'PENDING',
    ).length;

    // Add parsed coordinates and request data to the response
    const tripWithCoords = {
      ...trip,
      originCoordinates: originCoords,
      destinationCoordinates: destinationCoords,
      acceptedRequests,
      pendingRequests,
    };

    return NextResponse.json(tripWithCoords);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const PATCH = withAuth(updateTrip);
