import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function getNotifications(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    
    // Get notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 notifications
    });

    // Transform notifications
    const transformedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      userId: notif.fromUserId,
      userName: notif.fromUser.name,
      userAvatar: undefined, // Could be added later
      tripId: notif.tripId,
      requestId: notif.requestId,
      chatId: notif.chatId,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    }));

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications: transformedNotifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function markAllAsRead(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;
    
    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getNotifications);
export const PATCH = withAuth(markAllAsRead);
