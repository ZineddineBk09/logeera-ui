'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  Users,
  Star,
  Shield,
  MessageCircle,
  Calendar,
  Car,
  Loader2,
} from 'lucide-react';
import { UsersService, ChatService } from '@/lib/services';
import { useAuth } from '@/lib/hooks/use-auth';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';
import { toast } from 'sonner';

interface DriverProfileProps {
  driverId: string;
}

interface DriverData {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    type: string;
    status: string;
    role: string;
    averageRating: number | null;
    ratingCount: number | null;
    createdAt: string;
    updatedAt: string;
  };
  trips: Array<{
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    capacity: number;
    vehicleType: string;
    status: string;
  }>;
  ratings: Array<{
    id: string;
    value: number;
    comment: string | null;
    createdAt: string;
    reviewer: {
      id: string;
      name: string;
    };
  }>;
}

export function DriverProfile({ driverId }: DriverProfileProps) {
  const [activeTab, setActiveTab] = useState('trips');
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // Fetch driver data (public endpoint)
  const {
    data: driverData,
    error,
    isLoading,
  } = useSWR(
    ['users', 'public', driverId],
    () =>
      fetch(`/api/users/${driverId}/public`).then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load driver profile');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    },
  );

  const handleMessageDriver = async () => {
    if (!currentUser || !driverData) return;

    try {
      // Create or get chat between current user and driver
      const response = await ChatService.between(
        currentUser.id,
        driverData.user.id,
        true,
      );
      if (response.ok) {
        const chatData = await response.json();
        router.push(`/chats?chatId=${chatData.id}`);
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
            <div>
              <h3 className="text-lg font-semibold">Loading Driver Profile</h3>
              <p className="text-muted-foreground text-sm">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !driverData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4 text-center">
          <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Users className="text-destructive h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Driver Not Found</h3>
            <p className="text-muted-foreground text-sm">
              This driver profile may not exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { user: driver, trips, ratings } = driverData;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Driver Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <Avatar className="mx-auto h-24 w-24 md:mx-0">
              <AvatarImage src="/placeholder.svg" alt={driver?.name} />
              <AvatarFallback className="text-2xl">
                {driver?.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                <h1 className="text-3xl font-bold">{driver?.name}</h1>
                {driver?.status === 'ACTIVE' && (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>

              <div className="mb-4 flex items-center justify-center gap-4 md:justify-start">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {driver?.averageRating
                      ? driver?.averageRating.toFixed(1)
                      : 'No ratings'}
                  </span>
                  <span className="text-muted-foreground">
                    ({driver?.ratingCount || 0} reviews)
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {formatMemberSince(driver?.createdAt)}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                {driver?.phoneNumber} •{' '}
                {driver?.email}
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                {currentUser && currentUser.id !== driver?.id && (
                  <Button
                    className="flex items-center gap-2"
                    onClick={handleMessageDriver}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Message
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => router.push(`/trips?driver=${driver?.id}`)}
                >
                  <Car className="h-4 w-4" />
                  View All Trips
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trips">Active Trips</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-6 space-y-4">
          {trips.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-muted-foreground">
                  <Car className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No Active Trips
                  </h3>
                  <p>
                    This driver doesn't have any active trips at the moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            trips.map((trip: any) => (
              <Card key={trip.id} className="transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span className="font-semibold">
                          {trip.originName} → {trip.destinationName}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatDate(trip.departureAt)} at{' '}
                            {formatTime(trip.departureAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{trip.capacity} seats available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="h-4 w-4" />
                          <span>{trip.vehicleType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          trip.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                      >
                        {trip.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/trips/${trip.id}`)}
                      >
                        View Trip
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-4">
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-muted-foreground">
                  <Star className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <h3 className="mb-2 text-lg font-semibold">No Reviews Yet</h3>
                  <p>This driver hasn't received any reviews yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            ratings.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {review?.reviewerUser?.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.value
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
