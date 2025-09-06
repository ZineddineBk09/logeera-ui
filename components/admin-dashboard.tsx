"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const revenueData = [
  { month: "Jan", revenue: 32000, profit: 8000, trips: 450 },
  { month: "Feb", revenue: 38000, profit: 9500, trips: 520 },
  { month: "Mar", revenue: 42000, profit: 11200, trips: 580 },
  { month: "Apr", revenue: 45000, profit: 12600, trips: 620 },
  { month: "May", revenue: 48000, profit: 13800, trips: 680 },
  { month: "Jun", revenue: 52000, profit: 15200, trips: 720 },
];

const userGrowthData = [
  { month: "Jan", users: 8500, active: 6800 },
  { month: "Feb", users: 9200, active: 7400 },
  { month: "Mar", users: 10100, active: 8200 },
  { month: "Apr", users: 11000, active: 8900 },
  { month: "May", users: 11800, active: 9600 },
  { month: "Jun", users: 12847, active: 10500 },
];

const mockStats = {
  totalUsers: 12847,
  activeTrips: 342,
  monthlyRevenue: 52000,
  monthlyProfit: 15200,
  reportedIssues: 23,
  completionRate: 94.2,
  avgRating: 4.6,
  supportTickets: 12,
};

const mockUsers = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    avatar: "/diverse-user-avatars.png",
    status: "active",
    joinDate: "2024-01-15",
    trips: 23,
    rating: 4.8,
    verified: true,
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike.j@email.com",
    avatar: "/diverse-user-avatars.png",
    status: "suspended",
    joinDate: "2024-02-20",
    trips: 8,
    rating: 3.2,
    verified: false,
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    avatar: "/diverse-user-avatars.png",
    status: "active",
    joinDate: "2024-03-10",
    trips: 45,
    rating: 4.9,
    verified: true,
  },
];

const mockTrips = [
  {
    id: "1",
    route: "San Francisco → Los Angeles",
    publisher: "Sarah Chen",
    date: "2024-12-15",
    status: "active",
    passengers: 2,
    maxPassengers: 3,
    price: 45,
    reports: 0,
  },
  {
    id: "2",
    route: "Oakland → San Jose",
    publisher: "Mike Johnson",
    date: "2024-12-18",
    status: "flagged",
    passengers: 1,
    maxPassengers: 2,
    price: 25,
    reports: 2,
  },
  {
    id: "3",
    route: "San Francisco → Sacramento",
    publisher: "Emma Wilson",
    date: "2024-12-20",
    status: "completed",
    passengers: 3,
    maxPassengers: 3,
    price: 60,
    reports: 0,
  },
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [tripSearch, setTripSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [tripFilter, setTripFilter] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = userFilter === "all" || user.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredTrips = mockTrips.filter((trip) => {
    const matchesSearch =
      trip.route.toLowerCase().includes(tripSearch.toLowerCase()) ||
      trip.publisher.toLowerCase().includes(tripSearch.toLowerCase());
    const matchesFilter = tripFilter === "all" || trip.status === tripFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUserAction = (userId: string, action: string) => {
    console.log("[v0] User action:", action, "for user:", userId);
  };

  const handleTripAction = (tripId: string, action: string) => {
    console.log("[v0] Trip action:", action, "for trip:", tripId);
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "trips", label: "Trips", icon: Car },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Platform Management</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-muted-foreground">
                  Platform performance and key metrics
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockStats.totalUsers.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${mockStats.monthlyRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">
                      +15% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Profit
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${mockStats.monthlyProfit.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600">
                      +18% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Trips
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {mockStats.activeTrips}
                    </div>
                    <p className="text-xs text-green-600">+8% from last week</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Profit Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Revenue",
                          color: "hsl(var(--chart-1))",
                        },
                        profit: {
                          label: "Profit",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-revenue)"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="var(--color-profit)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        users: {
                          label: "Total Users",
                          color: "hsl(var(--chart-3))",
                        },
                        active: {
                          label: "Active Users",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stackId="1"
                            stroke="var(--color-users)"
                            fill="var(--color-users)"
                            fillOpacity={0.6}
                          />
                          <Area
                            type="monotone"
                            dataKey="active"
                            stackId="2"
                            stroke="var(--color-active)"
                            fill="var(--color-active)"
                            fillOpacity={0.8}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trip Completion Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        {mockStats.completionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Rating</span>
                      <span className="text-sm font-medium">
                        {mockStats.avgRating}/5
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Support Tickets</span>
                      <span className="text-sm font-medium text-orange-600">
                        {mockStats.supportTickets} open
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Reported Issues</span>
                      <span className="text-sm font-medium text-red-600">
                        {mockStats.reportedIssues}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockUsers.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant={user.verified ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.verified ? "Verified" : "Pending"}
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
                    {mockTrips.slice(0, 3).map((trip) => (
                      <div
                        key={trip.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">{trip.route}</p>
                          <p className="text-xs text-muted-foreground">
                            by {trip.publisher}
                          </p>
                        </div>
                        <Badge
                          variant={
                            trip.status === "active"
                              ? "default"
                              : trip.status === "flagged"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {trip.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Detailed platform analytics and insights
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trip Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        trips: { label: "Trips", color: "hsl(var(--chart-1))" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="trips" fill="var(--color-trips)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        growth: {
                          label: "Growth %",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", growth: 8 },
                            { month: "Feb", growth: 12 },
                            { month: "Mar", growth: 15 },
                            { month: "Apr", growth: 18 },
                            { month: "May", growth: 22 },
                            { month: "Jun", growth: 25 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="growth"
                            stroke="var(--color-growth)"
                            strokeWidth={3}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {activeSection === "users" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  User Management
                </h1>
                <p className="text-muted-foreground">
                  Manage platform users and their activities
                </p>
              </div>

              {/* User Management Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                          <th className="text-left p-4 font-medium">User</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Trips</th>
                          <th className="text-left p-4 font-medium">Rating</th>
                          <th className="text-left p-4 font-medium">
                            Join Date
                          </th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.name}
                                  />
                                  <AvatarFallback>
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "default"
                                    : user.status === "suspended"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {user.status}
                              </Badge>
                            </td>
                            <td className="p-4">{user.trips}</td>
                            <td className="p-4">{user.rating}</td>
                            <td className="p-4">{user.joinDate}</td>
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
                                      handleUserAction(user.id, "view")
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUserAction(user.id, "message")
                                    }
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUserAction(user.id, "suspend")
                                    }
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "trips" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Trip Management
                </h1>
                <p className="text-muted-foreground">
                  Manage platform trips and their activities
                </p>
              </div>

              {/* Trip Management Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                          <th className="text-left p-4 font-medium">Route</th>
                          <th className="text-left p-4 font-medium">
                            Publisher
                          </th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">
                            Passengers
                          </th>
                          <th className="text-left p-4 font-medium">Price</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTrips.map((trip) => (
                          <tr
                            key={trip.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-4 font-medium">{trip.route}</td>
                            <td className="p-4">{trip.publisher}</td>
                            <td className="p-4">{trip.date}</td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  trip.status === "active"
                                    ? "default"
                                    : trip.status === "flagged"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {trip.status}
                                {trip.reports > 0 &&
                                  ` (${trip.reports} reports)`}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {trip.passengers}/{trip.maxPassengers}
                            </td>
                            <td className="p-4">${trip.price}</td>
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
                                      handleTripAction(trip.id, "view")
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleTripAction(trip.id, "approve")
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Trip
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleTripAction(trip.id, "cancel")
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Trip
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "reports" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <span className="text-sm">
                            Payment processing delay
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">
                            User reported inappropriate behavior
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">
                            Trip cancellation dispute
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Feature Toggles</span>
                      <span className="text-sm font-medium">Enabled</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Notification Preferences</span>
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Privacy Settings</span>
                      <span className="text-sm font-medium">Strict</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
