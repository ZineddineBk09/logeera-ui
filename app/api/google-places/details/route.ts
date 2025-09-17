import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    const fields = searchParams.get('fields') || 'geometry';

    if (!placeId) {
      return NextResponse.json({ error: 'place_id is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in place details proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
