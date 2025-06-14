'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScans, useObjects, useDashboardStats, useObjectStats, useCreateScan } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Cable,
  Battery,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  Image as ImageIcon,
  Loader2,
  HardDrive,
  Cpu,
  Camera,
  Headphones,
  Plus,
  Upload,
  Zap,
  Plug,
  Car,
  Heart,
  Volume2,
  Keyboard as KeyboardIcon,
  Fan,
  Lightbulb,
  WashingMachine,
  Microwave,
  Mouse as MouseIcon,
  Printer,
  Gamepad2,
  Wifi,
  Flashlight,
  Shirt,
  Wrench,
  Phone,
  Tv,
  Wind,
  Sun,
  Watch
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import React from 'react';

// Component for individual stat cards
function ModernStatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  isLoading = false
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
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
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
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
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'failed':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  // Electronics & Computing
  if (categoryLower.includes('handphone')) return Smartphone;
  if (categoryLower.includes('laptop')) return Laptop;
  if (categoryLower.includes('monitor')) return Monitor;
  if (categoryLower.includes('cpu intel') || categoryLower.includes('komponen cpu')) return Cpu;
  if (categoryLower.includes('hardisk')) return HardDrive;
  if (categoryLower.includes('keyboard')) return KeyboardIcon;
  if (categoryLower.includes('mouse')) return MouseIcon;
  if (categoryLower.includes('printer')) return Printer;
  if (categoryLower.includes('router')) return Wifi;
  if (categoryLower.includes('speaker')) return Volume2;
  if (categoryLower.includes('camera')) return Camera;
  if (categoryLower.includes('flashdisk')) return HardDrive;
  
  // Gaming & Entertainment
  if (categoryLower.includes('ps2')) return Gamepad2;
  if (categoryLower.includes('tv')) return Tv;
  if (categoryLower.includes('remot')) return Zap;
  
  // Communication
  if (categoryLower.includes('telefon')) return Phone;
  
  // Power & Electrical
  if (categoryLower.includes('ac')) return Wind;
  if (categoryLower.includes('adaptor')) return Plug;
  if (categoryLower.includes('aki motor')) return Car;
  if (categoryLower.includes('baterai')) return Battery;
  if (categoryLower.includes('lampu')) return Lightbulb;
  if (categoryLower.includes('neon box')) return Lightbulb;
  if (categoryLower.includes('panel surya')) return Sun;
  if (categoryLower.includes('senter')) return Flashlight;
  
  // Home Appliances
  if (categoryLower.includes('mesin cuci')) return WashingMachine;
  if (categoryLower.includes('microwave')) return Microwave;
  if (categoryLower.includes('kompor listrik')) return Zap;
  if (categoryLower.includes('oven')) return Microwave;
  if (categoryLower.includes('kipas')) return Fan;
  if (categoryLower.includes('vacum cleaner')) return Wind;
  if (categoryLower.includes('komponen kulkas')) return Zap;
  
  // Personal Care & Tools
  if (categoryLower.includes('hair dryer')) return Wind;
  if (categoryLower.includes('seterika')) return Shirt;
  if (categoryLower.includes('solder')) return Wrench;
  
  // Medical & Measurement
  if (categoryLower.includes('alat tensi')) return Heart;
  if (categoryLower.includes('alat tes vol')) return Zap;
  if (categoryLower.includes('jam tangan')) return Watch;
  
  // Default fallback
  return Zap;
};

export default function EWastePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('scans');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { isAuthenticated, isAdmin, profile } = useAuth();

  // API queries
  const { 
    data: scansResponse, 
    isLoading: scansLoading,
    error: scansError
  } = useScans({
    page: 1,
    limit: 50
  });

  const { 
    data: objectsResponse, 
    isLoading: objectsLoading,
    error: objectsError
  } = useObjects({
    page: 1,
    limit: 100
  });

  const { 
    data: dashboardStatsResponse, 
    isLoading: dashboardStatsLoading,
    error: dashboardStatsError
  } = useDashboardStats();

  const { 
    data: objectStatsResponse, 
    isLoading: objectStatsLoading,
    error: objectStatsError
  } = useObjectStats();

  const createScanMutation = useCreateScan();

  const scans = scansResponse?.data || [];
  const objects = objectsResponse?.data || [];

  // Calculate statistics
  const totalScans = scansResponse?.meta?.total || 0;
  const completedScans = scans.filter(scan => scan.status === 'completed').length;
  
  // Use dashboard stats for total value (convert from USD to IDR)
  const totalValue = dashboardStatsResponse?.total_estimated_value || 0; // Approximate USD to IDR conversion
  
  const totalObjects = objects.length;

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

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await createScanMutation.mutateAsync(formData);
      
      // Reset form and close dialog
      setSelectedFile(null);
      setIsAddDialogOpen(false);
      
      // Refresh the scans list would happen automatically due to React Query
    } catch (error) {
      console.error('Error uploading scan:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Group objects by category for stats using API data
  const categoryStatsArray = objectStatsResponse?.by_category?.map((item: any) => ({
    name: item.category,
    count: item.count,
    value: parseFloat(item.total_value) || 0, // Use actual total_value from backend
    icon: getCategoryIcon(item.category),
    color: ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600', 'from-gray-500 to-gray-600', 'from-red-500 to-red-600'][Math.abs(item.category.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % 6]
  })) || [];

  // Filter scans based on search and status
  const filteredScans = scans.filter(scan => {
    const matchesSearch = !searchTerm || 
      scan.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.original_filename?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">E-Waste Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage e-waste scans, categorization, and processing.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Add E-Waste
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Upload E-Waste Scan</DialogTitle>
                <DialogDescription>
                  Upload an image of e-waste items for AI analysis and categorization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium">
                    Select Image
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-700 font-medium">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="ml-auto h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedFile(null);
                  }}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Scan
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatCard
          title="Total Scans"
          value={totalScans}
          subtitle="All submissions"
          icon={Eye}
          color="from-[#69C0DC] to-[#5BA8C4]"
          isLoading={scansLoading}
        />
        <ModernStatCard
          title="Completed"
          value={completedScans}
          subtitle="Successfully processed"
          icon={CheckCircle}
          color="from-green-500 to-green-600"
          isLoading={scansLoading}
        />
        <ModernStatCard
          title="Total Value"
          value={formatRupiah(totalValue)}
          subtitle="Estimated worth"
          icon={Battery}
          color="from-purple-500 to-purple-600"
          isLoading={scansLoading}
        />
        <ModernStatCard
          title="Items Detected"
          value={totalObjects}
          subtitle="Objects identified"
          icon={Smartphone}
          color="from-orange-500 to-orange-600"
          isLoading={objectsLoading}
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 rounded-xl">
            <TabsTrigger value="scans" className="rounded-lg">Scans</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg">Categories</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg">Analytics</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: 'completed' | 'processing' | 'failed' | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scans Tab */}
        <TabsContent value="scans" className="space-y-6">
          {scansLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredScans.map((scan) => (
                <Card key={scan.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={scan.user?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-[#69C0DC] to-[#5BA8C4] text-white">
                              {scan.user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{scan.user?.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500">{format(new Date(scan.created_at), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-xl">
                            <DropdownMenuItem onClick={() => router.push(`/admin/e-waste/${scan.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Download Image</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Scan Image */}
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                        {scan.image_url ? (
                          <img 
                            src={scan.image_url} 
                            alt="Scan"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className={`${getStatusColor(scan.status)} border`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(scan.status)}
                              <span className="capitalize">{scan.status}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>

                      {/* Scan Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Items Detected</span>
                          <span className="font-semibold text-gray-900">{scan.objects_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Estimated Value</span>
                          <span className="font-semibold text-[#69C0DC]">
                            {formatRupiah(Number(scan.total_estimated_value) || 0)}
                          </span>
                        </div>
                        {scan.original_filename && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Filename</span>
                            <span className="text-sm text-gray-900 truncate max-w-32">{scan.original_filename}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-lg"
                          onClick={() => router.push(`/admin/e-waste/${scan.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!scansLoading && filteredScans.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scans found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Category Overview</CardTitle>
              <CardDescription>Breakdown of e-waste items by category</CardDescription>
            </CardHeader>
            <CardContent>
              {objectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryStatsArray.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={category.name} className="p-4 rounded-xl border border-gray-200 hover:border-[#69C0DC] transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.count} items</p>
                            <p className="text-sm font-medium text-[#69C0DC]">{formatRupiah(category.value)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Processing Status</CardTitle>
                <CardDescription>Current status of all scans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['completed', 'processing', 'failed'].map((status) => {
                    const count = scans.filter(scan => scan.status === status).length;
                    const percentage = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <span className="capitalize font-medium text-gray-900">{status}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'completed' ? 'bg-green-500' :
                                status === 'processing' ? 'bg-blue-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Value Distribution</CardTitle>
                <CardDescription>Estimated value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStatsArray.slice(0, 5).map((category) => {
                    const percentage = totalValue > 0 ? Math.round((category.value / totalValue) * 100) : 0;
                    return (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${category.color}`} />
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-[#69C0DC]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-16 text-right">{formatRupiah(category.value)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}