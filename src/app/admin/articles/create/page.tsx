'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateArticle, useUploadFile } from '@/lib/queries';
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
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const createArticleMutation = useCreateArticle();
  const uploadFileMutation = useUploadFile();

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    try {
      const uploadedFile = await uploadFileMutation.mutateAsync({ file, path: 'articles' });
      setImageUrl(uploadedFile.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await createArticleMutation.mutateAsync({
        title,
        excerpt: excerpt || undefined,
        content: content as OutputData,
        status: status,
        featured_image: imageUrl || undefined,
        tags: tagsArray,
      });
      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to create article:', error);
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
                disabled={createArticleMutation.isPending || uploadFileMutation.isPending}
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
                            <Label className="text-sm font-medium text-slate-700">Featured Image</Label>
                            <div className="space-y-4">
                                <div className="relative aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {imageUrl ? (
                                        <Image src={imageUrl} alt="Featured image preview" fill className="object-cover rounded-xl" />
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
                                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#69C0DC]/10 file:text-[#69C0DC] hover:file:bg-[#69C0DC]/20 border-gray-200"
                                />
                                {uploadFileMutation.isPending && (
                                    <div className="flex items-center space-x-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-xl">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Uploading image...</span>
                                    </div>
                                )}
                                {uploadFileMutation.isError && (
                                    <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span>Upload failed. Please try again.</span>
                                    </div>
                                )}
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
                            <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                              <SelectTrigger id="publish-status" className="w-full rounded-xl border-gray-200">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>
                        <div className={`p-3 rounded-xl border ${status === 'published' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-xs font-medium">
                               {status === 'published' ? 
                                 '✅ This article will be visible to the public immediately.' : 
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
                                featured_image: imageUrl || undefined,
                                status: status,
                                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                                author: {
                                    id: 'author',
                                    full_name: 'EBS Team',
                                    email: 'team@ebs.com',
                                    avatar_url: undefined
                                },
                                created_at: new Date().toISOString(),
                                published_at: status === 'published' ? new Date().toISOString() : undefined,
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