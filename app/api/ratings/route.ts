import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createRatingSchema = z.object({
  ratedUserId: z.string().uuid(),
  reviewerUserId: z.string().uuid(),
  value: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

async function createRating(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const data = createRatingSchema.parse(body);

    // Verify reviewer is the authenticated user
    if (data.reviewerUserId !== req.user!.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if rating already exists
    const existingRating = await prisma.rating.findFirst({
      where: {
        ratedUserId: data.ratedUserId,
        reviewerUserId: data.reviewerUserId,
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'Rating already exists' },
        { status: 409 },
      );
    }

    const savedRating = await prisma.rating.create({
      data,
    });

    // Update user's average rating
    const ratings = await prisma.rating.findMany({
      where: { ratedUserId: data.ratedUserId },
    });
    const averageRating =
      ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;

    await prisma.user.update({
      where: { id: data.ratedUserId },
      data: {
        averageRating,
        ratingCount: ratings.length,
      },
    });

    return NextResponse.json(savedRating, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function getRatings(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const where: any = {};
    if (userId) {
      where.ratedUserId = userId;
    }

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        reviewerUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = getRatings;
export const POST = withAuth(createRating);
