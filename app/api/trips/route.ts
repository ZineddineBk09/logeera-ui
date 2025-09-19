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
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate =
      searchParams.get('departureDate') || searchParams.get('date');
    const vehicleType = searchParams.get('vehicleType');
    const capacity = searchParams.get('capacity');
    const originLat = searchParams.get('originLat');
    const originLng = searchParams.get('originLng');
    const destinationLat = searchParams.get('destinationLat');
    const destinationLng = searchParams.get('destinationLng');
    const publisherId =
      searchParams.get('publisherId') || searchParams.get('driver');
    const searchMode = searchParams.get('searchMode') || 'browse';

    const where: any = {
      status: 'PUBLISHED',
    };

    // Filter by publisher/driver
    if (publisherId) {
      where.publisherId = publisherId;
    }

    // Enhanced text-based search
    if (q || origin || destination) {
      const searchTerms = [];
      if (q) searchTerms.push(q);
      if (origin) searchTerms.push(origin);
      if (destination) searchTerms.push(destination);

      const searchQuery = searchTerms.join(' ');

      where.OR = [
        { originName: { contains: searchQuery, mode: 'insensitive' } },
        { destinationName: { contains: searchQuery, mode: 'insensitive' } },
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

    // For coordinate-based search, we'll fetch all trips and then filter
    // This is more flexible than complex SQL queries
    if ((originLat && originLng) || (destinationLat && destinationLng)) {
      // Only filter for trips with valid geometry
      where.originGeom = { not: '' };
      where.destinationGeom = { not: '' };
    }

    // date is after today
    where.departureAt = {
      gte: new Date(),
    };

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

    // Enhanced geospatial filtering with distance scoring
    if ((originLat && originLng) || (destinationLat && destinationLng)) {
      const searchOrigin =
        originLat && originLng
          ? { lat: parseFloat(originLat), lng: parseFloat(originLng) }
          : null;
      const searchDestination =
        destinationLat && destinationLng
          ? { lat: parseFloat(destinationLat), lng: parseFloat(destinationLng) }
          : null;

      trips = trips
        .map((trip) => {
          const tripOrigin = parseWKTPoint(trip.originGeom);
          const tripDestination = parseWKTPoint(trip.destinationGeom);

          let originDistance = Infinity;
          let destinationDistance = Infinity;
          let relevanceScore = 0;

          // Calculate origin proximity
          if (searchOrigin && tripOrigin) {
            originDistance = calculateDistance(searchOrigin, tripOrigin);
          }

          // Calculate destination proximity
          if (searchDestination && tripDestination) {
            destinationDistance = calculateDistance(
              searchDestination,
              tripDestination,
            );
          }

          // Enhanced scoring logic for trip relevance
          if (searchOrigin && searchDestination) {
            // Both origin and destination specified
            const maxOriginDistance = 100; // km
            const maxDestinationDistance = 100; // km

            if (
              originDistance <= maxOriginDistance &&
              destinationDistance <= maxDestinationDistance
            ) {
              // Perfect match bonus if both are very close
              const originScore = Math.max(
                0,
                50 - (originDistance / maxOriginDistance) * 50,
              );
              const destinationScore = Math.max(
                0,
                50 - (destinationDistance / maxDestinationDistance) * 50,
              );
              relevanceScore = originScore + destinationScore;

              // Bonus for exact route matches
              if (originDistance <= 10 && destinationDistance <= 10) {
                relevanceScore += 20;
              }
            }
          } else if (searchOrigin) {
            // Only origin specified - find trips starting nearby
            const maxDistance = 200; // Increased radius for single-point search
            if (originDistance <= maxDistance) {
              relevanceScore = Math.max(
                0,
                100 - (originDistance / maxDistance) * 100,
              );

              // Bonus for very close origins
              if (originDistance <= 25) {
                relevanceScore += 20;
              }
            }
          } else if (searchDestination) {
            // Only destination specified - find trips going there
            const maxDistance = 200; // Increased radius for single-point search
            if (destinationDistance <= maxDistance) {
              relevanceScore = Math.max(
                0,
                100 - (destinationDistance / maxDistance) * 100,
              );

              // Bonus for very close destinations
              if (destinationDistance <= 25) {
                relevanceScore += 20;
              }
            }
          }

          return {
            ...trip,
            _relevanceScore: relevanceScore,
            _originDistance: originDistance,
            _destinationDistance: destinationDistance,
          };
        })
        .filter((trip) => trip._relevanceScore > 0)
        .sort((a, b) => b._relevanceScore - a._relevanceScore); // Sort by relevance

      // If no trips found with strict proximity, try a broader search
      if (trips.length === 0 && searchMode === 'proximity') {
        console.log(
          'No trips found with proximity search, trying broader search...',
        );

        // Fetch all trips and apply very broad distance filtering
        const allTrips = await prisma.trip.findMany({
          where: {
            status: 'PUBLISHED',
            originGeom: { not: '' },
            destinationGeom: { not: '' },
            departureAt: {
              gte: new Date(),
            }, // date is after today
          },
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

        // Apply very broad distance filtering (up to 500km)
        trips = allTrips
          .map((trip) => {
            const tripOrigin = parseWKTPoint(trip.originGeom);
            const tripDestination = parseWKTPoint(trip.destinationGeom);

            let originDistance = Infinity;
            let destinationDistance = Infinity;
            let relevanceScore = 0;

            if (searchOrigin && tripOrigin) {
              originDistance = calculateDistance(searchOrigin, tripOrigin);
            }

            if (searchDestination && tripDestination) {
              destinationDistance = calculateDistance(
                searchDestination,
                tripDestination,
              );
            }

            // Broader matching criteria
            if (searchOrigin && searchDestination) {
              if (originDistance <= 300 && destinationDistance <= 300) {
                relevanceScore =
                  Math.max(0, 50 - originDistance / 10) +
                  Math.max(0, 50 - destinationDistance / 10);
              }
            } else if (searchOrigin && originDistance <= 500) {
              relevanceScore = Math.max(0, 100 - originDistance / 5);
            } else if (searchDestination && destinationDistance <= 500) {
              relevanceScore = Math.max(0, 100 - destinationDistance / 5);
            }

            return {
              ...trip,
              _relevanceScore: relevanceScore,
              _originDistance: originDistance,
              _destinationDistance: destinationDistance,
              _isBroadSearch: true,
            };
          })
          .filter((trip) => trip._relevanceScore > 0)
          .sort((a, b) => b._relevanceScore - a._relevanceScore)
          .slice(0, 20); // Limit results for broad search
      }
    }

    // Add search metadata to help frontend understand the results
    const searchMetadata = {
      searchMode,
      hasCoordinates:
        !!(originLat && originLng) || !!(destinationLat && destinationLng),
      hasDate: !!departureDate,
      isBroadSearch: trips.some((trip: any) => trip._isBroadSearch),
      totalResults: trips.length,
    };

    return NextResponse.json({
      trips,
      metadata: searchMetadata,
    });
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
