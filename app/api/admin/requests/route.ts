import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const getRequestsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
});

async function getRequests(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const { page, limit, search, status } = getRequestsSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
    });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          applicant: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          applicant: {
            email: { contains: search, mode: 'insensitive' },
          },
        },
        {
          trip: {
            origin: { contains: search, mode: 'insensitive' },
          },
        },
        {
          trip: {
            destination: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get requests with related data
    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.request.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return NextResponse.json({
      requests,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Admin requests fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getRequests);
