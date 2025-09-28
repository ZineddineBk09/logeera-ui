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
  payloadType: z.enum(['PARCEL', 'PASSENGER']).default('PARCEL'),
  capacity: z.number().int().positive(),
  pricePerSeat: z.number().positive(),
  parcelWeight: z.number().positive().optional(),
  passengerCount: z.number().int().positive().optional(),
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
        payloadType: data.payloadType,
        capacity: data.capacity,
        pricePerSeat: data.pricePerSeat,
        parcelWeight: data.parcelWeight,
        passengerCount: data.passengerCount,
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

    // Try to get user info from auth token (optional)
    let currentUserId: string | null = null;
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { verifyAccessToken } = await import('@/lib/auth/jwt');
        const user = await verifyAccessToken(token);
        currentUserId = user.userId;
      }
    } catch (error) {
      // User not authenticated or invalid token - continue without user context
      console.log('No valid auth token, proceeding without user context');
    }

    // Progressive search strategy to ensure no empty results
    const searchStrategy = {
      hasCoordinates:
        !!(originLat && originLng) || !!(destinationLat && destinationLng),
      hasTextSearch: !!(q || origin || destination),
      hasFilters: !!(departureDate || vehicleType || capacity),
    };

    const where: any = {
      status: {
        in: ['PUBLISHED'], // Only show published trips, exclude completed/cancelled
      },
      departureAt: {
        gte: new Date(), // Only future trips
      },
    };

    // Filter by publisher/driver
    if (publisherId) {
      where.publisherId = publisherId;
    } else if (currentUserId) {
      // Exclude user's own trips from search results (unless specifically viewing their trips)
      where.publisherId = {
        not: currentUserId,
      };
    }

    // Enhanced text-based search with fuzzy matching
    // Only apply text search if we don't have coordinates (coordinate search takes priority)
    if (searchStrategy.hasTextSearch && !searchStrategy.hasCoordinates) {
      const searchTerms = [];
      if (q) searchTerms.push(q);
      if (origin) searchTerms.push(origin);
      if (destination) searchTerms.push(destination);

      const searchQuery = searchTerms.join(' ');

      where.OR = [
        { originName: { contains: searchQuery, mode: 'insensitive' } },
        { destinationName: { contains: searchQuery, mode: 'insensitive' } },
        // Add partial matching for better results
        ...searchTerms.map((term) => ({
          originName: { contains: term, mode: 'insensitive' },
        })),
        ...searchTerms.map((term) => ({
          destinationName: { contains: term, mode: 'insensitive' },
        })),
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
    } else {
      // Default to future trips
      where.departureAt = {
        gte: new Date(),
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

    // For coordinate-based search, ensure we have valid geometry
    if (searchStrategy.hasCoordinates) {
      where.originGeom = { not: '' };
      where.destinationGeom = { not: '' };
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

    // Progressive geospatial search algorithm to ensure no empty results
    if (searchStrategy.hasCoordinates) {
      const searchOrigin =
        originLat && originLng
          ? { lat: parseFloat(originLat), lng: parseFloat(originLng) }
          : null;
      const searchDestination =
        destinationLat && destinationLng
          ? { lat: parseFloat(destinationLat), lng: parseFloat(destinationLng) }
          : null;

      // Progressive search with multiple radius levels
      const searchLevels = [
        { name: 'exact', originRadius: 10, destRadius: 10, weight: 100 },
        { name: 'close', originRadius: 25, destRadius: 25, weight: 80 },
        { name: 'nearby', originRadius: 50, destRadius: 50, weight: 60 },
        { name: 'regional', originRadius: 100, destRadius: 100, weight: 40 },
        { name: 'broad', originRadius: 200, destRadius: 200, weight: 20 },
        { name: 'extended', originRadius: 500, destRadius: 500, weight: 10 },
      ];

      let bestMatches: any[] = [];
      let searchMetadata = {
        searchMode: 'proximity',
        searchLevel: 'exact',
        isBroadSearch: false,
        totalResults: 0,
      };

      // Try each search level until we find results
      for (const level of searchLevels) {
        const levelMatches = trips
          .map((trip) => {
            const tripOrigin = parseWKTPoint(trip.originGeom);
            const tripDestination = parseWKTPoint(trip.destinationGeom);

            let originDistance = Infinity;
            let destinationDistance = Infinity;
            let relevanceScore = 0;
            let matchQuality = 'none';

            // Calculate distances
            if (searchOrigin && tripOrigin) {
              originDistance = calculateDistance(searchOrigin, tripOrigin);
            }
            if (searchDestination && tripDestination) {
              destinationDistance = calculateDistance(
                searchDestination,
                tripDestination,
              );
            }

            // Determine match quality and score
            if (searchOrigin && searchDestination) {
              // Both origin and destination specified
              if (
                originDistance <= level.originRadius &&
                destinationDistance <= level.destRadius
              ) {
                const originScore = Math.max(
                  0,
                  level.weight -
                    (originDistance / level.originRadius) * level.weight,
                );
                const destinationScore = Math.max(
                  0,
                  level.weight -
                    (destinationDistance / level.destRadius) * level.weight,
                );
                relevanceScore = (originScore + destinationScore) / 2;

                // Bonus for exact matches
                if (originDistance <= 5 && destinationDistance <= 5) {
                  relevanceScore += 20;
                  matchQuality = 'exact';
                } else if (originDistance <= 15 && destinationDistance <= 15) {
                  relevanceScore += 10;
                  matchQuality = 'very_close';
                } else {
                  matchQuality = 'close';
                }
              }
            } else if (searchOrigin) {
              // Only origin specified
              if (originDistance <= level.originRadius) {
                relevanceScore = Math.max(
                  0,
                  level.weight -
                    (originDistance / level.originRadius) * level.weight,
                );

                if (originDistance <= 5) {
                  relevanceScore += 20;
                  matchQuality = 'exact';
                } else if (originDistance <= 15) {
                  relevanceScore += 10;
                  matchQuality = 'very_close';
                } else {
                  matchQuality = 'close';
                }
              }
            } else if (searchDestination) {
              // Only destination specified
              if (destinationDistance <= level.destRadius) {
                relevanceScore = Math.max(
                  0,
                  level.weight -
                    (destinationDistance / level.destRadius) * level.weight,
                );

                if (destinationDistance <= 5) {
                  relevanceScore += 20;
                  matchQuality = 'exact';
                } else if (destinationDistance <= 15) {
                  relevanceScore += 10;
                  matchQuality = 'very_close';
                } else {
                  matchQuality = 'close';
                }
              }
            }

            return {
              ...trip,
              _relevanceScore: relevanceScore,
              _originDistance: originDistance,
              _destinationDistance: destinationDistance,
              _matchQuality: matchQuality,
              _searchLevel: level.name,
            };
          })
          .filter((trip) => trip._relevanceScore > 0)
          .sort((a, b) => b._relevanceScore - a._relevanceScore);

        // If we found matches at this level, use them
        if (levelMatches.length > 0) {
          bestMatches = levelMatches.map((trip) => ({
            ...trip,
            _searchMetadata: {
              searchMode: 'proximity',
              searchLevel: level.name,
              isBroadSearch:
                level.name === 'broad' || level.name === 'extended',
              totalResults: levelMatches.length,
            },
          }));
          break; // Stop at first successful level
        }
      }

      // If still no matches, fall back to text-based search or show all trips
      if (bestMatches.length === 0) {
        console.log(
          'No proximity matches found, falling back to text search or all trips',
        );

        if (searchStrategy.hasTextSearch && !searchStrategy.hasCoordinates) {
          // Keep the original text-based results (only if no coordinates)
          bestMatches = trips.map((trip) => ({
            ...trip,
            _searchMetadata: {
              searchMode: 'text',
              searchLevel: 'text_fallback',
              isBroadSearch: true,
              totalResults: trips.length,
            },
          }));
        } else {
          // Show all available trips as last resort
          const allTrips = await prisma.trip.findMany({
            where: {
              status: 'PUBLISHED',
              departureAt: { gte: new Date() },
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
            orderBy: { departureAt: 'asc' },
            take: 20, // Limit to prevent overwhelming results
          });

          bestMatches = allTrips.map((trip) => ({
            ...trip,
            _relevanceScore: 1,
            _originDistance: Infinity,
            _destinationDistance: Infinity,
            _matchQuality: 'fallback',
            _searchLevel: 'all_trips',
            _searchMetadata: {
              searchMode: 'fallback',
              searchLevel: 'all_trips',
              isBroadSearch: true,
              totalResults: allTrips.length,
            },
          }));
        }
      }

      trips = bestMatches;
    }

    // Add search metadata to help frontend understand the results
    const finalMetadata = searchStrategy.hasCoordinates
      ? trips.length > 0
        ? (trips[0] as any)._searchMetadata
        : {
            searchMode: 'proximity',
            searchLevel: 'no_matches',
            isBroadSearch: true,
            totalResults: 0,
          }
      : {
          searchMode: searchStrategy.hasTextSearch ? 'text' : 'browse',
          searchLevel: 'standard',
          isBroadSearch: false,
          totalResults: trips.length,
        };

    return NextResponse.json({
      trips,
      metadata: {
        ...finalMetadata,
        hasCoordinates: searchStrategy.hasCoordinates,
        hasTextSearch: searchStrategy.hasTextSearch,
        hasFilters: searchStrategy.hasFilters,
        hasDate: !!departureDate,
      },
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
