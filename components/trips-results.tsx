"use client";

import { useState } from "react";
import { Map, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TripCard } from "@/components/trip-card";
import { MapView } from "@/components/map-view";
import { FilterBar } from "@/components/filter-bar";

// Mock data for trips
const mockTrips = [
  {
    id: "1",
    originName: "New York City",
    destinationName: "Boston",
    dateTime: "2024-01-15T09:00:00",
    vehicleType: "car",
    capacity: 3,
    availableSeats: 2,
    price: 45,
    publisher: {
      name: "Sarah Johnson",
      rating: 4.9,
      avatar: "/woman-driver.png",
      trusted: true,
    },
    duration: "4h 30m",
    distance: "215 miles",
  },
  {
    id: "2",
    originName: "New York City",
    destinationName: "Boston",
    dateTime: "2024-01-15T14:00:00",
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
    dateTime: "2024-01-15T16:30:00",
    vehicleType: "car",
    capacity: 4,
    availableSeats: 1,
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
];

export function TripsResults() {
  const [activeView, setActiveView] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("departure");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Filter Bar */}
      <FilterBar />

      {/* Results Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">New York City → Boston</h1>
              <p className="text-muted-foreground">
                January 15, 2024 • {mockTrips.length} trips found
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Earliest departure</SelectItem>
                  <SelectItem value="price">Lowest price</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="distance">Shortest distance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex h-[calc(100vh-200px)]">
        {/* Left Panel - Trip List */}
        <div className="w-1/2 overflow-y-auto border-r">
          <div className="p-4 space-y-4">
            {mockTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isSelected={selectedTrip === trip.id}
                onSelect={() => setSelectedTrip(trip.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2">
          <MapView
            trips={mockTrips}
            selectedTripId={selectedTrip}
            onTripSelect={setSelectedTrip}
          />
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as "list" | "map")}
        >
          <div className="sticky top-16 z-40 bg-background border-b">
            <div className="container mx-auto px-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="list"
                  className="flex items-center space-x-2"
                >
                  <List className="h-4 w-4" />
                  <span>List</span>
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="flex items-center space-x-2"
                >
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="list" className="mt-0">
            <div className="p-4 space-y-4 pb-20">
              {mockTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[calc(100vh-200px)]">
              <MapView
                trips={mockTrips}
                selectedTripId={selectedTrip}
                onTripSelect={setSelectedTrip}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
