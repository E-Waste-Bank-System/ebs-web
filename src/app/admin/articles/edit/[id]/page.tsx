'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useArticle, useUpdateArticle } from '@/lib/queries';
import { ArticleStatus } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Save, 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OutputData } from '@editorjs/editorjs';
import dynamic from 'next/dynamic';
import { MobilePreview } from '@/components/ui/mobile-preview';
const Editor = dynamic(() => import('@/components/ui/editor').then(m => m.default), { ssr: false });

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: article, isLoading, error } = useArticle(id);
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState<OutputData | undefined>();
  const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const updateArticleMutation = useUpdateArticle();

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setExcerpt(article.excerpt || '');
      setTags(article.tags?.join(', ') || '');
      let initialData: OutputData | undefined;
      if (typeof article.content === 'string') {
        try {
          initialData = JSON.parse(article.content);
        } catch {
          // fallback as paragraph block
          initialData = {
            time: Date.now(),
            blocks: [
              { type: 'paragraph', data: { text: article.content } }
            ],
            version: '2.27.0'
          } as unknown as OutputData;
        }
      } else {
        initialData = article.content as any;
      }
      setContent(initialData);
      setStatus(article.status);
      setImageUrl(article.featured_image || null);
      setImagePreview(article.featured_image || null);
      setMetaTitle(article.meta_title || '');
      setMetaDescription(article.meta_description || '');
    }
  }, [article]);

  const handleImageSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please select a valid image file (JPG, PNG, WebP)');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      // Use FormData if we have a new image file, otherwise use JSON
      if (imageFile) {
        // Create FormData for multipart/form-data request
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', JSON.stringify(content || { blocks: [] }));
        if (excerpt) formData.append('excerpt', excerpt);
        if (tagsArray.length > 0) formData.append('tags', tagsArray.join(','));
        formData.append('status', status);
        if (metaTitle) formData.append('meta_title', metaTitle);
        if (metaDescription) formData.append('meta_description', metaDescription);
        formData.append('featured_image', imageFile);
        
        // Debug logging
        console.log('Article update request with FormData:');
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`${key}:`, value);
          }
        }
        
        console.log('Image file present:', !!imageFile);
        
        await updateArticleMutation.mutateAsync({
          id,
          data: formData
        });
      } else {
        // Use JSON for regular updates without new image
        const requestData = {
          title,
          excerpt: excerpt || undefined,
          content: content,
          status: status,
          featured_image: imageUrl || undefined,
          tags: tagsArray,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
        };
        
        console.log('Article update request with JSON:', requestData);
        
        await updateArticleMutation.mutateAsync({
          id,
          data: requestData
        });
      }
      
      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to update article:', error);
      // Log the full error details for debugging
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          message: (error as any).message,
          status: (error as any).status,
          url: (error as any).url,
          response: (error as any).response,
          stack: (error as any).stack,
        });
      }
      // Show user-friendly error message
      alert(`Failed to update article: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    }
  };

  if (isLoading) {
    return (
        <div className="p-6 sm:p-8 space-y-8 min-h-screen">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8 flex items-center justify-center min-h-screen">
        <Card className="bg-white rounded-xl border-0 shadow-lg w-full max-w-lg">
            <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="text-center space-y-4">
                <div className="mx-auto w-fit p-4 bg-red-100 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Error loading article</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                    There was a problem fetching the article data. Please try again.
                </p>
                <Button onClick={() => router.push('/admin/articles')} variant="outline" className="rounded-xl">
                    Back to Articles
                </Button>
            </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 sm:p-8 space-y-6 sm:space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/admin/articles')} className="rounded-xl border-gray-200 hover:border-gray-300">
            <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Edit Article</h1>
            <p className="text-slate-500 line-clamp-1 text-xs sm:text-sm">
                Editing: {article?.title}
            </p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/articles')} className="rounded-xl border-gray-200 w-full sm:w-auto">
                Cancel
            </Button>
            <Button 
                type="submit" 
                form="article-form"
                disabled={updateArticleMutation.isPending}
                className="bg-[#69C0DC] hover:bg-[#5BA8C4] text-white rounded-xl shadow-lg w-full sm:w-auto"
            >
                {updateArticleMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
            </Button>
        </div>
      </div>
      
      <form id="article-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white rounded-xl border-0 shadow-sm">
                    <CardHeader className="pb-4 sm:pb-6">
                        <CardTitle className="flex items-center text-slate-800 text-base sm:text-lg">
                            <FileText className="mr-3 h-5 w-5 text-[#69C0DC]" />
                            Article Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-medium text-slate-700">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., The Future of E-Waste Recycling"
                                required
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt" className="text-xs font-medium text-slate-700">Excerpt</Label>
                            <Input
                                id="excerpt"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Brief description of the article..."
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-xs font-medium text-slate-700">Tags</Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., recycling, environment, technology (comma-separated)"
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta-title" className="text-xs font-medium text-slate-700">SEO Meta Title</Label>
                            <Input
                                id="meta-title"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="SEO optimized title for search engines"
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta-description" className="text-xs font-medium text-slate-700">SEO Meta Description</Label>
                            <Input
                                id="meta-description"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="Brief description for search engine results"
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-slate-700">Featured Image</Label>
                            <div className="space-y-4">
                                <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Featured image preview" fill className="object-cover rounded-xl" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-xs font-medium">Upload an image</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleImageSelect(e.target.files[0])}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#69C0DC]/10 file:text-[#69C0DC] hover:file:bg-[#69C0DC]/20 border-gray-200"
                                />
                                {imageFile && (
                                    <p className="text-xs text-green-600 font-medium">
                                        ✓ New image selected: {imageFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-medium text-slate-700">Content</Label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <Editor
                                    data={content}
                                    onChange={(data) => setContent(data)}
                                    placeholder="Write your article here..."
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-white rounded-xl border-0 shadow-sm">
                    <CardHeader className="pb-4 sm:pb-6">
                        <CardTitle className="flex items-center text-slate-800 text-base sm:text-lg">
                            <CheckCircle className="mr-3 h-5 w-5 text-[#69C0DC]" />
                            Publish Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="publish-status" className="text-xs font-medium text-slate-700">Status</Label>
                            <Select value={status} onValueChange={(value: ArticleStatus) => setStatus(value)}>
                              <SelectTrigger id="publish-status" className="w-full rounded-xl border-gray-200">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                                <SelectItem value={ArticleStatus.PUBLISHED}>Published</SelectItem>
                                <SelectItem value={ArticleStatus.ARCHIVED}>Archived</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>
                        <div className={`p-3 rounded-xl border ${
                          status === ArticleStatus.PUBLISHED ? 'bg-green-50 border-green-200' : 
                          status === ArticleStatus.ARCHIVED ? 'bg-red-50 border-red-200' :
                          'bg-amber-50 border-amber-200'
                        }`}>
                            <p className="text-xs font-medium">
                               {status === ArticleStatus.PUBLISHED ? 
                                 '✅ This article will be visible to the public immediately.' : 
                                 status === ArticleStatus.ARCHIVED ?
                                 '🗄️ This article is archived and not visible to readers.' :
                                 '📝 This article is saved as a draft and not visible to readers.'
                               }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile Preview */}
                <Card className="bg-white rounded-xl border-0 shadow-sm">
                    <CardHeader className="pb-4 sm:pb-6">
                        <CardTitle className="flex items-center text-slate-800 text-base sm:text-lg">
                            <span className="mr-3 text-lg">📱</span>
                            Mobile Preview
                        </CardTitle>
                        <p className="text-xs text-slate-600">
                            See how your article will appear in the mobile app
                        </p>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <MobilePreview 
                            article={{
                                id: article?.id || 'preview',
                                title: title || 'Article Title',
                                excerpt: excerpt || 'Article excerpt will appear here...',
                                content: content,
                                featured_image: imagePreview || undefined,
                                status: status,
                                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                                author: article?.author || {
                                    id: 'author',
                                    full_name: 'EBS Team',
                                    email: 'team@ebs.com',
                                    avatar_url: undefined
                                },
                                created_at: article?.created_at || new Date().toISOString(),
                                published_at: status === ArticleStatus.PUBLISHED ? (article?.published_at || new Date().toISOString()) : undefined,
                                view_count: article?.view_count || 0
                            }}
                            authorName={article?.author?.full_name || 'EBS Team'}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </div>
  );
} 