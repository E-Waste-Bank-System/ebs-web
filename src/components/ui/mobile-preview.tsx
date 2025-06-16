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
  Signal,
  Quote,
  CheckSquare,
  Square
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

  // Function to strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html; // SSR safety
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Render individual EditorJS blocks
  const renderEditorBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-sm text-gray-800 leading-relaxed mb-3">
            {stripHtml(block.data?.text || '')}
          </p>
        );
      
      case 'header':
        const HeaderTag = `h${Math.min(block.data?.level || 1, 6)}` as keyof JSX.IntrinsicElements;
        const headerSizes = {
          1: 'text-xl font-bold mb-4',
          2: 'text-lg font-bold mb-3',
          3: 'text-base font-bold mb-3',
          4: 'text-sm font-bold mb-2',
          5: 'text-sm font-semibold mb-2',
          6: 'text-xs font-semibold mb-2'
        };
        return (
          <HeaderTag key={index} className={`text-gray-900 ${headerSizes[block.data?.level as keyof typeof headerSizes] || headerSizes[1]}`}>
            {stripHtml(block.data?.text || '')}
          </HeaderTag>
        );
      
      case 'list':
        const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
        const listClass = block.data?.style === 'ordered' ? 'list-decimal' : 'list-disc';
        return (
          <ListTag key={index} className={`${listClass} pl-5 mb-3 space-y-1`}>
            {block.data?.items?.map((item: any, itemIndex: number) => (
              <li key={itemIndex} className="text-sm text-gray-800">
                {block.data?.style === 'checklist' ? (
                  <div className="flex items-center space-x-2">
                    {item.meta?.checked ? (
                      <CheckSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span>{stripHtml(item.content || '')}</span>
                  </div>
                ) : (
                  stripHtml(item.content || item)
                )}
              </li>
            ))}
          </ListTag>
        );
      
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 rounded-r">
            <p className="text-sm text-gray-800 italic mb-1">
              "{stripHtml(block.data?.text || '')}"
            </p>
            {block.data?.caption && (
              <cite className="text-xs text-gray-600 font-medium">
                — {stripHtml(block.data.caption)}
              </cite>
            )}
          </blockquote>
        );
      
      case 'code':
        return (
          <pre key={index} className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto mb-4 font-mono">
            <code>{block.data?.code || ''}</code>
          </pre>
        );
      
      case 'delimiter':
        return (
          <div key={index} className="flex justify-center items-center my-6">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div key={index} className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-300 text-xs">
              <tbody>
                {block.data?.content?.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex === 0 && block.data?.withHeadings ? 'bg-gray-100' : ''}>
                    {row.map((cell: string, cellIndex: number) => {
                      const CellTag = rowIndex === 0 && block.data?.withHeadings ? 'th' : 'td';
                      return (
                        <CellTag
                          key={cellIndex}
                          className="border border-gray-300 px-2 py-1 text-left"
                        >
                          {stripHtml(cell)}
                        </CellTag>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      default:
        // For any unknown block types, try to extract text
        if (block.data?.text) {
          return (
            <p key={index} className="text-sm text-gray-800 leading-relaxed mb-3">
              {stripHtml(block.data.text)}
            </p>
          );
        }
        return null;
    }
  };

  // Render EditorJS content
  const renderEditorContent = () => {
    if (!article.content) {
      return (
        <p className="text-sm text-gray-600 italic">
          Konten artikel akan ditampilkan di sini...
        </p>
      );
    }

    let editorData: OutputData;
    
    if (typeof article.content === 'string') {
      try {
        editorData = JSON.parse(article.content) as OutputData;
      } catch {
        // If parsing fails, treat as plain text
        return (
          <p className="text-sm text-gray-800 leading-relaxed">
            {stripHtml(article.content)}
          </p>
        );
      }
    } else {
      editorData = article.content;
    }

    if (!editorData.blocks || editorData.blocks.length === 0) {
      return (
        <p className="text-sm text-gray-600 italic">
          {article.excerpt || 'Konten artikel akan ditampilkan di sini...'}
        </p>
      );
    }

    // Limit content for mobile preview (first 5 blocks or excerpt)
    const blocksToShow = editorData.blocks.slice(0, 5);
    
    return (
      <div className="space-y-2">
        {blocksToShow.map((block, index) => renderEditorBlock(block, index))}
        {editorData.blocks.length > 5 && (
          <p className="text-xs text-gray-500 italic mt-3">
            ... dan {editorData.blocks.length - 5} blok konten lainnya
          </p>
        )}
      </div>
    );
  };

  // Get the display author name
  const displayAuthorName = authorName || article.author?.full_name || 'EBS Team';

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

            {/* Author Attribution */}
            <div className="px-4 pb-3">
              <div className="flex items-center space-x-2 text-xs text-[#69C0DC]">
                <span className="font-medium">{displayAuthorName}</span>
                <span>•</span>
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="px-4 pb-6">
              <div className="prose prose-sm max-w-none">
                {renderEditorContent()}
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