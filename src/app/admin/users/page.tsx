'use client'

import { useState } from 'react';
import { useProfiles, useUpdateProfile, useDeleteProfile, useSyncUsers } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Trash2, 
  RefreshCw,
  Upload,
  ArrowRight,
  ShieldCheck,
  UserCog,
  TrendingUp
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Profile } from '@/lib/api-client';

function StatCard({ title, value, icon: Icon, color, change, isLoading }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
  isLoading?: boolean;
}) {
  const isPositive = change?.startsWith('+');
  
  return (
    <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`mr-1 h-4 w-4 ${!isPositive ? 'rotate-180' : ''}`} />
              {change}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {isLoading ? <Skeleton className="h-8 w-24" /> : value}
          </div>
          <p className="text-xs text-slate-400">Registered users</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { 
    data: usersResponse, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useProfiles({ 
    search: search || undefined,
    limit: 50 
  });

  const updateProfileMutation = useUpdateProfile();
  const deleteProfileMutation = useDeleteProfile();
  const syncUsersMutation = useSyncUsers();

  const users = usersResponse?.data || [];

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    return matchesRole && matchesStatus;
  });

  const handleToggleStatus = async (user: Profile) => {
    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        data: { is_active: !user.is_active }
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteProfileMutation.mutateAsync(deleteUserId);
      setDeleteUserId(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSyncUsers = async () => {
    try {
      await syncUsersMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to sync users:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN': return <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-500/20 rounded-full">Super Admin</Badge>;
      case 'ADMIN': return <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 border-purple-500/20 rounded-full">Admin</Badge>;
      default: return <Badge variant="outline" className="border-slate-300 rounded-full">User</Badge>;
    }
  };

  if (error) {
    return (
      <div className="p-8 space-y-8">
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center h-96 p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-fit p-4 bg-red-50 rounded-2xl">
                <Users className="h-10 w-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Failed to load users</h3>
                <p className="text-sm text-slate-500 max-w-sm">{(error as any).message}</p>
              </div>
              <Button onClick={() => refetch()} className="bg-[#69C0DC] hover:bg-[#5BA8C4] text-white rounded-xl px-6">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">User Management</h1>
          <p className="text-slate-600 text-lg">
            Oversee user accounts, manage permissions, and monitor activity.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleSyncUsers}
            variant="outline" 
            disabled={syncUsersMutation.isPending}
            className="bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:shadow-md rounded-xl px-4 py-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            Sync Users
          </Button>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            disabled={isRefetching}
            className="bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:shadow-md rounded-xl px-4 py-2"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users"
          value={usersResponse?.meta?.total || 0}
          icon={Users}
          color="#69C0DC"
          change="+23%"
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Users"
          value={users.filter(u => u.is_active).length}
          icon={UserCheck}
          color="#10B981"
          change="+12%"
          isLoading={isLoading}
        />
        <StatCard 
          title="Admins"
          value={users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length}
          icon={ShieldCheck}
          color="#8B5CF6"
          change="+2"
          isLoading={isLoading}
        />
        <StatCard 
          title="Standard Users"
          value={users.filter(u => u.role === 'USER').length}
          icon={UserCog}
          color="#F59E0B"
          change="+18%"
          isLoading={isLoading}
        />
      </div>

      {/* Filters & Table */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <CardTitle className="flex items-center text-slate-900 text-xl">
              <Users className="mr-3 h-6 w-6 text-[#69C0DC]" />
              User Directory
            </CardTitle>
            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white border-slate-200 rounded-xl"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:border-[#69C0DC] focus:ring-[#69C0DC] min-w-[120px]"
              >
                <option value="all">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPERADMIN">Super Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:border-[#69C0DC] focus:ring-[#69C0DC] min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-100">
                  <TableHead className="font-medium text-slate-700">User</TableHead>
                  <TableHead className="font-medium text-slate-700">Role</TableHead>
                  <TableHead className="font-medium text-slate-700">Status</TableHead>
                  <TableHead className="font-medium text-slate-700">Last Active</TableHead>
                  <TableHead className="font-medium text-slate-700">Joined</TableHead>
                  <TableHead className="text-right font-medium text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                          <Users className="h-12 w-12 text-slate-300" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-slate-700 mb-1">No users found</h3>
                          <p className="text-sm text-slate-500">Try adjusting your filters.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-xs bg-[#69C0DC] bg-opacity-20 text-[#69C0DC]">
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-800">
                              {user.full_name || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm">
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {user.last_login_at 
                            ? `${formatDistanceToNow(new Date(user.last_login_at))} ago`
                            : 'Never'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel className="text-[#69C0DC]">User Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              disabled={updateProfileMutation.isPending}
                              className="flex items-center gap-2"
                            >
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteUserId(user.id)}
                              className="flex items-center gap-2 text-red-600"
                              disabled={deleteProfileMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
              disabled={deleteProfileMutation.isPending}
            >
              {deleteProfileMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 