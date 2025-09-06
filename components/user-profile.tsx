"use client"

import { useState } from "react"
import { Star, Shield, Calendar, Settings, Lock, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProfileOverview } from "@/components/profile/profile-overview"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { ProfileSecurity } from "@/components/profile/profile-security"
import { ProfileRatings } from "@/components/profile/profile-ratings"

// Mock user data
const mockUser = {
  id: "user1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "/diverse-user-avatars.png",
  memberSince: "2022-03-15",
  rating: 4.8,
  reviewCount: 89,
  tripCount: 127,
  trusted: true,
  verifiedPhone: true,
  verifiedEmail: true,
  languages: ["English", "Spanish"],
  bio: "Experienced driver who loves meeting new people and sharing travel stories. I prioritize safety and punctuality.",
}

export function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                <AvatarFallback className="text-2xl">
                  {mockUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{mockUser.name}</h1>
                    {mockUser.trusted && (
                      <Badge variant="secondary" className="text-sm">
                        <Shield className="w-4 h-4 mr-1" />
                        Trusted Member
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{mockUser.rating}</span>
                      <span>•</span>
                      <span>{mockUser.reviewCount} reviews</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {new Date(mockUser.memberSince).getFullYear()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockUser.tripCount}</div>
                    <div className="text-sm text-muted-foreground">Total Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockUser.rating}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-sm text-muted-foreground">Response Rate</div>
                  </div>
                </div>
              </div>

              <Button size="lg" className="self-start">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="overview">
              <ProfileOverview user={mockUser} />
            </TabsContent>

            <TabsContent value="settings">
              <ProfileSettings user={mockUser} />
            </TabsContent>

            <TabsContent value="security">
              <ProfileSecurity user={mockUser} />
            </TabsContent>

            <TabsContent value="ratings">
              <ProfileRatings userId={mockUser.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
