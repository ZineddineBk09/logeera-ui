import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Logeera - Logistics Era | Trusted Rideshare';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Logeera
          </div>
          
          <div
            style={{
              fontSize: 48,
              fontWeight: '600',
              marginBottom: '40px',
              opacity: 0.95,
            }}
          >
            Logistics Era
          </div>

          <div
            style={{
              fontSize: 36,
              marginBottom: '60px',
              opacity: 0.9,
              maxWidth: '800px',
            }}
          >
            Connect, Share, Travel - Your trusted rideshare platform
          </div>

          <div
            style={{
              display: 'flex',
              gap: '60px',
              fontSize: 32,
              marginTop: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              🚗 Rideshare
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              📦 Parcel Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              ⭐ Trusted Drivers
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

