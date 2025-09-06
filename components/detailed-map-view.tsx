"use client"

import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoogleMap, MarkerF, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api"
import { mapStyles } from "@/lib/map-styles"
import { useState, useEffect } from "react"
import type { DirectionsResult, Map } from "@react-google-maps/api"

interface DetailedMapViewProps {
  trip: {
    originName: string
    destinationName: string
    originAddress: string
    destinationAddress: string
    route: Array<{ lat: number; lng: number; name: string }>
  }
}

const containerStyle = {
  width: "100%",
  height: "100%",
}

const defaultOrigin = { lat: 40.7128, lng: -74.006 } // NYC
const defaultDestination = { lat: 42.3601, lng: -71.0589 } // Boston

export function DetailedMapView({ trip }: DetailedMapViewProps) {
  const [directions, setDirections] = useState<DirectionsResult | null>(null)
  const [map, setMap] = useState<Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI",
    libraries: ["geometry", "geocoding"],
  })

  useEffect(() => {
    if (isLoaded && map && window.google) {
      const directionsService = new window.google.maps.DirectionsService()

      directionsService.route(
        {
          origin: defaultOrigin,
          destination: defaultDestination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirections(result)
          }
        },
      )
    }
  }, [isLoaded, map])

  if (!isLoaded) {
    return (
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Loading Route</h3>
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultOrigin}
        zoom={8}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "cooperative",
        }}
        onLoad={(map) => setMap(map)}
      >
        {/* Origin Marker */}
        <MarkerF
          position={defaultOrigin}
          options={{
            icon: {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 12,
              fillColor: "hsl(24 95% 53%)", // Primary color
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
            label: {
              text: "A",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold",
            },
          }}
        />

        {/* Destination Marker */}
        <MarkerF
          position={defaultDestination}
          options={{
            icon: {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 12,
              fillColor: "hsl(142 76% 36%)", // Accent color
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
            label: {
              text: "B",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold",
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
                strokeColor: "hsl(24 95% 53%)", // Primary color
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
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-sm font-medium">{trip.originName}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-5">{trip.originAddress}</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-sm font-medium">{trip.destinationName}</span>
                <div className="w-3 h-3 bg-accent rounded-full" />
              </div>
              <div className="text-xs text-muted-foreground pr-5">{trip.destinationAddress}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
