'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { swrKeys } from '@/lib/swr-config';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Car,
  AlertTriangle,
  Search,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  Home,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  BarChart,
  Area,
  AreaChart,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [tripFilter, setTripFilter] = useState('all');

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

  // Fetch users for management
  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR(
    activeSection === 'users' ? swrKeys.admin.users() : null,
    () =>
      api('/api/admin/users').then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load users');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  // Fetch trips for management
  const {
    data: tripsData,
    error: tripsError,
    isLoading: tripsLoading,
    mutate: mutateTrips,
  } = useSWR(
    activeSection === 'trips' ? swrKeys.admin.trips() : null,
    () =>
      api('/api/admin/trips').then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load trips');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
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
  const users = usersData?.users || [];
  const trips = tripsData?.trips || [];

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter =
      userFilter === 'all' ||
      user.status.toLowerCase() === userFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredTrips = Array.isArray(trips)
    ? trips.filter((trip: any) => {
        const route = `${trip.originName} → ${trip.destinationName}`;
        const matchesSearch =
          route.toLowerCase().includes(tripSearch.toLowerCase()) ||
          trip.publisher.name.toLowerCase().includes(tripSearch.toLowerCase());
        const matchesFilter =
          tripFilter === 'all' ||
          trip.status.toLowerCase() === tripFilter.toLowerCase();
        return matchesSearch && matchesFilter;
      })
    : [];

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          // Navigate to user profile or show details
          window.open(`/users/${userId}`, '_blank');
          break;
        case 'block':
          await api(`/api/admin/users/${userId}/block`, { method: 'POST' });
          toast.success('User blocked successfully');
          mutateUsers();
          break;
        case 'unblock':
          await api(`/api/admin/users/${userId}/unblock`, { method: 'POST' });
          toast.success('User unblocked successfully');
          mutateUsers();
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user?')) {
            await api(`/api/admin/users/${userId}`, { method: 'DELETE' });
            toast.success('User deleted successfully');
            mutateUsers();
          }
          break;
        default:
          console.log('User action:', action, 'for user:', userId);
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      toast.error('Failed to perform action');
    }
  };

  const handleTripAction = async (tripId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          // Navigate to trip details
          window.open(`/trips/${tripId}`, '_blank');
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this trip?')) {
            await api(`/api/admin/trips/${tripId}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'CANCELLED' }),
            });
            toast.success('Trip cancelled successfully');
            mutateTrips();
          }
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this trip?')) {
            await api(`/api/admin/trips/${tripId}`, { method: 'DELETE' });
            toast.success('Trip deleted successfully');
            mutateTrips();
          }
          break;
        default:
          console.log('Trip action:', action, 'for trip:', tripId);
      }
    } catch (error) {
      console.error('Error performing trip action:', error);
      toast.error('Failed to perform action');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'trips', label: 'Trips', icon: Car },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Platform performance and key metrics
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
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
                    : `${stats.userGrowth >= 0 ? '+' : ''}${stats.userGrowth.toFixed(1)}% from last period`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Revenue
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
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
                    : `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}% from last period`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Profit
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {dashboardLoading
                    ? '...'
                    : Math.round(stats.revenue * 0.3).toLocaleString()}
                </div>
                <p
                  className={`text-xs ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {dashboardLoading
                    ? '...'
                    : `${stats.revenueGrowth >= 0 ? '+' : ''}${(stats.revenueGrowth * 1.2).toFixed(1)}% from last period`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Trips
                </CardTitle>
                <Car className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardLoading
                    ? '...'
                    : stats.totalTrips - stats.completedTrips}
                </div>
                <p
                  className={`text-xs ${stats.tripGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {dashboardLoading
                    ? '...'
                    : `${stats.tripGrowth >= 0 ? '+' : ''}${stats.tripGrowth.toFixed(1)}% from last period`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex h-[300px] flex-col items-center justify-center space-y-4">
                <BarChart3 className="text-muted-foreground h-16 w-16" />
                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground">
                    View detailed analytics and insights
                  </p>
                  <Button
                    onClick={() => setActiveSection('analytics')}
                    size="sm"
                  >
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex h-[300px] flex-col items-center gap-y-4">
                <Button
                  onClick={() => setActiveSection('users')}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button
                  onClick={() => setActiveSection('trips')}
                  variant="outline"
                  className="w-full"
                >
                  <Car className="mr-2 h-4 w-4" />
                  Manage Trips
                </Button>
                <Button
                  onClick={() => setActiveSection('analytics')}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reported Issues</span>
                  <span className="text-sm font-medium text-red-600">
                    {dashboardLoading ? '...' : '23'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity
                  .filter(
                    (activity: any) => activity.type === 'user_registration',
                  )
                  .slice(0, 3)
                  .map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/placeholder.svg"
                          alt={activity.user.name}
                        />
                        <AvatarFallback>
                          {activity.user.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.user.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.slice(0, 3).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        by {activity.user.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.type === 'trip_published'
                          ? 'default'
                          : activity.type === 'user_registration'
                            ? 'secondary'
                            : 'outline'
                      }
                      className="text-xs"
                    >
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSection === 'analytics' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Detailed platform analytics and insights
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Insights</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[200px] flex-col items-center justify-center space-y-4">
              <div className="space-y-2 text-center">
                <p className="text-muted-foreground">
                  For detailed charts and analytics, visit the Analytics section
                </p>
                <Button onClick={() => setActiveSection('analytics')} size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">System Uptime</span>
                    <span className="text-sm font-medium text-green-600">
                      99.9%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="text-sm font-medium">145ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      0.02%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="text-sm font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Session Duration</span>
                    <span className="text-sm font-medium">12m 34s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      23%
                    </span>
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
                    <span className="text-sm font-medium text-green-600">
                      29.2%
                    </span>
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
      )}

      {activeSection === 'users' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage platform users and their activities
            </p>
          </div>

          {/* User Management Controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="p-4 text-left font-medium">User</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Trips</th>
                      <th className="p-4 text-left font-medium">Rating</th>
                      <th className="p-4 text-left font-medium">Join Date</th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <div className="text-muted-foreground">
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <div className="text-muted-foreground">
                            No users found
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user: any) => (
                        <tr
                          key={user.id}
                          className="hover:bg-muted/50 border-b"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src="/placeholder.svg"
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {user.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-muted-foreground text-sm">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                user.status === 'TRUSTED'
                                  ? 'default'
                                  : user.status === 'BLOCKED'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-4">{user.tripCount || 0}</td>
                          <td className="p-4">
                            {user.averageRating?.toFixed(1) || 'N/A'}
                          </td>
                          <td className="p-4">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(user.id, 'view')
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(user.id, 'message')
                                  }
                                >
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(
                                      user.id,
                                      user.status === 'BLOCKED'
                                        ? 'unblock'
                                        : 'block',
                                    )
                                  }
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  {user.status === 'BLOCKED'
                                    ? 'Unblock User'
                                    : 'Block User'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'trips' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Trip Management
            </h1>
            <p className="text-muted-foreground">
              Manage platform trips and their activities
            </p>
          </div>

          {/* Trip Management Controls */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search trips..."
                value={tripSearch}
                onChange={(e) => setTripSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tripFilter} onValueChange={setTripFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trips Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="p-4 text-left font-medium">Route</th>
                      <th className="p-4 text-left font-medium">Publisher</th>
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Passengers</th>
                      <th className="p-4 text-left font-medium">Price</th>
                      <th className="p-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripsLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <div className="text-muted-foreground">
                            Loading trips...
                          </div>
                        </td>
                      </tr>
                    ) : filteredTrips.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center">
                          <div className="text-muted-foreground">
                            No trips found
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTrips.map((trip: any) => (
                        <tr
                          key={trip.id}
                          className="hover:bg-muted/50 border-b"
                        >
                          <td className="p-4 font-medium">
                            {trip.originName} → {trip.destinationName}
                          </td>
                          <td className="p-4">{trip.publisher.name}</td>
                          <td className="p-4">
                            {new Date(trip.departureAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                trip.status === 'PUBLISHED'
                                  ? 'default'
                                  : trip.status === 'CANCELLED'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {trip.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {trip.bookedSeats || 0}/{trip.capacity}
                          </td>
                          <td className="p-4">${trip.pricePerSeat}</td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTripAction(trip.id, 'view')
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTripAction(trip.id, 'approve')
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Trip
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTripAction(trip.id, 'cancel')
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Trip
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'reports' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Reports Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage reported issues and platform operations
            </p>
          </div>

          {/* System Reports & Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>System Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Platform Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Active Users</span>
                      <span className="text-sm font-medium">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Trip Completion Rate</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Trip Rating</span>
                      <span className="text-sm font-medium">4.6/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Support Tickets</span>
                      <span className="text-sm font-medium">12 open</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Issues</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Payment processing delay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        User reported inappropriate behavior
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Trip cancellation dispute</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-foreground mb-2 text-3xl font-bold">
              Settings Dashboard
            </h1>
            <p className="text-muted-foreground">
              Configure platform settings and preferences
            </p>
          </div>

          {/* Settings Content */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Feature Toggles</span>
                  <span className="text-sm font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notification Preferences</span>
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Settings</span>
                  <span className="text-sm font-medium">Strict</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
