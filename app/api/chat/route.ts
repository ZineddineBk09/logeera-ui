import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function getChats(req: AuthenticatedRequest) {
  try {
    const userId = req.user!.userId;

    // Get all chats where the user is either userA or userB
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        userB: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        trip: {
          select: {
            id: true,
            originName: true,
            destinationName: true,
            departureAt: true,
            payloadType: true,
            parcelWeight: true,
            passengerCount: true,
            status: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the last message
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to include the other user and last message
    const transformedChats = chats.map((chat) => {
      const otherUser = chat.userAId === userId ? chat.userB : chat.userA;
      const lastMessage = chat.messages[0] || null;

      return {
        id: chat.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
        },
        trip: chat.trip
          ? {
              id: chat.trip.id,
              originName: chat.trip.originName,
              destinationName: chat.trip.destinationName,
              departureAt: chat.trip.departureAt,
              payloadType: chat.trip.payloadType,
              parcelWeight: chat.trip.parcelWeight,
              passengerCount: chat.trip.passengerCount,
              status: chat.trip.status,
            }
          : undefined,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      };
    });

    return NextResponse.json(transformedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getChats);
