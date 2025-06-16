'use client'

import { useState } from 'react';
import { useDashboardStats, useObjectStats, useScans, useObjects, useProfiles } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Recycle,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Globe,
  Clock,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import React from 'react';

// Component for metric cards
function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color, 
  subtitle,
  isLoading = false
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  changeType?: 'increase' | 'decrease'; 
  icon: any; 
  color: string; 
  subtitle?: string;
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
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24" />
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
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 e">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-white">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
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
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for chart cards
function ChartCard({ 
  title, 
  description, 
  children,
  isLoading = false
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{title}</CardTitle>
        {description && <CardDescription className="dark:text-gray-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#69C0DC]" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('scans');

  // API queries
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: objectStats, isLoading: objectStatsLoading } = useObjectStats();
  const { data: scansResponse, isLoading: scansLoading } = useScans({ page: 1, limit: 100 });
  const { data: objectsResponse, isLoading: objectsLoading } = useObjects({ page: 1, limit: 500 });
  const { data: profilesResponse, isLoading: profilesLoading } = useProfiles({ page: 1, limit: 100 });

  const scans = scansResponse?.data || [];
  const objects = objectsResponse?.data || [];
  const profiles = profilesResponse?.data || [];

  // Calculate performance data
  const totalValue = dashboardStats?.total_estimated_value || 0; // Convert USD to IDR
  
  // Debug logging
  console.log('Analytics Debug - Dashboard stats:', dashboardStats);
  console.log('Analytics Debug - Total value IDR:', totalValue);

  // Category breakdown from real data
  const categoryBreakdown = objectStats?.by_category?.map((item: any, index: number) => ({
    name: item.category,
    value: Math.round((parseInt(item.count) / (objectStats.by_category?.reduce((sum: number, cat: any) => sum + parseInt(cat.count), 0) || 1)) * 100),
    count: parseInt(item.count),
    total_value: parseFloat(item.total_value) || 0, // Use actual total_value from backend
    color: ['#69C0DC', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'][index % 6]
  })) || [];

  // Processing status data - showing validation status instead of scan status
  const statusData = [
    { name: 'Validated', value: objects.filter(obj => obj.is_validated === true).length, color: '#10B981' },
    { name: 'Not Validated', value: objects.filter(obj => obj.is_validated === false).length, color: '#F59E0B' }
  ];

  // Risk level data
  const riskData = objectStats?.by_risk_level?.map((item: any) => ({
    name: `Risk Level ${item.risk_level}`,
    value: item.count,
    color: item.risk_level <= 2 ? '#10B981' : item.risk_level <= 4 ? '#F59E0B' : '#EF4444'
  })) || [];

  // User activity data
  const activeUsers = profiles.filter(p => p.is_active).length;
  const adminUsers = profiles.filter(p => p.role === 'ADMIN' || p.role === 'SUPERADMIN').length;

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Comprehensive insights into your e-waste management system performance.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Scans"
          value={dashboardStats?.total_scans || 0}
          icon={Recycle}
          color="from-[#69C0DC] to-[#5BA8C4]"
          subtitle="All submissions"
          isLoading={statsLoading}
        />
        <MetricCard
          title="Active Users"
          value={activeUsers}
          icon={Users}
          color="from-green-500 to-green-600"
          subtitle="Currently active"
          isLoading={profilesLoading}
        />
        <MetricCard
          title="Total Value"
          value={formatRupiah(totalValue)}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
          subtitle="Estimated worth"
          isLoading={scansLoading}
        />
        <MetricCard
          title="Validation Rate"
          value={dashboardStats?.validation_rate ? `${Math.round(dashboardStats.validation_rate)}%` : '0%'}
          icon={Target}
          color="from-orange-500 to-orange-600"
          subtitle="System accuracy"
          isLoading={statsLoading}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <ChartCard
          title="E-Waste Categories"
          description="Distribution of detected items by category"
          isLoading={objectStatsLoading}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart width={400} height={320}>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${props.payload.count} items (${value}%)`,
                    props.payload.name
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                  }} 
                /> 
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Validation Status */}
        <ChartCard
          title="Validation Status"
          description="Validation status of detected objects"
          isLoading={objectsLoading}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Bar dataKey="value" fill="#69C0DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Value Breakdown */}
        <ChartCard
          title="Value by Category"
          description="Estimated value distribution"
          isLoading={objectStatsLoading}
        >
          <div className="space-y-4">
            {categoryBreakdown.slice(0, 5).map((category: any) => {
              const categoryValue = category.total_value || 0;
              const percentage = totalValue > 0 ? Math.round((categoryValue / totalValue) * 100) : 0;
              return (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-[#69C0DC]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">
                      {formatRupiah(categoryValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Risk Level Distribution */}
        <ChartCard
          title="Risk Assessment"
          description="Objects by risk level"
          isLoading={objectStatsLoading}
        >
          <div className="space-y-4">
            {riskData.map((risk: any, index: number) => {
              const total = riskData.reduce((sum: number, r: any) => sum + r.value, 0);
              const percentage = total > 0 ? Math.round((risk.value / total) * 100) : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: risk.color }} />
                    <span className="font-medium text-gray-900">{risk.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: risk.color,
                          width: `${percentage}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{risk.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* System Insights */}
        <ChartCard
          title="System Insights"
          description="Key performance indicators"
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-[#69C0DC]">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-[#69C0DC] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Objects Detected</p>
                  <p className="text-xs text-gray-600 mt-1">{dashboardStats?.total_objects || 0} items identified across all scans</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Validation Progress</p>
                  <p className="text-xs text-gray-600 mt-1">{dashboardStats?.validated_objects || 0} objects validated by experts</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">User Engagement</p>
                  <p className="text-xs text-gray-600 mt-1">{activeUsers} active users, {adminUsers} administrators</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Processing Efficiency</p>
                  <p className="text-xs text-gray-600 mt-1">{scans.filter(s => s.status === 'completed').length} completed out of {scans.length} total scans</p>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
} 