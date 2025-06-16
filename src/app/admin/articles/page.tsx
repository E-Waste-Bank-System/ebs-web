'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useArticles, useCreateArticle, useDeleteArticle } from '@/lib/queries';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { MobilePreview } from '@/components/ui/mobile-preview';

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
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'draft':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'archived':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'published':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'draft':
      return <Edit className="h-4 w-4 text-amber-500" />;
    case 'archived':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export default function ArticlesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'draft' | 'published' | 'archived' | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState('articles');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

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

  const createArticleMutation = useCreateArticle();
  const deleteArticleMutation = useDeleteArticle();

  const articles = articlesResponse?.data || [];
  const totalArticles = articlesResponse?.meta?.total || 0;

  // Calculate stats from actual data
  const publishedArticles = articles.filter(a => a.status === 'published').length;
  const draftArticles = articles.filter(a => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, article) => sum + (article.view_count || 0), 0);

  const handleCreateArticle = async () => {
    try {
      const tagsArray = newArticle.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await createArticleMutation.mutateAsync({
        title: newArticle.title,
        excerpt: newArticle.excerpt,
        content: {
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: newArticle.content
              }
            }
          ]
        },
        tags: tagsArray,
        status: newArticle.status,
      });
      
      setIsCreateDialogOpen(false);
      setNewArticle({
        title: '',
        excerpt: '',
        content: '',
        tags: '',
        status: 'draft'
      });
      refetch();
    } catch (error) {
      console.error('Failed to create article:', error);
    }
  };

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
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Content Management</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Create, manage, and publish articles about e-waste and sustainability.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl border-gray-200 hover:border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export Articles
          </Button>
          <Link href="/admin/articles/create">
            <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-6 sm:space-y-0">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 rounded-xl bg-gray-100 shadow-sm border">
            <TabsTrigger value="articles" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">All Articles</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Analytics</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Media Library</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="articles" className="space-y-8">
          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-80 rounded-xl border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value: 'draft' | 'published' | 'archived' | 'all') => setStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-40 rounded-xl border-gray-200">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Filter by tag..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="w-full sm:w-40 rounded-xl border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="rounded-xl border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-600 animate-pulse" />
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Card key={article.id} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      {article.featured_image ? (
                        <img 
                          src={article.featured_image} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-[#69C0DC]/10 to-[#5BA8C4]/10 w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-[#69C0DC]/40" />
                        </div>
                      )}
                    </div>
                    <Badge className={`absolute top-4 right-4 ${getStatusColor(article.status)} border shadow-sm`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(article.status)}
                        <span className="capitalize font-medium">{article.status}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#69C0DC] transition-colors leading-tight">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                      )}
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            +{article.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9 ring-2 ring-gray-100 dark:ring-gray-700">
                          <AvatarImage src={article.author?.avatar_url} />
                          <AvatarFallback className="bg-[#69C0DC] text-white text-sm font-medium">
                            {getAuthorInitials(article.author?.full_name || profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {article.author?.full_name || profile?.full_name || 'Unknown Author'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {article.published_at ? 
                              `Published ${formatDate(article.published_at)}` : 
                              `Created ${formatDate(article.created_at)}`
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {article.status === 'published' && (
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
                            <Eye className="h-4 w-4" />
                            <span className="font-medium">{article.view_count?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 space-x-3">
                      <Link href={`/admin/articles/edit/${article.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full rounded-xl border-gray-200 dark:border-gray-600 hover:border-[#69C0DC] hover:text-[#69C0DC] dark:text-gray-300 dark:hover:text-[#69C0DC]">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl shadow-lg border-gray-200">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && articles.length === 0 && (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No articles found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {searchTerm || statusFilter || tagFilter ? 
                    'No articles match your current filters. Try adjusting your search criteria.' : 
                    'Get started by creating your first article to share knowledge about e-waste and sustainability.'
                  }
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Detailed analytics and insights for your articles will be available here. Track views, engagement, and performance metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Media Library Coming Soon</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Manage your images and media files here. Upload, organize, and optimize your content assets.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 