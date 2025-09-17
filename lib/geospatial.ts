import { prisma } from './database';

/**
 * Geospatial utilities for PostGIS operations
 * Since Prisma doesn't have native PostGIS support, we use raw SQL queries
 */

export interface Point {
  longitude: number;
  latitude: number;
}

export function createWKT(point: Point): string {
  return `POINT(${point.longitude} ${point.latitude})`;
}

export function parseWKT(wkt: string): Point {
  // Parse WKT format: "POINT(lon lat)"
  const match = wkt.match(/POINT\(([^)]+)\)/);
  if (!match) {
    throw new Error('Invalid WKT format');
  }
  const [lon, lat] = match[1].split(' ').map(Number);
  return { longitude: lon, latitude: lat };
}

/**
 * Find trips within a radius of a given point
 */
export async function findTripsNearby(
  center: Point,
  radiusMeters: number = 5000
) {
  try {
    const centerWKT = createWKT(center);
    
    // Try PostGIS query first
    return await prisma.$queryRaw`
      SELECT 
        t.*,
        u.name as publisher_name,
        u.email as publisher_email,
        u.average_rating as publisher_rating
      FROM trips t
      JOIN users u ON t.publisher_id = u.id
      WHERE t.status = 'PUBLISHED'
      AND ST_DWithin(
        ST_GeomFromText(t.origin_geom, 4326),
        ST_GeomFromText(${centerWKT}, 4326),
        ${radiusMeters}
      )
      ORDER BY t.departure_at ASC
    `;
  } catch (error) {
    console.log('PostGIS query failed, falling back to simple query:', error);
    
    // Fallback: return all published trips if PostGIS fails
    return await prisma.trip.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        publisher: {
          select: {
            name: true,
            email: true,
            averageRating: true,
          }
        }
      },
      orderBy: { departureAt: 'asc' }
    });
  }
}

/**
 * Calculate distance between two points in meters
 */
export async function calculateDistance(point1: Point, point2: Point): Promise<number> {
  const wkt1 = createWKT(point1);
  const wkt2 = createWKT(point2);
  
  const result = await prisma.$queryRaw<[{ st_distance: number }]>`
    SELECT ST_Distance(
      ST_GeomFromText(${wkt1}, 4326)::geography,
      ST_GeomFromText(${wkt2}, 4326)::geography
    ) as st_distance
  `;
  
  return result[0].st_distance;
}

/**
 * Validate that a WKT string is a valid Point
 */
export function validateWKT(wkt: string): boolean {
  try {
    const point = parseWKT(wkt);
    return (
      typeof point.longitude === 'number' &&
      typeof point.latitude === 'number' &&
      point.longitude >= -180 &&
      point.longitude <= 180 &&
      point.latitude >= -90 &&
      point.latitude <= 90
    );
  } catch {
    return false;
  }
}
