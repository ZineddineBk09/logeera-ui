"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, MapPin, Phone, Video, MoreVertical, Loader2 } from "lucide-react";
import { useSocket } from "@/components/socket/SocketProvider";
import { ChatService } from "@/lib/services";
import { longPollingService } from "@/lib/services/long-polling";
import { useAuth } from "@/lib/hooks/use-auth";
import { swrKeys } from "@/lib/swr-config";
import useSWR from "swr";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Chat {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function ChatsInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { socket, isConnected, connectionError } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch chats list
  const { data: chats = [], error: chatsError, isLoading: chatsLoading, mutate: mutateChats } = useSWR(
    swrKeys.chat.list(),
    () => ChatService.list().then(async (r) => {
      if (r.ok) {
        return await r.json();
      }
      throw new Error('Failed to load chats');
    }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Handle URL parameters for direct chat access
  useEffect(() => {
    const chatId = searchParams?.get('chatId');
    if (chatId && chats.length > 0) {
      const chat = chats.find((c: any) => c.id === chatId);
      if (chat) {
        // Check if user is trying to chat with themselves
        if (chat.otherUser.id === user?.id) {
          toast.error('You cannot chat with yourself');
          router.push('/chat');
          return;
        }
        setSelectedChat(chat);
      }
    }
  }, [searchParams, chats, user?.id, router]);

  // Fetch messages for selected chat
  const { data: messages = [], error: messagesError, isLoading: messagesLoading, mutate: mutateMessages } = useSWR(
    selectedChat ? swrKeys.chat.messages(selectedChat.id) : null,
    () => ChatService.messages(selectedChat!.id).then(async (r) => {
      if (r.ok) {
        return await r.json();
      }
      throw new Error('Failed to load messages');
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  // Filter chats based on search query
  const filteredChats = chats.filter((chat: Chat) =>
    chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select first chat if none selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket.IO message handling
  useEffect(() => {
    if (!socket || !isConnected || connectionError) return;

    const onMessage = (payload: any) => {
      console.log("Received socket message:", payload);
      
      // If the message is for the currently selected chat, add it to messages
      if (selectedChat && payload.chatId === selectedChat.id) {
        mutateMessages((currentMessages: Message[] = []) => [...currentMessages, payload], false);
      }
      
      // Update the chat list to show the new last message
      mutateChats((currentChats: Chat[] = []) => {
        return currentChats.map((chat: Chat) => {
          if (chat.id === payload.chatId) {
            return {
              ...chat,
              lastMessage: {
                id: payload.id,
                content: payload.content,
                senderId: payload.senderId,
                createdAt: payload.createdAt,
              },
              updatedAt: payload.createdAt,
            };
          }
          return chat;
        });
      }, false);
    };

    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [socket, isConnected, connectionError, selectedChat, mutateMessages, mutateChats]);

  // Long polling fallback when Socket.IO is not available
  useEffect(() => {
    if (socket && isConnected && !connectionError) {
      // Socket.IO is working, stop any long polling
      if (selectedChat) {
        longPollingService.stopPolling(selectedChat.id);
      }
      return;
    }

    // Socket.IO is not available, start long polling for the selected chat
    if (selectedChat) {
      longPollingService.startPolling(selectedChat.id, {
        interval: 5000, // Poll every 5 seconds
        maxRetries: 3,
        onMessage: (newMessages: Message[]) => {
          // Check if there are new messages by comparing with current messages
          const currentMessageIds = new Set(messages?.map((m: Message) => m.id) || []);
          const actualNewMessages = newMessages.filter(msg => !currentMessageIds.has(msg.id));
          
          if (actualNewMessages.length > 0) {
            console.log(`Long polling: Found ${actualNewMessages.length} new messages`);
            mutateMessages((currentMessages: Message[] = []) => [...currentMessages, ...actualNewMessages], false);
            
            // Update chat list with new last message
            const latestMessage = actualNewMessages[actualNewMessages.length - 1];
            mutateChats((currentChats: Chat[] = []) => {
              return currentChats.map((chat: Chat) => {
                if (chat.id === selectedChat.id) {
                  return {
                    ...chat,
                    lastMessage: {
                      id: latestMessage.id,
                      content: latestMessage.content,
                      senderId: latestMessage.senderId,
                      createdAt: latestMessage.createdAt,
                    },
                    updatedAt: latestMessage.createdAt,
                  };
                }
                return chat;
              });
            }, false);
          }
        },
        onError: (error: Error) => {
          console.error("Long polling error:", error);
          toast.error("Failed to receive new messages. Please refresh the page.");
        }
      });
    }

    // Cleanup: stop polling when component unmounts or chat changes
    return () => {
      if (selectedChat) {
        longPollingService.stopPolling(selectedChat.id);
      }
    };
  }, [selectedChat, socket, isConnected, connectionError, messages, mutateMessages, mutateChats]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || isSending) return;
    
    setIsSending(true);
    try {
      const messagePayload = {
        senderId: user.id,
        content: newMessage.trim(),
      };

      // Send via Socket.IO for real-time delivery (if connected)
      if (socket && isConnected) {
        socket.emit("message", {
          chatId: selectedChat.id,
          ...messagePayload,
        });
      }

      // Send via API for persistence
      const response = await ChatService.postMessage(selectedChat.id, messagePayload);
      
      if (response.ok) {
        const newMessageData = await response.json();
        
        // Optimistically add the message to the UI
        mutateMessages((currentMessages: Message[] = []) => [...currentMessages, newMessageData], false);
        
        // Update chat list with new last message
        mutateChats((currentChats: Chat[] = []) => {
          return currentChats.map((chat: Chat) => {
            if (chat.id === selectedChat.id) {
              return {
                ...chat,
                lastMessage: {
                  id: newMessageData.id,
                  content: newMessageData.content,
                  senderId: newMessageData.senderId,
                  createdAt: newMessageData.createdAt,
                },
                updatedAt: newMessageData.createdAt,
              };
            }
            return chat;
          });
        }, false);
        
      setNewMessage("");
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (chatsError || messagesError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Chats</h1>
          <p className="text-muted-foreground">Failed to load chat data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with your trip companions</p>
        {connectionError && (
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
            {connectionError} - Messages will be saved but not delivered in real-time
          </div>
        )}
        {!connectionError && !isConnected && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            Connecting to real-time chat...
          </div>
        )}
        {isConnected && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            Real-time chat connected
          </div>
        )}
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
              {chatsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-muted-foreground mb-2">No conversations found</div>
                  <div className="text-sm text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "Start a conversation from a trip request"}
                  </div>
                </div>
              ) : (
                filteredChats.map((chat: Chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                      selectedChat?.id === chat.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                          src="/placeholder.svg"
                          alt={chat.otherUser.name}
                      />
                      <AvatarFallback>
                          {chat.otherUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                      {isConnected && !connectionError && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                          {chat.otherUser.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                          {chat.lastMessage ? formatTimestamp(chat.lastMessage.createdAt) : formatTimestamp(chat.updatedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-muted-foreground truncate">
                          {chat.otherUser.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage ? chat.lastMessage.content : "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
          {/* Chat Header */}
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                          src="/placeholder.svg"
                          alt={selectedChat.otherUser.name}
                    />
                    <AvatarFallback>
                          {selectedChat.otherUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                      {isConnected && !connectionError && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div>
                      <h3 className="font-semibold">{selectedChat.otherUser.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>{selectedChat.otherUser.email}</span>
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
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <div className="text-muted-foreground mb-2">No messages yet</div>
                        <div className="text-sm text-muted-foreground">Start the conversation!</div>
                      </div>
                    </div>
                  ) : (
              <div className="space-y-4">
                      {messages.map((message: Message) => {
                        const isMe = message.senderId === user?.id;
                        return (
                  <div
                    key={message.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isMe
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                              <p className="text-sm">{message.content}</p>
                      <span
                        className={`text-xs mt-1 block ${
                                  isMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                                {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
              </div>
                  )}
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
                className="flex-1"
                    disabled={isSending}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    disabled={isSending || !newMessage.trim()}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                <Send className="h-4 w-4" />
                    )}
              </Button>
            </div>
          </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">Select a conversation</div>
                <div className="text-sm text-muted-foreground">Choose a chat from the list to start messaging</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
