"use client"

import { useState } from "react"
import { ArrowLeft, Clock, Car, Users, Star, Shield, MessageCircle, Phone, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ReviewsPreview } from "@/components/reviews-preview"
import { RelatedTrips } from "@/components/related-trips"
import { RequestJoinDialog } from "@/components/request-join-dialog"
import { DetailedMapView } from "@/components/detailed-map-view"

// Mock trip data
const mockTrip = {
  id: "1",
  originName: "New York City",
  destinationName: "Boston",
  originAddress: "Times Square, Manhattan, NY",
  destinationAddress: "Boston Common, Boston, MA",
  dateTime: "2024-01-15T09:00:00",
  vehicleType: "car",
  vehicleMake: "Honda Accord",
  capacity: 3,
  availableSeats: 2,
  price: 45,
  duration: "4h 30m",
  distance: "215 miles",
  publisher: {
    id: "pub1",
    name: "Sarah Johnson",
    rating: 4.9,
    reviewCount: 127,
    avatar: "/woman-driver.png",
    trusted: true,
    memberSince: "2022",
    responseRate: 98,
    languages: ["English", "Spanish"],
  },
  description:
    "Comfortable ride in a clean, well-maintained Honda Accord. I'm a safe driver with over 5 years of rideshare experience. Non-smoking vehicle, air conditioning, and phone chargers available.",
  rules: ["No smoking", "No pets (allergies)", "Maximum 1 bag per person", "Please be on time"],
  amenities: ["Air conditioning", "Phone chargers", "Water bottles", "Music requests welcome"],
  pickupNotes: "I'll wait up to 10 minutes at the pickup location. Please be ready!",
  route: [
    { lat: 40.7589, lng: -73.9851, name: "Times Square" },
    { lat: 42.3601, lng: -71.0589, name: "Boston Common" },
  ],
}

interface TripDetailsProps {
  tripId: string
}

export function TripDetails({ tripId }: TripDetailsProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  const departureTime = new Date(mockTrip.dateTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const seatsProgress = ((mockTrip.capacity - mockTrip.availableSeats) / mockTrip.capacity) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/trips">Search Results</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Trip Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mt-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-2xl font-bold">
                <span>{mockTrip.originName}</span>
                <ArrowLeft className="h-6 w-6 text-muted-foreground rotate-180" />
                <span>{mockTrip.destinationName}</span>
              </div>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{departureTime}</span>
                </div>
                <span>•</span>
                <span>{mockTrip.duration}</span>
                <span>•</span>
                <span>{mockTrip.distance}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">${mockTrip.price}</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map */}
            <Card>
              <CardContent className="p-0">
                <DetailedMapView trip={mockTrip} />
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{mockTrip.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Vehicle & Amenities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{mockTrip.vehicleMake}</span>
                      </div>
                      {mockTrip.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Rules & Requirements</h4>
                    <div className="space-y-2">
                      {mockTrip.rules.map((rule, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                          <span className="text-sm">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Pickup Instructions</h4>
                  <p className="text-muted-foreground text-sm">{mockTrip.pickupNotes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Preview */}
            <ReviewsPreview publisherId={mockTrip.publisher.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publisher Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mockTrip.publisher.avatar || "/placeholder.svg"} alt={mockTrip.publisher.name} />
                    <AvatarFallback>
                      {mockTrip.publisher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{mockTrip.publisher.name}</h3>
                      {mockTrip.publisher.trusted && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{mockTrip.publisher.rating}</span>
                      <span>•</span>
                      <span>{mockTrip.publisher.reviewCount} reviews</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Member since {mockTrip.publisher.memberSince}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Response rate</div>
                    <div className="font-medium">{mockTrip.publisher.responseRate}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Languages</div>
                    <div className="font-medium">{mockTrip.publisher.languages.join(", ")}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Trip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available seats</span>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {mockTrip.availableSeats} of {mockTrip.capacity}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seats taken</span>
                    <span>
                      {mockTrip.capacity - mockTrip.availableSeats}/{mockTrip.capacity}
                    </span>
                  </div>
                  <Progress value={seatsProgress} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Price per person</span>
                    <span className="font-semibold">${mockTrip.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service fee</span>
                    <span>$2</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${mockTrip.price + 2}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={mockTrip.availableSeats === 0}
                  onClick={() => setShowRequestDialog(true)}
                >
                  {mockTrip.availableSeats === 0 ? "Trip Full" : "Request to Join"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  You won't be charged until your request is accepted
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Trips */}
        <div className="mt-12">
          <RelatedTrips currentTripId={tripId} />
        </div>
      </div>

      <RequestJoinDialog open={showRequestDialog} onOpenChange={setShowRequestDialog} trip={mockTrip} />
    </div>
  )
}
