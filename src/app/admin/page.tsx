'use client'

import { useState } from 'react';
import { useDashboardStats, useObjectStats, useRecentActivity } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Recycle,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
  Target,
  Loader2
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Client-only chart component
const ClientOnlyChart = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  { ssr: false }
);

// Client-only chart component
const EmptyChart = dynamic(() => import('@/components/charts/empty-chart'), {
  ssr: false,
});

// Client-only chart component
const CategoryChart = dynamic(() => import('@/components/charts/category-chart'), {
  ssr: false,
});

// Component for individual stat cards
function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color,
  isLoading = false
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  changeType?: 'increase' | 'decrease'; 
  icon: any; 
  color: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
      return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20" />
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16" />
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12" />
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              {change && (
                <div className="flex items-center space-x-1">
                  {changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeChartTab, setActiveChartTab] = useState('scans');

  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  // Format currency as Rupiah
  const formatRupiah = (amount: number) => {
    // Handle NaN, null, undefined, or invalid numbers
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(validAmount);
  };

  // API queries (only enabled when authenticated and admin)
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats({
    queryKey: ['dashboard', 'stats'],
    enabled: isAuthenticated && isAdmin && !authLoading,
  });
  const { data: objectStats, isLoading: objectStatsLoading } = useObjectStats({
    queryKey: ['dashboard', 'objects'],
    enabled: isAuthenticated && isAdmin && !authLoading,
  });
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(4, {
    queryKey: ['dashboard', 'activity', 4],
    enabled: isAuthenticated && isAdmin && !authLoading,
  });

  // Transform data for charts
  // Create weekly data from recent activity
  const weeklyScansData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (today.getDay() - 1) + index); // Get Monday to Sunday of current week
      
      // Count scans for this day from recent activity
      const dayScans = recentActivity?.recent_scans?.filter((scan: any) => {
        const scanDate = new Date(scan.created_at);
        return scanDate.toDateString() === date.toDateString();
      }).length || 0;
      
      return {
        day,
        scans: dayScans,
        users: Math.max(0, Math.floor(dayScans * 0.8)) // Estimate unique users (roughly 80% of scans)
      };
    });
  }, [recentActivity]);
  
  // Create user activity data based on actual data
  const weeklyUsersData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const totalUsers = dashboardStats?.total_users || 0;
    const totalScans = dashboardStats?.total_scans || 0;
    
    return days.map((day, index) => {
      // Calculate based on scan distribution for the week
      const dayScans = weeklyScansData[index]?.scans || 0;
      const active = Math.min(dayScans + Math.floor(totalUsers * 0.1), totalUsers); // Active users based on scans + 10% base activity
      const newUsers = index < 5 ? Math.floor(totalScans / 30) : 0; // Estimate new users on weekdays only
      
      return {
        day,
        active: Math.max(0, active),
        new: Math.max(0, newUsers)
      };
    });
  }, [dashboardStats, weeklyScansData]);

  const categoryData = React.useMemo(() => {
    if (!objectStats?.by_category) return [];
    
    // Sort categories by count in descending order
    const sortedCategories = [...objectStats.by_category].sort((a: any, b: any) => parseInt(b.count) - parseInt(a.count));
    
    // Calculate total count for percentage calculation
    const totalCount = sortedCategories.reduce((sum: number, cat: any) => sum + parseInt(cat.count), 0);
    
    if (totalCount === 0) return [];
    
    // Create data for all categories (we'll slice in the display)
    const result = sortedCategories.map((item: any, index: number) => ({
      name: item.category,
      value: Math.round((parseInt(item.count) / totalCount) * 100),
      count: parseInt(item.count),
      color: ['#69C0DC', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6', '#F59E0B'][index % 8]
    }));
    
    return result;
  }, [objectStats?.by_category]);
  
  const hasCategoryData = categoryData.some((cat) => cat.count > 0);

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your e-waste system.</p>
        </div>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                Last 7 days
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl">
              <DropdownMenuItem onClick={() => setTimeRange('1d')}>Last 24 hours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('7d')}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('30d')}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('90d')}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scans"
          value={dashboardStats?.total_scans || 0}
          icon={Recycle}
          color="from-[#69C0DC] to-[#5BA8C4]"
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Users"
          value={dashboardStats?.total_users || 0}
          icon={Users}
          color="from-green-500 to-green-600"
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Value"
          value={formatRupiah((dashboardStats?.total_estimated_value ?? 0) as number)}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
          isLoading={statsLoading}
        />
        <StatCard
          title="Validation Rate"
          value={dashboardStats?.validation_rate ? `${Math.round(dashboardStats.validation_rate)}%` : '0%'}
          icon={Target}
          color="from-orange-500 to-orange-600"
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-gray-800 rounded-2xl h-[500px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Weekly Activity</CardTitle>
                <CardDescription className="dark:text-gray-400">Scans and user activity over the past week</CardDescription>
              </div>
              <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="scans" className="rounded-lg">Scans</TabsTrigger>
                  <TabsTrigger value="users" className="rounded-lg">Users</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="h-full pb-6">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#69C0DC]" />
              </div>
            ) : (
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'scans' ? (
                    <AreaChart data={weeklyScansData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#69C0DC" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#69C0DC" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="scans" 
                        stroke="#69C0DC" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScans)" 
                        dot={{ r: 4, stroke: '#69C0DC', strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart data={weeklyUsersData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="active" 
                        stackId="1"
                        stroke="#10B981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorActive)" 
                        dot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="new" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorNew)" 
                        dot={{ r: 4, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800 h-[500px] flex flex-col">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">E-Waste Categories</CardTitle>
            <CardDescription className="dark:text-gray-400">Distribution by item type</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 flex flex-col overflow-hidden">
            {objectStatsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#69C0DC]" />
              </div>
            ) : hasCategoryData ? (
              <div className="flex-1 flex flex-col min-h-0 justify-center items-center">
                {/* Chart Section */}
                <div className="flex justify-center mb-6 flex-shrink-0">
                  <div className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <CategoryChart data={categoryData.slice(0, 5)} />
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Legend Section */}
                <div className="flex-1 overflow-y-auto min-h-0 w-full">
                  <div className="space-y-2">
                    {categoryData.slice(0, 5).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-500 ml-2">• {item.count} items</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 flex-shrink-0">{item.value}%</span>
                      </div>
                    ))}
                    
                    {/* Other categories summary */}
                    {categoryData.length > 5 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg border-t border-gray-300 mt-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-600">
                            {categoryData.length - 5} other types ({categoryData.slice(5).reduce((sum: number, cat: any) => sum + cat.count, 0)} items)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <EmptyChart />
                <span className="mt-4 text-sm">No category data available</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
                <CardDescription>Latest user submissions and scans</CardDescription>
              </div>
              <Link href="/admin/e-waste">
                <Button variant="ghost" size="sm" className="rounded-xl">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 rounded-xl">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              recentActivity?.recent_scans?.map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#69C0DC] to-[#5BA8C4] rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {activity.user_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.user_name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600 truncate">Scanned {activity.objects_count} items</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary"
                      className={`mb-1 ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        activity.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )) || []
            )}
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">System Overview</CardTitle>
                <CardDescription>Current system status and metrics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed Scans</p>
                    <p className="text-xs text-gray-600">Successfully processed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#69C0DC]">{dashboardStats?.completed_scans || 0}</p>
                    <p className="text-xs text-gray-500">scans</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Validated Objects</p>
                    <p className="text-xs text-gray-600">Human verified items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{dashboardStats?.validated_objects || 0}</p>
                    <p className="text-xs text-gray-500">objects</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Objects</p>
                    <p className="text-xs text-gray-600">All detected items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">{dashboardStats?.total_objects || 0}</p>
                    <p className="text-xs text-gray-500">objects</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Status</p>
                    <p className="text-xs text-gray-600">All systems operational</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}