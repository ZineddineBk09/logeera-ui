"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, Car, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SearchHero() {
  const router = useRouter()
  const [searchData, setSearchData] = useState({
    origin: "",
    destination: "",
    date: "",
    vehicleType: "",
    capacity: "",
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchData.origin) params.set("origin", searchData.origin)
    if (searchData.destination) params.set("destination", searchData.destination)
    if (searchData.date) params.set("date", searchData.date)
    if (searchData.vehicleType) params.set("vehicleType", searchData.vehicleType)
    if (searchData.capacity) params.set("capacity", searchData.capacity)

    router.push(`/trips?${params.toString()}`)
  }

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-3xl" />

      <div className="relative z-10 text-center space-y-8 py-16">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            Your Journey Starts Here
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Find Your Perfect
            <span className="text-primary"> Ride</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Connect with trusted drivers and travelers. Share rides, split costs, and travel sustainably.
          </p>
        </div>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-card/80 backdrop-blur">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Origin */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Origin city"
                    className="pl-10 h-12"
                    value={searchData.origin}
                    onChange={(e) => setSearchData((prev) => ({ ...prev, origin: e.target.value }))}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Destination city"
                    className="pl-10 h-12"
                    value={searchData.destination}
                    onChange={(e) => setSearchData((prev) => ({ ...prev, destination: e.target.value }))}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-10 h-12"
                    value={searchData.date}
                    onChange={(e) => setSearchData((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                <Select
                  value={searchData.vehicleType}
                  onValueChange={(value) => setSearchData((prev) => ({ ...prev, vehicleType: value }))}
                >
                  <SelectTrigger className="h-12">
                    <div className="flex items-center">
                      <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Any vehicle" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="bike">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground opacity-0">Search</label>
                <Button size="lg" className="w-full h-12 text-base font-semibold" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Rides
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4 sm:mb-0">Can't find what you're looking for?</p>
              <Button variant="outline" size="lg">
                <Car className="mr-2 h-4 w-4" />
                Publish Your Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
