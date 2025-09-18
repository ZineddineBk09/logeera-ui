'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  Shield,
  Car,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Driver {
  id: string;
  name: string;
  rating: number;
  ratingCount: number;
  completedTrips: number;
  recentRoutes: string[];
  vehicleTypes: string[];
  trusted: boolean;
}

interface DriversResponse {
  drivers: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function DriverCardSkeleton() {
  return (
    <Card className="group bg-card/50 rounded-2xl border transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DriversListing() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (search) params.append('search', search);
      if (minRating) params.append('minRating', minRating);
      if (vehicleType) params.append('vehicleType', vehicleType);

      const response = await api(`/api/drivers?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }

      const data: DriversResponse = await response.json();
      setDrivers(data.drivers);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search, minRating, vehicleType]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const valueFilter = value === 'any' ? '' : value;
    if (filterType === 'minRating') {
      setMinRating(valueFilter);
    } else if (filterType === 'vehicleType') {
      setVehicleType(valueFilter);
    }
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearch('');
    setMinRating('');
    setVehicleType('');
    setPage(1);
  };

  const getVehicleDisplayName = (vehicleType: string) => {
    const vehicleMap: { [key: string]: string } = {
      CAR: 'Car',
      VAN: 'Van',
      TRUCK: 'Truck',
      BIKE: 'Motorcycle',
    };

    return vehicleMap[vehicleType] || vehicleType;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Trusted Drivers</h1>
        <p className="text-muted-foreground text-lg">
          Connect with verified drivers who prioritize safety and reliability.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search drivers by name or email..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select
                value={minRating}
                onValueChange={(value) =>
                  handleFilterChange('minRating', value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Minimum Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={vehicleType}
                onValueChange={(value) =>
                  handleFilterChange('vehicleType', value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Vehicle</SelectItem>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="BIKE">Motorcycle</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {drivers.length} of {total} drivers
          </p>
        </div>
      )}

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <DriverCardSkeleton key={index} />
          ))
        ) : error ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground text-lg">{error}</p>
            <Button onClick={fetchDrivers} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : drivers.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground text-lg">
              No drivers found matching your criteria.
            </p>
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          drivers.map((driver) => (
            <Card
              key={driver.id}
              className="group bg-card/50 rounded-2xl border transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" alt={driver.name} />
                    <AvatarFallback className="text-lg">
                      {driver.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{driver.name}</h3>
                        {driver.trusted && (
                          <Badge
                            variant="secondary"
                            className="rounded-full text-xs"
                          >
                            <Shield className="mr-1 h-3 w-3" />
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{driver.rating.toFixed(1)}</span>
                        <span>({driver.ratingCount} reviews)</span>
                        <span>•</span>
                        <span>{driver.completedTrips} completed trips</span>
                      </div>
                    </div>

                    {driver.recentRoutes.length > 0 && (
                      <div>
                        <p className="text-muted-foreground mb-1 text-sm">
                          Recent Routes:
                        </p>
                        <div className="space-y-1">
                          {driver.recentRoutes
                            .slice(0, 2)
                            .map((route: string, index: number) => (
                              <p key={index} className="text-sm font-medium">
                                {route}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}

                    {driver.vehicleTypes.length > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Car className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">Vehicles:</span>
                        <span className="font-medium">
                          {driver.vehicleTypes
                            .map((type: string) => getVehicleDisplayName(type))
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    <Link href={`/drivers/${driver.id}`}>
                      <Button size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
