import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createRatingSchema = z.object({
  value: z.number().min(1).max(5),
  comment: z.string().optional(),
});

async function createRating(req: AuthenticatedRequest) {
  try {
    const tripId = req.url?.split('/')[6]; // Extract trip ID from URL
    const reviewerUserId = req.user!.userId;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { value, comment } = createRatingSchema.parse(body);

    // Check if trip exists and is completed
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        publisher: {
          select: { id: true, name: true },
        },
        requests: {
          where: {
            applicantId: reviewerUserId,
            status: 'ACCEPTED',
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if trip is completed
    if (trip.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only rate completed trips' },
        { status: 400 },
      );
    }

    // Check if user was part of this trip (either as publisher or accepted passenger)
    const isPublisher = trip.publisherId === reviewerUserId;
    const wasPassenger = trip.requests.length > 0;

    if (!isPublisher && !wasPassenger) {
      return NextResponse.json(
        { error: 'You can only rate trips you participated in' },
        { status: 403 },
      );
    }

    // Cannot rate yourself
    if (trip.publisherId === reviewerUserId) {
      return NextResponse.json(
        { error: 'Cannot rate your own trip' },
        { status: 400 },
      );
    }

    // Check if already rated this trip
    const existingRating = await prisma.rating.findUnique({
      where: {
        reviewerUserId_tripId: {
          reviewerUserId,
          tripId,
        },
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this trip' },
        { status: 400 },
      );
    }

    // Create the rating
    const rating = await prisma.rating.create({
      data: {
        ratedUserId: trip.publisherId, // Rate the trip publisher
        reviewerUserId,
        tripId,
        value,
        comment: comment || null,
      },
      include: {
        ratedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewerUser: {
          select: {
            id: true,
            name: true,
          },
        },
        trip: {
          select: {
            id: true,
            originName: true,
            destinationName: true,
            departureAt: true,
          },
        },
      },
    });

    // Update user's average rating
    const userRatings = await prisma.rating.aggregate({
      where: { ratedUserId: trip.publisherId },
      _avg: { value: true },
      _count: { id: true },
    });

    await prisma.user.update({
      where: { id: trip.publisherId },
      data: {
        averageRating: userRatings._avg.value || 0,
        ratingCount: userRatings._count.id,
      },
    });

    return NextResponse.json({
      message: 'Rating created successfully',
      rating,
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function getRatingsForTrip(req: AuthenticatedRequest) {
  try {
    const tripId = req.url?.split('/')[6]; // Extract trip ID from URL

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 },
      );
    }

    const ratings = await prisma.rating.findMany({
      where: { tripId },
      include: {
        reviewerUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching trip ratings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const POST = withAuth(createRating);
export const GET = withAuth(getRatingsForTrip);
