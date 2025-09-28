import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function markAsRead(req: AuthenticatedRequest) {
  try {
    const notificationId = req.nextUrl.pathname.split('/')[3];
    const userId = req.user!.userId;
    
    // Verify the notification belongs to the user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 },
      );
    }

    // Mark as read
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const PATCH = withAuth(markAsRead);
