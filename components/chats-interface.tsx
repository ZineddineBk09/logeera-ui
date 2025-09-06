"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MapPin, Phone, Video, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockChats = [
  {
    id: "1",
    user: {
      name: "Sarah Chen",
      avatar: "/diverse-user-avatars.png",
      online: true,
    },
    trip: { from: "San Francisco", to: "Los Angeles", date: "Dec 15" },
    lastMessage: "Thanks for accepting my request! What time should we meet?",
    timestamp: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    user: {
      name: "Mike Johnson",
      avatar: "/diverse-user-avatars.png",
      online: false,
    },
    trip: { from: "San Francisco", to: "Los Angeles", date: "Dec 18" },
    lastMessage: "Perfect! I'll be ready at 2 PM sharp.",
    timestamp: "1h ago",
    unread: 0,
  },
  {
    id: "3",
    user: {
      name: "Emma Wilson",
      avatar: "/diverse-user-avatars.png",
      online: true,
    },
    trip: { from: "Oakland", to: "San Jose", date: "Dec 20" },
    lastMessage: "Looking forward to the morning commute together!",
    timestamp: "3h ago",
    unread: 1,
  },
];

const mockMessages = [
  {
    id: "1",
    sender: "Sarah Chen",
    message: "Hi! Thanks for accepting my request to join your trip to LA!",
    timestamp: "10:30 AM",
    isMe: false,
  },
  {
    id: "2",
    sender: "You",
    message:
      "No problem! Happy to have you along. Have you done rideshares before?",
    timestamp: "10:32 AM",
    isMe: true,
  },
  {
    id: "3",
    sender: "Sarah Chen",
    message:
      "Yes, I've done a few trips. I'm a clean and quiet passenger, and I always chip in for gas!",
    timestamp: "10:35 AM",
    isMe: false,
  },
  {
    id: "4",
    sender: "You",
    message:
      "Great! What time works best for you to meet? I was thinking 9 AM at the Starbucks on Market Street.",
    timestamp: "10:37 AM",
    isMe: true,
  },
  {
    id: "5",
    sender: "Sarah Chen",
    message: "Thanks for accepting my request! What time should we meet?",
    timestamp: "10:40 AM",
    isMe: false,
  },
];

export function ChatsInterface() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = mockChats.filter(
    (chat) =>
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.trip.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.trip.to.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("[v0] Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with your trip companions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                    selectedChat.id === chat.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={chat.user.avatar || "/placeholder.svg"}
                        alt={chat.user.name}
                      />
                      <AvatarFallback>
                        {chat.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {chat.user.online && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {chat.user.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {chat.trip.from} → {chat.trip.to}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {chat.trip.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <Badge className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedChat.user.avatar || "/placeholder.svg"}
                      alt={selectedChat.user.name}
                    />
                    <AvatarFallback>
                      {selectedChat.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.user.online && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedChat.user.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {selectedChat.trip.from} → {selectedChat.trip.to}
                    </span>
                    <span>• {selectedChat.trip.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Trip Details</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Block User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.isMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
