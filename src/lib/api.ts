import axios from 'axios';
import { Notification, NotificationType, EventTrigger } from '@/types/notifications';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.warn('🔍 Resource not found');
    } else if (error.response?.status === 429) {
      console.warn('⏰ Rate limit exceeded');
    } else if (error.response?.status >= 500) {
      console.error('🔥 Server error');
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Notification endpoints
  async getNotifications(userId: string, params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());

    const response = await api.get(`/api/notifications/${userId}?${queryParams}`);
    return response.data;
  },

  async markNotificationAsRead(notificationId: string) {
    const response = await api.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllNotificationsAsRead(userId: string) {
    const response = await api.patch(`/api/notifications/users/${userId}/read-all`);
    return response.data;
  },

  async clearAllNotifications(userId: string) {
    const response = await api.delete(`/api/notifications/users/${userId}/clear`);
    return response.data;
  },

  async getNotificationStats(userId: string) {
    const response = await api.get(`/api/notifications/users/${userId}/stats`);
    return response.data;
  },

  // Event endpoints
  async createEvent(event: {
    type: NotificationType;
    sourceUserId: string;
    targetUserId?: string;
    data?: any;
  }) {
    const response = await api.post('/api/events', event);
    return response.data;
  },

  async getEvents(params?: {
    page?: number;
    limit?: number;
    type?: NotificationType;
    sourceUserId?: string;
    targetUserId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.sourceUserId) queryParams.append('sourceUserId', params.sourceUserId);
    if (params?.targetUserId) queryParams.append('targetUserId', params.targetUserId);

    const response = await api.get(`/api/events?${queryParams}`);
    return response.data;
  },

  // User endpoints
  async getUser(userId: string) {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  async getAllUsers(limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/api/users${queryParams}`);
    return response.data;
  },

  async seedDemoUsers() {
    const response = await api.post('/api/users/demo/seed');
    return response.data;
  },

  async updateUserPreferences(userId: string, preferences: any) {
    const response = await api.patch(`/api/users/${userId}/preferences`, { preferences });
    return response.data;
  },
};

// Error handling utility
export function handleApiError(error: any) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error || error.message;
    const status = error.response?.status;
    
    return {
      message,
      status,
      isNetworkError: !error.response,
      isServerError: status && status >= 500,
      isClientError: status && status >= 400 && status < 500,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: 0,
    isNetworkError: true,
    isServerError: false,
    isClientError: false,
  };
}

// Connection status checker
export async function checkApiConnection(): Promise<boolean> {
  try {
    await apiService.healthCheck();
    return true;
  } catch (error) {
    console.warn('⚠️ API connection check failed:', error);
    return false;
  }
}

// Default export
export default apiService;