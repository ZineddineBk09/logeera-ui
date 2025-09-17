'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Car,
  Users,
  Star,
  Shield,
  MessageCircle,
  Phone,
  Share2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ReviewsPreview } from '@/components/reviews-preview';
import { RelatedTrips } from '@/components/related-trips';
import { RequestJoinDialog } from '@/components/request-join-dialog';
import { DetailedMapView } from '@/components/detailed-map-view';
import { TripsService } from '@/lib/services';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ChatService } from '@/lib/services';
import { DistanceMatrixService } from '@/lib/services/distance-matrix';

interface TripDetailsProps {
  tripId: string;
}

export function TripDetails({ tripId }: TripDetailsProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [distanceData, setDistanceData] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Fetch trip data using SWR
  const {
    data: trip,
    error,
    isLoading,
  } = useSWR(
    swrKeys.trips.detail(tripId),
    () =>
      TripsService.get(tripId).then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load trip');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      onError: (error) => {
        console.error('Trip fetch error:', error);
        toast.error('Failed to load trip details');
      },
    },
  );

  // Calculate distance and duration when trip data is available
  useEffect(() => {
    if (trip?.originCoordinates && trip?.destinationCoordinates) {
      const calculateDistanceAndDuration = async () => {
        const result = await DistanceMatrixService.calculateDistanceAndDuration(
          trip.originCoordinates,
          trip.destinationCoordinates
        );
        
        if (result) {
          setDistanceData({
            distance: result.distance.text,
            duration: result.duration.text,
          });
        }
      };

      calculateDistanceAndDuration();
    }
  }, [trip?.originCoordinates, trip?.destinationCoordinates]);

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Clock className="text-primary h-8 w-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Loading Trip Details</h3>
            <p className="text-muted-foreground text-sm">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <Clock className="text-destructive h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Trip Not Found</h3>
            <p className="text-muted-foreground text-sm">
              This trip may have been removed or doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const departureTime = new Date(trip.departureAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate seat progress with accepted and pending requests
  const acceptedSeats = trip.acceptedRequests || 0;
  const pendingSeats = trip.pendingRequests || 0;
  const acceptedProgress = (acceptedSeats / trip.capacity) * 100;
  const pendingProgress = (pendingSeats / trip.capacity) * 100;

  // Use real data from the backend
  const tripData = {
    originAddress: `${trip.originName}`,
    destinationAddress: `${trip.destinationName}`,
    vehicleMake: `${trip.vehicleType} Vehicle`,
    availableSeats: trip.capacity - acceptedSeats, // Real available seats
    price: trip.pricePerSeat, // Real price from database
    duration: distanceData?.duration || 'Calculating...', // Real duration from Google
    distance: distanceData?.distance || 'Calculating...', // Real distance from Google
    description: `Comfortable ride in a clean, well-maintained ${trip.vehicleType.toLowerCase()}. Safe driver with experience. Non-smoking vehicle.`,
    rules: [
      'No smoking',
      'No pets (allergies)',
      'Maximum 1 bag per person',
      'Please be on time',
    ],
    amenities: [
      'Air conditioning',
      'Phone chargers',
      'Water bottles',
      'Music requests welcome',
    ],
    pickupNotes:
      "I'll wait up to 10 minutes at the pickup location. Please be ready!",
    // Use real coordinates from the database
    route: [
      { 
        lat: trip.originCoordinates?.lat || 40.7589, 
        lng: trip.originCoordinates?.lng || -73.9851, 
        name: trip.originName 
      },
      { 
        lat: trip.destinationCoordinates?.lat || 42.3601, 
        lng: trip.destinationCoordinates?.lng || -71.0589, 
        name: trip.destinationName 
      },
    ],
  };

  const handleRequestToJoin = () => {
    if (!isAuthenticated) {
      // Redirect to login with current trip page as redirect URL
      const currentUrl = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    setShowRequestDialog(true);
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      // Redirect to login with current trip page as redirect URL
      const currentUrl = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Check if user is trying to message themselves
    if (user?.id === trip.publisher.id) {
      toast.error('You cannot message yourself');
      return;
    }

    try {
      // Create or get chat with the trip publisher
      const response = await ChatService.between(user!.id, trip.publisher.id);
      if (response.ok) {
        const chatData = await response.json();
        // Navigate to chat page with the chat ID
        router.push(`/chat?chatId=${chatData.id}`);
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleCall = () => {
    if (!isAuthenticated) {
      // Redirect to login with current trip page as redirect URL
      const currentUrl = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Check if user is trying to call themselves
    if (user?.id === trip.publisher.id) {
      toast.error('You cannot call yourself');
      return;
    }

    setShowPhoneDialog(true);
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(trip.publisher.phoneNumber);
      toast.success('Phone number copied to clipboard');
      setShowPhoneDialog(false);
    } catch (error) {
      console.error('Failed to copy phone number:', error);
      toast.error('Failed to copy phone number');
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card/50 border-b">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/trips">Search Results</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Trip Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-2xl font-bold">
                <span>{trip.originName}</span>
                <ArrowLeft className="text-muted-foreground h-6 w-6 rotate-180" />
                <span>{trip.destinationName}</span>
              </div>
              <div className="text-muted-foreground flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{departureTime}</span>
                </div>
                <span>•</span>
                <span>{tripData.duration}</span>
                <span>•</span>
                <span>{tripData.distance}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="text-right">
                <Badge variant="secondary" className="px-3 py-1 text-lg">
                  {trip.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Map */}

            <DetailedMapView
              trip={{
                originName: trip.originName,
                destinationName: trip.destinationName,
                originAddress: tripData.originAddress,
                destinationAddress: tripData.destinationAddress,
                route: tripData.route,
              }}
            />

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-2 font-semibold">Description</h4>
                  <p className="text-muted-foreground">
                    {tripData.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-semibold">Vehicle & Amenities</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Car className="text-muted-foreground h-4 w-4" />
                        <span>{tripData.vehicleMake}</span>
                      </div>
                      {tripData.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div className="bg-primary h-2 w-2 rounded-full" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-semibold">Rules & Requirements</h4>
                    <div className="space-y-2">
                      {tripData.rules.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div className="bg-muted-foreground h-2 w-2 rounded-full" />
                          <span className="text-sm">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-2 font-semibold">Pickup Instructions</h4>
                  <p className="text-muted-foreground text-sm">
                    {tripData.pickupNotes}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Preview */}
            <ReviewsPreview publisherId={trip.publisher.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publisher Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Driver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={trip.publisher.name}
                    />
                    <AvatarFallback>
                      {trip.publisher.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-2">
                      <h3 className="font-semibold">{trip.publisher.name}</h3>
                    </div>
                    <div className="text-muted-foreground mb-2 flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {trip.publisher.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                      <span>•</span>
                      <span>{trip.publisher.ratingCount || 0} reviews</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {trip.publisher.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Vehicle Type</div>
                    <div className="font-medium">{trip.vehicleType}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Capacity</div>
                    <div className="font-medium">{trip.capacity} seats</div>
                  </div>
                </div>

                {/* Only show message and call buttons if user is not the trip publisher */}
                {user?.id !== trip.publisher.id && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                      onClick={handleMessage}
                  >
                      <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                      onClick={handleCall}
                  >
                      <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle>Book This Trip</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Available seats
                  </span>
                  <div className="flex items-center space-x-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">
                      {tripData.availableSeats} of {trip.capacity}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Booking Status</span>
                    <span>
                      {acceptedSeats} confirmed, {pendingSeats} pending
                    </span>
                  </div>
                  
                  {/* Multi-colored progress bar */}
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    {/* Accepted requests (blue) */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${acceptedProgress}%` }}
                    />
                    {/* Pending requests (orange) */}
                    <div 
                      className="absolute top-0 h-full bg-orange-500 transition-all duration-300"
                      style={{ 
                        left: `${acceptedProgress}%`,
                        width: `${pendingProgress}%` 
                      }}
                    />
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Confirmed ({acceptedSeats})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Pending ({pendingSeats})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span>Available ({tripData.availableSeats})</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="outline">{trip.status}</Badge>
                  </div>
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>Vehicle Type</span>
                    <span>{trip.vehicleType}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Departure</span>
                    <span>{departureTime}</span>
                  </div>
                </div>

                {/* Only show request to join button if user is not the trip publisher */}
                {user?.id !== trip.publisher.id ? (
                <Button
                  className="w-full"
                  size="lg"
                    disabled={tripData.availableSeats === 0}
                    onClick={handleRequestToJoin}
                  >
                    {tripData.availableSeats === 0
                      ? 'Trip Full'
                      : 'Request to Join'}
                </Button>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      This is your trip
                    </p>
                  </div>
                )}

                <p className="text-muted-foreground text-center text-xs">
                  You won't be charged until your request is accepted
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Trips */}
        <div className="mt-12">
          <RelatedTrips 
            currentTripId={tripId}
            currentTripCoordinates={
              trip.originCoordinates && trip.destinationCoordinates 
                ? {
                    origin: trip.originCoordinates,
                    destination: trip.destinationCoordinates,
                  }
                : undefined
            }
          />
        </div>
      </div>

      <RequestJoinDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        trip={{
          id: trip.id,
          originName: trip.originName,
          destinationName: trip.destinationName,
          price: trip.pricePerSeat,
          availableSeats: tripData.availableSeats,
          publisher: {
            name: trip.publisher.name,
          },
        }}
      />

      {/* Phone Number Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Driver</DialogTitle>
            <DialogDescription>
              Copy the phone number to contact {trip.publisher.name} directly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Phone Number</p>
                  <p className="font-mono text-lg">
                    {trip.publisher.phoneNumber}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyPhone}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-center text-xs">
              Tap the copy button to copy the phone number to your clipboard
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
