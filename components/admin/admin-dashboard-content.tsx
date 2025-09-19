'use client';

import { Badge } from '@/components/ui/badge';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { swrKeys } from '@/lib/swr-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export function AdminDashboardContent() {
  // Fetch dashboard stats
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
  } = useSWR(
    swrKeys.admin.dashboard('week'),
    () =>
      api('/api/admin/dashboard').then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load dashboard data');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    },
  );

  // Extract data with fallbacks
  const stats = dashboardData?.stats || {
    totalUsers: 0,
    totalTrips: 0,
    totalRequests: 0,
    activeUsers: 0,
    completedTrips: 0,
    revenue: 0,
    userGrowth: 0,
    tripGrowth: 0,
    revenueGrowth: 0,
  };

  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's performance and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <p
              className={`text-xs ${stats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {dashboardLoading
                ? '...'
                : `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth.toFixed(1)}% from last week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? '...' : stats.totalTrips.toLocaleString()}
            </div>
            <p
              className={`text-xs ${stats.tripGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {dashboardLoading
                ? '...'
                : `${stats.tripGrowth >= 0 ? '+' : ''}${stats.tripGrowth.toFixed(1)}% from last week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? '...' : stats.totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardLoading ? '...' : `${stats.activeUsers} pending`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardLoading ? '...' : stats.revenue.toLocaleString()}
            </div>
            <p
              className={`text-xs ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {dashboardLoading
                ? '...'
                : `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}% from last week`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt="Avatar" />
                    <AvatarFallback>
                      {activity.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.user.name}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Badge
                      variant={
                        activity.type === 'trip_published'
                          ? 'default'
                          : activity.type === 'user_registration'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/users">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/trips">
              <Button className="w-full" variant="outline">
                <Car className="mr-2 h-4 w-4" />
                Manage Trips
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button className="w-full" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Trip Completion Rate</span>
              <span className="text-sm font-medium text-green-600">
                {dashboardLoading
                  ? '...'
                  : `${stats.completedTrips > 0 ? ((stats.completedTrips / stats.totalTrips) * 100).toFixed(1) : '0'}%`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average Rating</span>
              <span className="text-sm font-medium">
                {dashboardLoading ? '...' : '4.6'}/5
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Support Tickets</span>
              <span className="text-sm font-medium text-orange-600">
                {dashboardLoading ? '...' : '12'} open
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">System Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">API Response Time</span>
                <span className="text-sm font-medium">145ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="text-sm font-medium text-green-600">0.02%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Profit Margin</span>
                <span className="text-sm font-medium text-green-600">29.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Transaction Volume</span>
                <span className="text-sm font-medium">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Commission Rate</span>
                <span className="text-sm font-medium">8.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
