import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function getTrip(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const tripId = pathSegments[pathSegments.length - 1];

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            type: true,
            status: true,
            averageRating: true,
            ratingCount: true,
          },
        },
        requests: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                averageRating: true,
                ratingCount: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function updateTrip(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const tripId = pathSegments[pathSegments.length - 1];

    const body = await req.json();
    const { status } = body;

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(status && { status }),
      },
      include: {
        publisher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function deleteTrip(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const tripId = pathSegments[pathSegments.length - 1];

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Delete trip (cascade will handle related records)
    await prisma.trip.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getTrip);
export const PUT = withAuth(updateTrip);
export const DELETE = withAuth(deleteTrip);
