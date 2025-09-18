'use client';

import { useState } from 'react';
import { Star, Shield, Calendar, Settings, Lock, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileOverview } from '@/components/profile/profile-overview';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { ProfileSecurity } from '@/components/profile/profile-security';
import { ProfileRatings } from '@/components/profile/profile-ratings';
import { useAuth } from '@/lib/hooks/use-auth';
import { TripsService, RatingsService } from '@/lib/services';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';

export function UserProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isLoading: authLoading } = useAuth();

  // Fetch user's trips
  const { data: userTrips = [], isLoading: tripsLoading } = useSWR(
    user ? swrKeys.trips.list({}) : null,
    () =>
      TripsService.list({}).then(async (r) => {
        if (r.ok) {
          const trips = await r.json();
          // Filter trips published by current user
          return trips.filter((trip: any) => trip.publisherId === user?.id);
        }
        throw new Error('Failed to load user trips');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    },
  );

  // Fetch user's ratings
  const { data: userRatings = [], isLoading: ratingsLoading } = useSWR(
    user ? swrKeys.ratings.list(user.id) : null,
    () =>
      RatingsService.list(user?.id).then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load user ratings');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    },
  );

  if (authLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <User className="text-primary h-8 w-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Loading Profile</h3>
            <p className="text-muted-foreground text-sm">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <User className="text-destructive h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Profile Not Found</h3>
            <p className="text-muted-foreground text-sm">
              Please log in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const tripCount = userTrips.length;
  const averageRating = user.averageRating || 0;
  const ratingCount = user.ratingCount || 0;
  const memberSince = new Date().getFullYear();
  console.log('user', user);
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col items-start space-y-6 md:flex-row md:items-center md:space-y-0 md:space-x-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="mb-2 flex items-center space-x-3">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge variant="secondary" className="text-sm">
                      <Shield className="mr-1 h-4 w-4" />
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{averageRating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{ratingCount} reviews</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="text-primary text-2xl font-bold">
                      {tripCount}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Published Trips
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-primary text-2xl font-bold">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Average Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-primary text-2xl font-bold">
                      {user.status || 'ACTIVE'}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Account Status
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center space-x-2"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger
              value="ratings"
              className="flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview">
              <ProfileOverview user={user} userTrips={userTrips} />
            </TabsContent>

            <TabsContent value="settings">
              <ProfileSettings user={user} />
            </TabsContent>

            <TabsContent value="security">
              <ProfileSecurity user={user} />
            </TabsContent>

            <TabsContent value="ratings">
              <ProfileRatings userId={user.id} ratings={userRatings} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
