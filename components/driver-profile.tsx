"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Shield,
  MessageCircle,
  Calendar,
  Car,
} from "lucide-react";

interface DriverProfileProps {
  driverId: string;
}

// Mock driver data
const mockDriver = {
  id: "1",
  name: "Sarah Johnson",
  avatar: "/woman-driver.png",
  rating: 4.9,
  totalTrips: 127,
  memberSince: "March 2023",
  verified: true,
  bio: "Experienced driver who loves meeting new people and sharing travel costs. I'm punctual, clean, and always play good music!",
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: 2022,
    color: "Silver",
    seats: 4,
  },
  activeTrips: [
    {
      id: "1",
      from: "San Francisco",
      to: "Los Angeles",
      date: "Dec 15, 2024",
      time: "9:00 AM",
      availableSeats: 2,
      price: 65,
    },
    {
      id: "2",
      from: "San Francisco",
      to: "Sacramento",
      date: "Dec 18, 2024",
      time: "3:00 PM",
      availableSeats: 3,
      price: 45,
    },
  ],
  reviews: [
    {
      id: "1",
      reviewer: "Mike Chen",
      rating: 5,
      comment:
        "Great driver! Very punctual and friendly. Would definitely ride with Sarah again.",
      date: "Nov 2024",
    },
    {
      id: "2",
      reviewer: "Emma Davis",
      rating: 5,
      comment:
        "Smooth ride and excellent conversation. Sarah made the long trip very enjoyable.",
      date: "Oct 2024",
    },
  ],
};

export function DriverProfile({ driverId }: DriverProfileProps) {
  const [activeTab, setActiveTab] = useState("trips");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Driver Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 mx-auto md:mx-0">
              <AvatarImage
                src={mockDriver.avatar || "/placeholder.svg"}
                alt={mockDriver.name}
              />
              <AvatarFallback className="text-2xl">
                {mockDriver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold">{mockDriver.name}</h1>
                {mockDriver.verified && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{mockDriver.rating}</span>
                  <span className="text-muted-foreground">
                    ({mockDriver.totalTrips} trips)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {mockDriver.memberSince}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{mockDriver.bio}</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Car className="h-4 w-4" />
                  View Vehicle Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trips">Active Trips</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="space-y-4 mt-6">
          {mockDriver.activeTrips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {trip.from} → {trip.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {trip.date} at {trip.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{trip.availableSeats} seats available</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ${trip.price}
                    </span>
                    <Button size="sm">Request to Join</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="vehicle" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Make & Model</p>
                  <p className="font-semibold">
                    {mockDriver.vehicle.make} {mockDriver.vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold">{mockDriver.vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-semibold">{mockDriver.vehicle.color}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-semibold">{mockDriver.vehicle.seats}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 mt-6">
          {mockDriver.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{review.reviewer}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
