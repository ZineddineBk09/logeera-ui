import { api } from '@/lib/api';

export interface DistanceMatrixResult {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
}

export class DistanceMatrixService {
  static async calculateDistanceAndDuration(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<DistanceMatrixResult | null> {
    try {
      const response = await api('/api/google-distance-matrix', {
        method: 'POST',
        body: JSON.stringify({
          origins: [`${origin.lat},${origin.lng}`],
          destinations: [`${destination.lat},${destination.lng}`],
          units: 'metric',
          mode: 'driving',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate distance');
      }

      const data = await response.json();

      if (data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        return data.rows[0].elements[0];
      }

      return null;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  }
}
