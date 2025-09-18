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
} from 'lucide-react';
import { RequestsService, ChatService } from '@/lib/services';
import { toast } from 'sonner';

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
  const [incoming, setIncoming] = useState<RequestIncoming[]>([]);
  const [outgoing, setOutgoing] = useState<RequestOutgoing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([RequestsService.incoming(), RequestsService.outgoing()])
      .then(async ([i, o]) => {
        if (i.ok) setIncoming(await i.json());
        if (o.ok) setOutgoing(await o.json());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = (requestId: string) => {
    RequestsService.setStatus(requestId, 'accepted').then(async (r) => {
      if (r.ok) toast.success('Request accepted');
      else toast.error('Failed to accept');
    });
  };

  const handleDecline = (requestId: string) => {
    RequestsService.setStatus(requestId, 'rejected').then(async (r) => {
      if (r.ok) toast.success('Request rejected');
      else toast.error('Failed to reject');
    });
  };

  const handleMessage = async (otherUserId: string, userName: string) => {
    try {
      // We need to get the current user's ID from auth context
      // For now, let's just navigate to chats page
      router.push(`/chats`);
      toast.success(`Opening chat with ${userName}`);
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
        <TabsList className="grid w-full grid-cols-2">
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
                      <Badge variant="outline" className="text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Badge>
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
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDecline(request.id)}
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
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
      </Tabs>
    </div>
  );
}
