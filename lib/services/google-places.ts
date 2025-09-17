// Google Places API service for autocomplete and geocoding

export interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface AutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI';

export class GooglePlacesService {
  private static baseUrl = '/api/google-places';

  static async getAutocompleteSuggestions(input: string): Promise<PlacePrediction[]> {
    if (!input || input.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/autocomplete?input=${encodeURIComponent(input)}&types=geocode`
      );

      console.log('Autocomplete response:', response);
      
      if (!response.ok) {
        console.error('Failed to fetch autocomplete suggestions:', response.statusText);
        throw new Error('Failed to fetch autocomplete suggestions');
      }

      const data: AutocompleteResponse = await response.json();
      console.log('Autocomplete data:', data);
      if (data.status !== 'OK') {
        console.warn('Google Places API error:', data.status);
        return [];
      }
      console.log('Autocomplete predictions:', data.predictions);
      return data.predictions;
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      return [];
    }
  }

  static async getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/details?place_id=${placeId}&fields=geometry`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data: PlaceDetailsResponse = await response.json();
      
      if (data.status !== 'OK') {
        console.warn('Google Places API error:', data.status);
        return null;
      }

      return {
        lat: data.result.geometry.location.lat,
        lng: data.result.geometry.location.lng,
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }
}
