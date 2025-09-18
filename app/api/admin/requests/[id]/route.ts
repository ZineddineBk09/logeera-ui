import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const updateRequestSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  message: z.string().optional(),
});

async function getRequest(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const requestId = url.pathname.split('/').slice(-2, -1)[0];

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        trip: {
          select: {
            id: true,
            originName: true,
            destinationName: true,
            departureAt: true,
            capacity: true,
            bookedSeats: true,
            pricePerSeat: true,
            publisher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request });
  } catch (error) {
    console.error('Admin request fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function updateRequest(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const requestId = url.pathname.split('/').slice(-2, -1)[0];

    const body = await req.json();
    const { status, message } = updateRequestSchema.parse(body);

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        ...(status && { status }),
        ...(message && { message }),
        updatedAt: new Date(),
      },
      include: {
        applicant: {
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
            publisher: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Admin request update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getRequest);
export const PUT = withAuth(updateRequest);
