import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    email: string;
    avatar_url?: string;
    initials?: string;
  };
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  viewAllHref?: string;
}

function getInitials(name?: string, email?: string) {
  if (name && typeof name === 'string' && name.trim().length > 0) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  if (email && typeof email === 'string' && email.length > 0) {
    return email[0].toUpperCase();
  }
  return 'U';
}

export function RecentActivity({ activities, isLoading, viewAllHref }: RecentActivityProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</CardTitle>
          <p className="text-gray-500 text-sm mt-1">Latest user submissions and scans</p>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">View All</Link>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No recent activity</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {activities.map((item) => (
              <li key={item.id} className="flex items-center py-3 space-x-3">
                <Avatar className="h-10 w-10">
                  {item.user.avatar_url ? (
                    <AvatarImage src={item.user.avatar_url} alt={item.user.name} />
                  ) : null}
                  <AvatarFallback>
                    {getInitials(item.user.name, item.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{item.user.name || item.user.email || 'Unknown User'}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap font-medium">{item.date}</div>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                  item.status === 'completed' ? 'bg-green-100 text-green-700' :
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
} 