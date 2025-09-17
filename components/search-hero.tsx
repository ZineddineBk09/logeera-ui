'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Car, Search, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import {
  GooglePlacesService,
  PlacePrediction,
} from '@/lib/services/google-places';
import { toast } from 'sonner';

export function SearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    date: '',
    vehicleType: '',
    capacity: '',
  });

  const [placeData, setPlaceData] = useState({
    originPlace: null as PlacePrediction | null,
    destinationPlace: null as PlacePrediction | null,
  });

  // Initialize search data from URL params
  useEffect(() => {
    if (!searchParams) return;

    const origin = searchParams.get('origin') || '';
    const destination = searchParams.get('destination') || '';
    const date = searchParams.get('date') || '';
    const vehicleType = searchParams.get('vehicleType') || '';
    const capacity = searchParams.get('capacity') || '';

    setSearchData({
      origin,
      destination,
      date,
      vehicleType,
      capacity,
    });

    // Restore place data from URL if available
    const originPlaceId = searchParams.get('originPlaceId');
    const destinationPlaceId = searchParams.get('destinationPlaceId');

    if (originPlaceId && origin) {
      // Create a mock place object from the stored data
      const originPlace: PlacePrediction = {
        place_id: originPlaceId,
        description: origin,
        structured_formatting: {
          main_text: origin.split(',')[0] || origin,
          secondary_text: origin.split(',').slice(1).join(',').trim() || '',
        },
        types: ['geocode'],
      };
      setPlaceData((prev) => ({ ...prev, originPlace }));
    }

    if (destinationPlaceId && destination) {
      // Create a mock place object from the stored data
      const destinationPlace: PlacePrediction = {
        place_id: destinationPlaceId,
        description: destination,
        structured_formatting: {
          main_text: destination.split(',')[0] || destination,
          secondary_text:
            destination.split(',').slice(1).join(',').trim() || '',
        },
        types: ['geocode'],
      };
      setPlaceData((prev) => ({ ...prev, destinationPlace }));
    }
  }, []);

  // Update URL when search data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      let hasChanges = false;

      // Update URL params with current search data
      if (searchData.origin !== (currentParams.get('origin') || '')) {
        if (searchData.origin) {
          currentParams.set('origin', searchData.origin);
        } else {
          currentParams.delete('origin');
        }
        hasChanges = true;
      }

      if (searchData.destination !== (currentParams.get('destination') || '')) {
        if (searchData.destination) {
          currentParams.set('destination', searchData.destination);
        } else {
          currentParams.delete('destination');
        }
        hasChanges = true;
      }

      if (searchData.date !== (currentParams.get('date') || '')) {
        if (searchData.date) {
          currentParams.set('date', searchData.date);
        } else {
          currentParams.delete('date');
        }
        hasChanges = true;
      }

      if (searchData.vehicleType !== (currentParams.get('vehicleType') || '')) {
        if (searchData.vehicleType) {
          currentParams.set('vehicleType', searchData.vehicleType);
        } else {
          currentParams.delete('vehicleType');
        }
        hasChanges = true;
      }

      if (searchData.capacity !== (currentParams.get('capacity') || '')) {
        if (searchData.capacity) {
          currentParams.set('capacity', searchData.capacity);
        } else {
          currentParams.delete('capacity');
        }
        hasChanges = true;
      }

      // Update URL if there are changes
      if (hasChanges) {
        const newUrl = `${window.location.pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ''}`;
        window.history.replaceState({}, '', newUrl);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [searchData]);

  const handleSearch = async () => {
    const params = new URLSearchParams();

    // Add text-based search params
    if (searchData.origin) params.set('origin', searchData.origin);
    if (searchData.destination)
      params.set('destination', searchData.destination);
    if (searchData.date) params.set('date', searchData.date);
    if (searchData.vehicleType)
      params.set('vehicleType', searchData.vehicleType);
    if (searchData.capacity) params.set('capacity', searchData.capacity);

    // Add coordinates if available
    if (placeData.originPlace) {
      const originCoords = await GooglePlacesService.getPlaceDetails(
        placeData.originPlace.place_id,
      );
      if (originCoords) {
        params.set('originLat', originCoords.lat.toString());
        params.set('originLng', originCoords.lng.toString());
      }
    }

    if (placeData.destinationPlace) {
      const destinationCoords = await GooglePlacesService.getPlaceDetails(
        placeData.destinationPlace.place_id,
      );
      if (destinationCoords) {
        params.set('destinationLat', destinationCoords.lat.toString());
        params.set('destinationLng', destinationCoords.lng.toString());
      }
    }

    router.push(`/trips?${params.toString()}`);
  };

  const handleOriginPlaceSelect = (place: PlacePrediction) => {
    setPlaceData((prev) => ({ ...prev, originPlace: place }));

    // Update URL with place ID for better persistence
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('originPlaceId', place.place_id);
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleDestinationPlaceSelect = (place: PlacePrediction) => {
    setPlaceData((prev) => ({ ...prev, destinationPlace: place }));

    // Update URL with place ID for better persistence
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('destinationPlaceId', place.place_id);
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleShareSearch = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast.success('Search link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="from-primary/5 via-background to-accent/5 absolute inset-0 rounded-4xl bg-gradient-to-br" />

      <div className="relative z-10 space-y-8 py-16 text-center">
        <div className="space-y-4">
          <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
            Your Journey Starts Here
          </Badge>
          <h1 className="text-4xl font-bold text-balance md:text-6xl">
            Find Your Perfect
            <span className="text-primary"> Ride</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl text-balance">
            Connect with trusted drivers and travelers. Share rides, split
            costs, and travel sustainably.
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-card/80 mx-auto max-w-4xl rounded-3xl border-1 border-gray-200 shadow-lg backdrop-blur dark:border-gray-700">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Origin */}
              <div className="flex flex-col items-start gap-2">
                <label className="text-muted-foreground text-sm font-medium">
                  From
                </label>
                <AutocompleteInput
                  placeholder="Origin city"
                  value={searchData.origin}
                  onChange={(value) =>
                    setSearchData((prev) => ({
                      ...prev,
                      origin: value,
                    }))
                  }
                  onPlaceSelect={handleOriginPlaceSelect}
                  className="h-10 rounded-full border-1 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Destination */}
              <div className="flex flex-col items-start gap-2">
                <label className="text-muted-foreground text-sm font-medium">
                  To
                </label>
                <AutocompleteInput
                  placeholder="Destination city"
                  value={searchData.destination}
                  onChange={(value) =>
                    setSearchData((prev) => ({
                      ...prev,
                      destination: value,
                    }))
                  }
                  onPlaceSelect={handleDestinationPlaceSelect}
                  className="h-10 rounded-full border-1 border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col items-start gap-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Date
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    className="h-10 rounded-full border-1 border-gray-200 pl-4 dark:border-gray-700"
                    value={searchData.date}
                    onChange={(e) =>
                      setSearchData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              {/* <div className="flex flex-col gap-2 items-start">
                <label className="text-sm font-medium text-muted-foreground">
                  Vehicle
                </label>
                <Select
                  value={searchData.vehicleType}
                  onValueChange={(value) =>
                    setSearchData((prev) => ({ ...prev, vehicleType: value }))
                  }
                  
                >
                  <SelectTrigger className="h-10 rounded-full border-1 border-gray-200">
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
 dark:border-gray-700              </div> */}

              {/* Search Button */}
              <div className="flex flex-col items-start gap-2">
                <label className="text-muted-foreground text-sm font-medium opacity-0">
                  Search
                </label>
                <Button
                  size="lg"
                  className="h-10 w-full rounded-full text-base font-semibold"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Rides
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-between border-t pt-6 sm:flex-row">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
                <p className="text-muted-foreground text-sm">
                  Can't find what you're looking for?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareSearch}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Search
                </Button>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/publish');
                }}
              >
                <Car className="mr-2 h-4 w-4" />
                Publish Your Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
