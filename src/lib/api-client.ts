const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ArticleQueryParams extends PaginationParams {
  status?: 'draft' | 'published' | 'archived';
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
  status: 'draft' | 'published' | 'archived';
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
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          // Try to parse JSON error response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // Handle non-JSON responses (like HTML error pages)
            const errorText = await response.text();
            if (errorText && errorText.length < 200) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          // If parsing fails, use the default error message
          console.warn('Failed to parse error response:', parseError);
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).url = url;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Enhanced error logging
      if (error instanceof Error) {
        console.error(`API request failed: ${endpoint}`, {
          url,
          error: error.message,
          status: (error as any).status,
        });
      } else {
        console.error(`API request failed: ${endpoint}`, error);
      }
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
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 