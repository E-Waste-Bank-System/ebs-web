'use client'

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScan, useValidateObject, useRejectObject, useCreateObject } from '@/lib/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
  Loader2,
  Plus
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
  const [correctedCategory, setCorrectedCategory] = useState(object.category);
  const [correctedPrice, setCorrectedPrice] = useState(object.estimated_value?.toString() || '0');

  const validateObjectMutation = useValidateObject();
  const rejectObjectMutation = useRejectObject();

  const handleAction = async (action: 'validate' | 'reject') => {
    if (action === 'validate') {
      try {
        await validateObjectMutation.mutateAsync({ 
          id: object.id, 
          data: { 
            notes,
            corrected_category: correctedCategory !== object.category ? correctedCategory : undefined,
            corrected_value: parseFloat(correctedPrice) !== object.estimated_value ? parseFloat(correctedPrice) : undefined
          } 
        });
        setIsEditing(false);
        onUpdate();
      } catch (error) {
        console.error('Failed to validate object:', error);
      }
    } else {
      try {
        await rejectObjectMutation.mutateAsync({ id: object.id, data: { notes } });
        setIsEditing(false);
        onUpdate();
      } catch (error) {
        console.error('Failed to reject object:', error);
      }
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
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor={`category-${object.id}`}>Corrected Category</Label>
                        <Select value={correctedCategory} onValueChange={setCorrectedCategory}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor={`price-${object.id}`}>Corrected Price (IDR)</Label>
                        <Input
                            id={`price-${object.id}`}
                            type="number"
                            value={correctedPrice}
                            onChange={(e) => setCorrectedPrice(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor={`notes-${object.id}`}>Validation Notes</Label>
                    <Textarea 
                        id={`notes-${object.id}`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes for validation or rejection..."
                        className="bg-white"
                    />
                </div>
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

const CATEGORIES = [
  "AC", "Adaptor /Kilo", "Aki Motor", "Alat Tensi", "Alat Tes Vol", 
  "Baterai Laptop", "Camera", "CPU Intel", "Flashdisk", "Hair Dryer",
  "Handphone", "Hardisk", "Jam Tangan", "Keyboard", "Kipas",
  "Komponen CPU", "Komponen Kulkas", "Kompor Listrik", "Lampu", "Laptop",
  "Mesin Cuci", "Microwave", "Monitor", "Mouse", "Neon Box",
  "Oven", "Panel Surya", "Printer", "PS2", "Remot",
  "Router", "Senter", "Seterika", "Solder", "Speaker", "Telefon", 
  "TV", "Vacum Cleaner"
];

interface ManualObjectDialogProps {
  scanId: string;
  onUpdate: () => void;
}

function ManualObjectDialog({ scanId, onUpdate }: ManualObjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState('1');
  const [damageLevel, setDamageLevel] = useState('1');

  const createObjectMutation = useCreateObject();

  const handleSubmit = async () => {
    try {
      await createObjectMutation.mutateAsync({
        name,
        category,
        estimated_value: parseFloat(estimatedValue),
        scan_id: scanId,
        description: description || undefined,
        risk_level: parseInt(riskLevel),
        damage_level: parseInt(damageLevel),
      });
      
      // Reset form
      setName('');
      setCategory('');
      setEstimatedValue('');
      setDescription('');
      setRiskLevel('1');
      setDamageLevel('1');
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#69C0DC] hover:bg-[#5BADD1] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Manual Object Entry</DialogTitle>
          <DialogDescription>
            Add an object that wasn't detected by the AI system.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Object Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Old Laptop"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="estimated-value">Estimated Value (IDR)</Label>
            <Input
              id="estimated-value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="e.g., 150000"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="risk-level">Risk Level (1-10)</Label>
              <Input
                id="risk-level"
                type="number"
                min="1"
                max="10"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="damage-level">Damage Level (1-10)</Label>
              <Input
                id="damage-level"
                type="number"
                min="1"
                max="10"
                value={damageLevel}
                onChange={(e) => setDamageLevel(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes about this object..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name || !category || !estimatedValue || createObjectMutation.isPending}
          >
            {createObjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Object
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
            {detectedObjects.length > 0 && (
                <StatCard 
                    title="Validation Progress" 
                    value={`${validatedObjects.length} / ${detectedObjects.length}`}
                    icon={CheckCircle}
                    change={`${Math.round((validatedObjects.length / detectedObjects.length) * 100)}% Validated`}
                />
            )}
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center text-slate-800">
                                    <Cpu className="mr-2 h-5 w-5 text-[#69C0DC]" />
                                    Detected Objects
                                </CardTitle>
                                <CardDescription>
                                    {detectedObjects.length > 0 
                                        ? `The AI model detected ${detectedObjects.length} objects. Review each one to validate or reject.`
                                        : 'No objects were detected in this scan. You can manually add objects that were missed by the AI.'
                                    }
                                </CardDescription>
                            </div>
                            <ManualObjectDialog scanId={scan.id} onUpdate={refetch} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {detectedObjects.length > 0 ? (
                            detectedObjects.map(obj => (
                                <ObjectDetailCard key={obj.id} object={obj} onUpdate={refetch}/>
                            ))
                       ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-fit p-3 bg-gray-100 rounded-full mb-4">
                                    <Cpu className="h-8 w-8 text-gray-400" />
                                </div>
                                <p className="text-slate-500 mb-4">No objects were detected in this scan.</p>
                                <p className="text-sm text-slate-400">Use the "Add Manual Entry" button above to add objects that weren't detected.</p>
                            </div>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
} 