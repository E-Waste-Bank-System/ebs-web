import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemOverviewMetric {
  label: string;
  value: string | number;
  description?: string;
  status?: 'online' | 'offline' | 'warning';
}

interface SystemOverviewProps {
  metrics: SystemOverviewMetric[];
  isLoading?: boolean;
}

// Helper to format numbers compactly (e.g., 1.5K, 2.3M)
function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function SystemOverview({ metrics, isLoading }: SystemOverviewProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-gray-800 h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">System Overview</CardTitle>
        <p className="text-gray-500 text-sm mt-1">Current system status and metrics</p>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No system metrics available</div>
        ) : (
          <ul className="space-y-3">
            {metrics.map((metric, idx) => {
              let displayValue = metric.value;
              if (typeof metric.value === 'number') {
                displayValue = formatCompactNumber(metric.value);
              } else if (typeof metric.value === 'string' && metric.value.startsWith('Rp')) {
                const num = parseInt(metric.value.replace(/[^\d]/g, ''));
                if (!isNaN(num) && num >= 1000) {
                  displayValue = `Rp ${formatCompactNumber(num)}`;
                }
              }
              return (
                <li key={idx} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 transition">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{metric.label}</div>
                    {metric.description && <div className="text-xs text-gray-500">{metric.description}</div>}
                  </div>
                  <div className="flex items-center space-x-2 min-w-[60px] justify-end">
                    <span className="text-base font-bold text-gray-800 dark:text-white text-right">{displayValue}</span>
                    {metric.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        metric.status === 'online' ? 'bg-green-100 text-green-700' :
                        metric.status === 'offline' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`} title={metric.status}>
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
} 