"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { FilterBar, type FilterState } from "@/components/filter-bar";
import { TripsService } from "@/lib/services";
import { toast } from "sonner";
import useSWR from "swr";
import { swrKeys } from "@/lib/swr-config";


export function TripsResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeView, setActiveView] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState("departure");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    date: "",
    vehicleType: "any",
    capacity: "any",
    trustedOnly: false,
    maxPrice: "",
    startLocation: "",
    endLocation: "",
  });

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

  // Build query parameters for SWR
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    
    // Text-based search
    if (filters.startLocation || filters.endLocation) {
      params.q = [filters.startLocation, filters.endLocation].filter(Boolean).join(" ");
    }
    
    // Date filter
    if (filters.date) params.departureDate = filters.date;
    
    // Vehicle type filter
    if (filters.vehicleType !== "any") params.vehicleType = filters.vehicleType;
    
    // Capacity filter
    if (filters.capacity !== "any") params.capacity = filters.capacity;
    
    // Coordinate-based search (for better geospatial queries)
    const originLat = searchParams?.get('originLat');
    const originLng = searchParams?.get('originLng');
    const destinationLat = searchParams?.get('destinationLat');
    const destinationLng = searchParams?.get('destinationLng');
    
    if (originLat && originLng) {
      params.originLat = originLat;
      params.originLng = originLng;
    }
    
    if (destinationLat && destinationLng) {
      params.destinationLat = destinationLat;
      params.destinationLng = destinationLng;
    }
    
    return params;
  }, [filters, searchParams]);

  // Use SWR to fetch trips
  const { data: trips = [], error, isLoading } = useSWR(
    swrKeys.trips.list(queryParams),
    () => TripsService.list(queryParams).then(async (r) => {
      if (r.ok) {
        return await r.json();
      }
      throw new Error('Failed to load trips');
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      onError: (error) => {
        console.error('Trips fetch error:', error);
        toast.error('Failed to load trips');
      },
    }
  );
  const pageSize = 5;

  const sortedTrips = useMemo(() => {
    const copy = [...trips];
    if (sortBy === "departure") {
      copy.sort((a, b) => new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime());
    }
    if (sortBy === "rating") {
      copy.sort((a, b) => (b.publisher.averageRating || 0) - (a.publisher.averageRating || 0));
    }
    if (sortBy === "capacity") {
      copy.sort((a, b) => b.capacity - a.capacity);
    }
    return copy;
  }, [trips, sortBy]);

  const visibleTrips = useMemo(() => sortedTrips.slice(0, page * pageSize), [sortedTrips, page]);

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    // Clear the URL search params
    router.push('/trips');
  };

  // Handle filter changes and update URL
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Update URL with new filter values
    const params = new URLSearchParams();
    
    if (newFilters.startLocation) params.set('origin', newFilters.startLocation);
    if (newFilters.endLocation) params.set('destination', newFilters.endLocation);
    if (newFilters.date) params.set('date', newFilters.date);
    if (newFilters.vehicleType && newFilters.vehicleType !== 'any') params.set('vehicleType', newFilters.vehicleType);
    if (newFilters.capacity && newFilters.capacity !== 'any') params.set('capacity', newFilters.capacity);
    
    // Preserve coordinate data if available
    const originLat = searchParams?.get('originLat');
    const originLng = searchParams?.get('originLng');
    const destinationLat = searchParams?.get('destinationLat');
    const destinationLng = searchParams?.get('destinationLng');
    
    if (originLat) params.set('originLat', originLat);
    if (originLng) params.set('originLng', originLng);
    if (destinationLat) params.set('destinationLat', destinationLat);
    if (destinationLng) params.set('destinationLng', destinationLng);
    
    const newUrl = params.toString() ? `/trips?${params.toString()}` : '/trips';
    router.push(newUrl);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Filter Bar */}
      <FilterBar 
        value={filters} 
        onChange={handleFilterChange} 
        onApply={handleFilterChange}
        onClearAll={handleClearAllFilters}
      />

      {/* Results Header */}
      <div className="w-full border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Trips</h1>
              <p className="text-muted-foreground">
                {isLoading ? "Loading..." : `${sortedTrips.length} trips found`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="departure">Earliest departure</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="capacity">Most seats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:flex h-[calc(100vh-200px)] w-full">
        {/* Left Panel - Trip List */}
        <div className="w-1/2 overflow-y-auto border-r">
          <div className="p-4 space-y-4">
            {visibleTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isSelected={selectedTrip === trip.id}
                onSelect={() => setSelectedTrip(trip.id)}
              />
            ))}
            <div className="pt-2">
              {visibleTrips.length < sortedTrips.length ? (
                <button
                  className="w-full text-sm text-primary hover:underline py-2"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load more
                </button>
              ) : (
                <div className="text-center text-xs text-muted-foreground py-2">No more results</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-1/2">
          <MapView
            trips={trips}
            selectedTripId={selectedTrip}
            onTripSelect={setSelectedTrip}
            originLat={searchParams?.get('originLat')}
            originLng={searchParams?.get('originLng')}
            destinationLat={searchParams?.get('destinationLat')}
            destinationLng={searchParams?.get('destinationLng')}
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
              {visibleTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
              <div className="pt-2">
                {visibleTrips.length < sortedTrips.length ? (
                  <button
                    className="w-full text-sm text-primary hover:underline py-2"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load more
                  </button>
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-2">No more results</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            <div className="h-[calc(100vh-200px)]">
              <MapView
                trips={trips}
                selectedTripId={selectedTrip}
                onTripSelect={setSelectedTrip}
                originLat={searchParams?.get('originLat')}
                originLng={searchParams?.get('originLng')}
                destinationLat={searchParams?.get('destinationLat')}
                destinationLng={searchParams?.get('destinationLng')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
