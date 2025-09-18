import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const getAnalyticsSchema = z.object({
  timeRange: z
    .enum(['week', 'month', 'quarter', 'year'])
    .optional()
    .default('week'),
});

async function getAnalytics(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const { timeRange } = getAnalyticsSchema.parse({
      timeRange: searchParams.get('timeRange') || 'week',
    });

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
      case 'quarter':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
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

    // Get summary statistics
    const [
      totalUsers,
      totalTrips,
      totalRequests,
      completedTrips,
      activeUsers,
      averageRating,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.request.count(),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { updatedAt: { gte: startDate } } }),
      prisma.rating.aggregate({
        _avg: { value: true },
      }),
    ]);

    // Calculate total revenue (mock calculation)
    const totalRevenue = totalTrips * 45.5; // Average price per seat

    // Get user growth data
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as users
      FROM users 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get trip statistics
    const tripStats = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as trips,
        SUM(booked_seats) as bookings
      FROM trips 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get revenue data (mock calculation based on trips)
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(price_per_seat * booked_seats) as revenue
      FROM trips 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get top routes
    const topRoutes = await prisma.$queryRaw`
      SELECT 
        CONCAT(origin, ' → ', destination) as route,
        COUNT(*) as count
      FROM trips 
      WHERE created_at >= ${startDate}
      GROUP BY origin, destination
      ORDER BY count DESC
      LIMIT 5
    `;

    // Get user types distribution
    const userTypes = await prisma.user.groupBy({
      by: ['type'],
      _count: {
        type: true,
      },
    });

    const userTypesData = userTypes.map((item: any) => ({
      name: item.type === 'INDIVIDUAL' ? 'Individual' : 'Company',
      value: item._count.type,
    }));

    const analytics = {
      summary: {
        totalUsers,
        totalTrips,
        totalRevenue: Math.round(totalRevenue),
        averageRating: averageRating._avg?.value
          ? Number(averageRating._avg.value.toFixed(1))
          : 0,
        activeUsers,
        completedTrips,
      },
      userGrowth: Array.isArray(userGrowth)
        ? userGrowth.map((item: any) => ({
            date: item.date,
            users: Number(item.users),
          }))
        : [],
      tripStats: Array.isArray(tripStats)
        ? tripStats.map((item: any) => ({
            date: item.date,
            trips: Number(item.trips),
            bookings: Number(item.bookings) || 0,
          }))
        : [],
      revenueData: Array.isArray(revenueData)
        ? revenueData.map((item: any) => ({
            date: item.date,
            revenue: Number(item.revenue) || 0,
          }))
        : [],
      topRoutes: Array.isArray(topRoutes)
        ? topRoutes.map((item: any) => ({
            route: item.route,
            count: Number(item.count),
          }))
        : [],
      userTypes: userTypesData,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Admin analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getAnalytics);
