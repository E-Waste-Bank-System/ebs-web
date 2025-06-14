'use client'

import { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import LinkTool from '@editorjs/link';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';

interface ArticleViewerProps {
  content: string | object;
  className?: string;
}

export default function ArticleViewer({ content, className = '' }: ArticleViewerProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!holderRef.current) return;

    // Parse content
    let parsedContent: OutputData = { blocks: [] };
    try {
      if (typeof content === 'string') {
        parsedContent = JSON.parse(content);
      } else if (typeof content === 'object') {
        parsedContent = content as OutputData;
      }
    } catch (e) {
      // If parsing fails, create a paragraph block with the content
      parsedContent = {
        blocks: [{
          type: 'paragraph',
          data: { text: typeof content === 'string' ? content : '' }
        }]
      };
    }

    const editor = new EditorJS({
      holder: holderRef.current,
      readOnly: true,
      data: parsedContent,
      tools: {
        header: {
          class: Header,
          config: {
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        paragraph: {
          class: Paragraph
        },
        list: {
          class: List
        },
        quote: {
          class: Quote
        },
        code: {
          class: Code
        },
        linkTool: {
          class: LinkTool
        },
        delimiter: Delimiter,
        table: {
          class: Table
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
              codepen: true,
              imgur: true
            }
          }
        }
      },
      onReady: () => {
        console.log('Article viewer ready');
      }
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [content]);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <div 
        ref={holderRef}
        className="article-content"
        style={{
          fontSize: '16px',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
} 