'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Map, List, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TripCard } from '@/components/trip-card';
import { MapView } from '@/components/map-view';
import { FilterBar, type FilterState } from '@/components/filter-bar';
import { Button } from '@/components/ui/button';
import { TripsService } from '@/lib/services';
import { GooglePlacesService } from '@/lib/services/google-places';
import { toast } from 'sonner';
import useSWR from 'swr';
import { swrKeys } from '@/lib/swr-config';

export function TripsResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState('departure');
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    date: '',
    vehicleType: 'any',
    capacity: 'any',
    trustedOnly: false,
    maxPrice: '',
    startLocation: '',
    endLocation: '',
    startPlace: null,
    endPlace: null,
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
      maxPrice: '',
      startLocation: origin,
      endLocation: destination,
      startPlace: null,
      endPlace: null,
    });
  }, [searchParams]);

  // Fetch driver name when filtering by driver
  useEffect(() => {
    const driverId =
      searchParams?.get('driver') || searchParams?.get('publisherId');
    if (driverId) {
      fetch(`/api/users/${driverId}/public`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setDriverName(data.user.name);
          }
        })
        .catch((err) => {
          console.error('Error fetching driver name:', err);
          setDriverName(null);
        });
    } else {
      setDriverName(null);
    }
  }, [searchParams]);

  // Helper functions for search context
  const getSearchTitle = () => {
    const origin = searchParams?.get('origin');
    const destination = searchParams?.get('destination');

    if (origin && destination) {
      return `${origin} → ${destination}`;
    } else if (origin) {
      return `Trips from ${origin}`;
    } else if (destination) {
      return `Trips to ${destination}`;
    }
    return 'Available Trips';
  };

  const getSearchDescription = () => {
    const searchMode = searchMetadata?.searchMode;
    const searchLevel = searchMetadata?.searchLevel;
    const isBroadSearch = searchMetadata?.isBroadSearch;

    if (searchMode === 'proximity') {
      switch (searchLevel) {
        case 'exact':
          return ' • Showing exact matches within 10km';
        case 'close':
          return ' • Showing close matches within 25km';
        case 'nearby':
          return ' • Showing nearby trips within 50km';
        case 'regional':
          return ' • Showing regional trips within 100km';
        case 'broad':
          return ' • Showing trips within 200km radius';
        case 'extended':
          return ' • Showing trips within 500km radius';
        default:
          return ' • Proximity-based search results';
      }
    } else if (searchMode === 'text') {
      return ' • Text-based search results';
    } else if (searchMode === 'fallback') {
      return ' • Showing available trips (no specific matches found)';
    } else if (searchMode === 'browse') {
      return ' • Browsing all available trips';
    }
    return '';
  };

  // Build query parameters for SWR
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};

    // Text-based search
    if (filters.startLocation || filters.endLocation) {
      params.q = [filters.startLocation, filters.endLocation]
        .filter(Boolean)
        .join(' ');
    }

    // Date filter
    if (filters.date) params.departureDate = filters.date;

    // Vehicle type filter
    if (filters.vehicleType !== 'any') params.vehicleType = filters.vehicleType;

    // Capacity filter
    if (filters.capacity !== 'any') params.capacity = filters.capacity;

    // Driver filter
    const driverId =
      searchParams?.get('driver') || searchParams?.get('publisherId');
    if (driverId) {
      params.driver = driverId;
    }

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
  const {
    data: tripsData,
    error,
    isLoading,
  } = useSWR(
    swrKeys.trips.list(queryParams),
    () =>
      TripsService.list(queryParams).then(async (r) => {
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
    },
  );

  // Handle both old and new API response formats
  const trips = useMemo(() => tripsData?.trips || tripsData || [], [tripsData]);
  const searchMetadata = useMemo(() => tripsData?.metadata || {}, [tripsData]);
  const pageSize = useMemo(() => 5, []);

  const sortedTrips = useMemo(() => {
    const copy = [...trips];
    if (sortBy === 'departure') {
      copy.sort(
        (a, b) =>
          new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime(),
      );
    }
    if (sortBy === 'rating') {
      copy.sort(
        (a, b) =>
          (b.publisher.averageRating || 0) - (a.publisher.averageRating || 0),
      );
    }
    if (sortBy === 'capacity') {
      copy.sort((a, b) => b.capacity - a.capacity);
    }
    return copy;
  }, [trips, sortBy]);

  const visibleTrips = useMemo(
    () => sortedTrips.slice(0, page * pageSize),
    [sortedTrips, page],
  );

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    // Clear the URL search params
    router.push('/trips');
  };

  // Handle filter changes and update URL
  const handleFilterChange = async (newFilters: FilterState) => {
    setFilters(newFilters);

    // Update URL with new filter values
    const params = new URLSearchParams();

    if (newFilters.startLocation)
      params.set('origin', newFilters.startLocation);
    if (newFilters.endLocation)
      params.set('destination', newFilters.endLocation);
    if (newFilters.date) params.set('date', newFilters.date);
    if (newFilters.vehicleType && newFilters.vehicleType !== 'any')
      params.set('vehicleType', newFilters.vehicleType);
    if (newFilters.capacity && newFilters.capacity !== 'any')
      params.set('capacity', newFilters.capacity);

    // Add coordinates if places are selected
    try {
      if (newFilters.startPlace) {
        const coords = await GooglePlacesService.getPlaceDetails(
          newFilters.startPlace.place_id,
        );
        if (coords) {
          params.set('originLat', coords.lat.toString());
          params.set('originLng', coords.lng.toString());
          params.set('originPlaceId', newFilters.startPlace.place_id);
        }
      }

      if (newFilters.endPlace) {
        const coords = await GooglePlacesService.getPlaceDetails(
          newFilters.endPlace.place_id,
        );
        if (coords) {
          params.set('destinationLat', coords.lat.toString());
          params.set('destinationLng', coords.lng.toString());
          params.set('destinationPlaceId', newFilters.endPlace.place_id);
        }
      }
    } catch (error) {
      console.error('Error getting place coordinates:', error);
    }

    // Preserve existing coordinate data if no new places selected
    if (!newFilters.startPlace) {
      const originLat = searchParams?.get('originLat');
      const originLng = searchParams?.get('originLng');
      if (originLat && originLng) {
        params.set('originLat', originLat);
        params.set('originLng', originLng);
      }
    }
    if (!newFilters.endPlace) {
      const destinationLat = searchParams?.get('destinationLat');
      const destinationLng = searchParams?.get('destinationLng');
      if (destinationLat && destinationLng) {
        params.set('destinationLat', destinationLat);
        params.set('destinationLng', destinationLng);
      }
    }

    const newUrl = params.toString() ? `/trips?${params.toString()}` : '/trips';
    router.push(newUrl);
  };

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Filter Bar */}
      <FilterBar
        value={filters}
        onChange={handleFilterChange}
        onApply={handleFilterChange}
        onClearAll={handleClearAllFilters}
      />

      {/* Results Header */}
      <div className="bg-card/50 w-full border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {driverName ? `Trips by ${driverName}` : getSearchTitle()}
              </h1>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `${sortedTrips.length} trips found`}
                {getSearchDescription()}
                {driverName && !isLoading && (
                  <span className="ml-2">
                    •{' '}
                    <button
                      onClick={handleClearAllFilters}
                      className="text-primary hover:underline"
                    >
                      View all trips
                    </button>
                  </span>
                )}
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
      <div className="hidden h-[calc(100vh-200px)] w-full lg:flex">
        {/* Left Panel - Trip List */}
        <div className="w-1/2 overflow-y-auto border-r">
          <div className="space-y-4 p-4">
            {visibleTrips.length === 0 && !isLoading ? (
              <div className="space-y-4 py-12 text-center">
                <div className="text-muted-foreground">
                  <MapPin className="mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No trips found</h3>
                  <p className="mb-4 text-sm">
                    {searchMetadata?.searchMode === 'fallback'
                      ? "No trips match your exact criteria, but we're showing available trips."
                      : searchMetadata?.isBroadSearch
                      ? "We searched within 500km but couldn't find matching trips."
                      : 'Try adjusting your search criteria or expanding the search area.'}
                  </p>
                  <div className="space-y-2 text-xs">
                    <p>• Try different dates or locations</p>
                    <p>• Remove some filters</p>
                    <p>• Consider nearby cities</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                  className="mt-4"
                >
                  Browse All Trips
                </Button>
              </div>
            ) : (
              visibleTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isSelected={selectedTrip === trip.id}
                  onSelect={() => setSelectedTrip(trip.id)}
                />
              ))
            )}
            <div className="pt-2">
              {visibleTrips.length < sortedTrips.length ? (
                <button
                  className="text-primary w-full py-2 text-sm hover:underline"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load more
                </button>
              ) : (
                <div className="text-muted-foreground py-2 text-center text-xs">
                  No more results
                </div>
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
          onValueChange={(value) => setActiveView(value as 'list' | 'map')}
        >
          <div className="bg-background sticky top-16 z-40 border-b">
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
            <div className="space-y-4 p-4 pb-20">
              {visibleTrips.length === 0 && !isLoading ? (
                <div className="space-y-4 py-12 text-center">
                  <div className="text-muted-foreground">
                    <MapPin className="mx-auto mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No trips found
                    </h3>
                    <p className="mb-4 text-sm">
                      {searchMetadata?.searchMode === 'fallback'
                        ? "No trips match your exact criteria, but we're showing available trips."
                        : searchMetadata?.isBroadSearch
                        ? "We searched within 500km but couldn't find matching trips."
                        : 'Try adjusting your search criteria or expanding the search area.'}
                    </p>
                    <div className="space-y-2 text-xs">
                      <p>• Try different dates or locations</p>
                      <p>• Remove some filters</p>
                      <p>• Consider nearby cities</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleClearAllFilters}
                    className="mt-4"
                  >
                    Browse All Trips
                  </Button>
                </div>
              ) : (
                visibleTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))
              )}
              <div className="pt-2">
                {visibleTrips.length < sortedTrips.length ? (
                  <button
                    className="text-primary w-full py-2 text-sm hover:underline"
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Load more
                  </button>
                ) : (
                  <div className="text-muted-foreground py-2 text-center text-xs">
                    No more results
                  </div>
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
