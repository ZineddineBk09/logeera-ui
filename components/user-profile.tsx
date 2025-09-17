"use client";

import { useState } from "react";
import { Star, Shield, Calendar, Settings, Lock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { ProfileSettings } from "@/components/profile/profile-settings";
import { ProfileSecurity } from "@/components/profile/profile-security";
import { ProfileRatings } from "@/components/profile/profile-ratings";
import { useAuth } from "@/lib/hooks/use-auth";
import { TripsService, RatingsService } from "@/lib/services";
import { swrKeys } from "@/lib/swr-config";
import useSWR from "swr";


export function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isLoading: authLoading } = useAuth();

  // Fetch user's trips
  const { data: userTrips = [], isLoading: tripsLoading } = useSWR(
    user ? swrKeys.trips.list({}) : null,
    () => TripsService.list({}).then(async (r) => {
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
    }
  );

  // Fetch user's ratings
  const { data: userRatings = [], isLoading: ratingsLoading } = useSWR(
    user ? swrKeys.ratings.list(user.id) : null,
    () => RatingsService.list(user?.id).then(async (r) => {
      if (r.ok) {
        return await r.json();
      }
      throw new Error('Failed to load user ratings');
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Loading Profile</h3>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Profile Not Found</h3>
            <p className="text-sm text-muted-foreground">Please log in to view your profile.</p>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src="/placeholder.svg"
                  alt={user.name}
                />
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge variant="secondary" className="text-sm">
                      <Shield className="w-4 h-4 mr-1" />
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{averageRating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{ratingCount} reviews</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Member since {memberSince}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {tripCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Published Trips
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {user.status || 'ACTIVE'}
                    </div>
                    <div className="text-sm text-muted-foreground">
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
