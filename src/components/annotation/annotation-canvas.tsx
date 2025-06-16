'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Square, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: string;
  confidence?: number;
  is_ai_generated: boolean;
  verified: boolean;
}

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: BoundingBox[];
  onAnnotationsChange: (annotations: BoundingBox[]) => void;
  categories: string[];
  isReadOnly?: boolean;
}

export default function AnnotationCanvas({
  imageUrl,
  annotations,
  onAnnotationsChange,
  categories,
  isReadOnly = false
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<Partial<BoundingBox> | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');
  const [showAIAnnotations, setShowAIAnnotations] = useState(true);
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Draw the image and annotations on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw existing annotations
    annotations.forEach((annotation) => {
      if (!showAIAnnotations && annotation.is_ai_generated) return;

      const isSelected = selectedAnnotation === annotation.id;
      const color = annotation.is_ai_generated ? '#3b82f6' : '#10b981'; // Blue for AI, Green for manual
      const alpha = annotation.verified ? 1 : 0.7;

      ctx.strokeStyle = isSelected ? '#ef4444' : color; // Red border for selected
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.fillStyle = `${color}20`; // Semi-transparent fill

      // Draw bounding box
      const x = (annotation.x / 100) * canvas.width;
      const y = (annotation.y / 100) * canvas.height;
      const width = (annotation.width / 100) * canvas.width;
      const height = (annotation.height / 100) * canvas.height;

      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);

      // Draw label
      ctx.fillStyle = color;
      ctx.font = '12px Arial';
      const labelText = `${annotation.category}${annotation.confidence ? ` (${(annotation.confidence * 100).toFixed(0)}%)` : ''}`;
      const labelWidth = ctx.measureText(labelText).width;
      
      // Label background
      ctx.fillRect(x, y - 20, labelWidth + 8, 20);
      
      // Label text
      ctx.fillStyle = 'white';
      ctx.fillText(labelText, x + 4, y - 6);
    });

    // Draw current drawing box
    if (currentBox && startPoint) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const x = Math.min(startPoint.x, currentBox.x || 0);
      const y = Math.min(startPoint.y, currentBox.y || 0);
      const width = Math.abs((currentBox.x || 0) - startPoint.x);
      const height = Math.abs((currentBox.y || 0) - startPoint.y);
      
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  }, [annotations, selectedAnnotation, showAIAnnotations, currentBox, startPoint, imageLoaded]);

  // Handle image load
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleLoad = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas size to maintain aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      let canvasWidth = maxWidth;
      let canvasHeight = maxWidth / aspectRatio;
      
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * aspectRatio;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      setScale(canvasWidth / image.naturalWidth);
      setImageLoaded(true);
    };

    if (image.complete) {
      handleLoad();
    } else {
      image.addEventListener('load', handleLoad);
      return () => image.removeEventListener('load', handleLoad);
    }
  }, [imageUrl]);

  // Redraw canvas when annotations change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Convert canvas coordinates to percentage
  const canvasToPercent = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    return {
      x: (x / canvas.width) * 100,
      y: (y / canvas.height) * 100
    };
  };

  // Handle mouse down - start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;

    const pos = getMousePos(e);
    
    // Check if clicking on existing annotation
    const clickedAnnotation = annotations.find(annotation => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const x = (annotation.x / 100) * canvas.width;
      const y = (annotation.y / 100) * canvas.height;
      const width = (annotation.width / 100) * canvas.width;
      const height = (annotation.height / 100) * canvas.height;

      return pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height;
    });

    if (clickedAnnotation) {
      setSelectedAnnotation(clickedAnnotation.id);
      return;
    }

    // Start drawing new annotation
    setSelectedAnnotation(null);
    setIsDrawing(true);
    setStartPoint(pos);
    setCurrentBox({ x: pos.x, y: pos.y });
  };

  // Handle mouse move - update drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return;

    const pos = getMousePos(e);
    setCurrentBox({ x: pos.x, y: pos.y });
  };

  // Handle mouse up - finish drawing
  const handleMouseUp = () => {
    if (!isDrawing || !startPoint || !currentBox || isReadOnly) return;

    const minSize = 10; // Minimum box size
    const width = Math.abs(currentBox.x! - startPoint.x);
    const height = Math.abs(currentBox.y! - startPoint.y);

    if (width < minSize || height < minSize) {
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentBox(null);
      return;
    }

    // Create new annotation
    const x = Math.min(startPoint.x, currentBox.x!);
    const y = Math.min(startPoint.y, currentBox.y!);
    const percentCoords = canvasToPercent(x, y);
    const percentSize = canvasToPercent(width, height);

    const newAnnotation: BoundingBox = {
      id: `manual_${Date.now()}`,
      x: percentCoords.x,
      y: percentCoords.y,
      width: percentSize.x,
      height: percentSize.y,
      category: selectedCategory,
      is_ai_generated: false,
      verified: true
    };

    onAnnotationsChange([...annotations, newAnnotation]);

    // Reset drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  };

  // Delete selected annotation
  const deleteAnnotation = () => {
    if (!selectedAnnotation) return;
    onAnnotationsChange(annotations.filter(a => a.id !== selectedAnnotation));
    setSelectedAnnotation(null);
  };

  // Update annotation category
  const updateAnnotationCategory = (annotationId: string, category: string) => {
    onAnnotationsChange(
      annotations.map(a => 
        a.id === annotationId 
          ? { ...a, category, verified: true }
          : a
      )
    );
  };

  // Verify annotation
  const verifyAnnotation = (annotationId: string) => {
    onAnnotationsChange(
      annotations.map(a => 
        a.id === annotationId 
          ? { ...a, verified: true }
          : a
      )
    );
  };

  const selectedAnnotationData = annotations.find(a => a.id === selectedAnnotation);

  return (
    <div className="flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="category">Category:</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAnnotations(!showAIAnnotations)}
          >
            {showAIAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            AI Annotations
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {annotations.filter(a => !a.is_ai_generated).length} Manual
          </Badge>
          <Badge variant="outline">
            {annotations.filter(a => a.is_ai_generated).length} AI
          </Badge>
          {selectedAnnotation && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteAnnotation}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex space-x-4">
        {/* Canvas */}
        <div className="flex-1">
          <div className="relative border rounded-lg overflow-hidden bg-gray-100">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Annotation target"
              className="absolute inset-0 w-full h-full object-contain opacity-0"
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setIsDrawing(false);
                setStartPoint(null);
                setCurrentBox(null);
              }}
              className={`block ${isReadOnly ? 'cursor-default' : 'cursor-crosshair'}`}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {!isReadOnly && (
            <p className="text-sm text-gray-600 mt-2">
              Click and drag to draw bounding boxes. Click on existing boxes to select them.
            </p>
          )}
        </div>

        {/* Annotation List */}
        <div className="w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Annotations ({annotations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnnotation === annotation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAnnotation(annotation.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={annotation.is_ai_generated ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {annotation.is_ai_generated ? 'AI' : 'Manual'}
                      </Badge>
                      {annotation.verified && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    {annotation.confidence && (
                      <span className="text-xs text-gray-500">
                        {(annotation.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {selectedAnnotation === annotation.id && !isReadOnly ? (
                    <div className="space-y-2">
                      <Select
                        value={annotation.category}
                        onValueChange={(value) => updateAnnotationCategory(annotation.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!annotation.verified && (
                        <Button
                          size="sm"
                          onClick={() => verifyAnnotation(annotation.id)}
                          className="w-full"
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="font-medium">{annotation.category}</p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {annotation.width.toFixed(1)}% × {annotation.height.toFixed(1)}%
                  </p>
                </div>
              ))}

              {annotations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No annotations yet</p>
                  {!isReadOnly && (
                    <p className="text-xs mt-1">Draw boxes on the image to add annotations</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 