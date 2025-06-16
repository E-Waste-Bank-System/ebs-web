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
  Code
} from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import AnnotationStudio from '@/components/annotation/annotation-studio';

interface Dataset {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'annotating' | 'ready' | 'training' | 'completed' | 'failed';
  total_images: number;
  annotated_images: number;
  total_annotations: number;
  created_by: string;
  created_at: string;
  training_started_at?: string;
  training_completed_at?: string;
  training_metrics?: {
    final_map?: number;
    precision?: number;
    recall?: number;
    epochs_completed?: number;
  };
  annotation_tasks?: AnnotationTask[];
}

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
}

export default function RetrainingPage() {
  const [selectedTab, setSelectedTab] = useState('export');
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('yolo');
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Legacy annotation system states (less prominent)
  const [isCreateDatasetOpen, setIsCreateDatasetOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [newDataset, setNewDataset] = useState({ name: '', description: '' });
  const [isAnnotating, setIsAnnotating] = useState(false);

  const { profile, isAuthenticated, isAdmin, isSuperAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Check if user has the required permissions (must be before useQuery)
  const hasAccess = isAuthenticated && (isAdmin || isSuperAdmin);

  // Fetch detected objects for dataset export
  const { data: objectsResponse, isLoading: isLoadingObjects, error: objectsError } = useQuery({
    queryKey: ['objects-for-export'],
    queryFn: async () => {
      return await apiClient.getObjects({ limit: 1000 }); // Get more objects for export
    },
    enabled: hasAccess,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Export mutation
  const exportDatasetMutation = useMutation({
    mutationFn: async ({ objectIds, format }: { objectIds: string[]; format: string }) => {
      console.log('Exporting dataset:', { objectIds, format });
      
      if (format === 'yolo') {
        const blob = await apiClient.exportYoloDataset(objectIds);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `yolo_dataset_${timestamp}.zip`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true };
      } else {
        throw new Error('Unsupported export format');
      }
    },
    onSuccess: () => {
      console.log('Dataset exported successfully');
      setIsExporting(false);
    },
    onError: (error) => {
      console.error('Error exporting dataset:', error);
      setIsExporting(false);
    },
  });

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied if user doesn't have the right permissions
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need ADMIN or SUPERADMIN privileges to access the retraining features.
            {profile && (
              <div className="mt-2 text-sm text-gray-600">
                Current role: {profile.role}
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
    exportDatasetMutation.mutate({
      objectIds: selectedObjects,
      format: exportFormat
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

  // Handle create dataset from selected objects (legacy)
  const handleCreateDatasetFromObjects = () => {
    if (!newDataset.name || selectedObjects.length === 0) return;
    
    console.log('Frontend - handleCreateDatasetFromObjects called with:', {
      name: newDataset.name,
      description: newDataset.description,
      objectIds: selectedObjects,
      objectCount: selectedObjects.length
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Development Notice */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <Construction className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Model</h1>
              <p className="text-gray-600">Export e-waste detection data for custom model training</p>
            </div>
          </div>
          
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Construction className="w-3 h-3 mr-1" />
            Under Development
          </Badge>
        </div>

        {/* Development Notice */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Development Notice:</strong> This page is currently under active development. 
            The main feature available is YOLO dataset export. Additional training features are experimental.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Dataset</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2 opacity-70">
            <Settings className="w-4 h-4" />
            <span>Advanced (Experimental)</span>
          </TabsTrigger>
        </TabsList>

        {/* Export Dataset Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Export Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileArchive className="h-5 w-5 text-blue-600" />
                    <span>YOLO Dataset Export</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Export detected e-waste objects in YOLO format for custom model training
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Format Selection */}
                  <div className="space-y-3">
                    <Label>Export Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yolo">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4" />
                            <span>YOLO v11 Format</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="coco" disabled>
                          <div className="flex items-center space-x-2">
                            <Database className="w-4 h-4" />
                            <span>COCO Format (Coming Soon)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dataset Structure Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Export Structure</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 ml-6">
                      <div>📁 dataset.zip</div>
                      <div className="ml-4">📁 images/ (JPG files)</div>
                      <div className="ml-4">📁 labels/ (TXT files)</div>
                      <div className="ml-4">📄 classes.txt (category names)</div>
                      <div className="ml-4">📄 data.yaml (YOLO config)</div>
                    </div>
                  </div>

                  {/* Label Format Example */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Label Format Example</span>
                    </div>
                    <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                      <div># Each line: class_id center_x center_y width height</div>
                      <div>1 0.49625 0.49125 0.78625 0.705</div>
                      <div>3 0.25000 0.75000 0.35000 0.40000</div>
                    </div>
                    <p className="text-xs text-gray-600">
                      Coordinates are normalized (0.0 - 1.0) relative to image dimensions
                    </p>
                  </div>

                  {/* Export Controls */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {selectedObjects.length} objects selected
                    </div>
                    <Button 
                      onClick={handleExport}
                      disabled={selectedObjects.length === 0 || isExporting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isExporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export Dataset ({selectedObjects.length})
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Object Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="h-5 w-5" />
                    <span>Select Objects</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Choose detected objects to include in your training dataset
                  </p>
                </CardHeader>
                <CardContent>
                  {isLoadingObjects ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : objectsError ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load detected objects. 
                        <br />
                        Error: {objectsError instanceof Error ? objectsError.message : 'Unknown error'}
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.reload()}
                          >
                            Refresh Page
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : objectsResponse?.data && objectsResponse.data.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {selectedObjects.length} of {objectsResponse.data.length} objects selected
                        </p>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedObjects([])}
                            disabled={selectedObjects.length === 0}
                          >
                            Clear Selection
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedObjects(objectsResponse.data.map(obj => obj.id))}
                            disabled={selectedObjects.length === objectsResponse.data.length}
                          >
                            Select All
                          </Button>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-96">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                          {objectsResponse.data.map((object) => (
                            <div
                              key={object.id}
                              className={`relative p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedObjects.includes(object.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleObjectSelection(object.id)}
                            >
                              <div className="space-y-3">
                                <div className="relative">
                                  {object.scan?.image_url ? (
                                    <img
                                      src={object.scan.image_url}
                                      alt={object.name}
                                      className="w-full h-24 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                                      <Image className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                  
                                  {selectedObjects.includes(object.id) && (
                                    <div className="absolute top-1 right-1">
                                      <CheckCircle className="w-5 h-5 text-blue-600 bg-white rounded-full" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="font-medium text-sm truncate">{object.name}</p>
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="text-xs">
                                      {object.category}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {(object.confidence_score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No objects found</h3>
                      <p className="text-gray-600 mb-4">
                        No detected objects available for export. Process some e-waste scans first.
                      </p>
                      <Button variant="outline" onClick={() => window.open('/admin/e-waste', '_blank')}>
                        View E-Waste Scans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span>Export Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Objects</span>
                      <span className="font-medium">{objectsResponse?.data?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Selected</span>
                      <span className="font-medium text-blue-600">{selectedObjects.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Format</span>
                      <span className="font-medium">YOLO v8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Usage Guide</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <div>
                    <strong>1. Select Objects:</strong> Choose the e-waste objects you want to include in your training dataset.
                  </div>
                  <div>
                    <strong>2. Export:</strong> Download the YOLO-formatted dataset as a ZIP file.
                  </div>
                  <div>
                    <strong>3. Train:</strong> Use the exported data with YOLOv11 or other training frameworks.
                  </div>
                  <div className="pt-2 border-t">
                    <strong>Note:</strong> Coordinates are normalized and ready for YOLO training.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Advanced/Experimental Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Experimental Features:</strong> These features are under development and may not work as expected.
            </AlertDescription>
          </Alert>

          {isAnnotating && selectedDataset ? (
            <AnnotationStudio
              datasetId={selectedDataset.id}
              datasetName={selectedDataset.name}
              onClose={() => {
                setIsAnnotating(false);
                setSelectedDataset(null);
              }}
            />
          ) : (
            <Card className="opacity-75">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Construction className="h-5 w-5 text-orange-500" />
                  <span>Built-in Annotation System</span>
                  <Badge variant="outline" className="text-xs">Experimental</Badge>
                </CardTitle>
                <p className="text-gray-600">
                  Advanced annotation features for fine-tuning detection models (Under Development)
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Construction className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced annotation tools and model training features are in development.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAdvanced(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview (Limited Functionality)
                  </Button>
                  
                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                      <p className="text-sm text-gray-600 mb-3">
                        Preview of annotation system:
                      </p>
                      <Button 
                        onClick={() => setIsCreateDatasetOpen(true)}
                        className="w-full"
                        variant="outline"
                        disabled={selectedObjects.length === 0}
                      >
                        Create Annotation Dataset ({selectedObjects.length} objects)
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Legacy Create Dataset Dialog (less visible) */}
      {isCreateDatasetOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Annotation Dataset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Dataset Name</Label>
                <Input
                  id="name"
                  value={newDataset.name}
                  onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter dataset name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newDataset.description}
                  onChange={(e) => setNewDataset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter dataset description"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDatasetOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDatasetFromObjects}
                  disabled={!newDataset.name || selectedObjects.length === 0}
                  className="flex-1"
                >
                  Create & Start
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 