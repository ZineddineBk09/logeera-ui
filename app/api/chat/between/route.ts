import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function handler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userAId = searchParams.get('userAId');
    const userBId = searchParams.get('userBId');
    const tripId = searchParams.get('tripId'); // Optional trip ID
    const create = searchParams.get('create') === '1';

    if (!userAId || !userBId) {
      return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
    }

    // Find existing chat between the two users (optionally for specific trip)
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { userAId, userBId, tripId: tripId || null },
          { userAId: userBId, userBId: userAId, tripId: tripId || null },
        ],
      },
      include: {
        trip: tripId ? {
          select: {
            id: true,
            originName: true,
            destinationName: true,
            departureAt: true,
            payloadType: true,
            parcelWeight: true,
            passengerCount: true,
            status: true,
          }
        } : false,
      },
    });

    if (!chat && create) {
      chat = await prisma.chat.create({
        data: { 
          userAId, 
          userBId,
          tripId: tripId || null,
        },
        include: {
          trip: tripId ? {
            select: {
              id: true,
              originName: true,
              destinationName: true,
              departureAt: true,
              payloadType: true,
              parcelWeight: true,
              passengerCount: true,
              status: true,
            }
          } : false,
        },
      });
    }

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler);
