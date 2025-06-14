'use client'

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Eye,
  Calendar,
  Clock,
  ArrowLeft,
  MoreVertical,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { format } from 'date-fns';
import { OutputData } from '@editorjs/editorjs';

interface MobilePreviewProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    content?: string | OutputData;
    featured_image?: string;
    status: string;
    tags: string[];
    author?: {
      id: string;
      full_name?: string;
      email: string;
      avatar_url?: string;
    };
    created_at: string;
    published_at?: string;
    view_count: number;
  };
  authorName?: string;
}

export function MobilePreview({ article, authorName }: MobilePreviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const getAuthorInitials = (name?: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Function to extract plain text from EditorJS OutputData
  const extractTextFromEditorData = (data: OutputData): string => {
    if (!data.blocks || data.blocks.length === 0) return '';
    
    return data.blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return stripHtml(block.data?.text || '');
        case 'header':
          return stripHtml(block.data?.text || '');
        case 'list':
          return block.data?.items?.map((item: string) => stripHtml(item)).join(' ') || '';
        case 'quote':
          return stripHtml(block.data?.text || '');
        case 'code':
          return block.data?.code || '';
        default:
          return '';
      }
    }).filter(text => text.trim().length > 0).join(' ');
  };

  // Function to strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html; // SSR safety
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get content preview - either from content or excerpt
  const getContentPreview = () => {
    if (article.content) {
      let plainText = '';
      
      if (typeof article.content === 'string') {
        try {
          const parsedContent = JSON.parse(article.content) as OutputData;
          plainText = extractTextFromEditorData(parsedContent);
        } catch {
          plainText = stripHtml(article.content);
        }
      } else {
        plainText = extractTextFromEditorData(article.content);
      }
      
      return plainText.length > 500 ? plainText.substring(0, 500) + '...' : plainText;
    }
    return article.excerpt || 'Konten artikel akan ditampilkan di sini...';
  };

  return (
    <div className="relative mx-auto" style={{ width: '280px', height: '560px' }}>
      {/* Android Phone Frame */}
      <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 py-2 bg-white text-black text-xs font-medium">
            <div className="flex items-center space-x-1">
              <span>9:41</span>
            </div>
            <div className="flex items-center space-x-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3 w-3" />
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Artikel</span>
            </div>
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </div>

          {/* Article Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Article Title */}
            <div className="px-4 pt-4 pb-2">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                {article.title}
              </h1>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="px-4 pb-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img 
                    src={article.featured_image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Source Attribution */}
            <div className="px-4 pb-3">
              <div className="flex items-center space-x-2 text-xs text-red-600">
                <span className="font-medium">Kompas.com</span>
                <span>•</span>
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="px-4 pb-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-800 leading-relaxed mb-4">
                  {getContentPreview()}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Phone Shadow */}
      <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] -z-10 transform translate-x-1 translate-y-1 opacity-20" />
    </div>
  );
} 