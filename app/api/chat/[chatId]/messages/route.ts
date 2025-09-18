import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createMessageSchema = z.object({
  senderId: z.string().uuid(),
  content: z.string().min(1),
});

async function getMessages(req: AuthenticatedRequest) {
  try {
    const chatId = req.nextUrl.pathname.split('/')[3]; // Extract chatId from URL: /api/chat/[chatId]/messages

    // Verify user has access to this chat
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (
      !chat ||
      (chat.userAId !== req.user!.userId && chat.userBId !== req.user!.userId)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function createMessage(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { senderId, content } = createMessageSchema.parse(body);
    const chatId = req.nextUrl.pathname.split('/')[3]; // Extract chatId from URL: /api/chat/[chatId]/messages

    // Verify user has access to this chat
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (
      !chat ||
      (chat.userAId !== req.user!.userId && chat.userBId !== req.user!.userId)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify sender is the authenticated user
    if (senderId !== req.user!.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const savedMessage = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
      },
    });
    return NextResponse.json(savedMessage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getMessages);
export const POST = withAuth(createMessage);
