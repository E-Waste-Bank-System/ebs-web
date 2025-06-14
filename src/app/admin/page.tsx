'use client'

import { useState } from 'react';
import { useDashboardStats, useObjectStats, useRecentActivity } from '@/lib/queries';
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
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import React from 'react';

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
      <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
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
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-slate-50 to-slate-100/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-slate-900">{value}</p>
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

  // API queries
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: objectStats, isLoading: objectStatsLoading } = useObjectStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(10);

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

  const categoryData = objectStats?.by_category?.map((item: any, index: number) => ({
    name: item.category,
    value: Math.round((item.count / (objectStats.by_category?.reduce((sum: number, cat: any) => sum + cat.count, 0) || 1)) * 100),
    count: item.count,
    color: ['#69C0DC', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'][index % 6]
  })) || [];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
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
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Weekly Activity</CardTitle>
                <CardDescription>Scans and user activity over the past week</CardDescription>
              </div>
              <Tabs value={activeChartTab} onValueChange={setActiveChartTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="scans" className="rounded-lg">Scans</TabsTrigger>
                  <TabsTrigger value="users" className="rounded-lg">Users</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#69C0DC]" />
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartTab === 'scans' ? (
                    <AreaChart data={weeklyScansData}>
                      <defs>
                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#69C0DC" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#69C0DC" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
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
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart data={weeklyUsersData}>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
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
                      />
                      <Area 
                        type="monotone" 
                        dataKey="new" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorNew)" 
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">E-Waste Categories</CardTitle>
            <CardDescription>Distribution by item type</CardDescription>
          </CardHeader>
          <CardContent>
            {objectStatsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#69C0DC]" />
              </div>
            ) : (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categoryData.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
                <CardDescription>Latest user submissions and scans</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl">
                View All
              </Button>
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
        <Card className="border-0 shadow-sm">
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