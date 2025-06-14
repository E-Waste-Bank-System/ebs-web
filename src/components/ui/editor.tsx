'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import LinkTool from '@editorjs/link';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';

// Global flag to prevent multiple editor instances
let isAnyEditorInitializing = false;
let globalEditorCount = 0;

interface EditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export interface EditorRef {
  save: () => Promise<OutputData>;
  clear: () => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  data,
  onChange,
  placeholder = 'Start writing your article...',
  readOnly = false
}, ref) => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const isInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  const initialDataRef = useRef<OutputData | undefined>(data);
  
  // Keep onChange ref updated without triggering re-render
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Stable onChange handler with better debugging and debouncing
  const handleChange = useCallback(async () => {
    console.log('Editor onChange triggered');
    if (onChangeRef.current && editorRef.current) {
      try {
        const outputData = await editorRef.current.save();
        console.log('Editor onChange saved data:', outputData);
        console.log('Blocks count:', outputData.blocks?.length || 0);
        // Only log first block if it exists and has content
        if (outputData.blocks?.[0]?.data && Object.keys(outputData.blocks[0].data).length > 0) {
          console.log('First block:', outputData.blocks[0]);
        }
        onChangeRef.current(outputData);
      } catch (error) {
        console.error('Error saving editor data in onChange:', error);
      }
    } else {
      console.log('onChange not available:', { hasOnChange: !!onChangeRef.current, hasEditor: !!editorRef.current });
    }
  }, []);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorRef.current) {
        try {
          const data = await editorRef.current.save();
          console.log('Manual save result:', data);
          return data;
        } catch (error) {
          console.error('Error in manual save:', error);
          return { blocks: [] };
        }
      }
      return { blocks: [] };
    },
    clear: () => {
      if (editorRef.current) {
        editorRef.current.clear();
      }
    }
  }));

  // Clean up function
  const cleanupEditor = useCallback(() => {
    console.log('Cleaning up editor... Global count before:', globalEditorCount);
    if (editorRef.current) {
      try {
        if (editorRef.current.destroy && typeof editorRef.current.destroy === 'function') {
          editorRef.current.destroy();
        }
      } catch (error) {
        console.warn('Error destroying editor:', error);
      }
      editorRef.current = null;
    }
    isInitializedRef.current = false;
    isInitializingRef.current = false;
    isAnyEditorInitializing = false;
    globalEditorCount = Math.max(0, globalEditorCount - 1);
    
    console.log('Editor cleaned up. Global count after:', globalEditorCount);
    
    // Clear the holder completely
    if (holderRef.current) {
      holderRef.current.innerHTML = '';
    }
  }, []);

  // Initialize editor only once
  useEffect(() => {
    if (!holderRef.current) {
      console.log('No holder element available');
      return;
    }
    
    // Prevent multiple initializations globally
    if (isInitializedRef.current || isInitializingRef.current || isAnyEditorInitializing) {
      console.log('Editor already initialized or initializing globally, skipping...', {
        initialized: isInitializedRef.current,
        initializing: isInitializingRef.current,
        globalInitializing: isAnyEditorInitializing,
        globalCount: globalEditorCount
      });
      return;
    }

    console.log('Starting editor initialization...');
    isInitializingRef.current = true;
    isAnyEditorInitializing = true;
    globalEditorCount++;

    // Completely clear the holder element
    holderRef.current.innerHTML = '';
    
    // Wait a moment to ensure DOM is clean
    const timeoutId = setTimeout(() => {
      if (!holderRef.current || isInitializedRef.current) {
        isInitializingRef.current = false;
        isAnyEditorInitializing = false;
        return;
      }

      console.log('Initializing EditorJS with data:', initialDataRef.current);

      // Check if we have actual content
      const hasRealContent = initialDataRef.current && 
        initialDataRef.current.blocks && 
        initialDataRef.current.blocks.length > 0 && 
        initialDataRef.current.blocks.some(block => 
          block.data && 
          Object.keys(block.data).length > 0 && 
          Object.values(block.data).some(value => 
            typeof value === 'string' ? value.trim().length > 0 : 
            Array.isArray(value) ? value.length > 0 : 
            value !== null && value !== undefined
          )
        );

      console.log('Has real content:', hasRealContent);

      const editorConfig: any = {
        holder: holderRef.current,
        readOnly,
        data: hasRealContent ? initialDataRef.current : undefined,
        autofocus: true,
        minHeight: 300,
        placeholder: placeholder,
        inlineToolbar: ['link', 'marker', 'bold', 'italic', 'inlineCode', 'underline'],
        tools: {
          // Block tools
          header: {
            class: Header,
            shortcut: 'CMD+SHIFT+H',
            config: {
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
              placeholder: 'Enter heading...'
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            config: {
              placeholder: placeholder || 'Start writing...',
              preserveBlank: false
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+L',
            config: {
              defaultStyle: 'unordered'
            }
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Quote text',
              captionPlaceholder: 'Author'
            }
          },
          code: {
            class: Code,
            shortcut: 'CMD+SHIFT+C',
            config: {
              placeholder: 'Enter your code...'
            }
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link-preview'
            }
          },
          delimiter: {
            class: Delimiter,
            shortcut: 'CMD+SHIFT+D'
          },
          table: {
            class: Table,
            inlineToolbar: true,
            shortcut: 'CMD+ALT+T',
            config: {
              rows: 2,
              cols: 3
            }
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
          },
          // Inline tools
          marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M'
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+C'
          },
          underline: {
            class: Underline,
            shortcut: 'CMD+U'
          }
        },
        onChange: handleChange,
        onReady: () => {
          console.log('Editor.js is ready to work! Global count:', globalEditorCount);
          isInitializedRef.current = true;
          isInitializingRef.current = false;
          isAnyEditorInitializing = false;
        }
      };

      console.log('Creating EditorJS with config:', editorConfig);

      try {
        const editor = new EditorJS(editorConfig);
        editorRef.current = editor;
      } catch (error) {
        console.error('Error creating editor:', error);
        isInitializingRef.current = false;
        isAnyEditorInitializing = false;
      }
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      cleanupEditor();
    };
  }, []);

  // Handle readOnly changes without reinitializing editor
  useEffect(() => {
    if (editorRef.current && isInitializedRef.current) {
      editorRef.current.readOnly.toggle(readOnly);
    }
  }, [readOnly]);

  // Handle placeholder changes
  useEffect(() => {
    // Don't reinitialize for placeholder changes, editor handles this internally
  }, [placeholder]);

  return (
    <div className="border rounded-lg">
      <div 
        ref={holderRef}
        className="min-h-[300px] p-4 prose prose-sm max-w-none focus-within:outline-none"
        style={{
          fontSize: '16px',
          lineHeight: '1.6'
        }}
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor; 