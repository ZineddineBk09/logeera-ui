'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Star,
  Locate,
  User,
  MapPin as OriginIcon,
  MapPin as DestinationIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { mapStyles } from '@/lib/map-styles';

interface MapViewProps {
  trips: Array<{
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    vehicleType: string;
    capacity: number;
    publisher: {
      id: string;
      name: string;
      averageRating?: number;
      ratingCount?: number;
    };
  }>;
  selectedTripId?: string | null;
  onTripSelect?: (tripId: string) => void;
  originLat?: string | null;
  originLng?: string | null;
  destinationLat?: string | null;
  destinationLng?: string | null;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const tripLocations = [
  { lat: 40.7589, lng: -73.9851 }, // Times Square area
  { lat: 40.7505, lng: -73.9934 }, // Herald Square area
  { lat: 40.7282, lng: -73.7949 }, // Queens area
];

export function MapView({
  trips,
  selectedTripId,
  onTripSelect,
  originLat,
  originLng,
  destinationLat,
  destinationLng,
}: MapViewProps) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [hoveredLocationPin, setHoveredLocationPin] = useState<string | null>(
    null,
  );
  const [map, setMap] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
      'AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI',
    libraries: ['geometry', 'geocoding'],
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    }
  }, []);

  // Calculate map center based on available data
  useEffect(() => {
    let center = defaultCenter;

    // Priority: 1. Origin from search params, 2. User location, 3. Default
    if (originLat && originLng) {
      center = {
        lat: parseFloat(originLat),
        lng: parseFloat(originLng),
      };
    } else if (userLocation) {
      center = userLocation;
    }

    setMapCenter(center);
  }, [originLat, originLng, userLocation]);

  if (!isLoaded) {
    return (
      <div className="bg-muted/20 relative h-full overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <MapPin className="text-primary h-8 w-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Loading Map</h3>
                <p className="text-muted-foreground text-sm">Please wait...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 relative h-full overflow-hidden rounded-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'cooperative',
        }}
        onLoad={(map) => setMap(map)}
      >
        {/* User Location Marker */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            onClick={() => setHoveredLocationPin('user')}
            onMouseOver={() => setHoveredLocationPin('user')}
            onMouseOut={() => setHoveredLocationPin(null)}
            options={{
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="#ffffff"/>
                  </svg>
                `)}`,
                scaledSize: new (window as any).google.maps.Size(24, 24),
                anchor: new (window as any).google.maps.Point(12, 12),
              },
            }}
          >
            {hoveredLocationPin === 'user' && (
              <InfoWindowF
                position={userLocation}
                onCloseClick={() => setHoveredLocationPin(null)}
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-600" />
                      <div className="text-sm font-medium">Your Location</div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Current position based on GPS
                    </div>
                  </CardContent>
                </Card>
              </InfoWindowF>
            )}
          </MarkerF>
        )}

        {/* Origin Marker */}
        {originLat && originLng && (
          <MarkerF
            position={{
              lat: parseFloat(originLat),
              lng: parseFloat(originLng),
            }}
            onClick={() => setHoveredLocationPin('origin')}
            onMouseOver={() => setHoveredLocationPin('origin')}
            onMouseOut={() => setHoveredLocationPin(null)}
            options={{
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#067AF9" stroke="#ffffff" stroke-width="1"/>
                  </svg>
                `)}`,
                scaledSize: new (window as any).google.maps.Size(24, 24),
                anchor: new (window as any).google.maps.Point(12, 12),
              },
            }}
          >
            {hoveredLocationPin === 'origin' && (
              <InfoWindowF
                position={{
                  lat: parseFloat(originLat),
                  lng: parseFloat(originLng),
                }}
                onCloseClick={() => setHoveredLocationPin(null)}
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center space-x-2">
                      <OriginIcon className="h-4 w-4 text-blue-600" />
                      <div className="text-sm font-medium">Origin</div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Starting point of your search
                    </div>
                  </CardContent>
                </Card>
              </InfoWindowF>
            )}
          </MarkerF>
        )}

        {/* Destination Marker */}
        {destinationLat && destinationLng && (
          <MarkerF
            position={{
              lat: parseFloat(destinationLat),
              lng: parseFloat(destinationLng),
            }}
            onClick={() => setHoveredLocationPin('destination')}
            onMouseOver={() => setHoveredLocationPin('destination')}
            onMouseOut={() => setHoveredLocationPin(null)}
            options={{
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EF4444" stroke="#ffffff" stroke-width="1"/>
                  </svg>
                `)}`,
                scaledSize: new (window as any).google.maps.Size(24, 24),
                anchor: new (window as any).google.maps.Point(12, 12),
              },
            }}
          >
            {hoveredLocationPin === 'destination' && (
              <InfoWindowF
                position={{
                  lat: parseFloat(destinationLat),
                  lng: parseFloat(destinationLng),
                }}
                onCloseClick={() => setHoveredLocationPin(null)}
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center space-x-2">
                      <DestinationIcon className="h-4 w-4 text-red-600" />
                      <div className="text-sm font-medium">Destination</div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      End point of your search
                    </div>
                  </CardContent>
                </Card>
              </InfoWindowF>
            )}
          </MarkerF>
        )}

        {/* Trip Markers */}
        {trips.slice(0, 3).map((trip, index) => (
          <MarkerF
            key={trip.id}
            position={tripLocations[index] || defaultCenter}
            onClick={() => onTripSelect?.(trip.id)}
            onMouseOver={() => setHoveredPin(trip.id)}
            onMouseOut={() => setHoveredPin(null)}
            options={{
              icon: {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="${selectedTripId === trip.id ? '#067AF9' : '#ffffff'}" stroke="#067AF9" stroke-width="2"/>
                    <path d="M8 12h16v8H8z" fill="${selectedTripId === trip.id ? '#ffffff' : '#067AF9'}"/>
                    <circle cx="12" cy="16" r="1" fill="${selectedTripId === trip.id ? '#067AF9' : '#ffffff'}"/>
                    <circle cx="20" cy="16" r="1" fill="${selectedTripId === trip.id ? '#067AF9' : '#ffffff'}"/>
                    <text x="16" y="22" text-anchor="middle" font-size="8" font-weight="bold" fill="${selectedTripId === trip.id ? '#ffffff' : '#067AF9'}">${trip.capacity}</text>
                  </svg>
                `)}`,
                scaledSize: new (window as any).google.maps.Size(32, 32),
                anchor: new (window as any).google.maps.Point(16, 16),
              },
            }}
          >
            {(hoveredPin === trip.id || selectedTripId === trip.id) && (
              <InfoWindowF
                position={tripLocations[index] || defaultCenter}
                onCloseClick={() => setHoveredPin(null)}
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {trip.publisher.name}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">
                          {trip.publisher.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(trip.departureAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </div>
                    <div className="text-primary text-lg font-bold">
                      {trip.vehicleType} • {trip.capacity} seats
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {trip.vehicleType}
                    </Badge>
                    <Button size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-x-2">
        <Button
          size="icon"
          variant="secondary"
          className="shadow-lg"
          onClick={() => {
            if (userLocation && map) {
              map.panTo(userLocation);
              map.setZoom(15);
            }
          }}
          disabled={!userLocation}
        >
          <Locate className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="shadow-lg"
          onClick={() => {
            if (map) {
              map.setZoom(15);
            }
          }}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
