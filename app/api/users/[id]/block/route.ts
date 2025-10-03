import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const blockUserSchema = z.object({
  reason: z.string().optional(),
});

async function blockUser(req: AuthenticatedRequest) {
  try {
    const userId = req.url?.split('/')[5]; // Extract user ID from URL
    const currentUserId = req.user!.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { reason } = blockUserSchema.parse(body);

    // Check if user exists
    const userToBlock = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!userToBlock) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 400 },
      );
    }

    // Create block relationship
    const blockRecord = await prisma.blockedUser.create({
      data: {
        blockerId: currentUserId,
        blockedId: userId,
        reason: reason || null,
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

    return NextResponse.json({
      message: 'User blocked successfully',
      blockedUser: blockRecord.blocked,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(blockUser);
