'use client';

import Link from 'next/link';
import { MapPin, Clock, Car, Users, Star, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: {
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    vehicleType: 'CAR' | 'VAN' | 'TRUCK' | 'BIKE';
    capacity: number;
    bookedSeats?: number;
    pricePerSeat?: number;
    status: string;
    publisher: {
      id: string;
      name: string;
      email: string;
      averageRating?: number;
      ratingCount?: number;
    };
  };
  isSelected?: boolean;
  onSelect?: () => void;
}

const vehicleIcons = {
  CAR: Car,
  VAN: Car,
  TRUCK: Car,
  BIKE: Car,
};

export function TripCard({ trip, isSelected, onSelect }: TripCardProps) {
  const VehicleIcon =
    vehicleIcons[trip.vehicleType as keyof typeof vehicleIcons] || Car;
  const departureTime = new Date(trip.departureAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Card
        className={cn(
          'bg-card/80 cursor-pointer border-0 transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-primary shadow-lg ring-2',
        )}
        onClick={onSelect}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Route and Time */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <span>{trip.originName}</span>
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <span>{trip.destinationName}</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{departureTime}</span>
                  </div>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {trip.vehicleType}
                  </Badge>
                  <span>•</span>
                  <span>{trip.capacity} seats</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-sm">
                  {trip.status}
                </Badge>
              </div>
            </div>

            {/* Publisher Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href={`/drivers/${trip.publisher.id}`}
                  className="flex items-center space-x-3 transition-opacity hover:opacity-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={trip.publisher.name}
                    />
                    <AvatarFallback>
                      {trip.publisher.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="hover:text-primary font-medium transition-colors">
                        {trip.publisher.name}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {trip.publisher.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                      {trip.publisher.ratingCount && (
                        <span>({trip.publisher.ratingCount})</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <VehicleIcon className="h-4 w-4" />
                  <span>{trip.vehicleType}</span>
                </div>
                <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{trip.capacity} seats</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Link href={`/trips/${trip.id}`}>
                <Button className="w-full" size="lg">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
