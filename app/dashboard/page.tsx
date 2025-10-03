'use client';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

import { useMemo } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  MapPin,
  MessageCircle,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { TripsService, RequestsService, ChatService } from '@/lib/services';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAuthenticated, isLoading } = useRequireAuth();

  // Fetch user's published trips
  const { data: userTripsData, isLoading: tripsLoading } = useSWR(
    user ? swrKeys.trips.list({ publisherId: user.id }) : null,
    () => TripsService.list({ publisherId: user!.id }).then((r) => r.json()),
  );

  // Handle both old and new API response formats
  const userTrips = userTripsData?.trips || userTripsData || [];

  // Fetch incoming requests
  const { data: incomingRequests = [], isLoading: incomingLoading } = useSWR(
    user ? swrKeys.requests.incoming() : null,
    () => RequestsService.incoming().then((r) => r.json()),
  );

  // Fetch outgoing requests
  const { data: outgoingRequests = [], isLoading: outgoingLoading } = useSWR(
    user ? swrKeys.requests.outgoing() : null,
    () => RequestsService.outgoing().then((r) => r.json()),
  );

  // Fetch chats
  const { data: chats = [], isLoading: chatsLoading } = useSWR(
    user ? swrKeys.chat.list() : null,
    () => ChatService.list().then((r) => r.json()),
  );

  // Calculate stats
  const activeTrips = useMemo(
    () =>
      Array.isArray(userTrips)
        ? userTrips.filter((trip: any) => trip.status === 'ACTIVE').length
        : 0,
    [userTrips],
  );

  const pendingRequests = useMemo(
    () =>
      Array.isArray(incomingRequests)
        ? incomingRequests.filter((req: any) => req.status === 'PENDING').length
        : 0,
    [incomingRequests],
  );

  const unreadMessages = useMemo(
    () =>
      Array.isArray(chats)
        ? chats.filter(
            (chat: any) =>
              chat.lastMessage && chat.lastMessage.senderId !== user?.id,
          ).length
        : 0,
    [chats, user?.id],
  );

  // Get upcoming trips (next 7 days)
  const upcomingTrips = useMemo(() => {
    if (!Array.isArray(userTrips)) return [];

    return userTrips
      .filter((trip: any) => {
        const departureDate = new Date(trip.departureAt);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return (
          departureDate > now &&
          departureDate <= weekFromNow &&
          trip.status === 'ACTIVE'
        );
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime(),
      )
      .slice(0, 3);
  }, [userTrips]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    const activities = [
      ...(Array.isArray(incomingRequests)
        ? incomingRequests.slice(0, 2).map((req: any) => ({
            type: 'request',
            message: 'New request received',
            detail: `From ${req.applicant?.name || 'Unknown'}`,
            status: req.status,
            time: req.createdAt,
          }))
        : []),
      ...(Array.isArray(chats)
        ? chats.slice(0, 2).map((chat: any) => ({
            type: 'message',
            message: 'Message received',
            detail: `From ${chat.otherUser.name}`,
            status: 'unread',
            time: chat.lastMessage?.createdAt || chat.updatedAt,
          }))
        : []),
    ];

    return activities
      .sort(
        (a: any, b: any) =>
          new Date(b.time).getTime() - new Date(a.time).getTime(),
      )
      .slice(0, 3);
  }, [incomingRequests, chats]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via middleware
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 px-4 py-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your rides today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Trips
              </CardTitle>
              <Car className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tripsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  activeTrips
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {userTrips.length} total trips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {incomingLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  pendingRequests
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {incomingRequests.length} total requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
              <Star className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.averageRating?.toFixed(1) || 'N/A'}
              </div>
              <p className="text-muted-foreground text-xs">
                {user?.ratingCount || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chatsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  chats.length
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                {unreadMessages} unread
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you might want to do
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link href={ROUTES.PUBLISH}>
                    <Car className="mb-2 h-6 w-6" />
                    Add Trip
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href={ROUTES.TRIPS}>
                    <MapPin className="mb-2 h-6 w-6" />
                    Find Trips
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href={ROUTES.REQUESTS}>
                    <Users className="mb-2 h-6 w-6" />
                    Manage Requests
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href={ROUTES.CHAT}>
                    <MessageCircle className="mb-2 h-6 w-6" />
                    Messages
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest trips and interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          activity.type === 'request'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                      ></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {activity.message}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {activity.detail}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activity.status === 'PENDING'
                            ? 'outline'
                            : activity.status === 'unread'
                              ? 'secondary'
                              : 'default'
                        }
                      >
                        {activity.status === 'PENDING'
                          ? 'Pending'
                          : activity.status === 'unread'
                            ? 'Unread'
                            : activity.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>
              Your scheduled trips for the next few days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTrips.length === 0 ? (
                <div className="py-8 text-center">
                  <Car className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    No upcoming trips
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Add a trip to get started
                  </p>
                </div>
              ) : (
                upcomingTrips.map((trip: any) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                        <Car className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {trip.originName} → {trip.destinationName}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(trip.departureAt).toLocaleDateString()} at{' '}
                          {new Date(trip.departureAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{trip.capacity} seats</Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`${ROUTES.TRIPS}/${trip.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
