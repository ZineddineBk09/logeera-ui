"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, Users, Check, X, MessageCircle, Star } from "lucide-react"

const mockRequests = {
  incoming: [
    {
      id: "1",
      user: { name: "Sarah Chen", avatar: "/diverse-user-avatars.png", rating: 4.8 },
      trip: {
        from: "San Francisco",
        to: "Los Angeles",
        date: "Dec 15, 2024",
        time: "9:00 AM",
        seats: 2,
      },
      message: "Hi! I'd love to join your trip. I'm a clean and quiet passenger.",
      requestedAt: "2 hours ago",
      status: "pending",
    },
    {
      id: "2",
      user: { name: "Mike Johnson", avatar: "/diverse-user-avatars.png", rating: 4.9 },
      trip: {
        from: "San Francisco",
        to: "Los Angeles",
        date: "Dec 18, 2024",
        time: "2:00 PM",
        seats: 1,
      },
      message: "Looking forward to sharing the ride and splitting gas costs!",
      requestedAt: "5 hours ago",
      status: "pending",
    },
  ],
  outgoing: [
    {
      id: "3",
      publisher: { name: "Emma Wilson", avatar: "/diverse-user-avatars.png", rating: 4.7 },
      trip: {
        from: "Oakland",
        to: "San Jose",
        date: "Dec 20, 2024",
        time: "7:30 AM",
        seats: 1,
      },
      message: "Hi Emma! I'd like to join your morning commute trip.",
      requestedAt: "1 day ago",
      status: "pending",
    },
    {
      id: "4",
      publisher: { name: "David Kim", avatar: "/diverse-user-avatars.png", rating: 4.6 },
      trip: {
        from: "San Francisco",
        to: "Sacramento",
        date: "Dec 22, 2024",
        time: "11:00 AM",
        seats: 2,
      },
      message: "Perfect timing for my weekend trip!",
      requestedAt: "2 days ago",
      status: "accepted",
    },
  ],
}

export function RequestsManagement() {
  const [activeTab, setActiveTab] = useState("incoming")

  const handleAccept = (requestId: string) => {
    console.log("[v0] Accepting request:", requestId)
  }

  const handleDecline = (requestId: string) => {
    console.log("[v0] Declining request:", requestId)
  }

  const handleMessage = (userId: string) => {
    console.log("[v0] Opening chat with user:", userId)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Trip Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing trip requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            Incoming
            <Badge variant="secondary" className="ml-1">
              {mockRequests.incoming.filter((r) => r.status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            Outgoing
            <Badge variant="secondary" className="ml-1">
              {mockRequests.outgoing.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-4 mt-6">
          {mockRequests.incoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
                <p className="text-muted-foreground text-center">
                  When people request to join your trips, they'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            mockRequests.incoming.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.user.avatar || "/placeholder.svg"} alt={request.user.name} />
                        <AvatarFallback>
                          {request.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{request.user.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{request.user.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {request.requestedAt}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.trip.from} → {request.trip.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.trip.date} at {request.trip.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.trip.seats} seat{request.trip.seats > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground">{request.message}</p>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleAccept(request.id)} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button variant="outline" onClick={() => handleDecline(request.id)} className="flex-1">
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleMessage(request.user.name)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4 mt-6">
          {mockRequests.outgoing.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
                <p className="text-muted-foreground text-center">Requests you send to join trips will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            mockRequests.outgoing.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={request.publisher.avatar || "/placeholder.svg"}
                          alt={request.publisher.name}
                        />
                        <AvatarFallback>
                          {request.publisher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{request.publisher.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">{request.publisher.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={request.status === "accepted" ? "default" : "secondary"} className="text-xs">
                        {request.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {request.requestedAt}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.trip.from} → {request.trip.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.trip.date} at {request.trip.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.trip.seats} seat{request.trip.seats > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground">{request.message}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessage(request.publisher.name)}
                      className="ml-auto"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
