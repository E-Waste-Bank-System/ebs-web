import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Trash, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';

interface ScanCardProps {
  scan: {
    id: string;
    user?: {
      full_name?: string;
      avatar_url?: string;
    };
    image_url?: string;
    status: string;
    created_at: string;
    objects_count?: number;
    total_estimated_value?: number;
    original_filename?: string;
  };
  onViewDetails?: (id: string) => void;
  onDownloadImage?: (url: string) => void;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper to format number as Indonesian Rupiah
function formatRupiah(amount: number) {
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(validAmount);
}

// Helper to convert number to Indonesian words (simple, up to millions)
function numberToWordsID(num: number): string {
  if (!num || isNaN(num)) return 'nol rupiah';
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  const scale = ['', 'ribu', 'juta', 'miliar'];
  let words = '';
  let scaleIdx = 0;
  let n = num;
  while (n > 0) {
    let group = n % 1000;
    if (group > 0) {
      let groupWords = '';
      if (group >= 100) {
        groupWords += (group >= 200 ? satuan[Math.floor(group / 100)] + ' ratus ' : 'seratus ');
        group %= 100;
      }
      if (group >= 20) {
        groupWords += satuan[Math.floor(group / 10)] + ' puluh ';
        group %= 10;
      } else if (group >= 10) {
        groupWords += (group === 10 ? 'sepuluh ' : group === 11 ? 'sebelas ' : satuan[group % 10] + ' belas ');
        group = 0;
      }
      if (group > 0) {
        groupWords += satuan[group] + ' ';
      }
      words = groupWords + scale[scaleIdx] + ' ' + words;
    }
    n = Math.floor(n / 1000);
    scaleIdx++;
  }
  words = words.trim() + ' rupiah';
  words = words.replace(/^satu ribu/, 'seribu');
  return words;
}

export function ScanCard({ scan, onViewDetails, onDownloadImage, onDelete }: ScanCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={scan.user?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#69C0DC] to-[#5BA8C4] text-white">
                  {scan.user?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{scan.user?.full_name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">{format(new Date(scan.created_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {onViewDetails && (
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => onViewDetails(scan.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onDownloadImage && scan.image_url && (
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => onDownloadImage(scan.image_url!)}>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" className="rounded-lg text-red-600" onClick={() => onDelete(scan.id)} aria-label="Delete Scan">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Scan Image */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
            {scan.image_url ? (
              <img 
                src={scan.image_url} 
                alt="Scan"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge className={`${getStatusColor(scan.status)} border`}>
                <span className="capitalize">{scan.status}</span>
              </Badge>
            </div>
          </div>

          {/* Scan Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Items Detected</span>
              <span className="font-semibold text-gray-900">{scan.objects_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Value</span>
              <span className="font-semibold text-[#69C0DC]">
                {formatRupiah(Number(scan.total_estimated_value) || 0)}
              </span>
            </div>
            {scan.id && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scan ID</span>
                <span className="text-sm text-gray-900 font-mono bg-slate-100 px-2 py-0.5 rounded">{scan.id.slice(0, 8)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 