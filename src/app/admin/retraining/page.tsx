'use client'

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database,
  Download,
  Image,
  FileText,
  Package,
  Construction,
  Info,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Brain,
  Layers,
  AlertCircle,
  FileArchive,
  Folder,
  Code,
  Plus,
  Trash2,
  Play,
  Square,
  Save,
  Upload,
  Users,
  BarChart3,
  Zap,
  Loader2,
  ChevronLeft,
  TrendingUp,
  Activity,
  Gauge
} from 'lucide-react';
import { format } from 'date-fns';
import { useObjects, useDatasets, useCreateDataset, useAddImagesToDataset, useStartTraining, useCompleteTraining, useFailTraining, useAnnotationTasks, useUpdateAnnotationTask, useAssignAnnotationTask } from '@/lib/queries';
import { apiClient, type Dataset, type AnnotationTask, type DatasetStatus, type AnnotationStatus, type RetrainingType } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/currency';

// Performance metrics interface
interface PerformanceMetrics {
  epoch: number;
  precision: number;
  recall: number;
  mAP50: number;
  mAP50_95: number;
  trainBoxLoss: number;
  trainClsLoss: number;
  trainDflLoss: number;
  valBoxLoss: number;
  valClsLoss: number;
  valDflLoss: number;
}

// Component to fetch and parse CSV data
const ModelPerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/model-perf/results.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
        // Remove header
        const dataLines = lines.slice(1).filter(line => line && line.split(',').length >= 14);
        if (dataLines.length > 0) {
          const lastLine = dataLines[dataLines.length - 1];
          const values = lastLine.split(',');
          if (values.length >= 14) {
            const currentMetrics: PerformanceMetrics = {
              epoch: parseInt(values[0]),
              precision: parseFloat(values[4]) * 100, // Convert to percentage
              recall: parseFloat(values[5]) * 100, // Convert to percentage
              mAP50: parseFloat(values[7]) * 100, // mAP50 (corrected index)
              mAP50_95: parseFloat(values[8]) * 100, // mAP50-95 (corrected index)
              trainBoxLoss: parseFloat(values[2]),
              trainClsLoss: parseFloat(values[3]),
              trainDflLoss: parseFloat(values[4]),
              valBoxLoss: parseFloat(values[9]),
              valClsLoss: parseFloat(values[10]),
              valDflLoss: parseFloat(values[11])
            };
            setMetrics(currentMetrics);
          }
        }
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#69C0DC]" />
            <span className="text-gray-600">Loading performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No performance metrics available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricColor = (value: number, type: 'positive' | 'negative' = 'positive') => {
    if (type === 'positive') {
      if (value >= 80) return 'text-green-600';
      if (value >= 60) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value <= 0.5) return 'text-green-600';
      if (value <= 1.0) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#69C0DC]/10 rounded-lg">
              <Gauge className="h-5 w-5 text-[#69C0DC]" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Model Performance
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Precision */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#69C0DC]" />
              <span className="text-sm font-medium text-gray-600">Precision</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.precision)}`}>
              {metrics.precision.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Detection Accuracy
            </div>
          </div>

          {/* Recall */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-[#69C0DC]" />
              <span className="text-sm font-medium text-gray-600">Recall</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.recall)}`}>
              {metrics.recall.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Detection Coverage
            </div>
          </div>

          {/* mAP50 */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-[#69C0DC]" />
              <span className="text-sm font-medium text-gray-600">mAP50</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.mAP50)}`}>
              {metrics.mAP50.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Mean Average Precision (IoU=0.5)
            </div>
          </div>

          {/* mAP50-95 */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-[#69C0DC]" />
              <span className="text-sm font-medium text-gray-600">mAP50-95</span>
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.mAP50_95)}`}>
              {metrics.mAP50_95.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Overall Performance (IoU=0.5:0.95)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function RetrainingPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('datasets');
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [newDataset, setNewDataset] = useState({ name: '', description: '' });
  const [isCreateDatasetOpen, setIsCreateDatasetOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportFormat, setExportFormat] = useState('yolo');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDatasetForAnnotation, setSelectedDatasetForAnnotation] = useState<string | null>(null);

  // API queries
  const { 
    data: objectsResponse, 
    isLoading: objectsLoading,
    error: objectsError
  } = useObjects({ page: 1, limit: 100 });

  const { 
    data: datasetsResponse, 
    isLoading: datasetsLoading,
    error: datasetsError
  } = useDatasets();

  const { 
    data: annotationTasks, 
    isLoading: annotationTasksLoading,
    error: annotationTasksError
  } = useAnnotationTasks(selectedDatasetForAnnotation || '');

  const createDatasetMutation = useCreateDataset();
  const addImagesToDatasetMutation = useAddImagesToDataset();
  const startTrainingMutation = useStartTraining();
  const completeTrainingMutation = useCompleteTraining();
  const failTrainingMutation = useFailTraining();
  const updateAnnotationTaskMutation = useUpdateAnnotationTask();
  const assignAnnotationTaskMutation = useAssignAnnotationTask();

  const objects = objectsResponse?.data || [];
  const datasets = datasetsResponse || [];

  // Show authentication error if objects fetch fails due to auth
  if (objectsError && (objectsError as any)?.status === 401) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication error. Your session may have expired.
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/login';
                }}
              >
                Login Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle export
  const handleExport = () => {
    if (selectedObjects.length === 0) return;
    
    setIsExporting(true);
    console.log('Starting export for objects:', selectedObjects);
    
    apiClient.exportYoloDataset(selectedObjects)
      .then((blob: Blob) => {
        console.log('Export successful, blob size:', blob.size);
        
        if (blob.size === 0) {
          throw new Error('Export returned empty file');
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yolo-dataset-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('Export download initiated');
      })
      .catch((error: any) => {
        console.error('Export failed:', error);
        alert(`Export failed: ${error.message || 'Unknown error occurred'}`);
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  // Toggle object selection
  const toggleObjectSelection = (objectId: string) => {
    setSelectedObjects(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId]
    );
  };

  // Select all objects
  const selectAllObjects = () => {
    setSelectedObjects(objects.map(obj => obj.id));
  };

  // Deselect all objects
  const deselectAllObjects = () => {
    setSelectedObjects([]);
  };

  // Check if all objects are selected
  const areAllObjectsSelected = objects.length > 0 && selectedObjects.length === objects.length;

  // Handle create dataset from selected objects
  const handleCreateDatasetFromObjects = () => {
    if (!newDataset.name || selectedObjects.length === 0) return;
    
    console.log('Frontend - handleCreateDatasetFromObjects called with:', {
      name: newDataset.name,
      description: newDataset.description,
      objectIds: selectedObjects,
      objectCount: selectedObjects.length
    });

    createDatasetMutation.mutate({
      name: newDataset.name,
      description: newDataset.description,
      configuration: {
        objectCount: selectedObjects.length,
        exportFormat: exportFormat
      }
    }, {
      onSuccess: (dataset) => {
        console.log('Dataset created successfully:', dataset);
        
        // Add selected objects to the dataset
        addImagesToDatasetMutation.mutate({
          datasetId: dataset.id,
          objectIds: selectedObjects
        }, {
          onSuccess: (tasks) => {
            console.log('Images added to dataset successfully:', tasks);
            setNewDataset({ name: '', description: '' });
            setSelectedObjects([]);
            setIsCreateDatasetOpen(false);
            queryClient.invalidateQueries({ queryKey: ['datasets'] });
          },
          onError: (error) => {
            console.error('Failed to add images to dataset:', error);
            alert(`Failed to add images to dataset: ${error.message || 'Unknown error'}`);
          }
        });
      },
      onError: (error) => {
        console.error('Failed to create dataset:', error);
        alert(`Failed to create dataset: ${error.message || 'Unknown error'}`);
      }
    });
  };

  // Handle start training
  const handleStartTraining = (datasetId: string) => {
    startTrainingMutation.mutate(datasetId);
  };

  // Handle complete training
  const handleCompleteTraining = (datasetId: string) => {
    const metrics = {
      final_map: 0.85,
      precision: 0.92,
      recall: 0.88,
      epochs_completed: 100,
      best_weights_path: `/weights/dataset-${datasetId}-best.pt`
    };
    completeTrainingMutation.mutate({ datasetId, metrics });
  };

  // Handle fail training
  const handleFailTraining = (datasetId: string) => {
    failTrainingMutation.mutate({ 
      datasetId, 
      error: 'Training failed due to insufficient data' 
    });
  };

  // Handle assign annotation task
  const handleAssignTask = (taskId: string) => {
    assignAnnotationTaskMutation.mutate(taskId);
  };

  // Handle update annotation task
  const handleUpdateAnnotationTask = (taskId: string, data: any) => {
    updateAnnotationTaskMutation.mutate({ taskId, data });
  };

  const getStatusColor = (status: DatasetStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'training':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: DatasetStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'training':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'ready':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAnnotationStatusColor = (status: AnnotationStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Model Training</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage datasets, annotations, and model training for improved e-waste detection.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={selectedObjects.length === 0 || isExporting}
            className="rounded-xl"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export YOLO Dataset ({selectedObjects.length})
          </Button>
          <Button 
            onClick={() => setIsCreateDatasetOpen(true)}
            disabled={selectedObjects.length === 0}
            className="bg-[#69C0DC] hover:bg-[#5BA8C4] rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Dataset
          </Button>
        </div>
      </div>

      {/* Performance Metrics Section */}
      <ModelPerformanceMetrics />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full rounded-xl">
          <TabsTrigger value="datasets" className="flex-1 rounded-lg">Datasets</TabsTrigger>
          <TabsTrigger value="objects" className="flex-1 rounded-lg">Objects</TabsTrigger>
          <TabsTrigger value="annotation" className="flex-1 rounded-lg">Annotation</TabsTrigger>
          <TabsTrigger value="training" className="flex-1 rounded-lg">Training</TabsTrigger>
        </TabsList>

        {/* Datasets Tab */}
        <TabsContent value="datasets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {datasetsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              datasets.map((dataset) => (
                <Card key={dataset.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#69C0DC]/10 rounded-lg">
                          <Database className="h-5 w-5 text-[#69C0DC]" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            {dataset.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dataset.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(dataset.status)}`}>
                        {getStatusIcon(dataset.status)}
                        <span className="ml-1 capitalize">{dataset.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total Images</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{dataset.total_images}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Annotated</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{dataset.annotated_images}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Annotations</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{dataset.total_annotations}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Progress</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {dataset.total_images > 0 ? Math.round((dataset.annotated_images / dataset.total_images) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    
                    {dataset.status === 'ready' && (
                      <Button 
                        onClick={() => handleStartTraining(dataset.id)}
                        disabled={startTrainingMutation.isPending}
                        className="w-full bg-[#69C0DC] hover:bg-[#5BA8C4]"
                      >
                        {startTrainingMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Start Training
                      </Button>
                    )}
                    
                    {dataset.status === 'training' && (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleCompleteTraining(dataset.id)}
                          disabled={completeTrainingMutation.isPending}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {completeTrainingMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Complete Training
                        </Button>
                        <Button 
                          onClick={() => handleFailTraining(dataset.id)}
                          disabled={failTrainingMutation.isPending}
                          variant="outline"
                          className="w-full"
                        >
                                                     {failTrainingMutation.isPending ? (
                             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                           ) : (
                             <Square className="h-4 w-4 mr-2" />
                           )}
                          Fail Training
                        </Button>
                      </div>
                    )}
                    
                                         {dataset.training_metrics && (
                       <div className="space-y-2">
                         <h4 className="text-sm font-medium text-gray-900 dark:text-white">Training Metrics</h4>
                         <div className="grid grid-cols-2 gap-2 text-xs">
                           <div>
                             <p className="text-gray-600">mAP</p>
                             <p className="font-semibold">{((dataset.training_metrics.final_map || 0) * 100).toFixed(1)}%</p>
                           </div>
                           <div>
                             <p className="text-gray-600">Precision</p>
                             <p className="font-semibold">{((dataset.training_metrics.precision || 0) * 100).toFixed(1)}%</p>
                           </div>
                           <div>
                             <p className="text-gray-600">Recall</p>
                             <p className="font-semibold">{((dataset.training_metrics.recall || 0) * 100).toFixed(1)}%</p>
                           </div>
                           <div>
                             <p className="text-gray-600">Epochs</p>
                             <p className="font-semibold">{dataset.training_metrics.epochs_completed || 0}</p>
                           </div>
                         </div>
                       </div>
                     )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Objects Tab */}
        <TabsContent value="objects" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <Package className="mr-3 h-5 w-5 text-[#69C0DC]" />
                    Available Objects for Dataset Creation
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select objects to include in your training dataset. {selectedObjects.length} objects selected.
                  </p>
                </div>
                <div className="flex space-x-2">
                  {areAllObjectsSelected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAllObjects}
                      className="rounded-lg"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Deselect All
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllObjects}
                      disabled={objects.length === 0}
                      className="rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Select All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {objectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {objects.map((object) => (
                      <div
                        key={object.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedObjects.includes(object.id)
                            ? 'border-[#69C0DC] bg-[#69C0DC]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleObjectSelection(object.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {object.scan?.image_url ? (
                              <img
                                src={object.scan.image_url}
                                alt={object.category}
                                className="w-12 h-12 rounded-lg object-cover border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 ${
                              object.scan?.image_url ? 'hidden' : ''
                            }`}>
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                            {selectedObjects.includes(object.id) && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#69C0DC] rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white capitalize">{object.category}</h4>
                            <p className="text-xs text-gray-500">
                              Confidence: {(object.confidence_score * 100).toFixed(1)}%
                            </p>
                            {object.estimated_value && (
                              <p className="text-xs text-gray-500">
                                Value: {formatCurrency(object.estimated_value)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annotation Tab */}
        <TabsContent value="annotation" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Target className="mr-3 h-5 w-5 text-[#69C0DC]" />
                Annotation Tasks
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Manage annotation tasks for dataset preparation and model training.
              </p>
            </CardHeader>
            <CardContent>
              {datasets.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Datasets Available</h3>
                  <p className="text-gray-600 mb-4">
                    Create a dataset first to start annotation tasks.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('datasets')}
                    className="bg-[#69C0DC] hover:bg-[#5BA8C4]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Dataset
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {datasets.map((dataset) => (
                    <Card key={dataset.id} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-[#69C0DC]/10 rounded-lg">
                              <Database className="h-5 w-5 text-[#69C0DC]" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
                              <p className="text-sm text-gray-600">{dataset.description}</p>
                            </div>
                          </div>
                          <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(dataset.status)}`}>
                            {getStatusIcon(dataset.status)}
                            <span className="ml-1 capitalize">{dataset.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Images</p>
                            <p className="font-semibold text-gray-900">{dataset.total_images}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Annotated</p>
                            <p className="font-semibold text-gray-900">{dataset.annotated_images}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Progress</p>
                            <p className="font-semibold text-gray-900">
                              {dataset.total_images > 0 ? Math.round((dataset.annotated_images / dataset.total_images) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                        
                        {dataset.total_images > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Annotation Progress</span>
                              <span className="text-gray-900 font-medium">
                                {dataset.annotated_images} / {dataset.total_images}
                              </span>
                            </div>
                            <Progress 
                              value={dataset.total_images > 0 ? (dataset.annotated_images / dataset.total_images) * 100 : 0} 
                              className="h-2"
                            />
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDatasetForAnnotation(dataset.id)}
                            disabled={dataset.total_images === 0}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Tasks
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // TODO: Export annotations
                              console.log('Export annotations for dataset:', dataset.id);
                            }}
                            disabled={dataset.annotated_images === 0}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Annotation Tasks Viewer */}
              {selectedDatasetForAnnotation && (
                <Card className="border-0 shadow-sm mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDatasetForAnnotation(null)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Back to Datasets
                        </Button>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Annotation Tasks
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {datasets.find(d => d.id === selectedDatasetForAnnotation)?.name}
                          </p>
                        </div>
                      </div>
                      <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                        {annotationTasks?.length || 0} Tasks
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {annotationTasksLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="p-4 border rounded-lg animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : annotationTasksError ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Failed to load annotation tasks. Please try again.
                        </AlertDescription>
                      </Alert>
                    ) : annotationTasks && annotationTasks.length > 0 ? (
                      <div className="space-y-4">
                        {annotationTasks.map((task) => (
                          <div key={task.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {task.status === 'completed' ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : task.status === 'in_progress' ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Clock className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {task.original_filename || 'Image Task'}
                                  </h4>
                                  <p className="text-sm text-gray-600 capitalize">
                                    Status: {task.status.replace('_', ' ')}
                                  </p>
                                  {task.annotations && (
                                    <p className="text-xs text-gray-500">
                                      {task.annotations.length} annotations
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Open annotation studio for this task
                                    console.log('Open annotation studio for task:', task.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Annotate
                                </Button>
                                {task.status === 'pending' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleAssignTask(task.id)}
                                    disabled={assignAnnotationTaskMutation.isPending}
                                  >
                                    {assignAnnotationTaskMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Users className="h-4 w-4 mr-2" />
                                    )}
                                    Assign
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Annotation Tasks</h3>
                        <p className="text-gray-600">
                          No annotation tasks found for this dataset.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <Brain className="mr-3 h-5 w-5 text-[#69C0DC]" />
                Model Training
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage AI model training processes and performance metrics.
              </p>
            </CardHeader>
            <CardContent>
              {datasets.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Training Datasets</h3>
                  <p className="text-gray-600 mb-4">
                    Create a dataset and complete annotations to start model training.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('datasets')}
                    className="bg-[#69C0DC] hover:bg-[#5BA8C4]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Dataset
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Training Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-900 text-center">Active Training</h4>
                      <p className="text-2xl font-bold text-blue-600 text-center">
                        {datasets.filter(d => d.status === 'training').length}
                      </p>
                      <p className="text-sm text-blue-600 text-center">Datasets</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium text-green-900 text-center">Completed</h4>
                      <p className="text-2xl font-bold text-green-600 text-center">
                        {datasets.filter(d => d.status === 'completed').length}
                      </p>
                      <p className="text-sm text-green-600 text-center">Models</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <h4 className="font-medium text-red-900 text-center">Failed</h4>
                      <p className="text-2xl font-bold text-red-600 text-center">
                        {datasets.filter(d => d.status === 'failed').length}
                      </p>
                      <p className="text-sm text-red-600 text-center">Training Runs</p>
                    </div>
                  </div>

                  {/* Training Datasets */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Training Datasets</h3>
                    {datasets
                      .filter(dataset => ['ready', 'training', 'completed', 'failed'].includes(dataset.status))
                      .map((dataset) => (
                        <Card key={dataset.id} className="border border-gray-200">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#69C0DC]/10 rounded-lg">
                                  <Database className="h-5 w-5 text-[#69C0DC]" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{dataset.name}</h4>
                                  <p className="text-sm text-gray-600">{dataset.description}</p>
                                </div>
                              </div>
                              <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(dataset.status)}`}>
                                {getStatusIcon(dataset.status)}
                                <span className="ml-1 capitalize">{dataset.status}</span>
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Images</p>
                                <p className="font-semibold text-gray-900">{dataset.total_images}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Annotated</p>
                                <p className="font-semibold text-gray-900">{dataset.annotated_images}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Annotations</p>
                                <p className="font-semibold text-gray-900">{dataset.total_annotations}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Progress</p>
                                <p className="font-semibold text-gray-900">
                                  {dataset.total_images > 0 ? Math.round((dataset.annotated_images / dataset.total_images) * 100) : 0}%
                                </p>
                              </div>
                            </div>

                            {/* Training Metrics */}
                            {dataset.training_metrics && (
                              <div className="space-y-3">
                                <h5 className="text-sm font-medium text-gray-900">Training Metrics</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">mAP</p>
                                    <p className="font-semibold text-gray-900">
                                      {((dataset.training_metrics.final_map || 0) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Precision</p>
                                    <p className="font-semibold text-gray-900">
                                      {((dataset.training_metrics.precision || 0) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Recall</p>
                                    <p className="font-semibold text-gray-900">
                                      {((dataset.training_metrics.recall || 0) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Epochs</p>
                                    <p className="font-semibold text-gray-900">
                                      {dataset.training_metrics.epochs_completed || 0}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Training Actions */}
                            <div className="flex space-x-2">
                              {dataset.status === 'ready' && (
                                <Button 
                                  onClick={() => handleStartTraining(dataset.id)}
                                  disabled={startTrainingMutation.isPending}
                                  className="flex-1 bg-[#69C0DC] hover:bg-[#5BA8C4]"
                                >
                                  {startTrainingMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                  )}
                                  Start Training
                                </Button>
                              )}
                              
                              {dataset.status === 'training' && (
                                <div className="flex space-x-2 w-full">
                                  <Button 
                                    onClick={() => handleCompleteTraining(dataset.id)}
                                    disabled={completeTrainingMutation.isPending}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    {completeTrainingMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Complete
                                  </Button>
                                  <Button 
                                    onClick={() => handleFailTraining(dataset.id)}
                                    disabled={failTrainingMutation.isPending}
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    {failTrainingMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Square className="h-4 w-4 mr-2" />
                                    )}
                                    Fail
                                  </Button>
                                </div>
                              )}
                              
                              {dataset.status === 'completed' && (
                                <div className="flex space-x-2 w-full">
                                  <Button 
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      // TODO: Deploy model
                                      console.log('Deploy model for dataset:', dataset.id);
                                    }}
                                  >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Deploy Model
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      // TODO: Download weights
                                      console.log('Download weights for dataset:', dataset.id);
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Weights
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dataset Dialog */}
      {isCreateDatasetOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New Dataset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataset-name">Dataset Name</Label>
                <Input
                  id="dataset-name"
                  value={newDataset.name}
                  onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter dataset name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dataset-description">Description</Label>
                <Textarea
                  id="dataset-description"
                  value={newDataset.description}
                  onChange={(e) => setNewDataset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter dataset description"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yolo">YOLO Format</SelectItem>
                    <SelectItem value="coco">COCO Format</SelectItem>
                    <SelectItem value="pascal">Pascal VOC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDatasetOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDatasetFromObjects}
                  disabled={!newDataset.name || selectedObjects.length === 0 || createDatasetMutation.isPending}
                  className="flex-1 bg-[#69C0DC] hover:bg-[#5BA8C4]"
                >
                  {createDatasetMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Create Dataset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 