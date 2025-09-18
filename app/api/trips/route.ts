import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { validateWKT } from '@/lib/geospatial';
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

// Function to calculate distance between two points using Haversine formula
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number },
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

const createTripSchema = z.object({
  origin: z.string(), // WKT format: "POINT(lon lat)"
  destination: z.string(), // WKT format: "POINT(lon lat)"
  originName: z.string(),
  destinationName: z.string(),
  departureAt: z.string().datetime(),
  vehicleType: z.enum(['CAR', 'VAN', 'TRUCK', 'BIKE']),
  capacity: z.number().int().positive(),
  pricePerSeat: z.number().positive(),
});

async function createTrip(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const data = createTripSchema.parse(body);

    // Validate WKT format for geospatial data
    if (!validateWKT(data.origin)) {
      return NextResponse.json(
        { error: 'Invalid origin coordinates format' },
        { status: 400 },
      );
    }
    if (!validateWKT(data.destination)) {
      return NextResponse.json(
        { error: 'Invalid destination coordinates format' },
        { status: 400 },
      );
    }

    const savedTrip = await prisma.trip.create({
      data: {
        publisherId: req.user!.userId,
        originGeom: data.origin,
        destinationGeom: data.destination,
        originName: data.originName,
        destinationName: data.destinationName,
        departureAt: new Date(data.departureAt),
        vehicleType: data.vehicleType,
        capacity: data.capacity,
        pricePerSeat: data.pricePerSeat,
      },
    });
    return NextResponse.json(savedTrip, { status: 201 });
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

async function getTrips(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const departureDate = searchParams.get('departureDate');
    const vehicleType = searchParams.get('vehicleType');
    const capacity = searchParams.get('capacity');
    const originLat = searchParams.get('originLat');
    const originLng = searchParams.get('originLng');
    const destinationLat = searchParams.get('destinationLat');
    const destinationLng = searchParams.get('destinationLng');
    const publisherId =
      searchParams.get('publisherId') || searchParams.get('driver');

    const where: any = {
      status: 'PUBLISHED',
    };

    // Filter by publisher/driver
    if (publisherId) {
      where.publisherId = publisherId;
    }

    // Text-based search
    if (q) {
      where.OR = [
        { originName: { contains: q, mode: 'insensitive' } },
        { destinationName: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Date filter
    if (departureDate) {
      const startDate = new Date(departureDate);
      const endDate = new Date(departureDate);
      endDate.setDate(endDate.getDate() + 1);
      where.departureAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Vehicle type filter
    if (vehicleType && ['CAR', 'VAN', 'TRUCK', 'BIKE'].includes(vehicleType)) {
      where.vehicleType = vehicleType;
    }

    // Capacity filter
    if (capacity && !isNaN(Number(capacity))) {
      where.capacity = {
        gte: Number(capacity),
      };
    }

    // Coordinate-based search using PostGIS
    if (originLat && originLng) {
      const originPoint = `POINT(${originLng} ${originLat})`;
      // Find trips with valid origin geometry (non-empty string)
      where.originGeom = {
        not: '',
      };
    }

    if (destinationLat && destinationLng) {
      const destinationPoint = `POINT(${destinationLng} ${destinationLat})`;
      // Find trips with valid destination geometry (non-empty string)
      where.destinationGeom = {
        not: '',
      };
    }

    let trips = await prisma.trip.findMany({
      where,
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
            averageRating: true,
            ratingCount: true,
          },
        },
      },
      orderBy: {
        departureAt: 'asc',
      },
    });

    // Post-process for geospatial filtering if coordinates are provided
    if ((originLat && originLng) || (destinationLat && destinationLng)) {
      trips = trips.filter((trip) => {
        let matchesOrigin = true;
        let matchesDestination = true;

        if (originLat && originLng && trip.originGeom) {
          // Parse the WKT POINT and calculate distance using Haversine formula
          const tripOrigin = parseWKTPoint(trip.originGeom);
          if (tripOrigin) {
            const distance = calculateDistance(
              { lat: parseFloat(originLat), lng: parseFloat(originLng) },
              tripOrigin,
            );
            // Match if within 50km radius
            matchesOrigin = distance <= 50;
          }
        }

        if (destinationLat && destinationLng && trip.destinationGeom) {
          // Parse the WKT POINT and calculate distance using Haversine formula
          const tripDestination = parseWKTPoint(trip.destinationGeom);
          if (tripDestination) {
            const distance = calculateDistance(
              {
                lat: parseFloat(destinationLat),
                lng: parseFloat(destinationLng),
              },
              tripDestination,
            );
            // Match if within 50km radius
            matchesDestination = distance <= 50;
          }
        }

        return matchesOrigin && matchesDestination;
      });
    }

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(createTrip);
export const GET = getTrips;
