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
  type Dataset,
  type AnnotationTask,
  type DashboardStats,
  type ObjectStats,
  type RecentActivity,
  type RetrainingType,
  type AnnotationStatus,
  type DatasetStatus
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
  
  // Datasets
  datasets: () => ['datasets'] as const,
  dataset: (id: string) => ['datasets', id] as const,
  
  // Annotation Tasks
  annotationTasks: (datasetId: string) => ['annotation-tasks', datasetId] as const,
  annotationTask: (id: string) => ['annotation-tasks', id] as const,
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
    mutationFn: async (data: Partial<Article> | FormData) => {
      const response = await apiClient.createArticle(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate all articles queries to ensure the list updates
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Article> | FormData }) => {
      const response = await apiClient.updateArticle(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.article(data.id), data);
      // Invalidate all articles queries to ensure the list updates
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
      // Invalidate all articles queries to ensure the list updates
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
    },
  });
}

// Object Hooks
export function useObjects(
  params?: PaginationParams & { scanId?: string; category?: string; isValidated?: boolean }, 
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
    mutationFn: async ({ 
      id, 
      data 
    }: { 
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
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
    },
  });
}

export function useDeleteObject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteObject(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objects'] });
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

// Dataset Hooks
export function useDatasets(options?: UseQueryOptions<Dataset[]>) {
  return useQuery({
    queryKey: queryKeys.datasets(),
    queryFn: async () => {
      const response = await apiClient.getDatasets();
      return response;
    },
    ...options,
  });
}

export function useDataset(id: string, options?: UseQueryOptions<Dataset>) {
  return useQuery({
    queryKey: queryKeys.dataset(id),
    queryFn: async () => {
      const response = await apiClient.getDataset(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; configuration?: Record<string, any> }) => {
      const response = await apiClient.createDataset(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useUpdateDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dataset> }) => {
      const response = await apiClient.updateDataset(id, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.dataset(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.deleteDataset(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useAddImagesToDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ datasetId, objectIds }: { datasetId: string; objectIds: string[] }) => {
      const response = await apiClient.addImagesToDataset(datasetId, objectIds);
      return response;
    },
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataset(datasetId) });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useStartTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (datasetId: string) => {
      const response = await apiClient.startTraining(datasetId);
      return response;
    },
    onSuccess: (_, datasetId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataset(datasetId) });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useCompleteTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      datasetId, 
      metrics 
    }: { 
      datasetId: string; 
      metrics: {
        final_map?: number;
        precision?: number;
        recall?: number;
        epochs_completed?: number;
        best_weights_path?: string;
      } 
    }) => {
      const response = await apiClient.completeTraining(datasetId, metrics);
      return response;
    },
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataset(datasetId) });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

export function useFailTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ datasetId, error }: { datasetId: string; error: string }) => {
      const response = await apiClient.failTraining(datasetId, error);
      return response;
    },
    onSuccess: (_, { datasetId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dataset(datasetId) });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}

// Annotation Task Hooks
export function useAnnotationTasks(datasetId: string, options?: UseQueryOptions<AnnotationTask[]>) {
  return useQuery({
    queryKey: queryKeys.annotationTasks(datasetId),
    queryFn: async () => {
      const response = await apiClient.getAnnotationTasks(datasetId);
      return response;
    },
    enabled: !!datasetId,
    ...options,
  });
}

export function useAnnotationTask(id: string, options?: UseQueryOptions<AnnotationTask>) {
  return useQuery({
    queryKey: queryKeys.annotationTask(id),
    queryFn: async () => {
      const response = await apiClient.getAnnotationTask(id);
      return response;
    },
    enabled: !!id,
    ...options,
  });
}

export function useUpdateAnnotationTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      taskId, 
      data 
    }: { 
      taskId: string; 
      data: {
        annotations?: Array<{
          category: string;
          bbox: { x: number; y: number; width: number; height: number };
          confidence?: number;
          is_ai_generated: boolean;
          verified: boolean;
        }>;
        status?: AnnotationStatus;
        notes?: string;
      } 
    }) => {
      const response = await apiClient.updateAnnotationTask(taskId, data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.annotationTask(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['annotation-tasks'] });
    },
  });
}

export function useAssignAnnotationTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.assignAnnotationTask(taskId);
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.annotationTask(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['annotation-tasks'] });
    },
  });
}

// File Upload Hooks
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, path }: { file: File; path?: string }) => {
      const response = await apiClient.uploadFile(file, path);
      return response;
    },
  });
}

export function useUploadArticleImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const response = await apiClient.uploadArticleImage(file);
      return response;
    },
  });
} 