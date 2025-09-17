import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origins, destinations, units = 'metric', mode = 'driving' } = body;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    // Build the Google Distance Matrix API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const params = new URLSearchParams({
      origins: origins.join('|'),
      destinations: destinations.join('|'),
      units,
      mode,
      key: apiKey,
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Google Distance Matrix API request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling Google Distance Matrix API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
