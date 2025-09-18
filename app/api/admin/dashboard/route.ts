import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';

async function getDashboardStats(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'week';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case 'year':
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total counts
    const [
      totalUsers,
      totalTrips,
      totalRequests,
      totalMessages,
      activeUsers,
      completedTrips,
      acceptedRequests,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.request.count(),
      prisma.message.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.trip.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.request.count({
        where: { status: 'ACCEPTED' },
      }),
    ]);

    // Get previous period counts for growth calculation
    const previousStartDate = new Date(
      startDate.getTime() - (now.getTime() - startDate.getTime()),
    );

    const [previousTotalUsers, previousTotalTrips, previousTotalRequests] =
      await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              lt: startDate,
            },
          },
        }),
        prisma.trip.count({
          where: {
            createdAt: {
              lt: startDate,
            },
          },
        }),
        prisma.request.count({
          where: {
            createdAt: {
              lt: startDate,
            },
          },
        }),
      ]);

    // Calculate growth percentages
    const userGrowth =
      previousTotalUsers > 0
        ? ((totalUsers - previousTotalUsers) / previousTotalUsers) * 100
        : 0;
    const tripGrowth =
      previousTotalTrips > 0
        ? ((totalTrips - previousTotalTrips) / previousTotalTrips) * 100
        : 0;
    const requestGrowth =
      previousTotalRequests > 0
        ? ((totalRequests - previousTotalRequests) / previousTotalRequests) *
          100
        : 0;

    // Mock revenue calculation (you can implement actual revenue logic)
    const revenue = completedTrips * 5; // $5 per completed trip
    const previousRevenue = previousTotalTrips * 0.8 * 5; // Assume 80% completion rate
    const revenueGrowth =
      previousRevenue > 0
        ? ((revenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Get recent activity
    const recentActivity = await Promise.all([
      // Recent user registrations
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
      // Recent trips
      prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originName: true,
          destinationName: true,
          createdAt: true,
          publisher: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      // Recent requests
      prisma.request.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          applicant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Format recent activity
    const formattedActivity = [
      ...recentActivity[0].map((user) => ({
        id: `user_${user.id}`,
        type: 'user_registration',
        description: `${user.name} registered`,
        timestamp: user.createdAt.toISOString(),
        user: { id: user.id, name: user.name },
      })),
      ...recentActivity[1].map((trip) => ({
        id: `trip_${trip.id}`,
        type: 'trip_published',
        description: `Trip from ${trip.originName} to ${trip.destinationName} published`,
        timestamp: trip.createdAt.toISOString(),
        user: { id: trip.publisher.id, name: trip.publisher.name },
      })),
      ...recentActivity[2].map((request) => ({
        id: `request_${request.id}`,
        type: 'request_made',
        description: `Request made by ${request.applicant.name}`,
        timestamp: request.createdAt.toISOString(),
        user: { id: request.applicant.id, name: request.applicant.name },
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    const stats = {
      totalUsers,
      totalTrips,
      totalRequests,
      totalMessages,
      activeUsers,
      completedTrips,
      acceptedRequests,
      revenue,
      userGrowth,
      tripGrowth,
      requestGrowth,
      revenueGrowth,
    };

    return NextResponse.json({
      stats,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getDashboardStats);
