"use client"

import { useState } from "react"
import { MapPin, Navigation, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api"
import { mapStyles } from "@/lib/map-styles"

interface MapViewProps {
  trips: Array<{
    id: string
    originName: string
    destinationName: string
    dateTime: string
    price: number
    publisher: {
      name: string
      rating: number
      trusted: boolean
    }
  }>
  selectedTripId?: string | null
  onTripSelect?: (tripId: string) => void
}

const containerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
}

const tripLocations = [
  { lat: 40.7589, lng: -73.9851 }, // Times Square area
  { lat: 40.7505, lng: -73.9934 }, // Herald Square area
  { lat: 40.7282, lng: -73.7949 }, // Queens area
]

export function MapView({ trips, selectedTripId, onTripSelect }: MapViewProps) {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const [map, setMap] = useState<any | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "AIzaSyADEv_BhmFoht8_TwlG0jJD53KIPu7blaI",
    libraries: ["geometry", "geocoding"],
  })

  if (!isLoaded) {
    return (
      <div className="relative h-full bg-muted/20 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Loading Map</h3>
                <p className="text-sm text-muted-foreground">Please wait...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-muted/20 rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
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
          position={{ lat: 40.7128, lng: -74.006 }}
          options={{
            icon: {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 8,
              fillColor: "hsl(24 95% 53%)", // Primary color
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          }}
        />

        {/* Destination Marker */}
        <MarkerF
          position={{ lat: 42.3601, lng: -71.0589 }}
          options={{
            icon: {
              path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
              scale: 8,
              fillColor: "hsl(142 76% 36%)", // Accent color
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          }}
        />

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
                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                scale: 15,
                fillColor: selectedTripId === trip.id ? "hsl(24 95% 53%)" : "#ffffff",
                fillOpacity: 1,
                strokeColor: "hsl(24 95% 53%)",
                strokeWeight: 2,
              },
              label: {
                text: `$${trip.price}`,
                color: selectedTripId === trip.id ? "#ffffff" : "hsl(24 95% 53%)",
                fontSize: "12px",
                fontWeight: "bold",
              },
            }}
          >
            {(hoveredPin === trip.id || selectedTripId === trip.id) && (
              <InfoWindowF position={tripLocations[index] || defaultCenter} onCloseClick={() => setHoveredPin(null)}>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{trip.publisher.name}</div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{trip.publisher.rating}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trip.dateTime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    <div className="text-lg font-bold text-primary">${trip.price}</div>
                    {trip.publisher.trusted && (
                      <Badge variant="secondary" className="text-xs">
                        Trusted
                      </Badge>
                    )}
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
      <div className="absolute top-4 right-4 space-y-2">
        <Button size="icon" variant="secondary" className="shadow-lg">
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
