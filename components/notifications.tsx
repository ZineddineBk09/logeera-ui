'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  MessageCircle,
  UserCheck,
  UserX,
  Package,
  Truck,
  CheckCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '@prisma/client';

interface Notification {
  id: string;
  type:
    | 'CHAT_MESSAGE'
    | 'REQUEST_SENT'
    | 'REQUEST_ACCEPTED'
    | 'REQUEST_REJECTED'
    | 'REQUEST_CANCELLED'
    | 'REQUEST_IN_TRANSIT'
    | 'REQUEST_DELIVERED'
    | 'REQUEST_COMPLETED';
  title: string;
  message: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  tripId?: string;
  requestId?: string;
  chatId?: string;
  isRead: boolean;
  createdAt: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await api('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await api(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await api('/api/notifications/read-all', {
        method: 'PATCH',
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);

    // Navigate based on notification type
    // if (notification.chatId) {
    //   router.push(`/chats?chatId=${notification.chatId}`);
    // } else if (notification.tripId) {
    //   router.push(`/trips/${notification.tripId}`);
    // } else if (notification.requestId) {
    //   router.push('/requests');
    // }

    switch (notification.type) {
      case 'CHAT_MESSAGE':
        router.push(`/chats?chatId=${notification.chatId}`);
        break;
      case 'REQUEST_SENT':
        router.push(`/requests?requestId=${notification.requestId}`);

      case 'REQUEST_ACCEPTED':
        router.push(`/requests?requestId=${notification.requestId}`);
        break;
      case 'REQUEST_REJECTED':
        router.push(`/requests?requestId=${notification.requestId}`);
        break;
      case 'REQUEST_CANCELLED':
        router.push(`/requests?requestId=${notification.requestId}`);
        break;
      case 'REQUEST_IN_TRANSIT':
        router.push(`/requests?requestId=${notification.requestId}`);
        break;
      case 'REQUEST_DELIVERED':
        router.push(`/requests?requestId=${notification.requestId}`);
        break;
      case 'REQUEST_COMPLETED':
        router.push(`/requests?requestId=${notification.requestId}`);
        break;
    }

    setIsOpen(false);
  };

  // Get notification icon
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'CHAT_MESSAGE':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'REQUEST_SENT':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'REQUEST_ACCEPTED':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'REQUEST_REJECTED':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'REQUEST_CANCELLED':
        return <X className="h-4 w-4 text-orange-500" />;
      case 'REQUEST_IN_TRANSIT':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'REQUEST_DELIVERED':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'REQUEST_COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="p-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex cursor-pointer items-start gap-3 p-3 hover:!bg-gray-100"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={notification.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {notification.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="truncate text-sm font-medium hover:!text-gray-700">
                        {notification.userName}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <p className="text-muted-foreground mb-1 text-sm">
                      {notification.message}
                    </p>

                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
