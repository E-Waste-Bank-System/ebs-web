'use client'

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Image as ImageIcon,
  Target
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import AnnotationCanvas from './annotation-canvas';
import { AnnotationStatus } from '@/lib/api-client';

interface AnnotationTask {
  id: string;
  dataset_id: string;
  image_url: string;
  original_filename?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'rejected';
  annotations?: Array<{
    id: string;
    category: string;
    bbox: { x: number; y: number; width: number; height: number };
    confidence?: number;
    is_ai_generated: boolean;
    verified: boolean;
  }>;
  assigned_to?: string;
  completed_at?: string;
  notes?: string;
}

interface AnnotationStudioProps {
  datasetId: string;
  datasetName: string;
  onClose: () => void;
}

// Common e-waste categories
const EWASTE_CATEGORIES = [
  'smartphone',
  'laptop',
  'tablet',
  'desktop_computer',
  'monitor',
  'keyboard',
  'mouse',
  'printer',
  'television',
  'camera',
  'headphones',
  'speakers',
  'game_console',
  'router',
  'cables',
  'battery',
  'charger',
  'circuit_board',
  'hard_drive',
  'memory_card',
  'other_electronic'
];

// Transform annotation from backend format to canvas format
const transformAnnotationForCanvas = (annotation: any) => {
  if (annotation.bbox) {
    // Transform from backend format { bbox: { x, y, width, height } } 
    // to canvas format { x, y, width, height }
    return {
      ...annotation,
      x: annotation.bbox.x,
      y: annotation.bbox.y,
      width: annotation.bbox.width,
      height: annotation.bbox.height,
      // Remove bbox to avoid confusion
      bbox: undefined
    };
  }
  return annotation; // Already in canvas format
};

// Transform annotation from canvas format to backend format
const transformAnnotationForBackend = (annotation: any) => {
  if (annotation.x !== undefined && annotation.y !== undefined && 
      annotation.width !== undefined && annotation.height !== undefined) {
    // Transform from canvas format { x, y, width, height }
    // to backend format { bbox: { x, y, width, height } }
    return {
      id: annotation.id,
      category: annotation.category,
      bbox: {
        x: annotation.x,
        y: annotation.y,
        width: annotation.width,
        height: annotation.height
      },
      confidence: annotation.confidence,
      is_ai_generated: annotation.is_ai_generated,
      verified: annotation.verified
    };
  }
  return annotation; // Already in backend format
};

export default function AnnotationStudio({ datasetId, datasetName, onClose }: AnnotationStudioProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentAnnotations, setCurrentAnnotations] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const queryClient = useQueryClient();

  // Fetch annotation tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['annotation-tasks', datasetId],
    queryFn: async (): Promise<AnnotationTask[]> => {
      console.log('Fetching annotation tasks for dataset:', datasetId);
      try {
        const response = await apiClient.getAnnotationTasks(datasetId);
        console.log('Annotation tasks response:', response);
        return response;
      } catch (error) {
        console.error('Failed to fetch annotation tasks:', error);
        throw error;
      }
    },
  });

  // Save annotation mutation
  const saveAnnotationMutation = useMutation({
    mutationFn: async ({ 
      taskId, 
      annotations, 
      status, 
      notes 
    }: { 
      taskId: string;
      annotations: any[];
      status: string;
      notes?: string;
    }) => {
      console.log('Saving annotation task:', { taskId, annotations, status, notes });
      try {
        const response = await apiClient.updateAnnotationTask(taskId, {
          annotations,
          status: status as AnnotationStatus,
          notes
        });
        console.log('Save annotation response:', response);
        return response;
      } catch (error) {
        console.error('Failed to save annotation task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotation-tasks', datasetId] });
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      console.error('Save annotation mutation error:', error);
    },
  });

  const currentTask = tasks[currentTaskIndex];

  // Load current task data
  useEffect(() => {
    if (currentTask) {
      // Transform annotations from backend format to canvas format
      const transformedAnnotations = (currentTask.annotations || []).map(transformAnnotationForCanvas);
      setCurrentAnnotations(transformedAnnotations);
      setNotes(currentTask.notes || '');
      setHasUnsavedChanges(false);
    }
  }, [currentTask]);

  // Track changes
  useEffect(() => {
    if (currentTask) {
      // Transform original annotations to canvas format for comparison
      const originalTransformed = (currentTask.annotations || []).map(transformAnnotationForCanvas);
      const originalAnnotations = JSON.stringify(originalTransformed);
      const currentAnnotationsStr = JSON.stringify(currentAnnotations);
      const originalNotes = currentTask.notes || '';
      
      setHasUnsavedChanges(
        originalAnnotations !== currentAnnotationsStr || originalNotes !== notes
      );
    }
  }, [currentAnnotations, notes, currentTask]);

  // Save current task
  const saveCurrentTask = async (markAsCompleted = false) => {
    if (!currentTask) return;

    const status = markAsCompleted ? 'completed' : 
                  currentAnnotations.length > 0 ? 'in_progress' : 'pending';

    // Transform annotations back to backend format
    const backendAnnotations = currentAnnotations.map(transformAnnotationForBackend);

    await saveAnnotationMutation.mutateAsync({
      taskId: currentTask.id,
      annotations: backendAnnotations,
      status,
      notes
    });
  };

  // Navigate to next task
  const goToNextTask = async () => {
    if (hasUnsavedChanges) {
      await saveCurrentTask();
    }
    
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  // Navigate to previous task
  const goToPreviousTask = async () => {
    if (hasUnsavedChanges) {
      await saveCurrentTask();
    }
    
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  // Complete task and move to next
  const completeTask = async () => {
    await saveCurrentTask(true);
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  // Get task status info
  const getTaskStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' };
      case 'in_progress':
        return { icon: Target, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' };
      case 'reviewed':
        return { icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load annotation tasks. Error: {error instanceof Error ? error.message : 'Unknown error'}
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['annotation-tasks', datasetId] })}
            >
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No images to annotate</h3>
        <p className="text-gray-600 mb-4">
          This dataset doesn't have any images yet. You need to add images from e-waste scans first.
        </p>
        <Alert className="max-w-md mx-auto mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Next steps:</strong>
            <br />
            1. Go to E-Waste Scans page
            <br />
            2. Upload and process some images
            <br />
            3. Come back to add those detected objects to this dataset
          </AlertDescription>
        </Alert>
        <div className="flex space-x-3 justify-center">
          <Button onClick={onClose}>
            Go Back to Dataset
          </Button>
          <Button variant="outline" onClick={() => window.open('/admin/e-waste', '_blank')}>
            View E-Waste Scans
          </Button>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = (completedTasks / tasks.length) * 100;
  const statusInfo = getTaskStatusInfo(currentTask?.status || 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onClose} className="mb-2">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to {datasetName}
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Annotation Studio</h2>
          <p className="text-gray-600">
            Task {currentTaskIndex + 1} of {tasks.length} • {completedTasks} completed
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
            <Badge className={`${statusInfo.bg} ${statusInfo.color}`}>
              {currentTask?.status || 'pending'}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="w-32" />
          <p className="text-xs text-gray-500 mt-1">{progressPercentage.toFixed(1)}% complete</p>
        </div>
      </div>

      {/* Main Content */}
      {currentTask && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Annotation Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>{currentTask.original_filename || `Image ${currentTaskIndex + 1}`}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    {hasUnsavedChanges && (
                      <Badge variant="secondary" className="text-orange-600">
                        Unsaved Changes
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AnnotationCanvas
                  imageUrl={apiClient.getProxiedImageUrl(currentTask.image_url)}
                  annotations={currentAnnotations}
                  onAnnotationsChange={setCurrentAnnotations}
                  categories={EWASTE_CATEGORIES}
                />
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Task Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousTask}
                    disabled={currentTaskIndex === 0 || saveAnnotationMutation.isPending}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextTask}
                    disabled={currentTaskIndex === tasks.length - 1 || saveAnnotationMutation.isPending}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <Button
                  onClick={() => saveCurrentTask()}
                  disabled={!hasUnsavedChanges || saveAnnotationMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveAnnotationMutation.isPending ? 'Saving...' : 'Save Progress'}
                </Button>

                <Button
                  onClick={completeTask}
                  disabled={currentAnnotations.length === 0 || saveAnnotationMutation.isPending}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Task
                </Button>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="notes" className="text-sm text-gray-600">
                  Add any observations or issues with this image
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes about this annotation task..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Task Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {currentAnnotations.filter(a => a.is_ai_generated).length}
                    </p>
                    <p className="text-xs text-gray-600">AI Annotations</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {currentAnnotations.filter(a => !a.is_ai_generated).length}
                    </p>
                    <p className="text-xs text-gray-600">Manual</p>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {currentAnnotations.filter(a => a.verified).length}
                  </p>
                  <p className="text-xs text-gray-600">Verified</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 