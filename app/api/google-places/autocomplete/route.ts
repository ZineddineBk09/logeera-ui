import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const types = searchParams.get('types') || 'geocode';

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_MAPS_API_KEY}&input=${encodeURIComponent(input)}&types=${types}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch autocomplete suggestions');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in autocomplete proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
