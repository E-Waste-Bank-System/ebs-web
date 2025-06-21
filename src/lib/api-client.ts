const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
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
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
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
  user_id: string;
  user?: Profile;
  objects?: DetectedObject[];
  created_at: string;
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
}

export interface RetrainingData {
  id: string;
  name?: string;
  description?: string;
  type: 'correction' | 'validation' | 'improvement';
  status: 'pending' | 'running' | 'completed' | 'failed';
  data_source: string;
  sample_count?: number;
  final_accuracy?: number;
  training_duration?: number;
  original_category: string;
  corrected_category?: string;
  original_confidence: number;
  corrected_value?: number;
  correction_data: Record<string, any>;
  notes?: string;
  submitted_by: string;
  is_processed: boolean;
  processed_at?: string;
  object_id: string;
  created_at: string;
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
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          // Try to parse JSON error response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.log('API Error Data:', errorData);
          } else {
            // Handle non-JSON responses (like HTML error pages)
            const textData = await response.text();
            console.log('API Error (non-JSON):', textData.substring(0, 200));
          }
        } catch (parseError) {
          console.log('Could not parse error response:', parseError);
        }
        
        const apiError = new Error(errorMessage);
        (apiError as any).status = response.status;
        (apiError as any).url = url;
        
        // Enhanced error logging
        console.error(`API request failed: ${endpoint}`, {
          url,
          error: errorMessage,
          status: response.status,
          statusText: response.statusText,
        });
        
        throw apiError;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      console.error('API Request Error:', {
        url,
        error: error instanceof Error ? error.message : error
      });
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
    return this.request('/auth/sync-users', { method: 'POST' });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/admin/dashboard');
  }

  async getObjectStats() {
    return this.request<ObjectStats>('/admin/dashboard/stats/objects');
  }

  async getRecentActivity(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<RecentActivity>(`/admin/dashboard/activity${params}`);
  }

  // Profiles (Admin)
  async getProfiles(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    
    return this.request<PaginatedResponse<Profile>>(`/profiles?${searchParams}`);
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
    return this.request(`/profiles/${id}/stats`);
  }

  // Articles (Admin)
  async getArticles(params: ArticleQueryParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    
    return this.request<PaginatedResponse<Article>>(`/admin/articles?${searchParams}`);
  }

  async getArticle(id: string) {
    return this.request<Article>(`/admin/articles/${id}`);
  }

  async createArticle(data: Partial<Article>) {
    return this.request<Article>('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: Partial<Article>) {
    return this.request<Article>(`/admin/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string) {
    return this.request(`/admin/articles/${id}`, { method: 'DELETE' });
  }

  // Scans (Admin)
  async getScans(params: PaginationParams & { include?: string[] } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'include' && Array.isArray(value)) {
        value.forEach(relation => searchParams.append('include', relation));
      } else if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    return this.request<PaginatedResponse<Scan>>(`/admin/scans?${searchParams}`);
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

  // Objects (Admin)
  async getObjects(params: PaginationParams & { scanId?: string; category?: string } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    
    return this.request<PaginatedResponse<DetectedObject>>(`/admin/objects?${searchParams}`);
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

  // Retraining Data (Admin)
  async getRetrainingData(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    
    return this.request<RetrainingData[]>(`/retraining?${searchParams}`);
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

    return this.request<{ url: string }>('/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Article Image Upload (with dedicated endpoint and comprehensive fallbacks)
  async uploadArticleImage(file: File) {
    try {
      // Log the upload attempt
      console.log('Attempting article image upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // First try the new dedicated article image endpoint
      const formData = new FormData();
      formData.append('file', file);

      const result = await this.request<{ url: string }>('/upload/article-image', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Dedicated article image upload successful:', result);
      return result;
    } catch (dedicatedError: any) {
      console.error('Dedicated article endpoint failed:', {
        error: dedicatedError?.message,
        status: dedicatedError?.status,
        response: dedicatedError?.response
      });
      
      // Fallback 1: Try the general upload endpoint
      try {
        console.log('Trying general upload endpoint...');
        
        const fallbackFormData = new FormData();
        fallbackFormData.append('file', file);
        fallbackFormData.append('path', 'articles');

        const result = await this.request<{ url: string }>('/upload', {
          method: 'POST',
          body: fallbackFormData,
        });
        
        console.log('General upload successful:', result);
        return result;
      } catch (generalError: any) {
        console.error('General upload also failed:', generalError);
        
        // Fallback 2: Use the scans endpoint directly (since it works)
        try {
          console.log('Trying scans endpoint as final fallback...');
          
          const scansFormData = new FormData();
          scansFormData.append('file', file);
          scansFormData.append('original_filename', `article-${Date.now()}-${file.name}`);
          
          // Use the scans endpoint that we know works
          const token = this.token;
          const scansResponse = await fetch(`${this.baseURL}/scans`, {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
            body: scansFormData,
          });

          if (!scansResponse.ok) {
            const errorText = await scansResponse.text();
            throw new Error(`HTTP ${scansResponse.status}: ${errorText}`);
          }

          const scansResult = await scansResponse.json();
          console.log('Scans endpoint fallback successful:', scansResult);
          
          // Extract the image URL from the scan result
          if (scansResult.image_url) {
            // Delete the scan record since we only wanted the uploaded image
            try {
              await fetch(`${this.baseURL}/scans/${scansResult.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': token ? `Bearer ${token}` : '',
                },
              });
              console.log('Cleaned up temporary scan record');
            } catch (cleanupError) {
              console.warn('Failed to clean up temporary scan record:', cleanupError);
            }
            
            return { url: scansResult.image_url };
          } else {
            throw new Error('No image URL returned from scans endpoint');
          }
        } catch (scansError: any) {
          console.error('Scans endpoint fallback also failed:', scansError);
          
          // If all approaches fail, throw a comprehensive error
          throw new Error(`Image upload failed on all attempts: 1) Dedicated endpoint: ${dedicatedError?.message || 'Unknown error'} 2) General upload: ${generalError?.message || 'Unknown error'} 3) Scans fallback: ${scansError?.message || 'Unknown scans error'}`);
        }
      }
    }
  }

  // Retraining/Dataset methods
  async getDatasets() {
    return this.request<any[]>('/retraining/datasets');
  }

  async createDataset(data: { name: string; description?: string }) {
    return this.request<any>('/retraining/datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDataset(id: string) {
    return this.request<any>(`/retraining/datasets/${id}`);
  }

  async updateDataset(id: string, data: any) {
    return this.request<any>(`/retraining/datasets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDataset(id: string) {
    return this.request<any>(`/retraining/datasets/${id}`, {
      method: 'DELETE',
    });
  }

  async startTraining(datasetId: string) {
    return this.request<any>(`/retraining/datasets/${datasetId}/train`, {
      method: 'POST',
    });
  }

  async getAnnotationTasks(datasetId: string) {
    return this.request<any[]>(`/retraining/datasets/${datasetId}/tasks`);
  }

  async updateAnnotationTask(taskId: string, data: any) {
    return this.request<any>(`/retraining/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async assignAnnotationTask(taskId: string) {
    return this.request<any>(`/retraining/tasks/${taskId}/assign`, {
      method: 'POST',
    });
  }

  async addImagesToDataset(datasetId: string, objectIds: string[]) {
    console.log('API Client - addImagesToDataset called with:', {
      datasetId,
      objectIds,
      objectCount: objectIds?.length
    });
    
    const payload = { objectIds };
    console.log('API Client - Request payload:', payload);
    
    return this.request<any>(`/retraining/datasets/${datasetId}/images`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
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

  async exportYoloDataset(objectIds: string[]): Promise<Blob> {
    console.log('API Client - exportYoloDataset called with:', { objectIds, count: objectIds.length });
    
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

    return await response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 