'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScans, useObjects, useDashboardStats, useObjectStats, useCreateScan, useDeleteScan } from '@/lib/queries';
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
  Watch,
  RefreshCw,
  Package,
  DollarSign,
  Target,
  Trash2,
  Recycle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import React from 'react';
import { ScanCard } from '@/components/admin/ScanCard';
import Link from 'next/link';

// Helper to format numbers compactly (e.g., 1.5K, 2.3M)
function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

// Helper to format value for stat cards (number or currency)
function formatStatValue(value: string | number): string {
  if (typeof value === 'number') {
    return formatCompactNumber(value);
  } else if (typeof value === 'string' && value.startsWith('Rp')) {
    const num = parseInt(value.replace(/[^\d]/g, ''));
    if (!isNaN(num) && num >= 1000) {
      return `Rp ${formatCompactNumber(num)}`;
    }
  }
  return value as string;
}

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
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatStatValue(value)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6); // Fixed page size for scans
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  
  const { isAuthenticated, isAdmin, profile } = useAuth();

  // API queries
  const { 
    data: scansResponse, 
    isLoading: scansLoading,
    error: scansError,
    refetch: refetchScans // Added refetch for refresh functionality
  } = useScans({
    page: currentPage,
    limit: pageSize
  });

  // Get all scans for stats (without pagination)
  const { 
    data: allScansResponse, 
    isLoading: allScansLoading,
    error: allScansError
  } = useScans({
    page: 1,
    limit: 1000 // Large limit to get all scans for stats
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
  const deleteScanMutation = useDeleteScan();

  const scans = scansResponse?.data || [];
  const allScans = allScansResponse?.data || []; // All scans for stats
  const objects = objectsResponse?.data || [];

  // Calculate statistics using all scans data
  const totalScans = dashboardStatsResponse?.total_scans || allScansResponse?.meta?.total || 0;
  const completedScans = allScans.filter(scan => scan.status === 'completed').length;
  
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
      
      // Optionally add the original filename
      if (selectedFile.name) {
        formData.append('original_filename', selectedFile.name);
      }

      await createScanMutation.mutateAsync(formData);
      
      // Reset form and close dialog
      setSelectedFile(null);
      setIsAddDialogOpen(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'E-waste scan uploaded successfully! AI processing has started.'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error uploading scan:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error?.message || 'Failed to upload scan. Please try again.'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setNotification({
        type: 'error',
        message: 'Please select a valid image file (JPG, PNG, WebP)'
      });
      setTimeout(() => setNotification(null), 5000);
      return false;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setNotification({
        type: 'error',
        message: 'File size must be less than 10MB'
      });
      setTimeout(() => setNotification(null), 5000);
      return false;
    }
    
    setSelectedFile(file);
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      await deleteScanMutation.mutateAsync(scanId);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Scan deleted successfully!'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setScanToDelete(null);
    } catch (error: any) {
      console.error('Error deleting scan:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error?.message || 'Failed to delete scan. Please try again.'
      });
      
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const confirmDeleteScan = (scanId: string) => {
    setScanToDelete(scanId);
    setDeleteDialogOpen(true);
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

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = scansResponse?.meta?.pages || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Debug pagination
  console.log('Pagination Debug:', {
    currentPage,
    totalPages,
    meta: scansResponse?.meta,
    scansLength: scans.length,
    totalScans
  });

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-6">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-medium">{notification.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotification(null)}
                className="ml-2 h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8 pt-4 sm:pt-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">E-Waste Management</h1>
            <p className="text-xs sm:text-sm text-slate-500">Monitor and manage e-waste scans and detected objects.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="rounded-2xl border-gray-200 hover:border-gray-300 h-12 px-6 font-semibold w-full sm:w-auto"
              onClick={() => refetchScans()} // Use refetchScans for refresh
              disabled={scansLoading}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${scansLoading ? 'animate-spin' : ''}`} />
              {scansLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" className="rounded-2xl border-gray-200 hover:border-gray-300 h-12 px-6 font-semibold w-full sm:w-auto">
              <Download className="h-5 w-5 mr-2" />
              Export Scans
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-2xl shadow-lg px-6 h-12 text-base font-semibold w-full sm:w-auto"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Scan
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-0 mb-8 sm:mb-12">
          <ModernStatCard
            title="Total Scans"
            value={formatStatValue(totalScans)}
            subtitle="All submissions"
            icon={Recycle}
            color="from-[#69C0DC] to-[#5BA8C4]"
            isLoading={scansLoading}
          />
          <ModernStatCard
            title="Total Objects"
            value={formatStatValue(totalObjects)}
            subtitle="Detected items"
            icon={Package}
            color="from-green-500 to-green-600"
            isLoading={scansLoading}
          />
          <ModernStatCard
            title="Total Value"
            value={formatStatValue(formatRupiah(totalValue))}
            subtitle="Estimated worth"
            icon={DollarSign}
            color="from-purple-500 to-purple-600"
            isLoading={scansLoading}
          />
          <ModernStatCard
            title="Validation Rate"
            value={(() => {
              const rate = dashboardStatsResponse?.validation_rate;
              if (!rate) return '0.0%';
              const numRate = parseFloat(String(rate));
              return `${numRate.toFixed(1)}%`;
            })()}
            subtitle="System accuracy"
            icon={Target}
            color="from-orange-500 to-orange-600"
            isLoading={scansLoading}
          />
        </div>



        {/* Scans Grid */}
        {scansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 mt-0">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-full flex flex-col rounded-2xl border border-slate-100 shadow-xl bg-white overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-2xl"></div>
                <CardContent className="flex flex-col flex-1 px-4 sm:px-6 pt-4 sm:pt-6 pb-0 gap-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8 mt-0">
            {filteredScans.map((scan) => (
              <Card key={scan.id} className="h-full flex flex-col rounded-2xl border border-slate-100 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-video">
                  {scan.image_url ? (
                    <img 
                      src={scan.image_url} 
                      alt={`Scan ${scan.id}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-[#69C0DC]/10 to-[#5BA8C4]/10 w-full h-full flex items-center justify-center">
                      <Camera className="h-12 w-12 text-[#69C0DC]/40" />
                    </div>
                  )}
                  <Badge className={`absolute top-4 left-4 rounded-full px-3 py-1 shadow-lg bg-white/90 ${getStatusColor(scan.status)} font-medium text-xs flex items-center gap-1 z-10`}>
                    {getStatusIcon(scan.status)}
                    <span className="capitalize">{scan.status}</span>
                  </Badge>
                </div>
                <CardContent className="flex flex-col flex-1 px-4 sm:px-6 pt-4 sm:pt-6 pb-0 gap-4">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-[#69C0DC] transition-colors leading-tight">
                        Scan #{scan.id.substring(0, 8)}
                      </h3>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {scan.objects_count} objects
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User className="h-4 w-4" />
                        <span>{scan.user?.full_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(scan.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {scan.total_estimated_value && (
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatRupiah(Number(scan.total_estimated_value))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </div>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full text-xs text-slate-600">
                      <Cpu className="h-4 w-4" />
                      {scan.objects_count} detected
                    </span>
                  </div>
                </CardContent>
                <div className="border-t border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-2 mt-auto bg-white">
                  <Link href={`/admin/e-waste/${scan.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-2xl border-gray-200 hover:border-[#69C0DC] hover:text-[#69C0DC]">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-2xl hover:bg-gray-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-2xl shadow-lg border-gray-200">
                      <DropdownMenuItem className="rounded-lg">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 rounded-lg hover:bg-red-50"
                        onClick={() => confirmDeleteScan(scan.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!scansLoading && filteredScans.length === 0 && (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="p-8 sm:p-16 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Recycle className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No scans found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                {searchTerm || statusFilter !== 'all' || searchTerm // This seems like a bug, should be categoryFilter
                  ? 'No scans match your current filters. Try adjusting your search criteria.'
                  : 'Get started by uploading your first e-waste scan for analysis.'}
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl shadow-lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First Scan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Delete Scan
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scan? This action cannot be undone and will permanently remove:
            </DialogDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>The scan image and metadata</li>
              <li>All detected objects and their data</li>
              <li>Any associated AI analysis results</li>
            </ul>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setScanToDelete(null);
              }}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => scanToDelete && handleDeleteScan(scanToDelete)}
              disabled={deleteScanMutation.isPending}
              className="rounded-lg"
            >
              {deleteScanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Delete Scan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}