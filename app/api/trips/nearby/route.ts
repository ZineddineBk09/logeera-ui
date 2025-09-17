import { NextRequest, NextResponse } from 'next/server';
import { findTripsNearby, validateWKT } from '@/lib/geospatial';
import { z } from 'zod';

const nearbySchema = z.object({
  lon: z.string().transform(Number),
  lat: z.string().transform(Number),
  radiusMeters: z.string().default('5000').transform(Number),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { lon, lat, radiusMeters } = nearbySchema.parse({
      lon: searchParams.get('lon'),
      lat: searchParams.get('lat'),
      radiusMeters: searchParams.get('radiusMeters') || '5000',
    });

    // Use PostGIS for proper geospatial proximity search
    const trips = await findTripsNearby(
      { longitude: lon, latitude: lat },
      radiusMeters
    );

    return NextResponse.json(trips);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
