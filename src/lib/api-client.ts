const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum DatasetStatus {
  DRAFT = 'draft',
  ANNOTATING = 'annotating',
  READY = 'ready',
  TRAINING = 'training',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum AnnotationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
}

export enum RetrainingType {
  CORRECTION = 'correction',
  VALIDATION = 'validation',
  IMPROVEMENT = 'improvement',
  ANNOTATION = 'annotation',
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ArticleQueryParams extends PaginationParams {
  status?: ArticleStatus;
  tag?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Interfaces matching backend DTOs
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  is_active: boolean;
  last_login_at?: string;
  email_verified?: boolean;
  phone?: string;
  bio?: string;
  location?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | object;
  excerpt?: string;
  featured_image?: string;
  status: ArticleStatus;
  tags: string[];
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
  published_at?: string;
  author_id: string;
  author?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Scan {
  id: string;
  image_url: string;
  original_filename?: string;
  status: 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  error_message?: string;
  total_estimated_value: number;
  objects_count: number;
  processed_at?: string;
  user_id: string;
  user?: Profile;
  objects?: DetectedObject[];
  created_at: string;
  updated_at: string;
}

export interface DetectedObject {
  id: string;
  name: string;
  category: string;
  confidence_score: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  estimated_value?: number;
  risk_level: number;
  damage_level: number;
  is_validated: boolean;
  validated_by?: string;
  validated_at?: string;
  validation_notes?: string;
  description?: string;
  suggestions?: string[];
  ai_metadata: Record<string, any>;
  scan_id: string;
  scan?: Scan;
  created_at: string;
  updated_at: string;
}

export interface RetrainingData {
  id: string;
  type: RetrainingType;
  original_category: string;
  corrected_category?: string;
  original_confidence: number;
  corrected_value?: number;
  correction_data: Record<string, any>;
  annotation_data?: Record<string, any>;
  notes?: string;
  submitted_by: string;
  is_processed: boolean;
  processed_at?: string;
  object_id?: string;
  dataset_id?: string;
  annotation_task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  status: DatasetStatus;
  configuration?: Record<string, any>;
  total_images: number;
  annotated_images: number;
  total_annotations: number;
  created_by: string;
  training_started_at?: string;
  training_completed_at?: string;
  training_metrics?: {
    final_map?: number;
    precision?: number;
    recall?: number;
    epochs_completed?: number;
    best_weights_path?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AnnotationTask {
  id: string;
  dataset_id: string;
  object_id?: string;
  image_url: string;
  original_filename?: string;
  status: AnnotationStatus;
  annotations?: Array<{
    id: string;
    category: string;
    bbox: { x: number; y: number; width: number; height: number };
    confidence?: number;
    is_ai_generated: boolean;
    verified: boolean;
  }>;
  assigned_to?: string;
  assigned_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_scans: number;
  total_objects: number;
  total_users: number;
  completed_scans: number;
  validated_objects: number;
  total_estimated_value: number;
  validation_rate: number;
}

export interface ObjectStats {
  by_category: Array<{
    category: string;
    count: number;
    avg_confidence: number;
    total_value: number;
  }>;
  by_risk_level: Array<{
    risk_level: number;
    count: number;
  }>;
}

export interface RecentActivity {
  recent_scans: Array<{
    id: string;
    user_name: string;
    status: string;
    objects_count: number;
    created_at: string;
  }>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Debug logging
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      hasToken: !!this.token,
      tokenLength: this.token ? this.token.length : 0
    });
    
    // Don't set Content-Type for FormData (browser will set it with boundary)
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).url = url;
        (error as any).response = errorData;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: Profile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<Profile>('/auth/profile');
  }

  async syncUsers() {
    return this.request<void>('/auth/sync-users', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/admin/dashboard');
  }

  async getObjectStats() {
    return this.request<ObjectStats>('/admin/dashboard/stats/objects');
  }

  async getRecentActivity(limit?: number) {
    return this.request<RecentActivity>(`/admin/dashboard/activity${limit ? `?limit=${limit}` : ''}`);
  }

  // Profiles
  async getProfiles(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    return this.request<PaginatedResponse<Profile>>(`/profiles?${searchParams.toString()}`);
  }

  async getProfileById(id: string) {
    return this.request<Profile>(`/profiles/${id}`);
  }

  async updateProfile(id: string, data: Partial<Profile>) {
    return this.request<Profile>(`/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProfile(id: string) {
    return this.request(`/profiles/${id}`, { method: 'DELETE' });
  }

  async getUserStats(id: string) {
    return this.request<any>(`/profiles/${id}/stats`);
  }

  // Articles
  async getArticles(params: ArticleQueryParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    return this.request<PaginatedResponse<Article>>(`/admin/articles?${searchParams.toString()}`);
  }

  async getArticle(id: string) {
    return this.request<Article>(`/admin/articles/${id}`);
  }

  async createArticle(data: Partial<Article> | FormData) {
    return this.request<Article>('/admin/articles', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: Partial<Article> | FormData) {
    return this.request<Article>(`/admin/articles/${id}`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  async deleteArticle(id: string) {
    return this.request(`/admin/articles/${id}`, { method: 'DELETE' });
  }

  // Scans
  async getScans(params: PaginationParams & { include?: string[] } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    return this.request<PaginatedResponse<Scan>>(`/scans?${searchParams.toString()}`);
  }

  async getScan(id: string) {
    return this.request<Scan>(`/admin/scans/${id}`);
  }

  async createScan(formData: FormData) {
    return this.request<Scan>('/scans', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteScan(id: string) {
    return this.request(`/scans/${id}`, { method: 'DELETE' });
  }

  // Objects
  async getObjects(params: PaginationParams & { scanId?: string; category?: string; isValidated?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    return this.request<PaginatedResponse<DetectedObject>>(`/objects?${searchParams.toString()}`);
  }

  async getObject(id: string) {
    return this.request<DetectedObject>(`/objects/${id}`);
  }

  async validateObject(id: string, data: { 
    notes?: string;
    corrected_category?: string;
    corrected_value?: number;
  }) {
    return this.request<DetectedObject>(`/admin/objects/${id}/validate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createObject(data: {
    name: string;
    category: string;
    estimated_value: number;
    scan_id: string;
    description?: string;
    risk_level?: number;
    damage_level?: number;
  }) {
    return this.request<DetectedObject>(`/admin/objects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectObject(id: string, data: { notes?: string }) {
    return this.request<DetectedObject>(`/admin/objects/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteObject(id: string) {
    return this.request(`/admin/objects/${id}`, { method: 'DELETE' });
  }

  // Retraining
  async getRetrainingData(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    return this.request<RetrainingData[]>(`/retraining?${searchParams.toString()}`);
  }

  async createRetrainingData(data: Partial<RetrainingData>) {
    return this.request<RetrainingData>('/retraining', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRetrainingData(id: string) {
    return this.request(`/retraining/${id}`, { method: 'DELETE' });
  }

  // File Upload
  async uploadFile(file: File, path?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (path) formData.append('path', path);
    
    return this.request<{ url: string }>('/upload/file', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadArticleImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'article');
    
    return this.request<{ url: string }>('/upload/article-image', {
      method: 'POST',
      body: formData,
    });
  }

  // Dataset Management
  async getDatasets() {
    return this.request<Dataset[]>('/retraining/datasets');
  }

  async createDataset(data: { name: string; description?: string; configuration?: Record<string, any> }) {
    return this.request<Dataset>('/retraining/datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDataset(id: string) {
    return this.request<Dataset>(`/retraining/datasets/${id}`);
  }

  async updateDataset(id: string, data: Partial<Dataset>) {
    return this.request<Dataset>(`/retraining/datasets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDataset(id: string) {
    return this.request(`/retraining/datasets/${id}`, { method: 'DELETE' });
  }

  async addImagesToDataset(datasetId: string, objectIds: string[]) {
    return this.request<any>(`/retraining/datasets/${datasetId}/images`, {
      method: 'POST',
      body: JSON.stringify({ objectIds }),
    });
  }

  async startTraining(datasetId: string) {
    return this.request<any>(`/retraining/datasets/${datasetId}/train`, {
      method: 'POST',
    });
  }

  async completeTraining(datasetId: string, metrics: {
    final_map?: number;
    precision?: number;
    recall?: number;
    epochs_completed?: number;
    best_weights_path?: string;
  }) {
    return this.request<any>(`/retraining/datasets/${datasetId}/complete`, {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  }

  async failTraining(datasetId: string, error: string) {
    return this.request<any>(`/retraining/datasets/${datasetId}/fail`, {
      method: 'POST',
      body: JSON.stringify({ error }),
    });
  }

  // Annotation Tasks
  async getAnnotationTasks(datasetId: string) {
    return this.request<AnnotationTask[]>(`/retraining/datasets/${datasetId}/tasks`);
  }

  async getAnnotationTask(taskId: string) {
    return this.request<AnnotationTask>(`/retraining/tasks/${taskId}`);
  }

  async updateAnnotationTask(taskId: string, data: {
    annotations?: Array<{
      category: string;
      bbox: { x: number; y: number; width: number; height: number };
      confidence?: number;
      is_ai_generated: boolean;
      verified: boolean;
    }>;
    status?: AnnotationStatus;
    notes?: string;
  }) {
    return this.request<AnnotationTask>(`/retraining/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async assignAnnotationTask(taskId: string) {
    return this.request<AnnotationTask>(`/retraining/tasks/${taskId}/assign`, {
      method: 'POST',
    });
  }

  // Export functionality
  async exportDatasetForTraining(datasetId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/retraining/datasets/${datasetId}/export`, {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Helper to generate proxied image URLs to avoid CORS issues
  getProxiedImageUrl(originalUrl: string): string {
    if (!originalUrl) return originalUrl;
    
    // Only proxy Google Cloud Storage URLs
    if (originalUrl.includes('storage.googleapis.com') || originalUrl.includes('storage.cloud.google.com')) {
      const encodedUrl = encodeURIComponent(originalUrl);
      return `${this.baseURL}/retraining/proxy-image?url=${encodedUrl}`;
    }
    
    // Return original URL if it's not from GCS
    return originalUrl;
  }

  // Export YOLO dataset
  async exportYoloDataset(objectIds: string[]): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/retraining/export-yolo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify({ objectIds }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 