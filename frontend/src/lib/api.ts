import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.post<{ accessToken: string; refreshToken: string }>(
                '/auth/refresh',
                { refreshToken }
              );
              if (response.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                // Retry original request
                return this.client.request(error.config!);
              }
            } catch {
              // Refresh failed - logout
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          } else {
            // No refresh token - logout
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  }
}

export const api = new ApiClient();

// API methods
export const authApi = {
  register: (email: string, password: string, fullName: string) =>
    api.post('/auth/register', { email, password, fullName }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const onboardingApi = {
  complete: (data: any) => api.post('/onboarding', data),

  getStatus: () => api.get('/onboarding/status'),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const mealsApi = {
  uploadPhoto: (file: File, onProgress?: (progress: number) => void) =>
    api.uploadFile('/meals/upload-photo', file, onProgress),

  analyzeNutrients: (foods: { foodId: string; portionGrams: number }[]) =>
    api.post('/meals/analyze-nutrients', { foods }),

  getAlternatives: (foodId: string) =>
    api.post('/meals/alternatives', { foodId }),

  logMeal: (data: {
    photoUrl: string;
    mealType?: string;
    foods: { foodId: string; portionGrams: number }[];
    notes?: string;
  }) => api.post('/meals/log', data),

  getMeals: (params?: { startDate?: string; endDate?: string; limit?: number; offset?: number }) =>
    api.get('/meals', { params }),

  getMealById: (id: string) => api.get(`/meals/${id}`),

  deleteMeal: (id: string) => api.delete(`/meals/${id}`),
};

export const foodsApi = {
  search: (query: string, params?: { category?: string; cuisine?: string; limit?: number }) =>
    api.get('/foods/search', { params: { q: query, ...params } }),

  getById: (id: string) => api.get(`/foods/${id}`),

  getSimilar: (id: string, limit?: number) =>
    api.get(`/foods/${id}/similar`, { params: { limit } }),
};
