'use client'

import { useState } from 'react';
import { useScan, useValidateObject } from '@/lib/queries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scan, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Eye,
  Bot,
  AlertTriangle,
  FileText,
  Zap,
  Shield,
  Target,
  MessageSquare,
  Lightbulb,
  Edit,
  Save,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import type { DetectedObject } from '@/lib/api-client';

interface ScanDetailsDialogProps {
  scanId: string | null;
  onClose: () => void;
}

interface ObjectDetailCardProps {
  object: DetectedObject;
}

function ObjectDetailCard({ object }: ObjectDetailCardProps) {
  const [correctedCategory, setCorrectedCategory] = useState(object.category);
  const [correctedPrice, setCorrectedPrice] = useState(object.estimated_value.toString());
  const [validationMessage, setValidationMessage] = useState('');
  
  const validateObjectMutation = useValidateObject();

  const handleValidate = async () => {
    try {
      await validateObjectMutation.mutateAsync({
        id: object.id,
        data: { 
          notes: validationMessage,
          corrected_category: correctedCategory !== object.category ? correctedCategory : undefined,
          corrected_value: parseFloat(correctedPrice) !== object.estimated_value ? parseFloat(correctedPrice) : undefined
        }
      });
      setValidationMessage('');
    } catch (error) {
      console.error('Failed to validate object:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (risk: number) => {
    if (risk >= 7) return 'text-red-600';
    if (risk >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md border-l-4 border-l-[#69C0DC]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="p-1 bg-[#69C0DC] bg-opacity-20 rounded">
              <Bot className="h-4 w-4 text-[#69C0DC]" />
            </div>
            {object.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {object.is_validated ? (
              <Badge variant="default" className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validated
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Pending
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Classification & Assessment */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-gray-900">
            <Target className="h-3 w-3 text-[#69C0DC]" />
            Classification & Assessment
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold text-gray-900">{object.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className={`font-semibold ${getConfidenceColor(object.confidence_score)}`}>
                {(object.confidence_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Value:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(object.estimated_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk Level:</span>
              <span className={`font-semibold ${getRiskLevelColor(object.risk_level)} flex items-center`}>
                <Shield className="h-3 w-3 mr-1" />
                {object.risk_level}/10
              </span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-gray-600">Damage Level:</span>
              <span className={`font-semibold ${getRiskLevelColor(object.damage_level)}`}>
                {object.damage_level}/10
              </span>
            </div>
          </div>
        </div>

        {/* AI Description */}
        {object.description && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-900">
              <MessageSquare className="h-3 w-3 text-[#69C0DC]" />
              AI Description
            </h4>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                {object.description}
              </p>
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {object.suggestions && object.suggestions.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-900">
              <Lightbulb className="h-3 w-3 text-[#69C0DC]" />
              AI Suggestions
            </h4>
            <div className="space-y-2">
              {object.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-[#69C0DC] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="bg-green-50 border border-green-200 p-2 rounded text-sm text-gray-700 flex-1">
                    {suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Section */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="mb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900">
              <Edit className="h-3 w-3 text-[#69C0DC]" />
              Validation
            </h4>
          </div>

          {object.is_validated ? (
            <div className="text-sm space-y-2">
              <div className="text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span className="font-medium">Validated on {format(new Date(object.validated_at!), 'MMM dd, yyyy')}</span>
              </div>
              {object.validation_notes && (
                <div className="bg-white border border-gray-200 p-3 rounded text-gray-700">
                  {object.validation_notes}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`category-${object.id}`} className="text-xs font-medium text-gray-700">Corrected Category</Label>
                  <Input
                    id={`category-${object.id}`}
                    value={correctedCategory}
                    onChange={(e) => setCorrectedCategory(e.target.value)}
                    className="h-8 mt-1 border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor={`price-${object.id}`} className="text-xs font-medium text-gray-700">Corrected Price</Label>
                  <Input
                    id={`price-${object.id}`}
                    type="number"
                    value={correctedPrice}
                    onChange={(e) => setCorrectedPrice(e.target.value)}
                    className="h-8 mt-1 border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] bg-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`message-${object.id}`} className="text-xs font-medium text-gray-700">Validation Message</Label>
                <Textarea
                  id={`message-${object.id}`}
                  placeholder="Add validation notes..."
                  value={validationMessage}
                  onChange={(e) => setValidationMessage(e.target.value)}
                  className="h-16 text-sm mt-1 border-gray-200 focus:border-[#69C0DC] focus:ring-[#69C0DC] bg-white"
                />
              </div>
              <Button
                onClick={handleValidate}
                disabled={validateObjectMutation.isPending}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                <Save className="h-3 w-3 mr-1" />
                {validateObjectMutation.isPending ? 'Validating...' : 'Validate Object'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ScanDetailsDialog({ scanId, onClose }: ScanDetailsDialogProps) {
  const { data: scan, isLoading, error } = useScan(scanId!, {
    enabled: !!scanId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskLevelColor = (risk: number) => {
    if (risk >= 7) return 'text-red-600';
    if (risk >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={!!scanId} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 border-0 shadow-2xl">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <div className="p-2 bg-[#69C0DC] bg-opacity-20 rounded-xl">
                    <Scan className="h-6 w-6 text-[#69C0DC]" />
                  </div>
                  Scan Details
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Detailed information about the scan and detected objects
                </DialogDescription>
              </div>
              {scan && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(scan.status)}
                  <Badge variant={getStatusBadgeVariant(scan.status)} className="text-sm px-3 py-1">
                    {scan.status}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {error ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center space-y-3">
                  <div className="p-4 bg-red-100 rounded-full w-fit mx-auto">
                    <AlertTriangle className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Failed to load scan</h3>
                  <p className="text-sm text-gray-600">{error.message}</p>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-lg" />
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-32 rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : scan ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
              <Tabs defaultValue="overview" className="h-[850px]">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
                    <TabsTrigger 
                      value="overview" 
                      className="data-[state=active]:bg-[#69C0DC] data-[state=active]:text-white font-medium"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="metadata" 
                      className="data-[state=active]:bg-[#69C0DC] data-[state=active]:text-white font-medium"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      AI Data
                    </TabsTrigger>
                  </TabsList>
                </div>

                                 <TabsContent value="overview" className="h-[780px] m-0">
                  <div className="grid gap-6 grid-cols-2 h-full p-6">
                    {/* Left Column - Scan Image */}
                    <div className="space-y-4">
                      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                            <Sparkles className="h-5 w-5 text-[#69C0DC]" />
                            Scan Image
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={scan.image_url}
                              alt="Scan"
                              fill
                              className="object-contain"
                            />
                            {/* Bounding Boxes for all objects */}
                            {scan.objects?.map((object) => (
                              <div 
                                key={object.id}
                                className="absolute border-2 border-[#69C0DC] bg-[#69C0DC]/10 shadow-sm"
                                style={{
                                  left: `${(object.bounding_box.x / 100) * 100}%`,
                                  top: `${(object.bounding_box.y / 100) * 100}%`,
                                  width: `${(object.bounding_box.width / 100) * 100}%`,
                                  height: `${(object.bounding_box.height / 100) * 100}%`,
                                }}
                              >
                                <div className="absolute -top-7 left-0 bg-[#69C0DC] text-white px-2 py-1 text-xs rounded shadow-md font-medium">
                                  {object.name}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Scan Summary */}
                          <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Scan Summary</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Scan ID:</span>
                                <span className="font-mono text-gray-900">{scan.id.slice(0, 8)}...</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Objects Found:</span>
                                <span className="font-semibold text-[#69C0DC]">{scan.objects_count}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Value:</span>
                                <span className="font-semibold text-green-600">{formatCurrency(scan.total_estimated_value)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="text-gray-900">{format(new Date(scan.created_at), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                                         {/* Right Column - Objects Details with Scroll */}
                     <div className="h-full flex flex-col">
                       <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border-0 h-full flex flex-col">
                         <div className="p-4 border-b border-gray-200 flex-shrink-0">
                           <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                             <Bot className="h-5 w-5 text-[#69C0DC]" />
                             Detected Objects ({scan.objects?.length || 0})
                           </h3>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ height: '100%', minHeight: '500px' }}>
                           {scan.objects && scan.objects.length > 0 ? (
                             scan.objects.map((object) => (
                               <ObjectDetailCard key={object.id} object={object} />
                             ))
                           ) : (
                             <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                               <CardContent className="flex items-center justify-center h-32">
                                 <div className="text-center space-y-2">
                                   <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto">
                                     <Bot className="h-8 w-8 text-gray-400" />
                                   </div>
                                   <p className="text-sm text-gray-600">No objects detected</p>
                                 </div>
                               </CardContent>
                             </Card>
                           )}
                         </div>
                       </div>
                     </div>
                  </div>
                </TabsContent>

                                 <TabsContent value="metadata" className="h-[780px] m-0">
                  <div className="p-6 h-full">
                    <ScrollArea className="h-full w-full">
                      {scan.metadata ? (
                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                              <Zap className="h-5 w-5 text-[#69C0DC]" />
                              AI Processing Results
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                              <pre className="text-xs text-green-400 whitespace-pre-wrap break-words font-mono">
                                {JSON.stringify(scan.metadata, null, 2)}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                          <CardContent className="flex items-center justify-center h-64">
                            <div className="text-center space-y-3">
                              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto">
                                <FileText className="h-12 w-12 text-gray-400" />
                              </div>
                              <h3 className="font-semibold text-gray-900">No Metadata Available</h3>
                              <p className="text-sm text-gray-600">
                                AI processing metadata is not available for this scan
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
} 