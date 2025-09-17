"use client";

import { Phone, Mail, Globe, Calendar, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProfileOverviewProps {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    type?: string;
    status?: string;
    role?: string;
    averageRating?: number;
    ratingCount?: number;
    createdAt?: string;
  };
  userTrips: any[];
}


export function ProfileOverview({ user, userTrips }: ProfileOverviewProps) {
  // Get recent trips (limit to 5)
  const recentTrips = userTrips.slice(0, 5);
  
  // Calculate trip statistics
  const totalTrips = userTrips.length;
  const completedTrips = userTrips.filter(trip => trip.status === 'COMPLETED').length;
  const activeTrips = userTrips.filter(trip => trip.status === 'ACTIVE').length;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Personal Information */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center space-x-2">
                    <span>{user.email}</span>
                    {user.email && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="flex items-center space-x-2">
                    <span>{user.phoneNumber || 'Not provided'}</span>
                    {user.phoneNumber && (
                      <Badge variant="secondary" className="text-xs">
                        Provided
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">
                    Member since
                  </div>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Account Type</div>
                  <span>{user.type || 'Individual'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-2">Account Status</div>
              <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {user.status || 'ACTIVE'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTrips.length > 0 ? (
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Car className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{trip.originName} → {trip.destinationName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trip.departureAt).toLocaleDateString()} • {trip.vehicleType}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{trip.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No trips published yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {totalTrips}
              </div>
              <div className="text-sm text-muted-foreground">Published Trips</div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{completedTrips}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-xl font-bold">{activeTrips}</div>
                <div className="text-xs text-muted-foreground">
                  Active
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Rating</span>
                <span className="font-medium">{user.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Reviews</span>
                <span className="font-medium">{user.ratingCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.averageRating && user.averageRating >= 4.5 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400">🏆</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Top Rated Driver</div>
                  <div className="text-xs text-muted-foreground">
                    Maintained {user.averageRating.toFixed(1)}+ rating
                  </div>
                </div>
              </div>
            )}

            {completedTrips >= 10 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Reliable Member</div>
                  <div className="text-xs text-muted-foreground">
                    {completedTrips}+ completed trips
                  </div>
                </div>
              </div>
            )}

            {user.createdAt && new Date(user.createdAt).getFullYear() <= 2023 && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">🌟</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Early Adopter</div>
                  <div className="text-xs text-muted-foreground">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </div>
                </div>
              </div>
            )}

            {totalTrips === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Start publishing trips to earn achievements!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
