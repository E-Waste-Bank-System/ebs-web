import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { 
  apiClient, 
  type PaginationParams, 
  type ArticleQueryParams,
  type PaginatedResponse,
  type Profile, 
  type Article, 
  type Scan, 
  type DetectedObject, 
  type RetrainingData, 
  type DashboardStats,
  type ObjectStats,
  type RecentActivity
} from './api-client';

// Query Keys
export const queryKeys = {
  // Auth
  currentProfile: ['profile'] as const,
  
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  objectStats: ['dashboard', 'objects'] as const,
  recentActivity: (limit?: number) => ['dashboard', 'activity', limit] as const,
  
  // Profiles
  profiles: (params?: PaginationParams) => ['profiles', params] as const,
  profile: (id: string) => ['profiles', id] as const,
  userStats: (id: string) => ['profiles', id, 'stats'] as const,
  
  // Articles
  articles: (params?: ArticleQueryParams) => ['articles', params] as const,
  article: (id: string) => ['articles', id] as const,
  
  // Scans
  scans: (params?: PaginationParams) => ['scans', params] as const,
  scan: (id: string) => ['scans', id] as const,
  
  // Objects
  objects: (params?: PaginationParams) => ['objects', params] as const,
  object: (id: string) => ['objects', id] as const,
  
  // Retraining
  retrainingData: (params?: PaginationParams) => ['retraining', params] as const,
} as const;

// Auth Hooks
export function useProfile(options?: UseQueryOptions<Profile>) {
  return useQuery({
    queryKey: queryKeys.currentProfile,
    queryFn: async () => {
      const response = await apiClient.getProfile();
      return response;
    },
    ...options,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiClient.login(email, password);
      if (response.access_token) {
        apiClient.setToken(response.access_token);
        localStorage.setItem('auth_token', response.access_token);
      }
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.currentProfile, data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.currentProfile });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      apiClient.setToken(null);
      localStorage.removeItem('auth_token');
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSyncUsers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.syncUsers();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Dashboard Hooks
export function useDashboardStats(options?: UseQueryOptions<DashboardStats>) {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async () => {
      const response = await apiClient.getDashboardStats();
      return response;
    },
    ...options,
  });
}

export function useObjectStats(options?: UseQueryOptions<ObjectStats>) {
  return useQuery({
    queryKey: queryKeys.objectStats,
    queryFn: async () => {
      const response = await apiClient.getObjectStats();
      return response;
    },
    ...options,
  });
}

export function useRecentActivity(limit?: number, options?: UseQueryOptions<RecentActivity>) {
  return useQuery({
    queryKey: queryKeys.recentActivity(limit),
    queryFn: async () => {
      const response = await apiClient.getRecentActivity(limit);
      return response;
    },
    ...options,
  });
}

// Profile Hooks
export function useProfiles(params?: PaginationParams, options?: UseQueryOptions<PaginatedResponse<Profile>>) {
  return useQuery({
    queryKey: queryKeys.profiles(params),
    queryFn: async () => {
      const response = await apiClient.getProfiles(params);
      return response;
    },
    ...options,
  });
}

export function useProfileById(id: string, options?: UseQueryOptions<Profile>) {
  return useQuery({
    queryKey: queryKeys.profile(id),
    queryFn: async () => {
      const response = await apiClient.getProfileById(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useUserStats(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: queryKeys.userStats(id),
    queryFn: async () => {
      const response = await apiClient.getUserStats(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Profile> }) => {
      const response = await apiClient.updateProfile(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteProfile(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Article Hooks
export function useArticles(params?: ArticleQueryParams, options?: UseQueryOptions<PaginatedResponse<Article>>) {
  return useQuery({
    queryKey: queryKeys.articles(params),
    queryFn: async () => {
      const response = await apiClient.getArticles(params);
      return response;
    },
    ...options,
  });
}

export function useArticle(id: string, options?: UseQueryOptions<Article>) {
  return useQuery({
    queryKey: queryKeys.article(id),
    queryFn: async () => {
      const response = await apiClient.getArticle(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Article>) => {
      const response = await apiClient.createArticle(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Article> }) => {
      const response = await apiClient.updateArticle(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.article(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteArticle(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

// Scan Hooks
export function useScans(params?: PaginationParams, options?: UseQueryOptions<PaginatedResponse<Scan>>) {
  return useQuery({
    queryKey: queryKeys.scans(params),
    queryFn: async () => {
      const response = await apiClient.getScans(params);
      return response;
    },
    ...options,
  });
}

export function useScan(id: string, options?: UseQueryOptions<Scan>) {
  return useQuery({
    queryKey: queryKeys.scan(id),
    queryFn: async () => {
      const response = await apiClient.getScan(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.createScan(formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

export function useDeleteScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteScan(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    },
  });
}

// Object Hooks
export function useObjects(
  params?: PaginationParams & { scanId?: string; category?: string }, 
  options?: UseQueryOptions<PaginatedResponse<DetectedObject>>
) {
  return useQuery({
    queryKey: queryKeys.objects(params),
    queryFn: async () => {
      const response = await apiClient.getObjects(params);
      return response;
    },
    ...options,
  });
}

export function useObject(id: string, options?: UseQueryOptions<DetectedObject>) {
  return useQuery({
    queryKey: queryKeys.object(id),
    queryFn: async () => {
      const response = await apiClient.getObject(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useValidateObject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: { 
        notes?: string;
        corrected_category?: string;
        corrected_value?: number;
      } 
    }) => {
      const response = await apiClient.validateObject(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.object(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.objectStats });
    },
  });
}

export function useCreateObject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      estimated_value: number;
      scan_id: string;
      description?: string;
      risk_level?: number;
      damage_level?: number;
    }) => {
      const response = await apiClient.createObject(data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.scan(data.scan_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.objectStats });
    },
  });
}

export function useRejectObject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { notes?: string } }) => {
      const response = await apiClient.rejectObject(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.object(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['objects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.objectStats });
    },
  });
}

// Retraining Hooks
export function useRetrainingData(params?: PaginationParams, options?: UseQueryOptions<RetrainingData[]>) {
  return useQuery({
    queryKey: queryKeys.retrainingData(params),
    queryFn: async () => {
      const response = await apiClient.getRetrainingData(params);
      return response;
    },
    ...options,
  });
}

export function useCreateRetrainingData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<RetrainingData>) => {
      const response = await apiClient.createRetrainingData(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retraining'] });
    },
  });
}

export function useDeleteRetrainingData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteRetrainingData(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retraining'] });
    },
  });
}

// File Upload Hook
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, path }: { file: File; path?: string }) => {
      const response = await apiClient.uploadFile(file, path);
      return response;
    },
  });
}

// Article Image Upload Hook (with fallback handling)
export function useUploadArticleImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await apiClient.uploadArticleImage(file);
      return response;
    },
  });
} 