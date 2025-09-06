"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TripCard } from "@/components/trip-card"

const mockRelatedTrips = [
  {
    id: "2",
    originName: "New York City",
    destinationName: "Boston",
    dateTime: "2024-01-16T10:00:00",
    vehicleType: "van",
    capacity: 6,
    availableSeats: 4,
    price: 40,
    publisher: {
      name: "Mike Chen",
      rating: 4.8,
      avatar: "/man-driver.jpg",
      trusted: true,
    },
    duration: "4h 45m",
    distance: "220 miles",
  },
  {
    id: "3",
    originName: "New York City",
    destinationName: "Boston",
    dateTime: "2024-01-17T14:30:00",
    vehicleType: "car",
    capacity: 4,
    availableSeats: 2,
    price: 50,
    publisher: {
      name: "Emma Davis",
      rating: 5.0,
      avatar: "/woman-driver-professional.jpg",
      trusted: true,
    },
    duration: "4h 15m",
    distance: "210 miles",
  },
]

interface RelatedTripsProps {
  currentTripId: string
}

export function RelatedTrips({ currentTripId }: RelatedTripsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Similar Trips</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockRelatedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
