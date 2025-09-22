import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Simple HTML sanitization function
function sanitizeMessage(content: string): string {
  return content
    .replace(/&/g, '&amp;')  // Must be first to avoid double encoding
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

const createMessageSchema = z.object({
  senderId: z.string().uuid(),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message cannot exceed 1000 characters')
    .refine(
      (content) => {
        // Check for basic XSS patterns
        const xssPatterns = [
          /<script[^>]*>.*?<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe[^>]*>/gi,
          /<object[^>]*>/gi,
          /<embed[^>]*>/gi,
          /<link[^>]*>/gi,
          /<meta[^>]*>/gi,
          /<style[^>]*>.*?<\/style>/gi,
          /<form[^>]*>/gi,
          /<input[^>]*>/gi,
        ];
        return !xssPatterns.some(pattern => pattern.test(content));
      },
      'Message contains potentially harmful content'
    ),
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
      orderBy: [
        { createdAt: 'asc' },
        { id: 'asc' }, // Secondary sort by ID for consistent ordering
      ],
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

    // Sanitize the content to remove any remaining harmful HTML
    const sanitizedContent = sanitizeMessage(content);

    // Additional validation: ensure content is not empty after sanitization
    if (!sanitizedContent.trim()) {
      return NextResponse.json(
        { error: 'Message content is invalid after sanitization' },
        { status: 400 }
      );
    }

    const savedMessage = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content: sanitizedContent.trim(),
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
