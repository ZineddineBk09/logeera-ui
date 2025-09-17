"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  X,
  SlidersHorizontal,
  Calendar,
  Car,
  Users,
  Shield,
  MapPin,
  RotateCcw,
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

export interface FilterState {
  date: string;
  vehicleType: string;
  capacity: string;
  trustedOnly: boolean;
  maxPrice: string;
  startLocation: string;
  endLocation: string;
}

export function FilterBar({
  value,
  onChange,
  onApply,
  onClearAll,
}: {
  value?: FilterState;
  onChange?: (v: FilterState) => void;
  onApply?: (v: FilterState) => void;
  onClearAll?: () => void;
}) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(
    value || {
      date: "",
      vehicleType: "any",
      capacity: "any",
      trustedOnly: false,
      maxPrice: "",
      startLocation: "",
      endLocation: "",
    },
  );

  // Initialize filters from URL search params
  useEffect(() => {
    if (!searchParams) return;
    
    const origin = searchParams.get('origin') || '';
    const destination = searchParams.get('destination') || '';
    const date = searchParams.get('date') || '';
    const vehicleType = searchParams.get('vehicleType') || 'any';
    const capacity = searchParams.get('capacity') || 'any';

    setFilters({
      date,
      vehicleType,
      capacity,
      trustedOnly: false,
      maxPrice: "",
      startLocation: origin,
      endLocation: destination,
    });
  }, [searchParams]);

  const set = (updater: (prev: FilterState) => FilterState) => {
    setFilters((prev) => {
      const next = updater(prev);
      onChange?.(next);
      return next;
    });
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to format route
  const formatRoute = (start: string, end: string) => {
    if (!start && !end) return '';
    if (!start) return end;
    if (!end) return start;
    return `${start} → ${end}`;
  };

  const activeFilters = [
    ...(filters.date
      ? [{ key: "date", label: formatDate(filters.date), removable: false }]
      : []),
    ...(formatRoute(filters.startLocation, filters.endLocation)
      ? [{ key: "route", label: formatRoute(filters.startLocation, filters.endLocation), removable: false }]
      : []),
    ...(filters.vehicleType !== "any"
      ? [{ key: "vehicleType", label: filters.vehicleType, removable: true }]
      : []),
    ...(filters.trustedOnly
      ? [{ key: "trusted", label: "Trusted only", removable: true }]
      : []),
    ...(filters.maxPrice
      ? [{ key: "price", label: `Under $${filters.maxPrice}`, removable: true }]
      : []),
    ...(filters.startLocation && !filters.endLocation
      ? [
          {
            key: "startLocation",
            label: `From: ${filters.startLocation}`,
            removable: true,
          },
        ]
      : []),
    ...(filters.endLocation && !filters.startLocation
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
    set((prev) => ({
      ...prev,
      ...(key === "vehicleType" && { vehicleType: "any" }),
      ...(key === "trusted" && { trustedOnly: false }),
      ...(key === "price" && { maxPrice: "" }),
      ...(key === "startLocation" && { startLocation: "" }),
      ...(key === "endLocation" && { endLocation: "" }),
      ...(key === "date" && { date: "" }),
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      date: "",
      vehicleType: "any",
      capacity: "any",
      trustedOnly: false,
      maxPrice: "",
      startLocation: "",
      endLocation: "",
    };
    setFilters(clearedFilters);
    onChange?.(clearedFilters);
    onClearAll?.();
  };

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Active Filters */}
          <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
            {activeFilters.length > 0 ? (
              activeFilters.map((filter) => (
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
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No filters applied</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
            <SheetContent className="p-3">
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
                      set((prev) => ({
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
                      set((prev) => ({
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
                      set((prev) => ({ ...prev, date: e.target.value }))
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
                      set((prev) => ({ ...prev, vehicleType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any vehicle</SelectItem>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="VAN">Van</SelectItem>
                      <SelectItem value="TRUCK">Truck</SelectItem>
                      <SelectItem value="BIKE">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Capacity */}
                <div className="space-y-2 w-full flex-1">
                  <Label className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Minimum Seats</span>
                  </Label>
                  <Select
                    value={filters.capacity}
                    onValueChange={(value) =>
                      set((prev) => ({ ...prev, capacity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="flex-1 w-full">
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
                      set((prev) => ({
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
                      set((prev) => ({ ...prev, trustedOnly: checked }))
                    }
                    // gray bg when disabled
                    className="bg-gray-300 cursor-pointer"
                  />
                </div>

                {/* Apply Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => onApply?.(filters)}
                >
                  Apply Filters
                </Button>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
