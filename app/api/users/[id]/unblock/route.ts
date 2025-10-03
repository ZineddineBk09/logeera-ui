import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function unblockUser(req: AuthenticatedRequest) {
  try {
    const userId = req.url?.split('/')[5]; // Extract user ID from URL
    const currentUserId = req.user!.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    // Find and delete the block relationship
    const blockRecord = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!blockRecord) {
      return NextResponse.json(
        { error: 'User is not blocked' },
        { status: 400 },
      );
    }

    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      },
    });

    return NextResponse.json({
      message: 'User unblocked successfully',
      unblockedUser: blockRecord.blocked,
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const DELETE = withAuth(unblockUser);
