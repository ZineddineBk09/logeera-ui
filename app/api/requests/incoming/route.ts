import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function handler(req: AuthenticatedRequest) {
  try {
    const requests = await prisma.request.findMany({
      where: {
        trip: {
          publisherId: req.user!.userId,
        },
        status: {
          not: 'CANCELLED', // Exclude cancelled requests from incoming view
        },
      },
      include: {
        trip: true,
        applicant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler);
