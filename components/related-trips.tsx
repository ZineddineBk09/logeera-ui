"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trip-card";
import { TripsService } from "@/lib/services";
import { swrKeys } from "@/lib/swr-config";
import useSWR from "swr";

// Function to calculate distance between two points using Haversine formula
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Function to parse WKT POINT format
function parseWKTPoint(wkt: string): { lat: number; lng: number } | null {
  if (!wkt) return null;
  const match = wkt.match(/POINT\(([+-]?\d*\.?\d+)\s+([+-]?\d*\.?\d+)\)/);
  if (match) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    return { lat, lng };
  }
  return null;
}

// Function to calculate trip similarity score
function calculateTripSimilarity(
  currentTrip: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } },
  otherTrip: { originGeom: string; destinationGeom: string }
): number {
  const otherOrigin = parseWKTPoint(otherTrip.originGeom);
  const otherDestination = parseWKTPoint(otherTrip.destinationGeom);
  
  if (!otherOrigin || !otherDestination) return Infinity;
  
  // Calculate distances between start points and end points
  const originDistance = calculateDistance(currentTrip.origin, otherOrigin);
  const destinationDistance = calculateDistance(currentTrip.destination, otherDestination);
  
  // Combined score: average of origin and destination distances
  // Lower score = more similar trip
  return (originDistance + destinationDistance) / 2;
}

interface RelatedTripsProps {
  currentTripId: string;
  currentTripCoordinates?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
}

export function RelatedTrips({ currentTripId, currentTripCoordinates }: RelatedTripsProps) {
  // Fetch related trips (excluding current trip)
  const { data: trips = [], isLoading } = useSWR(
    swrKeys.trips.list({}),
    () => TripsService.list({}).then(async (r) => {
      if (r.ok) {
        return await r.json();
      }
      throw new Error('Failed to load related trips');
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Filter out current trip and sort by similarity
  const relatedTrips = trips
    .filter((trip: any) => trip.id !== currentTripId)
    .map((trip: any) => {
      // Calculate similarity score if current trip coordinates are available
      let similarityScore = Math.random(); // Fallback to random if no coordinates
      
      if (currentTripCoordinates && trip.originGeom && trip.destinationGeom) {
        similarityScore = calculateTripSimilarity(currentTripCoordinates, trip);
      }
      
      return {
        ...trip,
        similarityScore,
      };
    })
    .sort((a: any, b: any) => a.similarityScore - b.similarityScore) // Sort by similarity (lower score = more similar)
    .slice(0, 2); // Limit to 2 most similar trips

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading similar trips...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedTrips.length === 0) {
    return null; // Don't show the card if no related trips
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Similar Trips</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {relatedTrips.map((trip: any) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
