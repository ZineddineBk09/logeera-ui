'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Circle,
} from 'lucide-react';
import { RequestsService, ChatService } from '@/lib/services';
import { toast } from 'sonner';
import { TripRating } from './trip-rating';
import { api } from '@/lib/api';
import useSWR from 'swr';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    payloadType: 'PARCEL' | 'PASSENGER';
    parcelWeight?: number;
    passengerCount?: number;
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
    payloadType: 'PARCEL' | 'PASSENGER';
    parcelWeight?: number;
    passengerCount?: number;
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

// Helper function to get progress steps for a request
function getProgressSteps(status: string, payloadType: 'PARCEL' | 'PASSENGER') {
  // Special handling for rejected/cancelled requests
  if (status === 'REJECTED' || status === 'CANCELLED') {
    const steps = [
      {
        key: 'pending',
        icon: Circle,
        label: 'Pending',
        completed: true,
        isRejected: true,
      },
      {
        key: 'accepted',
        icon: CheckCircle,
        label: 'Accepted',
        completed: true,
        isRejected: true,
      },
      {
        key: 'in_transit',
        icon: payloadType === 'PARCEL' ? Package : Truck,
        label: payloadType === 'PARCEL' ? 'Parcel Received' : 'In Transit',
        completed: true,
        isRejected: true,
      },
      {
        key: 'delivered',
        icon: CheckCircle,
        label: payloadType === 'PARCEL' ? 'Delivered' : 'Arrived',
        completed: true,
        isRejected: true,
      },
      {
        key: 'rejected',
        icon: XCircle,
        label: status === 'REJECTED' ? 'Rejected' : 'Cancelled',
        completed: true,
        isRejected: true,
        isFinal: true,
      },
    ];
    return steps;
  }

  // Normal progress steps for active requests
  const steps = [
    { key: 'pending', icon: Circle, label: 'Pending', completed: false },
    { key: 'accepted', icon: CheckCircle, label: 'Accepted', completed: false },
    {
      key: 'in_transit',
      icon: payloadType === 'PARCEL' ? Package : Truck,
      label: payloadType === 'PARCEL' ? 'Parcel Received' : 'In Transit',
      completed: false,
    },
    {
      key: 'delivered',
      icon: CheckCircle,
      label: payloadType === 'PARCEL' ? 'Delivered' : 'Arrived',
      completed: false,
    },
    { key: 'completed', icon: Star, label: 'Completed', completed: false },
  ];

  const statusMap: Record<string, number> = {
    PENDING: 0,
    ACCEPTED: 1,
    IN_TRANSIT: 2,
    DELIVERED: 3,
    COMPLETED: 4,
  };

  const currentStep = statusMap[status] ?? -1;

  return steps.map((step, index) => ({
    ...step,
    completed: index <= currentStep && currentStep >= 0,
    current: index === currentStep,
    isRejected: false,
    isFinal: false,
  }));
}

export function RequestsManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [incoming, setIncoming] = useState<RequestIncoming[]>([]);
  const [outgoing, setOutgoing] = useState<RequestOutgoing[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set(),
  );
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showReceivedDialog, setShowReceivedDialog] = useState(false);
  const [showCancelAcceptedDialog, setShowCancelAcceptedDialog] =
    useState(false);
  const [showCancelOutgoingDialog, setShowCancelOutgoingDialog] =
    useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestIncoming | null>(null);
  const [selectedOutgoingRequest, setSelectedOutgoingRequest] =
    useState<RequestOutgoing | null>(null);

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

  const handleAccept = (request: RequestIncoming) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const confirmAccept = async () => {
    if (!selectedRequest) return;

    const requestId = selectedRequest.id;
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestId));
    setShowAcceptDialog(false);

    try {
      const response = await RequestsService.setStatus(requestId, 'accepted');
      if (response.ok) {
        const acceptedRequest = await response.json();
        toast.success('Request accepted');

        // Update the local state to reflect the change
        setIncoming((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: 'ACCEPTED' } : req,
          ),
        );

        // Automatically open chat with the accepted user
        if (user?.id) {
          try {
            const chatResponse = await ChatService.between(
              user.id,
              acceptedRequest.applicant.id,
              true,
              acceptedRequest.trip.id,
            );
            if (chatResponse.ok) {
              const chatData = await chatResponse.json();
              router.push(`/chats?chatId=${chatData.id}`);
              toast.success(
                `Chat opened with ${acceptedRequest.applicant.name}`,
              );
            }
          } catch (chatError) {
            console.error('Error opening chat:', chatError);
            // Don't show error for chat opening, just log it
          }
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setSelectedRequest(null);
    }
  };

  const handleDecline = (request: RequestIncoming) => {
    setSelectedRequest(request);
    setShowDeclineDialog(true);
  };

  const handleReceived = (request: RequestIncoming) => {
    setSelectedRequest(request);
    setShowReceivedDialog(true);
  };

  const handleCancelAccepted = (request: RequestIncoming) => {
    setSelectedRequest(request);
    setShowCancelAcceptedDialog(true);
  };

  const confirmDecline = async () => {
    if (!selectedRequest) return;

    const requestId = selectedRequest.id;
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestId));
    setShowDeclineDialog(false);

    try {
      const response = await RequestsService.setStatus(requestId, 'rejected');
      if (response.ok) {
        toast.success('Request rejected');
        // Update the local state to reflect the change
        setIncoming((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: 'REJECTED' } : req,
          ),
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setSelectedRequest(null);
    }
  };

  const confirmReceived = async () => {
    if (!selectedRequest) return;

    const requestId = selectedRequest.id;
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestId));
    setShowReceivedDialog(false);

    try {
      const response = await RequestsService.setStatus(requestId, 'in_transit');
      if (response.ok) {
        toast.success('Request marked as received');
        // Update the local state to reflect the change
        setIncoming((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: 'IN_TRANSIT' } : req,
          ),
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to mark as received');
      }
    } catch (error) {
      console.error('Error marking as received:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setSelectedRequest(null);
    }
  };

  const confirmCancelAccepted = async () => {
    if (!selectedRequest) return;

    const requestId = selectedRequest.id;
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestId));
    setShowCancelAcceptedDialog(false);

    try {
      const response = await RequestsService.setStatus(requestId, 'cancelled');
      if (response.ok) {
        toast.success('Request cancelled');
        // Update the local state to reflect the change
        setIncoming((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: 'CANCELLED' } : req,
          ),
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setSelectedRequest(null);
    }
  };

  const handleCancelOutgoing = (request: RequestOutgoing) => {
    setSelectedOutgoingRequest(request);
    setShowCancelOutgoingDialog(true);
  };

  const confirmCancelOutgoing = async () => {
    if (!selectedOutgoingRequest) return;

    const requestId = selectedOutgoingRequest.id;
    // Prevent multiple clicks
    if (processingRequests.has(requestId)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestId));
    setShowCancelOutgoingDialog(false);

    try {
      const response = await RequestsService.setStatus(requestId, 'cancelled');
      if (response.ok) {
        toast.success('Request cancelled');
        // Update the local state to reflect the change
        setOutgoing((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: 'CANCELLED' } : req,
          ),
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
      setSelectedOutgoingRequest(null);
    }
  };

  const handleMessage = async (
    otherUserId: string,
    userName: string,
    tripId?: string,
  ) => {
    if (!user?.id) {
      toast.error('Please log in to start a conversation');
      return;
    }

    try {
      // Create or find the chat between current user and the other user
      const response = await ChatService.between(
        user.id,
        otherUserId,
        true,
        tripId,
      );

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

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    if (processingRequests.has(requestId)) return;

    setProcessingRequests((prev) => new Set(prev).add(requestId));

    try {
      const response = await RequestsService.setStatus(
        requestId,
        newStatus.toLowerCase() as
          | 'accepted'
          | 'rejected'
          | 'in_transit'
          | 'delivered'
          | 'completed'
          | 'cancelled',
      );
      if (response.ok) {
        const statusMessages = {
          in_transit: 'Request marked as in transit',
          delivered: 'Request marked as delivered',
          completed: 'Request completed',
          cancelled: 'Request cancelled',
        };
        toast.success(
          statusMessages[
            newStatus.toLowerCase() as keyof typeof statusMessages
          ] || 'Status updated',
        );

        // Update the local state
        setIncoming((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: newStatus } : req,
          ),
        );
        setOutgoing((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: newStatus } : req,
          ),
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Combine all requests into a single list
  const allRequests = [
    ...incoming.map((req) => ({ ...req, type: 'incoming' as const })),
    ...outgoing.map((req) => ({ ...req, type: 'outgoing' as const })),
  ].sort((a, b) => {
    // Sort by creation date, newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalRequests = useMemo(() => allRequests.length, [allRequests]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-foreground text-xl font-bold md:text-2xl lg:text-3xl">
            Requests
          </h1>
          {totalRequests > 0 && (
            <Badge variant="secondary" className="text-lg">
              {totalRequests}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-2">
          Manage your incoming and outgoing trip requests
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center text-sm">
              Loading...
            </CardContent>
          </Card>
        ) : allRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No requests</h3>
              <p className="text-muted-foreground text-center">
                Your incoming and outgoing requests will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          allRequests.map((request) => {
            const isIncoming = request.type === 'incoming';
            let requestData: RequestIncoming | RequestOutgoing;
            let otherUser: {
              id: string;
              name: string;
              email: string;
              averageRating: number;
              ratingCount: number;
            };
            let trip: {
              id: string;
              originName: string;
              destinationName: string;
              departureAt: string;
              capacity: number;
              vehicleType: string;
              payloadType: 'PARCEL' | 'PASSENGER';
              parcelWeight?: number;
              passengerCount?: number;
            };

            if (isIncoming) {
              requestData = request as RequestIncoming & { type: 'incoming' };
              otherUser = requestData.applicant;
              trip = requestData.trip;
            } else {
              requestData = request as RequestOutgoing & { type: 'outgoing' };
              otherUser = requestData.trip.publisher;
              trip = requestData.trip;
            }
            const progressSteps = getProgressSteps(
              requestData.status,
              trip.payloadType,
            );

            return (
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
                            alt={otherUser.name}
                          />
                          <AvatarFallback>
                            {otherUser.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-foreground font-semibold">
                              {otherUser.name}
                            </h3>
                            {isIncoming && (
                              <Badge variant="outline" className="text-xs">
                                Incoming
                              </Badge>
                            )}
                            {!isIncoming && (
                              <Badge variant="secondary" className="text-xs">
                                Outgoing
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-muted-foreground text-sm">
                              {otherUser.averageRating.toFixed(1)} (
                              {otherUser.ratingCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(requestData.createdAt).toLocaleDateString()}
                        </Badge>
                        <Badge
                          variant={
                            requestData.status === 'PENDING'
                              ? 'secondary'
                              : requestData.status === 'ACCEPTED'
                                ? 'default'
                                : requestData.status === 'IN_TRANSIT'
                                  ? 'default'
                                  : requestData.status === 'DELIVERED'
                                    ? 'default'
                                    : requestData.status === 'COMPLETED'
                                      ? 'default'
                                      : 'destructive'
                          }
                          className="text-xs capitalize"
                        >
                          {processingRequests.has(requestData.id)
                            ? 'Processing...'
                            : requestData.status
                                .toLowerCase()
                                .replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Indicator */}
                    {requestData.status === 'REJECTED' ||
                    requestData.status === 'CANCELLED' ? (
                      <div className="p-2">
                        <div className="flex items-center justify-between">
                          {progressSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === progressSteps.length - 1;
                            return (
                              <div
                                key={step.key}
                                className="flex flex-1 items-center"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                      step.isRejected
                                        ? (step as any).isFinal
                                          ? 'bg-red-600 text-white'
                                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <span
                                    className={`mt-1 text-xs ${
                                      step.isRejected
                                        ? (step as any).isFinal
                                          ? 'font-semibold text-red-600 dark:text-red-400'
                                          : 'font-medium text-red-600 dark:text-red-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                {!isLast && (
                                  <div
                                    className={`mx-2 -mt-3 h-0.5 flex-1 ${
                                      step.isRejected
                                        ? 'bg-red-300 dark:bg-red-800'
                                        : 'bg-muted'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          {progressSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isLast = index === progressSteps.length - 1;
                            return (
                              <div
                                key={step.key}
                                className="flex flex-1 items-center"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                      step.completed
                                        ? 'bg-primary text-primary-foreground'
                                        : (step as any).current
                                          ? 'border-primary bg-background text-primary border-2'
                                          : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <span
                                    className={`mt-1 text-xs ${
                                      step.completed || (step as any).current
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                {!isLast && (
                                  <div
                                    className={`mx-2 -mt-3 h-0.5 flex-1 ${
                                      step.completed ? 'bg-primary' : 'bg-muted'
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4 text-sm lg:flex-row lg:items-center">
                      <div className="flex items-center gap-1">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <span>
                          {trip.originName} → {trip.destinationName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span>
                          {new Date(trip.departureAt).toLocaleDateString()} at{' '}
                          {new Date(trip.departureAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span>
                          {trip.payloadType === 'PARCEL'
                            ? `${trip.parcelWeight || trip.capacity}kg capacity`
                            : `${trip.capacity} seat${trip.capacity > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-foreground text-sm">
                        {isIncoming
                          ? `Request to ${trip.payloadType === 'PARCEL' ? 'use this delivery service' : 'join this trip'}`
                          : `Your request to ${trip.payloadType === 'PARCEL' ? 'use this delivery service' : 'join this trip'}`}
                      </p>
                    </div>

                    {/* Action Buttons - Incoming Requests */}
                    {isIncoming && requestData.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() =>
                            handleAccept(requestData as RequestIncoming)
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-2 h-4 w-4" />
                          )}
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleDecline(requestData as RequestIncoming)
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
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
                            handleMessage(otherUser.id, otherUser.name, trip.id)
                          }
                          disabled={processingRequests.has(requestData.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {isIncoming && requestData.status === 'ACCEPTED' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() =>
                            handleReceived(requestData as RequestIncoming)
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Package className="mr-2 h-4 w-4" />
                          )}
                          Received
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleCancelAccepted(requestData as RequestIncoming)
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Cancel Request
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleMessage(otherUser.id, otherUser.name, trip.id)
                          }
                          disabled={processingRequests.has(requestData.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {isIncoming && requestData.status === 'IN_TRANSIT' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() =>
                            handleStatusUpdate(requestData.id, 'DELIVERED')
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Truck className="mr-2 h-4 w-4" />
                          )}
                          Delivered
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleMessage(otherUser.id, otherUser.name, trip.id)
                          }
                          disabled={processingRequests.has(requestData.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {isIncoming && requestData.status === 'DELIVERED' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() =>
                            handleStatusUpdate(requestData.id, 'COMPLETED')
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Complete
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleMessage(otherUser.id, otherUser.name, trip.id)
                          }
                          disabled={processingRequests.has(requestData.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Action Buttons - Outgoing Requests */}
                    {!isIncoming && requestData.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleCancelOutgoing(requestData as RequestOutgoing)
                          }
                          className="flex-1"
                          disabled={processingRequests.has(requestData.id)}
                        >
                          {processingRequests.has(requestData.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Cancel Request
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleMessage(otherUser.id, otherUser.name, trip.id)
                          }
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    )}

                    {/* Message button for other statuses */}
                    {(requestData.status === 'REJECTED' ||
                      requestData.status === 'CANCELLED' ||
                      requestData.status === 'COMPLETED' ||
                      (!isIncoming && requestData.status !== 'PENDING')) && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleMessage(otherUser.id, otherUser.name, trip.id)
                          }
                          disabled={processingRequests.has(requestData.id)}
                          className="ml-auto"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this request from{' '}
              {selectedRequest?.applicant.name}?
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedRequest.applicant.name}
                    />
                    <AvatarFallback>
                      {selectedRequest.applicant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {selectedRequest.applicant.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedRequest.trip.originName} →{' '}
                      {selectedRequest.trip.destinationName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    This will automatically open a chat with{' '}
                    {selectedRequest.applicant.name} and mark the request as
                    accepted.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAcceptDialog(false);
                setSelectedRequest(null);
              }}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAccept}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              {processingRequests.has(selectedRequest?.id || '') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Accept Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this request from{' '}
              {selectedRequest?.applicant.name}?
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedRequest.applicant.name}
                    />
                    <AvatarFallback>
                      {selectedRequest.applicant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {selectedRequest.applicant.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedRequest.trip.originName} →{' '}
                      {selectedRequest.trip.destinationName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    This action cannot be undone. The applicant will be notified
                    that their request was declined.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeclineDialog(false);
                setSelectedRequest(null);
              }}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDecline}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              {processingRequests.has(selectedRequest?.id || '') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Decline Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Received Confirmation Dialog */}
      <Dialog open={showReceivedDialog} onOpenChange={setShowReceivedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Received</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this request as received from{' '}
              {selectedRequest?.applicant.name}?
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedRequest.applicant.name}
                    />
                    <AvatarFallback>
                      {selectedRequest.applicant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {selectedRequest.applicant.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedRequest.trip.originName} →{' '}
                      {selectedRequest.trip.destinationName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    This will mark the{' '}
                    {selectedRequest.trip.payloadType === 'PARCEL'
                      ? 'parcel'
                      : 'passenger'}{' '}
                    as received and change the status to "In Transit".
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowReceivedDialog(false);
                setSelectedRequest(null);
              }}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReceived}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              {processingRequests.has(selectedRequest?.id || '') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking as Received...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Mark as Received
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Accepted Request Confirmation Dialog */}
      <Dialog
        open={showCancelAcceptedDialog}
        onOpenChange={setShowCancelAcceptedDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this accepted request from{' '}
              {selectedRequest?.applicant.name}?
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedRequest.applicant.name}
                    />
                    <AvatarFallback>
                      {selectedRequest.applicant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {selectedRequest.applicant.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedRequest.trip.originName} →{' '}
                      {selectedRequest.trip.destinationName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">
                    This action cannot be undone. The applicant will be notified
                    that their accepted request was cancelled.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelAcceptedDialog(false);
                setSelectedRequest(null);
              }}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelAccepted}
              disabled={processingRequests.has(selectedRequest?.id || '')}
            >
              {processingRequests.has(selectedRequest?.id || '') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Outgoing Request Confirmation Dialog */}
      <Dialog
        open={showCancelOutgoingDialog}
        onOpenChange={setShowCancelOutgoingDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your request to{' '}
              {selectedOutgoingRequest?.trip.publisher.name}?
            </DialogDescription>
          </DialogHeader>

          {selectedOutgoingRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src="/placeholder.svg"
                      alt={selectedOutgoingRequest.trip.publisher.name}
                    />
                    <AvatarFallback>
                      {selectedOutgoingRequest.trip.publisher.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {selectedOutgoingRequest.trip.publisher.name}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedOutgoingRequest.trip.originName} →{' '}
                      {selectedOutgoingRequest.trip.destinationName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    This action cannot be undone. The{' '}
                    {selectedOutgoingRequest.trip.payloadType === 'PARCEL'
                      ? 'delivery provider'
                      : 'trip publisher'}{' '}
                    will be notified.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelOutgoingDialog(false);
                setSelectedOutgoingRequest(null);
              }}
              disabled={processingRequests.has(
                selectedOutgoingRequest?.id || '',
              )}
            >
              Keep Request
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelOutgoing}
              disabled={processingRequests.has(
                selectedOutgoingRequest?.id || '',
              )}
            >
              {processingRequests.has(selectedOutgoingRequest?.id || '') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
