'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import React from 'react';



interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface BarChartDataItem {
  name: string;
  scans: number;
  objects: number;
}

interface AnalyticsData {
  totalScans: number;
  totalObjects: number;
  objectsByCategory: ChartDataItem[];
  scansByDate: BarChartDataItem[];
  riskDistribution: ChartDataItem[];
  categoryTrends: { name: string; data: { month: string; count: number }[] }[];
  averageObjectsPerScan: number;
  topCategories: { category: string; count: number; percentage: number }[];
  riskMetrics: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
  timeSeriesData: { date: string; scans: number; objects: number }[];
  geographicalData: { location: string; scans: number; objects: number }[];
  userEngagement: { activeUsers: number; totalUsers: number; engagementRate: number };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<string>('7d');

  // Mock data for demonstration
  const analyticsData: AnalyticsData = {
    totalScans: 1247,
    totalObjects: 3891,
    objectsByCategory: [
      { name: 'Smartphones', value: 456, color: '#3b82f6' },
      { name: 'Laptops', value: 234, color: '#10b981' },
      { name: 'Tablets', value: 189, color: '#f59e0b' },
      { name: 'Accessories', value: 167, color: '#ef4444' },
      { name: 'Other', value: 98, color: '#8b5cf6' },
    ],
    scansByDate: [
      { name: 'Mon', scans: 23, objects: 67 },
      { name: 'Tue', scans: 45, objects: 134 },
      { name: 'Wed', scans: 34, objects: 98 },
      { name: 'Thu', scans: 56, objects: 167 },
      { name: 'Fri', scans: 67, objects: 201 },
      { name: 'Sat', scans: 43, objects: 129 },
      { name: 'Sun', scans: 38, objects: 114 },
    ],
    riskDistribution: [
      { name: 'Low Risk', value: 65, color: '#10b981' },
      { name: 'Medium Risk', value: 25, color: '#f59e0b' },
      { name: 'High Risk', value: 10, color: '#ef4444' },
    ],
    categoryTrends: [
      {
        name: 'Smartphones',
        data: [
          { month: 'Jan', count: 45 },
          { month: 'Feb', count: 52 },
          { month: 'Mar', count: 48 },
          { month: 'Apr', count: 61 },
          { month: 'May', count: 55 },
          { month: 'Jun', count: 67 },
        ],
      },
      {
        name: 'Laptops',
        data: [
          { month: 'Jan', count: 23 },
          { month: 'Feb', count: 29 },
          { month: 'Mar', count: 31 },
          { month: 'Apr', count: 28 },
          { month: 'May', count: 34 },
          { month: 'Jun', count: 39 },
        ],
      },
    ],
    averageObjectsPerScan: 3.12,
    topCategories: [
      { category: 'Smartphones', count: 456, percentage: 35.2 },
      { category: 'Laptops', count: 234, percentage: 18.1 },
      { category: 'Tablets', count: 189, percentage: 14.6 },
      { category: 'Accessories', count: 167, percentage: 12.9 },
      { category: 'Other', count: 98, percentage: 7.6 },
    ],
    riskMetrics: {
      highRisk: 128,
      mediumRisk: 312,
      lowRisk: 807,
    },
    timeSeriesData: [
      { date: '2024-01-01', scans: 45, objects: 134 },
      { date: '2024-01-02', scans: 52, objects: 156 },
      { date: '2024-01-03', scans: 48, objects: 142 },
      { date: '2024-01-04', scans: 61, objects: 183 },
      { date: '2024-01-05', scans: 55, objects: 165 },
      { date: '2024-01-06', scans: 67, objects: 201 },
      { date: '2024-01-07', scans: 59, objects: 177 },
    ],
    geographicalData: [
      { location: 'North America', scans: 456, objects: 1367 },
      { location: 'Europe', scans: 342, objects: 1026 },
      { location: 'Asia', scans: 289, objects: 867 },
      { location: 'Other', scans: 160, objects: 480 },
    ],
    userEngagement: {
      activeUsers: 234,
      totalUsers: 456,
      engagementRate: 51.3,
    },
  };

  const formatPercentage = (value: number, name: string) => {
    const total = analyticsData.objectsByCategory.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((value / total) * 100).toFixed(1);
    return `${name}: ${percentage}%`;
  };

  const renderCustomizedLabel = (entry: ChartDataItem & { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    const RADIAN = Math.PI / 180;
    const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5;
    const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN);
    const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > entry.cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(entry.percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={dateRange === '7d' ? 'default' : 'outline'}
            onClick={() => setDateRange('7d')}
          >
            7 days
          </Button>
          <Button
            variant={dateRange === '30d' ? 'default' : 'outline'}
            onClick={() => setDateRange('30d')}
          >
            30 days
          </Button>
          <Button
            variant={dateRange === '90d' ? 'default' : 'outline'}
            onClick={() => setDateRange('90d')}
          >
            90 days
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalScans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objects Detected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalObjects.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Objects/Scan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageObjectsPerScan}</div>
            <p className="text-xs text-muted-foreground">+2.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.userEngagement.activeUsers}</div>
            <p className="text-xs text-muted-foreground">+5.7% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Objects by Category</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <RechartsPieChart>
                <Pie
                  data={analyticsData.objectsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                />
                <Tooltip formatter={formatPercentage} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Classification of detected objects by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.riskDistribution.map((risk) => (
                <div key={risk.name} className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: risk.color }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{risk.name}</span>
                      <span className="text-sm text-muted-foreground">{risk.value}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: risk.color, width: `${risk.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most frequently detected e-waste categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center space-x-4">
                  <div className="text-sm font-medium w-4">{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{category.count}</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{category.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest scanning activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">234 new scans today</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">567 objects detected</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">12 high-risk items found</p>
                  <p className="text-xs text-muted-foreground">6 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-muted-foreground">8 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 