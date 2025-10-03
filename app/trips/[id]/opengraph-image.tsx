import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/database';

export const runtime = 'edge';
export const alt = 'Trip Details';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        publisher: {
          select: {
            name: true,
            averageRating: true,
          },
        },
      },
    });

    if (!trip) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            Trip Not Found
          </div>
        ),
        { ...size }
      );
    }

    const date = new Date(trip.departureAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const time = new Date(trip.departureAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '60px',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 32,
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            Logeera
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {trip.originName} → {trip.destinationName}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '40px',
                fontSize: 28,
                marginTop: '20px',
              }}
            >
              <div>📅 {date}</div>
              <div>🕐 {time}</div>
              <div>
                {trip.payloadType === 'PARCEL' 
                  ? `📦 ${trip.parcelWeight || trip.capacity}kg` 
                  : `👥 ${trip.capacity} seats`}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: '30px',
                fontSize: 24,
              }}
            >
              <div>
                By {trip.publisher.name} ⭐ {trip.publisher.averageRating.toFixed(1)}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 20,
              opacity: 0.9,
            }}
          >
            Connect, Share, Travel
          </div>
        </div>
      ),
      { ...size }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom right, #2563eb, #1e40af)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Logeera Trip
        </div>
      ),
      { ...size }
    );
  }
}

