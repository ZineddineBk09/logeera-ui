import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAId = searchParams.get('userAId');
    const userBId = searchParams.get('userBId');
    const create = searchParams.get('create') === '1';

    if (!userAId || !userBId) {
      return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
    }

    // Find existing chat between the two users
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });

    if (!chat && create) {
      chat = await prisma.chat.create({
        data: { userAId, userBId },
      });
    }

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ id: chat.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler);
