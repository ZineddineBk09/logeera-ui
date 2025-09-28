'use client';

import { Star, Shield, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import useSWR from 'swr';
import { swrKeys } from '@/lib/swr-config';
import { api } from '@/lib/api';

interface TrustedDriver {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  completedTrips: number;
  recentRoute: string | null;
  vehicleType: string | null;
  trusted: boolean;
}

function DriverCardSkeleton() {
  return (
    <Card className="group bg-card/50 rounded-3xl border-1 border-gray-200 transition-all duration-300 hover:shadow-lg dark:border-gray-700">
      <CardContent className="flex flex-col items-center space-y-4 p-6">
        <div className="flex w-full justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </CardContent>
    </Card>
  );
}

export function TrustedPublishers() {
  // Fetch trusted drivers using SWR
  const { data, error, isLoading } = useSWR(
    swrKeys.drivers.trusted('3'),
    async () => {
      const response = await api('/api/drivers/trusted?limit=3');

      if (!response.ok) {
        throw new Error('Failed to fetch trusted drivers');
      }

      const result = await response.json();
      return result.drivers;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      onError: (err) => {
        console.error('Error fetching trusted drivers:', err);
      },
    },
  );

  const drivers = data || [];
  const loading = isLoading;
  const errorMessage = error?.message;

  const getVehicleDisplayName = (vehicleType: string | null) => {
    if (!vehicleType) return 'Vehicle';

    const vehicleMap: { [key: string]: string } = {
      CAR: 'Car',
      VAN: 'Van',
      TRUCK: 'Truck',
      BIKE: 'Motorcycle',
    };

    return vehicleMap[vehicleType] || vehicleType;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (errorMessage || drivers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-12">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold text-balance md:text-4xl">
          Trusted by Thousands
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance">
          Join our community of verified drivers and passengers who prioritize
          safety and reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <DriverCardSkeleton key={index} />
          ))
        ) : errorMessage ? (
          // Error state
          <div className="col-span-full py-8 text-center">
            <p className="text-muted-foreground">
              {errorMessage}. Please try again later.
            </p>
          </div>
        ) : drivers.length === 0 ? (
          // Empty state
          <div className="col-span-full py-8 text-center">
            <p className="text-muted-foreground">
              No trusted drivers found. Check back soon!
            </p>
          </div>
        ) : (
          // Actual drivers
          drivers.map((driver: TrustedDriver) => (
            <Card
              key={driver.id}
              className="group bg-card/50 rounded-3xl border-1 border-gray-200 transition-all duration-300 hover:shadow-lg dark:border-gray-700"
            >
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="flex w-full justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt={driver.name} />
                      <AvatarFallback>
                        {driver.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{driver.name}</h3>
                        {driver.trusted && (
                          <Badge
                            variant="secondary"
                            className="bg-opacity-50 rounded-full text-xs"
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{driver.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{driver.completedTrips} trips</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  {driver.recentRoute && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Popular Route
                      </span>
                      <span className="font-medium">{driver.recentRoute}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vehicle</span>
                    <div className="flex items-center space-x-1">
                      <Car className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">
                        {getVehicleDisplayName(driver.vehicleType)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/drivers/${driver.id}`}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 mx-auto w-32 rounded-full px-4 py-2 text-center text-sm font-medium transition-colors"
                >
                  View Profile
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-center">
        <Link href="/drivers">
          <Button size="lg" variant="outline">
            View All Trusted Drivers
          </Button>
        </Link>
      </div>
    </section>
  );
}
