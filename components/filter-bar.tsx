"use client";

import { useState } from "react";
import {
  X,
  SlidersHorizontal,
  Calendar,
  Car,
  Users,
  Shield,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FilterState {
  date: string;
  vehicleType: string;
  capacity: string;
  trustedOnly: boolean;
  maxPrice: string;
  startLocation: string;
  endLocation: string;
}

export function FilterBar() {
  const [filters, setFilters] = useState<FilterState>({
    date: "2024-01-15",
    vehicleType: "any",
    capacity: "any",
    trustedOnly: false,
    maxPrice: "",
    startLocation: "",
    endLocation: "",
  });

  const activeFilters = [
    { key: "date", label: "Jan 15, 2024", removable: false },
    { key: "route", label: "NYC → Boston", removable: false },
    ...(filters.vehicleType !== "any"
      ? [{ key: "vehicleType", label: filters.vehicleType, removable: true }]
      : []),
    ...(filters.trustedOnly
      ? [{ key: "trusted", label: "Trusted only", removable: true }]
      : []),
    ...(filters.maxPrice
      ? [{ key: "price", label: `Under $${filters.maxPrice}`, removable: true }]
      : []),
    ...(filters.startLocation
      ? [
          {
            key: "startLocation",
            label: `From: ${filters.startLocation}`,
            removable: true,
          },
        ]
      : []),
    ...(filters.endLocation
      ? [
          {
            key: "endLocation",
            label: `To: ${filters.endLocation}`,
            removable: true,
          },
        ]
      : []),
  ];

  const removeFilter = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      ...(key === "vehicleType" && { vehicleType: "any" }),
      ...(key === "trusted" && { trustedOnly: false }),
      ...(key === "price" && { maxPrice: "" }),
      ...(key === "startLocation" && { startLocation: "" }),
      ...(key === "endLocation" && { endLocation: "" }),
    }));
  };

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Active Filters */}
          <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center space-x-1 whitespace-nowrap"
              >
                <span>{filter.label}</span>
                {filter.removable && (
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>

          {/* Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 bg-transparent"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Filter Results</h3>
                </div>

                {/* Start Location Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Start Location</span>
                  </Label>
                  <Input
                    placeholder="Enter start location"
                    value={filters.startLocation}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        startLocation: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Destination Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Destination</span>
                  </Label>
                  <Input
                    placeholder="Enter destination"
                    value={filters.endLocation}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        endLocation: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Date Filter */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Departure Date</span>
                  </Label>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Vehicle Type</span>
                  </Label>
                  <Select
                    value={filters.vehicleType}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, vehicleType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any vehicle</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="bike">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Minimum Seats</span>
                  </Label>
                  <Select
                    value={filters.capacity}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, capacity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any capacity</SelectItem>
                      <SelectItem value="1">1+ seats</SelectItem>
                      <SelectItem value="2">2+ seats</SelectItem>
                      <SelectItem value="3">3+ seats</SelectItem>
                      <SelectItem value="4">4+ seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Price */}
                <div className="space-y-2">
                  <Label>Maximum Price</Label>
                  <Input
                    type="number"
                    placeholder="Enter max price"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Trusted Only */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Trusted drivers only</span>
                  </Label>
                  <Switch
                    checked={filters.trustedOnly}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({ ...prev, trustedOnly: checked }))
                    }
                  />
                </div>

                {/* Apply Button */}
                <Button className="w-full" size="lg">
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
