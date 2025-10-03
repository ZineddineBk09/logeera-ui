import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function getBlockedUsers(req: AuthenticatedRequest) {
  try {
    const currentUserId = req.user!.userId;

    const blockedUsers = await prisma.blockedUser.findMany({
      where: {
        blockerId: currentUserId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            averageRating: true,
            ratingCount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      blockedUsers.map((block) => ({
        id: block.id,
        blockedAt: block.createdAt,
        reason: block.reason,
        user: block.blocked,
      })),
    );
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getBlockedUsers);
