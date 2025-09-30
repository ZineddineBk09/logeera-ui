'use client';

import { useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Send,
  MapPin,
  Phone,
  Video,
  MoreVertical,
  Loader2,
  X,
  Package,
  Truck,
  CheckCircle,
  Users,
  Calendar,
  Clock,
  Navigation,
} from 'lucide-react';
import { useSocket } from '@/components/socket/SocketProvider';
import { ChatService, RequestsService } from '@/lib/services';
import { longPollingService } from '@/lib/services/long-polling';
import { useAuth } from '@/lib/hooks/use-auth';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';

interface Chat {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  trip?: {
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    payloadType: 'PARCEL' | 'PASSENGER';
    parcelWeight?: number;
    passengerCount?: number;
    status: string;
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

interface ActiveRequest {
  id: string;
  status: string;
  isPublisher: boolean; // Whether current user is the trip publisher
}

export function ChatsInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [userToBlock, setUserToBlock] = useState<{ id: string; name: string } | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState(false);
  const [hasLocationAccess, setHasLocationAccess] = useState<boolean | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showCancelPendingDialog, setShowCancelPendingDialog] = useState(false);
  const [showCancelAcceptedDialog, setShowCancelAcceptedDialog] = useState(false);
  const [showReceivedDialog, setShowReceivedDialog] = useState(false);
  const [showDeliveredDialog, setShowDeliveredDialog] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const { socket, isConnected, connectionError } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch chats list
  const {
    data: chats = [],
    error: chatsError,
    isLoading: chatsLoading,
    mutate: mutateChats,
  } = useSWR(
    swrKeys.chat.list(),
    () =>
      ChatService.list().then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load chats');
      }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    },
  );

  // Handle URL parameters for direct chat access
  useEffect(() => {
    const chatId = searchParams?.get('chatId');
    if (chatId && !chatsLoading && user?.id) {
      // If chats are loaded, try to find the specific chat
      if (chats.length > 0) {
        const chat = chats.find((c: any) => c.id === chatId);
        if (chat) {
          // Check if user is trying to chat with themselves
          if (chat.otherUser.id === user.id) {
            toast.error('You cannot chat with yourself');
            router.push('/chats');
            return;
          }
          setSelectedChat(chat);
        } else {
          // Chat not found in the list, try to fetch it directly
          // This might be a chat that exists but isn't in the current user's chat list
          // We'll show an error for now, but in the future we could try to fetch it
          // toast.error('Chat not found or you no longer have access to this conversation');
          router.push('/chats');
        }
      } else {
        // No chats available, but we have a chatId - this might be an invalid chat
        // toast.error('Chat not found or you no longer have access to this conversation');
        router.push('/chats');
      }
    }
  }, [searchParams, chats, chatsLoading, user?.id, router]);

  // Fetch messages for selected chat
  const {
    data: messages = [],
    error: messagesError,
    isLoading: messagesLoading,
    mutate: mutateMessages,
  } = useSWR(
    selectedChat ? swrKeys.chat.messages(selectedChat.id) : null,
    () =>
      ChatService.messages(selectedChat!.id).then(async (r) => {
        if (r.ok) {
          const messages = await r.json();
          // Sort messages by createdAt and id to ensure proper ordering
          return messages.sort((a: Message, b: Message) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            if (dateA !== dateB) {
              return dateA - dateB;
            }
            // If timestamps are equal, sort by ID for consistency
            return a.id.localeCompare(b.id);
          });
        }
        throw new Error('Failed to load messages');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
    },
  );

  // Filter chats based on search query
  const filteredChats = chats.filter(
    (chat: Chat) =>
      chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.otherUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.trip && (
        chat.trip.originName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.trip.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
      )),
  );

  // Auto-select first chat if none selected and no URL parameter
  useEffect(() => {
    const chatId = searchParams?.get('chatId');
    if (chats.length > 0 && !selectedChat && !chatId) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat, searchParams]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch active request when chat with trip is selected
  useEffect(() => {
    const fetchActiveRequest = async () => {
      if (!selectedChat?.trip || !user?.id) {
        setActiveRequest(null);
        return;
      }

      try {
        // Fetch requests for this trip
        const response = await api(`/api/requests?tripId=${selectedChat.trip.id}`);
        if (response.ok) {
          const requests = await response.json();
          // Find the active request between current user and the other user
          const activeReq = requests.find((req: any) => 
            (req.applicantId === user.id && req.trip.publisherId === selectedChat.otherUser.id) ||
            (req.applicantId === selectedChat.otherUser.id && req.trip.publisherId === user.id)
          );
          
          if (activeReq) {
            setActiveRequest({
              id: activeReq.id,
              status: activeReq.status,
              isPublisher: activeReq.trip.publisherId === user.id,
            });
          } else {
            setActiveRequest(null);
          }
        }
      } catch (error) {
        console.error('Error fetching active request:', error);
        setActiveRequest(null);
      }
    };

    fetchActiveRequest();
  }, [selectedChat, user?.id]);

  // Socket.IO message handling (only if socket is enabled and connected)
  useEffect(() => {
    if (!socket || !isConnected || connectionError) return;

    const onMessage = (payload: any) => {
      console.log('Received socket message:', payload);

      // If the message is for the currently selected chat, add it to messages
      if (selectedChat && payload.chatId === selectedChat.id) {
        mutateMessages(
          (currentMessages: Message[] = []) => {
            // Check if message already exists to prevent duplicates
            const messageExists = currentMessages.some(msg => msg.id === payload.id);
            if (messageExists) {
              console.log('Message already exists, skipping duplicate');
              return currentMessages;
            }
            return [...currentMessages, payload];
          },
          false,
        );
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

    socket.on('message', onMessage);
    return () => {
      socket.off('message', onMessage);
    };
  }, [
    socket,
    isConnected,
    connectionError,
    selectedChat,
    mutateMessages,
    mutateChats,
  ]);

  // Long polling fallback when Socket.IO is not available or disabled
  useEffect(() => {
    // Check if Socket.IO is enabled via environment variable
    const socketEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true';
    
    if (socketEnabled && socket && isConnected && !connectionError) {
      // Socket.IO is working, stop any long polling
      if (selectedChat) {
        longPollingService.stopPolling(selectedChat.id);
      }
      return;
    }

    // Socket.IO is disabled or not available, start long polling for the selected chat
    if (selectedChat) {
      longPollingService.startPolling(selectedChat.id, {
        interval: 5000, // Poll every 5 seconds
        maxRetries: 3,
        onMessage: (newMessages: Message[]) => {
          // Use mutateMessages to get the current state and check for duplicates
          let actualNewMessages: Message[] = [];
          
          mutateMessages(
            (currentMessages: Message[] = []) => {
              // Check if there are new messages by comparing with current messages
              const currentMessageIds = new Set(
                currentMessages.map((m: Message) => m.id),
              );
              actualNewMessages = newMessages.filter(
                (msg) => !currentMessageIds.has(msg.id),
              );

              if (actualNewMessages.length > 0) {
                console.log(
                  `Long polling: Found ${actualNewMessages.length} new messages`,
                );
                // Sort messages by createdAt and id to ensure proper ordering
                const allMessages = [...currentMessages, ...actualNewMessages];
                return allMessages.sort((a, b) => {
                  const dateA = new Date(a.createdAt).getTime();
                  const dateB = new Date(b.createdAt).getTime();
                  if (dateA !== dateB) {
                    return dateA - dateB;
                  }
                  // If timestamps are equal, sort by ID for consistency
                  return a.id.localeCompare(b.id);
                });
              }
              
              // No new messages, return current messages unchanged
              return currentMessages;
            },
            false,
          );

          // Update chat list with new last message if there were new messages
          if (actualNewMessages.length > 0) {
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
          console.error('Long polling error:', error);
          toast.error(
            'Failed to receive new messages. Please refresh the page.',
          );
        },
      });
    }

    // Cleanup: stop polling when component unmounts or chat changes
    return () => {
      if (selectedChat) {
        longPollingService.stopPolling(selectedChat.id);
      }
    };
  }, [
    selectedChat,
    socket,
    isConnected,
    connectionError,
    messages,
    mutateMessages,
    mutateChats,
  ]);

  // Check for location access permission
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((result) => {
        setHasLocationAccess(result.state === 'granted');
      }).catch(() => {
        // If permissions API is not supported, we'll check when user tries to use it
        setHasLocationAccess(null);
      });
    } else {
      setHasLocationAccess(false);
    }
  }, []);

  // Simple client-side validation
  const validateMessage = (content: string): string | null => {
    if (!content.trim()) {
      return 'Message cannot be empty';
    }
    if (content.length > 1000) {
      return 'Message cannot exceed 1000 characters';
    }
    
    // Check for basic XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /<form[^>]*>/gi,
      /<input[^>]*>/gi,
    ];
    
    if (xssPatterns.some(pattern => pattern.test(content))) {
      return 'Message contains potentially harmful content';
    }
    
    return null;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || isSending) return;

    // Validate message content
    const validationError = validateMessage(newMessage);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSending(true);
    try {
      const messagePayload = {
        senderId: user.id,
        content: newMessage.trim(),
      };

      // Send via API for persistence
      const response = await ChatService.postMessage(
        selectedChat.id,
        messagePayload,
      );

      if (response.ok) {
        const newMessageData = await response.json();

        // Only add to UI if Socket.IO is not enabled (to avoid duplicates)
        // If Socket.IO is enabled, the message will be received via socket
        const socketEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true';
        if (!socketEnabled || !socket || !isConnected) {
          console.log('Adding message to UI via API response:', newMessageData.id);
          // Optimistically add the message to the UI
          mutateMessages(
            (currentMessages: Message[] = []) => [
              ...currentMessages,
              newMessageData,
            ],
            false,
          );
        } else {
          console.log('Socket.IO enabled, not adding message to UI via API response');
        }

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

        setNewMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendLocation = async () => {
    if (!selectedChat || !user || isGettingLocation) return;

    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `📍 My location: https://www.google.com/maps/@${latitude},${longitude},14z`;
          
          // Send location as a message
          const response = await ChatService.postMessage(selectedChat.id, {
            content: locationMessage,
            senderId: user.id,
          });

          if (response.ok) {
            const newMessageData = await response.json();
            
            // Add message to UI immediately for better UX
            mutateMessages((currentMessages: Message[] = []) => {
              return [...currentMessages, newMessageData];
            }, false);

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

            setHasLocationAccess(true);
            toast.success('Location sent successfully!');
          } else {
            throw new Error('Failed to send location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setHasLocationAccess(false);
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error('Location access denied. Please enable location permissions.');
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error('Location information unavailable.');
              break;
            case error.TIMEOUT:
              toast.error('Location request timed out.');
              break;
            default:
              toast.error('An unknown error occurred while retrieving location.');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    } catch (error) {
      console.error('Error sending location:', error);
      toast.error('Failed to send location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleRequestStatusUpdate = async (newStatus: string) => {
    if (!activeRequest || isUpdatingRequest) return;

    setIsUpdatingRequest(true);
    try {
      const response = await RequestsService.setStatus(activeRequest.id, newStatus.toLowerCase() as any);
      
      if (response.ok) {
        const updatedRequest = await response.json();
        setActiveRequest({
          ...activeRequest,
          status: updatedRequest.status,
        });
        
        const statusMessages = {
          'cancelled': 'Request cancelled',
          'in_transit': 'Request marked as in transit',
          'delivered': 'Request marked as delivered',
          'completed': 'Request completed',
        };
        toast.success(statusMessages[newStatus.toLowerCase() as keyof typeof statusMessages] || 'Status updated');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingRequest(false);
    }
  };

  // Handler functions for confirmation dialogs
  const handleCancelPending = () => {
    setShowCancelPendingDialog(true);
  };

  const handleCancelAccepted = () => {
    setShowCancelAcceptedDialog(true);
  };

  const handleReceived = () => {
    setShowReceivedDialog(true);
  };

  const handleDelivered = () => {
    setShowDeliveredDialog(true);
  };

  const handleCompleted = () => {
    setShowCompletedDialog(true);
  };

  // Confirmation functions
  const confirmCancelPending = async () => {
    setShowCancelPendingDialog(false);
    await handleRequestStatusUpdate('CANCELLED');
  };

  const confirmCancelAccepted = async () => {
    setShowCancelAcceptedDialog(false);
    await handleRequestStatusUpdate('CANCELLED');
  };

  const confirmReceived = async () => {
    setShowReceivedDialog(false);
    await handleRequestStatusUpdate('IN_TRANSIT');
  };

  const confirmDelivered = async () => {
    setShowDeliveredDialog(false);
    await handleRequestStatusUpdate('DELIVERED');
  };

  const confirmCompleted = async () => {
    setShowCompletedDialog(false);
    await handleRequestStatusUpdate('COMPLETED');
  };

  const handleBlockUser = (userId: string, userName: string) => {
    setUserToBlock({ id: userId, name: userName });
    setShowBlockDialog(true);
  };

  const confirmBlockUser = async () => {
    if (!userToBlock) return;

    setIsBlocking(true);
    try {
      const response = await api(`/api/users/${userToBlock.id}/block`, {
        method: 'POST',
        body: JSON.stringify({
          reason: 'Blocked from chat',
        }),
      });

      if (response.ok) {
        toast.success(`${userToBlock.name} has been blocked`);
        setShowBlockDialog(false);
        setUserToBlock(null);
        
        // Remove the chat from the list or redirect to chat list
        if (selectedChat?.otherUser.id === userToBlock.id) {
          setSelectedChat(null);
          router.push('/chats');
        }
        
        // Refresh chats list
        mutateChats();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsBlocking(false);
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
      minute: '2-digit',
    });
  };

  // Function to detect URLs and render them as clickable links
  const renderMessageContent = (content: string) => {
    // URL regex pattern to match http/https URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
  return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-blue-400 hover:text-blue-300"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (chatsError || messagesError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-foreground mb-2 text-2xl font-bold">
            Error Loading Chats
          </h1>
          <p className="text-muted-foreground">
            Failed to load chat data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with your trip companions</p>
        {/* {connectionError && (
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            {connectionError} - Messages will be saved but not delivered in
            real-time
          </div>
        )} */}
        {/* {!connectionError && !isConnected && process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            Connecting to real-time chat...
          </div>
        )}
        {isConnected && process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            Real-time chat connected
          </div>
        )}
        {process.env.NEXT_PUBLIC_ENABLE_SOCKET !== 'true' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            Using polling mode for message updates
          </div>
        )} */}
      </div>

      <div className="grid h-[calc(100vh-200px)] grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-full max-h-[calc(100vh-400px)] overflow-y-auto">
              {chatsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-muted-foreground mb-2">
                    No conversations found
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Start a conversation from a trip request'}
                  </div>
                </div>
              ) : (
                filteredChats.map((chat: Chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                    className={`h-full hover:bg-muted/50 flex cursor-pointer items-start gap-3 border-b p-4 transition-colors ${
                      selectedChat?.id === chat.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                          src="/placeholder.svg"
                          alt={chat.otherUser.name}
                      />
                      <AvatarFallback>
                          {chat.otherUser.name
                            .split(' ')
                          .map((n) => n[0])
                            .join('')}
                      </AvatarFallback>
                    </Avatar>
                      {process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' && isConnected && !connectionError && (
                        <div className="border-background absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 bg-green-500" />
                    )}
                  </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-tight truncate flex-1 min-w-0">
                          {chat.otherUser.name}
                      </h3>
                        <span className="text-muted-foreground text-xs flex-shrink-0">
                          {chat.lastMessage
                            ? formatTimestamp(chat.lastMessage.createdAt)
                            : formatTimestamp(chat.updatedAt)}
                      </span>
                    </div>
                      {chat.trip ? (
                        <div className="mb-1 flex items-start gap-1 min-w-0">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground text-xs leading-relaxed truncate flex-1 min-w-0">
                            {chat.trip.originName} → {chat.trip.destinationName}
                      </span>
                        </div>
                      ) : (
                        <div className="mb-1 flex items-start gap-1 min-w-0">
                          <span className="text-muted-foreground text-xs leading-relaxed truncate flex-1 min-w-0">
                            {chat.otherUser.email}
                      </span>
                    </div>
                      )}
                    <div className="flex items-start justify-between gap-2 min-w-0">
                        <p className="text-muted-foreground text-sm leading-relaxed flex-1 min-w-0 truncate">
                          {chat.lastMessage
                            ? chat.lastMessage.content
                            : 'No messages yet'}
                        </p>
                        {chat.trip && (
                          <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">
                            {chat.trip.payloadType === 'PARCEL' ? 'Delivery' : 'Trip'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="flex flex-col lg:col-span-2">
          {selectedChat ? (
            <>
          {/* Chat Header */}
              <CardHeader className="border-b pb-4">
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
                            .split(' ')
                        .map((n) => n[0])
                            .join('')}
                    </AvatarFallback>
                  </Avatar>
                      {process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' && isConnected && !connectionError && (
                        <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
                  )}
                </div>
                <div>
                      <h3 className="font-semibold">
                        {selectedChat.otherUser.name}
                      </h3>
                      <div className="text-muted-foreground flex items-center gap-1 text-sm">
                        <span>{selectedChat.otherUser.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                      <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/drivers/${selectedChat.otherUser.id}`)
                          }
                        >
                          View Profile
                        </DropdownMenuItem>
                        {hasLocationAccess !== false && (
                          <DropdownMenuItem
                            onClick={handleSendLocation}
                            disabled={isGettingLocation}
                          >
                            {isGettingLocation ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Getting Location...
                              </>
                            ) : (
                              <>
                                <Navigation className="mr-2 h-4 w-4" />
                                Share My Location
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleBlockUser(selectedChat.otherUser.id, selectedChat.otherUser.name)}
                        >
                      Block User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Trip Information Header */}
          {selectedChat.trip && (
            <div className="border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedChat.trip.originName} → {selectedChat.trip.destinationName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(selectedChat.trip.departureAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(selectedChat.trip.departureAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedChat.trip.payloadType === 'PARCEL' ? (
                        <Package className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      <span>
                        {selectedChat.trip.payloadType === 'PARCEL' 
                          ? `${selectedChat.trip.parcelWeight || 'N/A'}kg`
                          : `${selectedChat.trip.passengerCount || 'N/A'} passengers`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {selectedChat.trip.status}
                </Badge>
              </div>
              
              {/* Action Buttons */}
              {activeRequest && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeRequest.status === 'PENDING' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelPending}
                        disabled={isUpdatingRequest}
                      >
                        {isUpdatingRequest ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <X className="mr-2 h-3 w-3" />
                        )}
                        Cancel Request
                      </Button>
                    </>
                  )}

                  {activeRequest.status === 'ACCEPTED' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelAccepted}
                        disabled={isUpdatingRequest}
                      >
                        {isUpdatingRequest ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <X className="mr-2 h-3 w-3" />
                        )}
                        Cancel Request
                      </Button>
                      {activeRequest.isPublisher && (
                        <Button
                          size="sm"
                          onClick={handleReceived}
                          disabled={isUpdatingRequest}
                        >
                          {isUpdatingRequest ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Package className="mr-2 h-3 w-3" />
                          )}
                          {selectedChat.trip?.payloadType === 'PARCEL' ? 'Received' : 'Passenger Onboard'}
                        </Button>
                      )}
                    </>
                  )}

                  {activeRequest.status === 'IN_TRANSIT' && (
                    <>
                      {activeRequest.isPublisher && (
                        <Button
                          size="sm"
                          onClick={handleDelivered}
                          disabled={isUpdatingRequest}
                        >
                          {isUpdatingRequest ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : selectedChat.trip?.payloadType === 'PARCEL' ? (
                            <Truck className="mr-2 h-3 w-3" />
                          ) : (
                            <CheckCircle className="mr-2 h-3 w-3" />
                          )}
                          {selectedChat.trip?.payloadType === 'PARCEL' ? 'Delivered' : 'Arrived at Destination'}
                        </Button>
                      )}
                    </>
                  )}

                  {activeRequest.status === 'DELIVERED' && activeRequest.isPublisher && (
                    <Button
                      size="sm"
                      onClick={handleCompleted}
                      disabled={isUpdatingRequest}
                    >
                      {isUpdatingRequest ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-3 w-3" />
                      )}
                      Complete Trip
                    </Button>
                  )}

                  {activeRequest.status === 'COMPLETED' && (
                    <Badge variant="secondary" className="text-xs">
                      Trip Completed
                    </Badge>
                  )}

                  {(activeRequest.status === 'REJECTED' || activeRequest.status === 'CANCELLED') && (
                    <Badge variant="destructive" className="text-xs">
                      {activeRequest.status === 'REJECTED' ? 'Request Rejected' : 'Request Cancelled'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] p-4">
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <div className="text-muted-foreground mb-2">
                          No messages yet
                        </div>
                        <div className="text-muted-foreground text-sm">
                          Start the conversation!
                        </div>
                      </div>
                    </div>
                  ) : (
              <div className="space-y-4">
                      {messages.map((message: Message) => {
                        const isMe = message.senderId === user?.id;
                        return (
                  <div
                    key={message.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isMe
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-sm break-words whitespace-pre-wrap">
                                {renderMessageContent(message.content)}
                              </p>
                      <span
                                className={`mt-1 block text-xs ${
                                  isMe
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
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
              <div className="border-t p-4">
            <div className="mb-2 flex justify-end">
              <span className={`text-xs ${newMessage.length > 900 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {newMessage.length}/1000
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  // Limit input length and prevent XSS
                  const value = e.target.value;
                  if (value.length <= 1000) {
                    setNewMessage(value);
                  }
                }}
                onKeyPress={(e) =>
                  e.key === 'Enter' && !isSending && handleSendMessage()
                }
                className="flex-1"
                disabled={isSending}
                maxLength={1000}
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
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">
                  Select a conversation
                </div>
                <div className="text-muted-foreground text-sm">
                  Choose a chat from the list to start messaging
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {userToBlock?.name}? This will prevent them from sending you messages and you won't see their messages anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowBlockDialog(false);
              setUserToBlock(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBlockUser}
              disabled={isBlocking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBlocking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Blocking...
                </>
              ) : (
                'Block User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Pending Request Confirmation Dialog */}
      <AlertDialog open={showCancelPendingDialog} onOpenChange={setShowCancelPendingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this pending request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelPendingDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelPending}
              disabled={isUpdatingRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdatingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Accepted Request Confirmation Dialog */}
      <AlertDialog open={showCancelAcceptedDialog} onOpenChange={setShowCancelAcceptedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this accepted request? This will notify the other party and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelAcceptedDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelAccepted}
              disabled={isUpdatingRequest}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdatingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Received Confirmation Dialog */}
      <AlertDialog open={showReceivedDialog} onOpenChange={setShowReceivedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Received</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this {selectedChat?.trip?.payloadType === 'PARCEL' ? 'parcel' : 'passenger'} as received? This will change the status to "In Transit".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReceivedDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReceived}
              disabled={isUpdatingRequest}
            >
              {isUpdatingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Mark as Received
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delivered Confirmation Dialog */}
      <AlertDialog open={showDeliveredDialog} onOpenChange={setShowDeliveredDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedChat?.trip?.payloadType === 'PARCEL' ? 'Mark as Delivered' : 'Mark as Arrived'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this {selectedChat?.trip?.payloadType === 'PARCEL' ? 'parcel as delivered' : 'passenger as arrived at destination'}? This will change the status to "Delivered".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeliveredDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelivered}
              disabled={isUpdatingRequest}
            >
              {isUpdatingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : selectedChat?.trip?.payloadType === 'PARCEL' ? (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Mark as Delivered
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Arrived
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Completed Confirmation Dialog */}
      <AlertDialog open={showCompletedDialog} onOpenChange={setShowCompletedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this trip? This will finalize the {selectedChat?.trip?.payloadType === 'PARCEL' ? 'delivery' : 'passenger transport'} and enable rating.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCompletedDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCompleted}
              disabled={isUpdatingRequest}
            >
              {isUpdatingRequest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Trip
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
