import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

async function getUser(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        type: true,
        status: true,
        role: true,
        averageRating: true,
        ratingCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's published trips
    const trips = await prisma.trip.findMany({
      where: {
        publisherId: userId,
        // status: 'ACTIVE' // Only show active trips
      },
      select: {
        id: true,
        originName: true,
        destinationName: true,
        departureAt: true,
        capacity: true,
        vehicleType: true,
        status: true,
      },
      orderBy: { departureAt: 'asc' },
    });

    // Get user's received ratings
    const ratings = await prisma.rating.findMany({
      where: { ratedUserId: userId },
      include: {
        reviewerUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to recent reviews
    });

    return NextResponse.json({
      user,
      trips,
      ratings,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function updateUser(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    // Check if user is updating their own profile
    console.log('Authenticated user ID:', req.user!.userId);
    console.log('Requested user ID:', userId);
    console.log('IDs match:', req.user!.userId === userId);

    if (req.user!.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();

    // Validate input
    const updateSchema = z.object({
      name: z.string().min(1, 'Name is required').max(100),
      email: z.string().email('Invalid email'),
      phoneNumber: z.string().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        id: { not: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 },
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        type: true,
        status: true,
        role: true,
        averageRating: true,
        ratingCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function deleteUser(req: AuthenticatedRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];

    // Check if user is deleting their own account
    if (req.user!.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getUser);
export const PUT = withAuth(updateUser);
export const DELETE = withAuth(deleteUser);
