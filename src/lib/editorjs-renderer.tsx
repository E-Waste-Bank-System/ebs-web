import React from 'react';
import { OutputData } from '@editorjs/editorjs';

interface EditorBlock {
  type: string;
  data: any;
}

export function renderEditorContent(content: OutputData | string) {
  console.log('Rendering content:', content);
  let parsedContent: OutputData;
  
  try {
    if (typeof content === 'string') {
      parsedContent = JSON.parse(content);
    } else {
      parsedContent = content;
    }
  } catch (e) {
    console.log('Failed to parse content:', e);
    return <p className="text-gray-500">Unable to parse content</p>;
  }

  console.log('Parsed content blocks:', parsedContent?.blocks?.length || 0);
  if (!parsedContent.blocks || parsedContent.blocks.length === 0) {
    return <p className="text-gray-500 italic">No content available</p>;
  }

  // Check if all blocks are empty
  const hasContent = parsedContent.blocks.some(block => {
    if (block.type === 'paragraph') {
      return block.data?.text && block.data.text.trim().length > 0;
    }
    if (block.type === 'header') {
      return block.data?.text && block.data.text.trim().length > 0;
    }
    if (block.type === 'list') {
      return block.data?.items && block.data.items.length > 0 && 
        block.data.items.some((item: string) => item.trim().length > 0);
    }
    // For other block types, assume they have content if they exist
    return true;
  });

  if (!hasContent) {
    return <p className="text-gray-500 italic">Start writing content to see the preview...</p>;
  }

  return (
    <div className="space-y-4">
      {parsedContent.blocks.map((block: EditorBlock, index: number) => 
        renderBlock(block, index)
      )}
    </div>
  );
}

function renderBlock(block: EditorBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <div 
          key={index} 
          className="text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.data?.text || '' }}
        />
      );

    case 'header':
      const level = Math.min(Math.max(block.data?.level || 2, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
      const headerClassMap: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
        1: 'text-4xl font-bold text-gray-900 mb-4',
        2: 'text-3xl font-bold text-gray-900 mb-3',
        3: 'text-2xl font-bold text-gray-900 mb-3',
        4: 'text-xl font-bold text-gray-900 mb-2',
        5: 'text-lg font-bold text-gray-900 mb-2',
        6: 'text-base font-bold text-gray-900 mb-2'
      };
      const headerClass = headerClassMap[level];

      switch (level) {
        case 1:
          return <h1 key={index} className={headerClass} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
        case 2:
          return <h2 key={index} className={headerClass} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
        case 3:
          return <h3 key={index} className={headerClass} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
        case 4:
          return <h4 key={index} className={headerClass} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
        case 5:
          return <h5 key={index} className={headerClass} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
        case 6:
          return <h6 key={index} className={headerClass} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
        default:
          return <h2 key={index} className={headerClassMap[2]} dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />;
      }

    case 'list':
      const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
      const listClass = block.data?.style === 'ordered' 
        ? 'list-decimal list-inside space-y-1 ml-4' 
        : 'list-disc list-inside space-y-1 ml-4';

      return (
        <ListTag key={index} className={listClass}>
          {block.data?.items?.map((item: string, i: number) => (
            <li 
              key={i} 
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </ListTag>
      );

    case 'quote':
      return (
        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">
          <div dangerouslySetInnerHTML={{ __html: block.data?.text || '' }} />
          {block.data?.caption && (
            <cite className="block text-sm text-gray-500 mt-2 not-italic">
              — <span dangerouslySetInnerHTML={{ __html: block.data.caption }} />
            </cite>
          )}
        </blockquote>
      );

    case 'code':
      return (
        <pre key={index} className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
          <code className="text-sm font-mono">{block.data?.code || ''}</code>
        </pre>
      );

    case 'delimiter':
      return (
        <hr key={index} className="border-t-2 border-gray-200 my-8" />
      );

    case 'table':
      return (
        <div key={index} className="overflow-x-auto my-4">
          <table className="min-w-full border border-gray-200">
            <tbody>
              {block.data?.content?.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex} className="border-b border-gray-200">
                  {row.map((cell: string, cellIndex: number) => (
                    <td 
                      key={cellIndex} 
                      className="border-r border-gray-200 px-3 py-2 text-sm"
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'embed':
      if (block.data?.service === 'youtube') {
        return (
          <div key={index} className="my-4">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${block.data.embed}`}
              frameBorder="0"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        );
      }
      return (
        <div key={index} className="bg-gray-100 p-4 rounded-lg my-4">
          <p className="text-gray-600">Embedded content: {block.data?.service}</p>
        </div>
      );

    default:
      return (
        <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-yellow-400 my-2">
          <p className="text-sm text-gray-600">
            Unsupported block type: {block.type}
          </p>
          <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
            {JSON.stringify(block.data, null, 2)}
          </pre>
        </div>
      );
  }
} 