"use client"

import { Phone, Mail, Globe, Calendar, Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ProfileOverviewProps {
  user: {
    name: string
    email: string
    phone: string
    memberSince: string
    languages: string[]
    bio: string
    verifiedPhone: boolean
    verifiedEmail: boolean
    tripCount: number
  }
}

const recentTrips = [
  {
    id: "1",
    route: "New York → Boston",
    date: "2024-01-10",
    role: "Driver",
    status: "Completed",
  },
  {
    id: "2",
    route: "Boston → New York",
    date: "2024-01-08",
    role: "Passenger",
    status: "Completed",
  },
  {
    id: "3",
    route: "New York → Philadelphia",
    date: "2024-01-05",
    role: "Driver",
    status: "Completed",
  },
]

export function ProfileOverview({ user }: ProfileOverviewProps) {
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
                    {user.verifiedEmail && (
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
                    <span>{user.phone}</span>
                    {user.verifiedPhone && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Member since</div>
                  <span>{new Date(user.memberSince).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Languages</div>
                  <span>{user.languages.join(", ")}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-2">Bio</div>
              <p className="text-sm leading-relaxed">{user.bio}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{trip.route}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(trip.date).toLocaleDateString()} • {trip.role}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{trip.status}</Badge>
                </div>
              ))}
            </div>
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
              <div className="text-3xl font-bold text-primary">{user.tripCount}</div>
              <div className="text-sm text-muted-foreground">Total Trips</div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">67</div>
                <div className="text-xs text-muted-foreground">As Driver</div>
              </div>
              <div>
                <div className="text-xl font-bold">60</div>
                <div className="text-xs text-muted-foreground">As Passenger</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This month</span>
                <span className="font-medium">8 trips</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>This year</span>
                <span className="font-medium">45 trips</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400">🏆</span>
              </div>
              <div>
                <div className="text-sm font-medium">Top Rated Driver</div>
                <div className="text-xs text-muted-foreground">Maintained 4.8+ rating</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✅</span>
              </div>
              <div>
                <div className="text-sm font-medium">Reliable Member</div>
                <div className="text-xs text-muted-foreground">100+ completed trips</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">🌟</span>
              </div>
              <div>
                <div className="text-sm font-medium">Early Adopter</div>
                <div className="text-xs text-muted-foreground">Member since 2022</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
