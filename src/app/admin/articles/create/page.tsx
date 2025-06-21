'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateArticle } from '@/lib/queries';
import { ArticleStatus } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OutputData } from '@editorjs/editorjs';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Save, 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import { MobilePreview } from '@/components/ui/mobile-preview';

const Editor = dynamic(() => import('@/components/ui/editor').then(m => m.default), { ssr: false });

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState<OutputData | undefined>();
  const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const createArticleMutation = useCreateArticle();

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
      
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', JSON.stringify(content || { blocks: [] }));
      if (excerpt) formData.append('excerpt', excerpt);
      if (tagsArray.length > 0) formData.append('tags', tagsArray.join(','));
      formData.append('status', status);
      if (metaTitle) formData.append('meta_title', metaTitle);
      if (metaDescription) formData.append('meta_description', metaDescription);
      if (imageFile) formData.append('featured_image', imageFile);
      
      // Debug logging
      console.log('Article create request with FormData:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      
      await createArticleMutation.mutateAsync(formData);
      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to create article:', error);
      // Log the full error details for debugging
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          message: (error as any).message,
          status: (error as any).status,
          url: (error as any).url,
          response: (error as any).response,
        });
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/admin/articles')} className="rounded-xl border-gray-200 hover:border-gray-300">
            <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Create New Article</h1>
            <p className="text-slate-500">
                Write and publish a new article for your readers
            </p>
            </div>
        </div>
        <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/articles')} className="rounded-xl border-gray-200">
                Cancel
            </Button>
            <Button 
                type="submit" 
                form="article-form"
                disabled={createArticleMutation.isPending}
                className="bg-[#69C0DC] hover:bg-[#5BA8C4] text-white rounded-xl shadow-lg"
            >
                {createArticleMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="mr-2 h-4 w-4" />
                )}
                Create Article
            </Button>
        </div>
      </div>
      
      <form id="article-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white rounded-xl border-0 shadow-sm">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center text-slate-800 text-xl">
                            <FileText className="mr-3 h-5 w-5 text-[#69C0DC]" />
                            Article Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium text-slate-700">Title</Label>
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
                            <Label htmlFor="excerpt" className="text-sm font-medium text-slate-700">Excerpt</Label>
                            <Input
                                id="excerpt"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Brief description of the article..."
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-sm font-medium text-slate-700">Tags</Label>
                            <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., recycling, environment, technology (comma-separated)"
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta-title" className="text-sm font-medium text-slate-700">SEO Meta Title</Label>
                            <Input
                                id="meta-title"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="SEO optimized title for search engines"
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta-description" className="text-sm font-medium text-slate-700">SEO Meta Description</Label>
                            <Input
                                id="meta-description"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="Brief description for search engine results"
                                className="bg-white border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Featured Image</Label>
                            <div className="space-y-4">
                                <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Featured image preview" fill className="object-cover rounded-xl" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                            <p className="text-sm font-medium">Upload an image</p>
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
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-slate-700">Content</Label>
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
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center text-slate-800 text-xl">
                            <CheckCircle className="mr-3 h-5 w-5 text-[#69C0DC]" />
                            Publish Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="publish-status" className="text-sm font-medium text-slate-700">Status</Label>
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
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center text-slate-800 text-xl">
                            <span className="mr-3 text-lg">📱</span>
                            Mobile Preview
                        </CardTitle>
                        <p className="text-sm text-slate-600">
                            See how your article will appear in the mobile app
                        </p>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <MobilePreview 
                            article={{
                                id: 'preview',
                                title: title || 'Article Title',
                                excerpt: excerpt || 'Article excerpt will appear here...',
                                content: content,
                                featured_image: imagePreview || undefined,
                                status: status,
                                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                                author: {
                                    id: 'author',
                                    full_name: 'EBS Team',
                                    email: 'team@ebs.com',
                                    avatar_url: undefined
                                },
                                created_at: new Date().toISOString(),
                                published_at: status === ArticleStatus.PUBLISHED ? new Date().toISOString() : undefined,
                                view_count: 0
                            }}
                            authorName="EBS Team"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </div>
  );
} 