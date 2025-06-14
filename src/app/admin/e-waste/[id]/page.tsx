'use client'

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScan, useValidateObject, useRejectObject } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
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
  ArrowLeft,
  Camera,
  ThumbsUp,
  ThumbsDown,
  Cpu,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import type { DetectedObject } from '@/lib/api-client';
import { StatCard } from '@/components/admin/StatCard';

interface ObjectDetailCardProps {
  object: DetectedObject;
  onUpdate: () => void;
}

function ObjectDetailCard({ object, onUpdate }: ObjectDetailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(object.validation_notes || '');

  const validateObjectMutation = useValidateObject();
  const rejectObjectMutation = useRejectObject();

  const handleAction = async (action: 'validate' | 'reject') => {
    const mutation = action === 'validate' ? validateObjectMutation : rejectObjectMutation;
    try {
      await mutation.mutateAsync({ id: object.id, data: { notes } });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error(`Failed to ${action} object:`, error);
    }
  };
  
  const isPending = validateObjectMutation.isPending || rejectObjectMutation.isPending;

  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#69C0DC]/10 rounded-lg">
                    <Bot className="h-5 w-5 text-[#69C0DC]" />
                </div>
                <div>
                    <CardTitle className="text-lg font-semibold text-slate-800">{object.name}</CardTitle>
                    <CardDescription>Category: {object.category}</CardDescription>
                </div>
            </div>
            {object.is_validated ? (
                 <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                    <CheckCircle className="mr-1.5 h-3 w-3" /> Validated
                 </Badge>
             ) : (
                <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                    <Clock className="mr-1.5 h-3 w-3" /> Pending
                </Badge>
             )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between items-center">
                <span className="text-slate-500">Confidence</span>
                <span className="font-medium text-slate-700">{(object.confidence_score * 100).toFixed(1)}%</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-500">Damage Level</span>
                <span className="font-medium text-slate-700">{object.damage_level}/10</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-500">Est. Value</span>
                <span className="font-medium text-green-600">{formatCurrency(object.estimated_value)}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-500">Risk Level</span>
                <span className="font-medium text-slate-700">{object.risk_level}/10</span>
            </div>
        </div>

        {object.description && (
             <div className="bg-slate-50 p-3 rounded-lg">
                 <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-slate-700">
                    <MessageSquare className="h-4 w-4 text-[#69C0DC]" />
                    AI Description
                </h4>
                <p className="text-sm text-slate-600">{object.description}</p>
            </div>
        )}

        {object.suggestions && object.suggestions.length > 0 && (
             <div className="bg-slate-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-slate-700">
                    <Lightbulb className="h-4 w-4 text-[#69C0DC]" />
                    AI Suggestions
                </h4>
                <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside">
                    {object.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                    ))}
                </ul>
            </div>
        )}

        {isEditing ? (
            <div className="space-y-3">
                <Label htmlFor={`notes-${object.id}`}>Validation Notes</Label>
                <Textarea 
                    id={`notes-${object.id}`}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for validation or rejection..."
                    className="bg-white"
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isPending}>Cancel</Button>
                    <Button onClick={() => handleAction('reject')} disabled={isPending} variant="destructive">
                        {rejectObjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button onClick={() => handleAction('validate')} disabled={isPending}>
                        {validateObjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        <ThumbsUp className="mr-2 h-4 w-4" /> Validate
                    </Button>
                </div>
            </div>
        ) : (
            <div>
                 {object.validation_notes && (
                     <div className="bg-slate-50 p-3 rounded-lg border">
                         <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-slate-700">
                            Validation Notes
                        </h4>
                        <p className="text-sm text-slate-600">{object.validation_notes}</p>
                     </div>
                 )}
                 {!object.is_validated && (
                    <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Review & Validate
                    </Button>
                 )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function ScanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: scan, isLoading, error, refetch } = useScan(id);

  if (isLoading) {
    return (
        <div className="p-6 sm:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                 <Skeleton className="h-32 rounded-xl" />
                 <Skeleton className="h-32 rounded-xl" />
                 <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-96 rounded-xl" />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-[500px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="p-6 sm:p-8 flex items-center justify-center">
        <Card className="bg-white rounded-xl border border-slate-200 shadow-sm w-full max-w-lg">
            <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-fit p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Error loading scan</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                        There was a problem fetching the scan data. It may have been deleted or an error occurred.
                    </p>
                    <Button onClick={() => router.push('/admin/e-waste')} variant="outline">
                        Back to E-Waste Directory
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200"><CheckCircle className="mr-1.5 h-3 w-3" />Completed</Badge>;
      case 'processing': return <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200"><Clock className="mr-1.5 h-3 w-3" />Processing</Badge>;
      case 'failed': return <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200"><XCircle className="mr-1.5 h-3 w-3" />Failed</Badge>;
      default: return <Badge variant="outline"><Clock className="mr-1.5 h-3 w-3" />{status}</Badge>;
    }
  };

  const detectedObjects = scan.objects || [];
  const validatedObjects = detectedObjects.filter(o => o.is_validated);

  return (
    <div className="p-6 sm:p-8 space-y-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/admin/e-waste')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Scan Details</h1>
                <p className="text-slate-500 mt-1">Analysis for scan #{scan.id.substring(0, 8)}...</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Status" value={scan.status} icon={scan.status === 'completed' ? CheckCircle : Clock} />
            <StatCard title="Objects Detected" value={scan.objects_count} icon={Cpu} />
            <StatCard title="Total Value" value={formatCurrency(scan.total_estimated_value)} icon={DollarSign} />
            <StatCard 
                title="Validation Progress" 
                value={`${validatedObjects.length} / ${detectedObjects.length}`}
                icon={CheckCircle}
                change={`${Math.round(scan.objects_count > 0 ? (validatedObjects.length / detectedObjects.length) * 100 : 0)}% Validated`}
            />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-800">
                            <Camera className="mr-2 h-5 w-5 text-[#69C0DC]" />
                            Scanned Image
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Image 
                            src={scan.image_url} 
                            alt={`Scan ${scan.id}`}
                            width={500}
                            height={500}
                            className="rounded-lg object-cover w-full aspect-video"
                        />
                    </CardContent>
                </Card>
                 <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader>
                         <CardTitle className="flex items-center text-slate-800">
                            <FileText className="mr-2 h-5 w-5 text-[#69C0DC]" />
                            Scan Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Scan ID</span>
                            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">#{scan.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Contributor</span>
                            <span className="font-medium text-slate-800">{scan.user?.full_name || "Anonymous"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Date</span>
                            <span className="font-medium text-slate-800">{format(new Date(scan.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500">Status</span>
                            {getStatusBadge(scan.status)}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-800">
                            <Cpu className="mr-2 h-5 w-5 text-[#69C0DC]" />
                            Detected Objects
                        </CardTitle>
                        <CardDescription>
                            The AI model detected {detectedObjects.length} objects. Review each one to validate or reject.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {detectedObjects.length > 0 ? (
                            detectedObjects.map(obj => (
                                <ObjectDetailCard key={obj.id} object={obj} onUpdate={refetch}/>
                            ))
                       ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No objects were detected in this scan.</p>
                            </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
} 