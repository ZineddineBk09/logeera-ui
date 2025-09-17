'use client';

import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';
import { mapStyles } from '@/lib/map-styles';
import { useState, useEffect } from 'react';
// import type { DirectionsResult } from "google.maps";

interface DetailedMapViewProps {
  trip: {
    originName: string;
    destinationName: string;
    originAddress: string;
    destinationAddress: string;
    route: Array<{ lat: number; lng: number; name: string }>;
  };
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

export function DetailedMapView({ trip }: DetailedMapViewProps) {
  console.log('trip', trip);
  const [directions, setDirections] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  
  // Calculate center point between origin and destination
  const originCoords = trip.route[0];
  const destinationCoords = trip.route[1];
  const centerPoint = {
    lat: (originCoords.lat + destinationCoords.lat) / 2,
    lng: (originCoords.lng + destinationCoords.lng) / 2,
  };

  // Calculate appropriate zoom level based on distance
  const latDiff = Math.abs(originCoords.lat - destinationCoords.lat);
  const lngDiff = Math.abs(originCoords.lng - destinationCoords.lng);
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoomLevel = 10;
  if (maxDiff < 0.1) zoomLevel = 12;
  else if (maxDiff < 0.5) zoomLevel = 10;
  else if (maxDiff < 1) zoomLevel = 9;
  else if (maxDiff < 2) zoomLevel = 8;
  else zoomLevel = 7;

  const defaultOrigin = trip.route[0];
  const defaultDestination = trip.route[trip.route.length - 1];

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
      'AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI',
    libraries: ['geometry', 'geocoding'],
  });

  useEffect(() => {
    if (isLoaded && map && window.google) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: defaultOrigin,
          destination: defaultDestination,
          travelMode: (window as any).google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (
            status === (window as any).google.maps.DirectionsStatus.OK &&
            result
          ) {
            setDirections(result);
          }
        },
      );
    }
  }, [isLoaded, map]);

  if (!isLoaded) {
    return (
      <div className="relative h-96 overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <MapPin className="text-primary h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Loading Route</h3>
              <p className="text-muted-foreground text-sm">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 overflow-hidden rounded-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centerPoint}
        zoom={zoomLevel}
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
        {/* Origin Marker */}
        <MarkerF
          position={defaultOrigin}
          options={{
            icon: {
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#067AF9', // Primary color
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            label: {
              text: 'A',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          }}
        />

        {/* Destination Marker */}
        <MarkerF
          position={defaultDestination}
          options={{
            icon: {
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: 'hsl(142 76% 36%)', // Accent color
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            label: {
              text: 'B',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          }}
        />

        {/* Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#067AF9', // Primary color
                strokeOpacity: 0.8,
                strokeWeight: 4,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button size="icon" variant="secondary" className="shadow-lg">
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Trip Info Overlay */}
      <div className="absolute right-4 bottom-4 left-4">
        <div className="bg-background/95 rounded-lg p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="bg-primary h-3 w-3 rounded-full" />
                <span className="text-sm font-medium">{trip.originName}</span>
              </div>
              <div className="text-muted-foreground pl-5 text-xs">
                {trip.originAddress}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-sm font-medium">
                  {trip.destinationName}
                </span>
                <div className="bg-accent h-3 w-3 rounded-full" />
              </div>
              <div className="text-muted-foreground pr-5 text-xs">
                {trip.destinationAddress}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
