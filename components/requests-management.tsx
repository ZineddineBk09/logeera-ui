'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Users,
  Check,
  X,
  MessageCircle,
  Star,
  Loader2,
} from 'lucide-react';
import { RequestsService, ChatService } from '@/lib/services';
import { toast } from 'sonner';
import { TripRating } from './trip-rating';
import { api } from '@/lib/api';
import useSWR from 'swr';
import { useAuth } from '@/lib/hooks/use-auth';

interface RequestIncoming {
  id: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    averageRating: number;
    ratingCount: number;
  };
      trip: {
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    capacity: number;
    vehicleType: string;
  };
  status: string;
  createdAt: string;
}

interface RequestOutgoing {
  id: string;
      trip: {
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    capacity: number;
    vehicleType: string;
      publisher: {
      id: string;
      name: string;
      email: string;
      averageRating: number;
      ratingCount: number;
    };
  };
  status: string;
  createdAt: string;
}

export function RequestsManagement() {
  const [activeTab, setActiveTab] = useState('incoming');
  const router = useRouter();
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<RequestIncoming[]>([]);
  const [outgoing, setOutgoing] = useState<RequestOutgoing[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  // Fetch trips that can be rated
  const {
    data: pendingRatings = [],
    error: ratingsError,
    isLoading: ratingsLoading,
    mutate: mutatePendingRatings,
  } = useSWR(
    '/api/ratings/pending',
    () =>
      api('/api/ratings/pending').then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load pending ratings');
      }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([RequestsService.incoming(), RequestsService.outgoing()])
      .then(async ([i, o]) => {
        if (i.ok) setIncoming(await i.json());
        if (o.ok) setOutgoing(await o.json());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (requestId: string) => {
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;
    
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      const response = await RequestsService.setStatus(requestId, 'accepted');
      if (response.ok) {
        toast.success('Request accepted');
        // Update the local state to reflect the change
        setIncoming(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'ACCEPTED' } : req
        ));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;
    
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      const response = await RequestsService.setStatus(requestId, 'rejected');
      if (response.ok) {
        toast.success('Request rejected');
        // Update the local state to reflect the change
        setIncoming(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'REJECTED' } : req
        ));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleMessage = async (otherUserId: string, userName: string) => {
    if (!user?.id) {
      toast.error('Please log in to start a conversation');
      return;
    }

    try {
      // Create or find the chat between current user and the other user
      const response = await ChatService.between(user.id, otherUserId, true);
      
      if (response.ok) {
        const chatData = await response.json();
        // Navigate to the specific chat
        router.push(`/chats?chatId=${chatData.id}`);
        toast.success(`Opening chat with ${userName}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">
          Trip Requests
        </h1>
        <p className="text-muted-foreground">
          Manage your incoming and outgoing trip requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            Incoming
            <Badge variant="secondary" className="ml-1">
              {incoming.filter((r) => r.status === 'PENDING').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            Outgoing
            <Badge variant="secondary" className="ml-1">
              {outgoing.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            Rate Trips
            <Badge variant="secondary" className="ml-1">
              {pendingRatings.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-6 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                Loading...
              </CardContent>
            </Card>
          ) : incoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">
                  No incoming requests
                </h3>
                <p className="text-muted-foreground text-center">
                  When people request to join your trips, they'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            incoming.map((request) => (
              <motion.div
                key={request.id}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                            src="/placeholder.svg"
                            alt={request.applicant.name}
                        />
                        <AvatarFallback>
                            {request.applicant.name
                              .split(' ')
                            .map((n) => n[0])
                              .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                          <h3 className="text-foreground font-semibold">
                            {request.applicant.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-muted-foreground text-sm">
                              {request.applicant.averageRating.toFixed(1)} (
                              {request.applicant.ratingCount} reviews)
                          </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Badge>
                        <Badge
                          variant={
                            request.status === 'PENDING'
                              ? 'secondary'
                              : request.status === 'ACCEPTED'
                                ? 'default'
                                : 'destructive'
                          }
                          className="text-xs capitalize"
                        >
                          {processingRequests.has(request.id) ? 'Processing...' : request.status.toLowerCase()}
                    </Badge>
                      </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>
                          {request.trip.originName} →{' '}
                          {request.trip.destinationName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                          {new Date(
                            request.trip.departureAt,
                          ).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(
                            request.trip.departureAt,
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                          {request.trip.capacity} seat
                          {request.trip.capacity > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        Request to join this trip
                      </p>
                  </div>

                    {request.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1"
                        disabled={processingRequests.has(request.id)}
                      >
                        {processingRequests.has(request.id) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDecline(request.id)}
                        className="flex-1"
                        disabled={processingRequests.has(request.id)}
                      >
                        {processingRequests.has(request.id) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        Decline
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                          onClick={() =>
                            handleMessage(
                              request.applicant.id,
                              request.applicant.name,
                            )
                          }
                        disabled={processingRequests.has(request.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                Loading...
              </CardContent>
            </Card>
          ) : outgoing.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">
                  No outgoing requests
                </h3>
                <p className="text-muted-foreground text-center">
                  Requests you send to join trips will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            outgoing.map((request) => (
              <motion.div
                key={request.id}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                            src="/placeholder.svg"
                            alt={request.trip.publisher.name}
                        />
                        <AvatarFallback>
                            {request.trip.publisher.name
                              .split(' ')
                            .map((n) => n[0])
                              .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                          <h3 className="text-foreground font-semibold">
                            {request.trip.publisher.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-muted-foreground text-sm">
                              {request.trip.publisher.averageRating.toFixed(1)}{' '}
                              ({request.trip.publisher.ratingCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                            request.status === 'ACCEPTED'
                              ? 'default'
                              : request.status === 'REJECTED'
                                ? 'destructive'
                                : 'secondary'
                        }
                        className="text-xs"
                      >
                        {request.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                          {new Date(request.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>
                          {request.trip.originName} →{' '}
                          {request.trip.destinationName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="text-muted-foreground h-4 w-4" />
                      <span>
                          {new Date(
                            request.trip.departureAt,
                          ).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(
                            request.trip.departureAt,
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                          {request.trip.capacity} seat
                          {request.trip.capacity > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        Your request to join this trip
                      </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                        onClick={() =>
                          handleMessage(
                            request.trip.publisher.id,
                            request.trip.publisher.name,
                          )
                        }
                      className="ml-auto"
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="ratings" className="mt-6 space-y-4">
          {ratingsLoading ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                Loading trips to rate...
              </CardContent>
            </Card>
          ) : ratingsError ? (
            <Card>
              <CardContent className="text-muted-foreground py-12 text-center text-sm">
                Failed to load trips. Please try again.
              </CardContent>
            </Card>
          ) : pendingRatings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="text-muted-foreground mb-2 text-lg font-semibold">
                  No trips to rate
                </h3>
                <p className="text-muted-foreground text-sm">
                  Complete some trips to be able to rate your experience with drivers
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {pendingRatings.map((trip: any) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TripRating
                    trip={trip}
                    onRatingSubmitted={() => {
                      mutatePendingRatings(); // Refresh the list
                      toast.success('Thank you for your feedback!');
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
