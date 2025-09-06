"use client";

import Link from "next/link";
import { MapPin, Clock, Car, Users, Star, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: {
    id: string;
    originName: string;
    destinationName: string;
    dateTime: string;
    vehicleType: string;
    capacity: number;
    availableSeats: number;
    price: number;
    publisher: {
      name: string;
      rating: number;
      avatar: string;
      trusted: boolean;
    };
    duration: string;
    distance: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
}

const vehicleIcons = {
  car: Car,
  van: Car,
  truck: Car,
  bike: Car,
};

export function TripCard({ trip, isSelected, onSelect }: TripCardProps) {
  const VehicleIcon =
    vehicleIcons[trip.vehicleType as keyof typeof vehicleIcons] || Car;
  const departureTime = new Date(trip.dateTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border-0 bg-card/80",
        isSelected && "ring-2 ring-primary shadow-lg",
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
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{trip.destinationName}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{departureTime}</span>
                </div>
                <span>•</span>
                <span>{trip.duration}</span>
                <span>•</span>
                <span>{trip.distance}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ${trip.price}
              </div>
              <div className="text-sm text-muted-foreground">per person</div>
            </div>
          </div>

          {/* Publisher Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href={`/drivers/${trip.id}`}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={trip.publisher.avatar || "/placeholder.svg"}
                    alt={trip.publisher.name}
                  />
                  <AvatarFallback>
                    {trip.publisher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium hover:text-primary transition-colors">
                      {trip.publisher.name}
                    </span>
                    {trip.publisher.trusted && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Trusted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{trip.publisher.rating}</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <VehicleIcon className="h-4 w-4" />
                <span className="capitalize">{trip.vehicleType}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{trip.availableSeats} seats left</span>
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
  );
}
