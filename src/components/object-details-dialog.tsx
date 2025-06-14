'use client'

import { useState } from 'react';
import { useValidateObject, useRejectObject } from '@/lib/queries';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertTriangle,
  Target,
  Shield,
  Zap,
  Calendar,
  User,
  FileText,
  Check,
  X,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import type { DetectedObject } from '@/lib/api-client';

interface ObjectDetailsDialogProps {
  object: DetectedObject | null;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ObjectDetailsDialog({ object, onClose, onUpdate }: ObjectDetailsDialogProps) {
  const [validationNotes, setValidationNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  
  const validateObjectMutation = useValidateObject();
  const rejectObjectMutation = useRejectObject();

  const handleValidate = async () => {
    if (!object) return;
    
    try {
      await validateObjectMutation.mutateAsync({
        id: object.id,
        data: { notes: validationNotes }
      });
      setValidationNotes('');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to validate object:', error);
    }
  };

  const handleReject = async () => {
    if (!object) return;
    
    try {
      await rejectObjectMutation.mutateAsync({
        id: object.id,
        data: { notes: rejectNotes }
      });
      setRejectNotes('');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to reject object:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevelColor = (risk: number) => {
    if (risk >= 7) return 'text-red-600 bg-red-50';
    if (risk >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getDamageLevelColor = (damage: number) => {
    if (damage >= 7) return 'text-red-600';
    if (damage >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!object) return null;

  return (
    <Dialog open={!!object} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Object Details: {object.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the detected e-waste object
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-[700px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 h-[650px] overflow-y-auto">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Object Image with Bounding Box */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Detection Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {object.scan?.image_url ? (
                      <>
                        <Image
                          src={object.scan.image_url}
                          alt="Scan with detection"
                          fill
                          className="object-contain"
                        />
                        
                        {/* Bounding Box Overlay */}
                        <div 
                          className="absolute border-2 border-red-500 bg-red-500/10"
                          style={{
                            left: `${(object.bounding_box.x / 100) * 100}%`,
                            top: `${(object.bounding_box.y / 100) * 100}%`,
                            width: `${(object.bounding_box.width / 100) * 100}%`,
                            height: `${(object.bounding_box.height / 100) * 100}%`,
                          }}
                        >
                          <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                            {object.name}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Classification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="font-medium">
                        {object.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={`font-semibold ${getConfidenceColor(object.confidence_score)}`}>
                        {(object.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      {object.is_validated ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validated
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending Validation
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estimated Value:</span>
                      <span className="font-semibold text-lg">
                        {formatCurrency(object.estimated_value)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <Badge className={`${getRiskLevelColor(object.risk_level)} border`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {object.risk_level}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Damage Level:</span>
                      <span className={`font-semibold ${getDamageLevelColor(object.damage_level)}`}>
                        {object.damage_level}/10
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detection Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Object ID:</span>
                      <span className="font-mono text-sm">{object.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Detected:</span>
                      <span>{format(new Date(object.created_at), 'PPp')}</span>
                    </div>
                    {object.validated_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Validated:</span>
                        <span>{format(new Date(object.validated_at), 'PPp')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="h-[650px]">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {object.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        AI Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{object.description}</p>
                    </CardContent>
                  </Card>
                )}

                {object.suggestions && object.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {object.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="flex-1">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Bounding Box Coordinates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">X Position:</span>
                        <span className="font-mono">{object.bounding_box.x}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Y Position:</span>
                        <span className="font-mono">{object.bounding_box.y}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Width:</span>
                        <span className="font-mono">{object.bounding_box.width}px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Height:</span>
                        <span className="font-mono">{object.bounding_box.height}px</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {object.ai_metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        AI Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(object.ai_metadata, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {(object.validation_notes || object.is_validated) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Validation Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {object.validation_notes || 'No validation notes available.'}
                      </p>
                      {object.validated_by && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Validated by: {object.validated_by}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="validation" className="h-[650px]">
            <ScrollArea className="h-full">
              {!object.is_validated ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">Validate Object</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Confirm that this object detection is correct and the information is accurate.
                      </p>
                      <div>
                        <Label htmlFor="validation-notes">Validation Notes (Optional)</Label>
                        <Textarea
                          id="validation-notes"
                          placeholder="Add any notes about this validation..."
                          value={validationNotes}
                          onChange={(e) => setValidationNotes(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleValidate}
                        disabled={validateObjectMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {validateObjectMutation.isPending ? 'Validating...' : 'Validate Object'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600">Reject Object</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Mark this object detection as incorrect or invalid.
                      </p>
                      <div>
                        <Label htmlFor="reject-notes">Rejection Reason</Label>
                        <Textarea
                          id="reject-notes"
                          placeholder="Explain why this detection is incorrect..."
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleReject}
                        disabled={rejectObjectMutation.isPending || !rejectNotes.trim()}
                        variant="destructive"
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {rejectObjectMutation.isPending ? 'Rejecting...' : 'Reject Object'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center space-y-2">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                      <h3 className="font-semibold">Object Already Validated</h3>
                      <p className="text-sm text-muted-foreground">
                        This object has been validated on {format(new Date(object.validated_at!), 'PPp')}
                      </p>
                      {object.validation_notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg text-left">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Validation Notes:</p>
                          <p className="text-sm">{object.validation_notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 