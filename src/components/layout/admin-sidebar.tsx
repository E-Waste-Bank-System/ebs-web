'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  FileText,
  Scan,
  Bot,
  BarChart3,
  Settings,
  Recycle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  requireRoles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'E-Waste Management',
    items: [
      {
        title: 'E-Waste Scans',
        href: '/admin/e-waste',
        icon: Recycle,
      },
    ],
  },
  {
    title: 'Content & Users',
    items: [
      {
        title: 'Articles',
        href: '/admin/articles',
        icon: FileText,
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
        requireRoles: ['ADMIN', 'SUPERADMIN'],
      },
    ],
  },
  {
    title: 'Analytics & AI',
    items: [
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        requireRoles: ['ADMIN', 'SUPERADMIN'],
      },
      {
        title: 'AI Training',
        href: '/admin/retraining',
        icon: Bot,
        badge: 'AI',
        requireRoles: ['ADMIN', 'SUPERADMIN'],
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        requireRoles: ['ADMIN', 'SUPERADMIN'],
      },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminSidebar({ 
  isCollapsed = false, 
  onCollapsedChange,
  isMobile = false,
  isOpen = false,
  onOpenChange 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { hasRole, profile } = useAuth();

  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!item.requireRoles) return true;
      return hasRole(item.requireRoles);
    })
  })).filter(group => group.items.length > 0);

  const toggleCollapsed = () => {
    onCollapsedChange?.(!isCollapsed);
  };

  const handleItemClick = () => {
    if (isMobile) {
      onOpenChange?.(false);
    }
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Recycle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">EWB System</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        )}
        
        {isMobile ? (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleCollapsed}
            className={cn(isCollapsed && "w-full justify-center")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-4">
          {filteredNavGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {(!isCollapsed || isMobile) && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href} onClick={handleItemClick}>
                      <Button
                        variant={"ghost"}
                        className={cn(
                          "w-full justify-start rounded-full",
                          isCollapsed && !isMobile && "justify-center px-2",
                          isActive
                            ? "bg-[#A97CFF]/10 text-[#A97CFF] font-semibold"
                            : "hover:bg-[#A97CFF]/5 hover:text-[#A97CFF]"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", (!isCollapsed || isMobile) && "mr-3")} />
                        {(!isCollapsed || isMobile) && (
                          <>
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {groupIndex < filteredNavGroups.length - 1 && (!isCollapsed || isMobile) && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </nav>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        {(!isCollapsed || isMobile) && profile && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {profile.full_name?.charAt(0) || profile.email.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => onOpenChange?.(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "h-full bg-white shadow-sm border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      <div className="flex h-full flex-col">
        {sidebarContent}
      </div>
    </div>
  );
} 