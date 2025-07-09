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
  ComposedChart,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  LabelList
} from 'recharts';
import React from 'react';
import { saveAs } from 'file-saver';

// Define the type for category entries at the top level
interface CategoryEntry {
  name: string;
  value: number;
  count: number;
  total_value: number;
  color: string;
}

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
  const [refreshKey, setRefreshKey] = useState(0);

  // API queries
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchDashboard } = useDashboardStats();
  const { data: objectStats, isLoading: objectStatsLoading, refetch: refetchObjectStats } = useObjectStats();
  const { data: scansResponse, isLoading: scansLoading, refetch: refetchScans } = useScans({ page: 1, limit: 100 });
  const { data: objectsResponse, isLoading: objectsLoading, refetch: refetchObjects } = useObjects({ page: 1, limit: 500 });
  const { data: profilesResponse, isLoading: profilesLoading, refetch: refetchProfiles } = useProfiles({ page: 1, limit: 100 });

  // Helper to get date threshold
  function getDateThreshold(range: string): Date | null {
    const now = new Date();
    switch (range) {
      case '1m': return new Date(now.setMonth(now.getMonth() - 1));
      case '3m': return new Date(now.setMonth(now.getMonth() - 3));
      case '6m': return new Date(now.setMonth(now.getMonth() - 6));
      case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return null;
    }
  }

  // Filter data by timeRange
  const dateThreshold = getDateThreshold(timeRange);
  const scans = (scansResponse?.data || []).filter(scan => {
    if (!dateThreshold) return true;
    return new Date(scan.created_at) >= dateThreshold;
  });
  const objects = (objectsResponse?.data || []).filter(obj => {
    if (!dateThreshold) return true;
    return new Date(obj.created_at) >= dateThreshold;
  });
  const profiles = (profilesResponse?.data || []).filter(profile => {
    if (!dateThreshold) return true;
    return new Date(profile.created_at) >= dateThreshold;
  });

  // Export Data as CSV
  function exportData() {
    let csv = 'Type,ID,Name/Email,Created At,Status/Role,Value/Count\n';
    scans.forEach(scan => {
      csv += `Scan,${scan.id},${scan.user?.full_name || ''},${scan.created_at},${scan.status},${scan.total_estimated_value}\n`;
    });
    objects.forEach(obj => {
      csv += `Object,${obj.id},${obj.name || ''},${obj.created_at},${obj.is_validated ? 'Validated' : 'Not Validated'},${obj.estimated_value}\n`;
    });
    profiles.forEach(profile => {
      csv += `Profile,${profile.id},${profile.email},${profile.created_at},${profile.role},\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `analytics_export_${timeRange}_${new Date().toISOString()}.csv`);
  }

  // Refresh handler
  function handleRefresh() {
    setRefreshKey(k => k + 1);
    refetchDashboard();
    refetchObjectStats();
    refetchScans();
    refetchObjects();
    refetchProfiles();
  }

  // Calculate performance data
  const totalValue = dashboardStats?.total_estimated_value || 0; // Convert USD to IDR
  
  // Debug logging
  console.log('Analytics Debug - Dashboard stats:', dashboardStats);
  console.log('Analytics Debug - Total value IDR:', totalValue);

  // Category breakdown from real data
  const categoryColors = [
    '#69C0DC', // Teal blue (primary)
    '#10B981', // Emerald green
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#6B7280', // Gray
    '#14B8A6'  // Teal
  ];
  
  const categoryBreakdown = objectStats?.by_category?.map((item: any, index: number) => ({
    name: item.category,
    value: Math.round((parseInt(item.count) / (objectStats.by_category?.reduce((sum: number, cat: any) => sum + parseInt(cat.count), 0) || 1)) * 100),
    count: parseInt(item.count),
    total_value: parseFloat(item.total_value) || 0, // Use actual total_value from backend
    color: categoryColors[index % categoryColors.length]
  })) || [];

  // Processing status data - showing validation status instead of scan status
  const statusData = [
    { name: 'Validated', value: objects.filter(obj => obj.is_validated === true).length, color: '#10B981' },
    { name: 'Not Validated', value: objects.filter(obj => obj.is_validated === false).length, color: '#F59E0B' }
  ];

  // 1. Monthly E-Waste Breakdown improvements
  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.count - a.count);
  const topCategories = sortedCategories.slice(0, 8);
  const otherCount = sortedCategories.slice(8).reduce((sum, cat) => sum + cat.count, 0);
  const chartData = [...topCategories, otherCount > 0 ? { name: 'Other', count: otherCount, color: '#CBD5E1' } : null].filter(Boolean);
  const totalItems = sortedCategories.reduce((sum, cat) => sum + cat.count, 0);

  // 2. Validation Status improvements
  const validationTotal = statusData.reduce((sum, d) => sum + d.value, 0);
  const validationChartData = statusData.map(d => ({ ...d, percent: validationTotal ? Math.round((d.value / validationTotal) * 100) : 0 }));

  // 3. Value by Category improvements
  const valueSorted = [...categoryBreakdown].sort((a, b) => b.total_value - a.total_value).slice(0, 5);
  const valueTotal = valueSorted.reduce((sum, cat) => sum + cat.total_value, 0);

  // Modern color palette for top 5 categories
  const valueColors = ['#EC4899', '#8B5CF6', '#14B8A6', '#F472B6', '#6366F1'];

  return (
    <div className="p-2 sm:p-6 space-y-6 sm:space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Comprehensive insights into your e-waste management system performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="rounded-xl w-full sm:w-auto" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl shadow-lg w-full sm:w-auto" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          value={profiles.filter(p => p.is_active).length}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly E-Waste Breakdown (Bar Chart) */}
        <ChartCard
          title="Monthly E-Waste Breakdown"
          description="Breakdown of detected items by category for the selected month"
          isLoading={objectStatsLoading}
        >
          <div className="h-96 flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData} margin={{ top: 30, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} label={{ value: 'Category', position: 'insideBottom', offset: -25, fontSize: 14, fill: '#64748B' }} />
                <YAxis stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 14, fill: '#64748B' }} />
                <Tooltip formatter={(value, name, props) => [
                  `${value} items (${totalItems ? Math.round((Number(value)/totalItems)*100) : 0}%)`,
                  props.payload.name
                ]} />
                <RechartsBar dataKey="count" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#334155', fontWeight: 600, fontSize: 13 }}>
                  {chartData.filter((entry): entry is { name: string; color: string; count: number } => !!entry && typeof entry.name === 'string' && typeof entry.count === 'number' && typeof entry.color === 'string').map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </RechartsBar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Validation Status (Bar Chart) */}
        <ChartCard
          title="Validation Status"
          description="Validation status of detected objects"
          isLoading={objectsLoading}
        >
          <div className="h-96 flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={validationChartData} margin={{ top: 30, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} label={{ value: 'Status', position: 'insideBottom', offset: -25, fontSize: 14, fill: '#64748B' }} />
                <YAxis stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', fontSize: 14, fill: '#64748B' }} />
                <Tooltip formatter={(value, name, props) => [`${value} objects (${props.payload.percent}%)`, props.payload.name]} />
                <RechartsBar dataKey="value" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#334155', fontWeight: 600, fontSize: 13 }}>
                  {validationChartData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.name === 'Validated' ? '#10B981' : '#F59E0B'} />
                  ))}
                </RechartsBar>
              </RechartsBarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-end text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Validated</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Not Validated</span>
            </div>
          </div>
        </ChartCard>

      {/* Value by Category (Horizontal Bar Chart with Legend + Tooltip) */}
      <ChartCard
        title="Top 5 Value by Category"
        description="Estimated value distribution"
        isLoading={objectStatsLoading}
      >
        <div className="h-80 flex flex-col">
          <ResponsiveContainer width="99%" height="100%">
            <RechartsBarChart
              data={valueSorted.map((cat, idx) => {
                const totalValueNum = typeof cat.total_value === 'number' ? cat.total_value : Number(cat.total_value) || 0;
                return {
                  ...cat,
                  total_value: totalValueNum,
                  color: valueColors[idx % valueColors.length],
                  percent: valueTotal > 0 ? Math.round((totalValueNum / valueTotal) * 100) : 0,
                };
              })}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 24, bottom: 20 }}
              barCategoryGap={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" stroke="#64748B" fontSize={13} tickLine={false} axisLine={false} tickFormatter={(v: number) => typeof v === 'number' ? v.toLocaleString('id-ID') : ''} />
              {/* Hide Y axis labels for a clean look */}
              <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={15} tickLine={false} axisLine={false} width={0} tick={false} />
              <Tooltip
                formatter={(value, name, props) => [
                  formatRupiah(Number(value)),
                  props.payload.name + ` (${props.payload.percent}%)`
                ]}
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '14px', fontWeight: '500' }}
              />
              <RechartsBar dataKey="total_value" radius={16} minPointSize={8} barSize={32}>
                {valueSorted.filter((entry): entry is CategoryEntry => !!entry && typeof entry.name === 'string' && typeof entry.total_value === 'number').map((entry, idx) => (
                  <Cell key={entry && entry.name ? entry.name : String(idx)} fill={valueColors[idx % valueColors.length]} />
                ))}
                <LabelList
                  dataKey="total_value"
                  position="right"
                  content={({ x, y, width, value, index }: { x?: number | string; y?: number | string; width?: number | string; value?: number | string; index?: number }) => {
                    if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number") return null;
                    const numValue = Number(value);
                    if (isNaN(numValue)) return null;
                    const percent = valueTotal > 0 ? Math.round((numValue / valueTotal) * 100) : 0;
                    const labelX = x + width + 8;
                    const labelY = y;
                    return (
                      <g>
                        <text
                          x={labelX}
                          y={labelY + 12}
                          fontSize="14"
                          fontWeight="bold"
                          fill="#1e293b"
                        >
                          {formatRupiah(numValue)}
                        </text>
                        <text x={labelX} y={labelY + 26} fontSize="12" fill="#64748B">
                          {percent}%
                        </text>
                      </g>
                    );
                  }}
                />
              </RechartsBar>
            </RechartsBarChart>
          </ResponsiveContainer>
          {/* Color-coded legend below the chart */}
          <div className="flex flex-wrap gap-4 justify-center">
            {valueSorted.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: valueColors[idx % valueColors.length] }} />
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
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
                  <p className="text-xs text-gray-600 mt-1">{profiles.filter(p => p.is_active).length} active users, {profiles.filter(p => p.role === 'ADMIN' || p.role === 'SUPERADMIN').length} administrators</p>
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