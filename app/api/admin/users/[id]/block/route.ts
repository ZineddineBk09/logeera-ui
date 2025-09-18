import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function blockUser(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 2]; // Get user ID from the path

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from blocking themselves
    if (userId === req.user!.id) {
      return NextResponse.json(
        { error: 'Cannot block your own account' },
        { status: 400 },
      );
    }

    // Block user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: 'BLOCKED' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'User blocked successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(blockUser);
