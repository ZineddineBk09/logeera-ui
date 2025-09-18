import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

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
