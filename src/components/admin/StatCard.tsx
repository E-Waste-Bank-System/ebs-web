import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  isLoading?: boolean
}

// Helper to format numbers compactly (e.g., 1.5K, 2.3M)
function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function StatCard({ title, value, icon: Icon, change, isLoading }: StatCardProps) {
  // If value is a string and starts with 'Rp', try to compact the number part
  let displayValue = value;
  if (typeof value === 'number') {
    displayValue = formatCompactNumber(value);
  } else if (typeof value === 'string' && value.startsWith('Rp')) {
    // Extract the number part and compact it
    const num = parseInt(value.replace(/[^\d]/g, ''));
    if (!isNaN(num) && num >= 1000) {
      displayValue = `Rp ${formatCompactNumber(num)}`;
    }
  }
  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-800">{displayValue}</div>
            {change && <p className="text-xs text-slate-500 mt-1">{change}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
} 