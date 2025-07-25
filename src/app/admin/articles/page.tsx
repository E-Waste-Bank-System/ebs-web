'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArticles, useCreateArticle, useDeleteArticle } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  Save, 
  Tag, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MoreHorizontal, 
  Share2,
  Image as ImageIcon,
  Loader2,
  Calendar,
  User,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { MobilePreview } from '@/components/ui/mobile-preview';
import { ArticleStatus } from '@/lib/api-client';

// Component for individual stat cards
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: any; 
  color: string; 
  trend?: string; 
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  {trend}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const getStatusColor = (status: ArticleStatus) => {
  switch (status) {
    case ArticleStatus.PUBLISHED:
      return 'bg-green-100 text-green-800 border-green-200';
    case ArticleStatus.DRAFT:
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case ArticleStatus.ARCHIVED:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: ArticleStatus) => {
  switch (status) {
    case ArticleStatus.PUBLISHED:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case ArticleStatus.DRAFT:
      return <Edit className="h-4 w-4 text-amber-500" />;
    case ArticleStatus.ARCHIVED:
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export default function ArticlesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('articles');
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);

  // API queries
  const { 
    data: articlesResponse, 
    isLoading, 
    error,
    refetch 
  } = useArticles({
    page: 1,
    limit: 50,
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    tag: tagFilter || undefined
  });

  // Debug logging
  console.log('Articles page state:', {
    articlesCount: articlesResponse?.data?.length || 0,
    totalArticles: articlesResponse?.meta?.total || 0,
    statusFilter,
    searchTerm,
    tagFilter,
    isLoading,
    error: error?.message
  });



  const deleteArticleMutation = useDeleteArticle();

  const articles = articlesResponse?.data || [];
  const totalArticles = articlesResponse?.meta?.total || 0;

  // Calculate stats from actual data
  const publishedArticles = articles.filter(a => a.status === ArticleStatus.PUBLISHED).length;
  const draftArticles = articles.filter(a => a.status === ArticleStatus.DRAFT).length;
  const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0);

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticleMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const handleRefresh = () => {
    refetch();
    setShowRefreshMessage(true);
    setTimeout(() => setShowRefreshMessage(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getAuthorInitials = (name?: string) => {
    if (!name) return 'AU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Failed to load articles</h3>
              <p className="text-gray-600 mb-6 max-w-sm">There was an error loading the articles. Please try again.</p>
              <Button onClick={() => refetch()} className="bg-[#69C0DC] hover:bg-[#5BA8C4]">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8 pt-4 sm:pt-8">
          {showRefreshMessage && (
            <div className="absolute top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50">
              Articles refreshed!
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">Content Management</h1>
            <p className="text-xs sm:text-sm text-slate-500">Create, manage, and publish articles about e-waste and sustainability.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="rounded-2xl border-gray-200 hover:border-gray-300 h-12 px-6 font-semibold w-full sm:w-auto"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" className="rounded-2xl border-gray-200 hover:border-gray-300 h-12 px-6 font-semibold w-full sm:w-auto">
              <Download className="h-5 w-5 mr-2" />
              Export Articles
            </Button>
            <Link href="/admin/articles/create">
              <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-2xl shadow-lg px-6 h-12 text-base font-semibold w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                New Article
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mt-0 mb-8 sm:mb-12">
          <StatCard
            title="Total Articles"
            value={totalArticles.toString()}
            subtitle="All content pieces"
            icon={FileText}
            color="from-[#69C0DC] to-[#5BA8C4]"
          />
          <StatCard
            title="Published"
            value={publishedArticles.toString()}
            subtitle="Live articles"
            icon={CheckCircle}
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            subtitle="All time readers"
            icon={Eye}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="Draft Articles"
            value={draftArticles.toString()}
            subtitle="Pending review"
            icon={Edit}
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Filters Row */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-2xl border-gray-200 h-12"
                />
              </div>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-40 rounded-2xl border-gray-200 h-12">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={ArticleStatus.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ArticleStatus.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Tag filter..."
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="rounded-2xl border-gray-200 w-full sm:max-w-xs h-12"
              />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
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
            {articles.map((article) => (
              <Card key={article.id} className="h-full flex flex-col rounded-2xl border border-slate-100 shadow-xl bg-white overflow-hidden">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-2xl">
                    {article.featured_image ? (
                      <img 
                        src={article.featured_image} 
                        alt={article.title}
                        className="w-full h-full object-cover rounded-t-2xl"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-[#69C0DC]/10 to-[#5BA8C4]/10 w-full h-full flex items-center justify-center rounded-t-2xl">
                        <ImageIcon className="h-12 w-12 text-[#69C0DC]/40" />
                      </div>
                    )}
                  </div>
                  <Badge className={`absolute top-4 left-4 rounded-full px-3 py-1 shadow-lg bg-white/90 ${getStatusColor(article.status)} font-medium text-xs flex items-center gap-1 z-10`}>
                    {getStatusIcon(article.status)}
                    <span className="capitalize">{article.status}</span>
                  </Badge>
                </div>
                <CardContent className="flex flex-col flex-1 px-4 sm:px-6 pt-4 sm:pt-6 pb-0 gap-4">
                  <div className="flex-1 flex flex-col gap-3">
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-[#69C0DC] transition-colors leading-tight">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-2">{article.excerpt}</p>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 mb-1">
                        {article.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs rounded-full px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-gray-100 text-gray-700">
                            +{article.tags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ring-1 ring-gray-100">
                        <AvatarImage src={article.author?.avatar_url} />
                        <AvatarFallback className="bg-[#69C0DC] text-white text-xs font-medium">
                          {getAuthorInitials(article.author?.full_name || profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-700">
                        {article.author?.full_name || profile?.full_name || 'Unknown Author'}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {article.published_at ? 
                          formatDate(article.published_at) : 
                          formatDate(article.created_at)
                        }
                      </span>
                    </div>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full text-xs text-slate-600">
                      <Eye className="h-4 w-4" />
                      {article.view_count?.toLocaleString() || 0}
                    </span>
                  </div>
                </CardContent>
                <div className="border-t border-gray-100 px-4 sm:px-6 py-4 flex items-center gap-2 mt-auto bg-white">
                  <Link href={`/admin/articles/edit/${article.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-2xl border-gray-200 hover:border-[#69C0DC] hover:text-[#69C0DC]">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 rounded-lg hover:bg-red-50"
                        onClick={() => handleDeleteArticle(article.id)}
                        disabled={deleteArticleMutation.isPending}
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
        {!isLoading && articles.length === 0 && (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="p-8 sm:p-16 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FileText className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                {searchTerm || statusFilter !== 'all' || tagFilter
                  ? 'No articles match your current filters. Try adjusting your search criteria.'
                  : 'Get started by creating your first article to share knowledge about e-waste and sustainability.'}
              </p>
              <Link href="/admin/articles/create">
                <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 