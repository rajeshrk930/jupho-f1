import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  // In production we want an explicit API URL configured — warn loudly so builds/ops catch it.
  // Falling back to localhost in production would be surprising and hard to debug.
  // Keep this as a runtime warning rather than throwing to avoid breaking builds.
  // Ensure ops/devs notice this in logs.
  // eslint-disable-next-line no-console
  console.error(
    'NEXT_PUBLIC_API_URL is not defined and the app is running in production. Please set NEXT_PUBLIC_API_URL to your backend API URL.'
  );
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send httpOnly cookies for auth (backend sets the JWT cookie)
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // If an explicit token exists in the client store, attach it.
  // In cookie-based auth this will normally be undefined and cookies are sent automatically.
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // When running outside of React (eg. during SSR or in tests) accessing the store
    // may throw — surface a debug message rather than silently swallowing it.
    // eslint-disable-next-line no-console
    console.warn('api request interceptor: could not read auth token from store', e);
  }
  return config;
});

// Handle auth errors
let isHandling401 = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      // Don't trigger logout/redirect for the auth/me probe — let callers handle it.
      if (reqUrl.includes('/auth/me')) {
        return Promise.reject(error);
      }

      // Prevent duplicate logout/redirect attempts when multiple requests fail.
      if (isHandling401) return Promise.reject(error);
      isHandling401 = true;

      try {
        useAuthStore.getState().logout();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error during logout from response interceptor', e);
      }

      if (typeof window !== 'undefined') {
        // Use direct location replacement so browser history isn't polluted.
        // If you prefer client-side routing integration, replace this with Router.push in a component.
        window.location.replace('/login');
      }

      // allow subsequent 401s to be handled later after a short delay
      setTimeout(() => {
        isHandling401 = false;
      }, 1000);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  createOrder: async (plan: 'PRO_MONTHLY' | 'PRO_ANNUAL' = 'PRO_MONTHLY') => {
    const response = await api.post('/payments/create-order', { plan });
    // Backend wraps payload as { success, data }, we only need the data block for the modal
    return response.data.data;
  },
  verifyPayment: async (data: {
    orderId?: string;
    subscriptionId?: string;
    paymentId: string;
    signature: string;
  }) => {
    const response = await api.post('/payments/verify', {
      razorpay_order_id: data.orderId,
      razorpay_subscription_id: data.subscriptionId,
      razorpay_payment_id: data.paymentId,
      razorpay_signature: data.signature,
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};

// Chat API
export const chatApi = {
  sendMessage: async (message: string, conversationId?: string, analysisId?: string) => {
    const response = await api.post('/chat', { message, conversationId, analysisId });
    return response.data;
  },
  getConversation: async (conversationId: string) => {
    const response = await api.get(`/chat/${conversationId}`);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
  sendFeedback: async (messageId: string, feedback: 'up' | 'down') => {
    const response = await api.post(`/chat/${messageId}/feedback`, { feedback });
    return response.data;
  },
  exportJsonl: async () => {
    const response = await api.get('/chat/export/jsonl', { responseType: 'blob' });
    return response.data as Blob;
  },
  getUsage: async () => {
    const response = await api.get('/chat/usage');
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.patch('/auth/password', data);
    return response.data;
  },
  exportData: async () => {
    const response = await api.get('/auth/export', { responseType: 'blob' });
    return response.data as Blob;
  },
  deleteAccount: async () => {
    const response = await api.delete('/auth/account');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    plan?: 'FREE' | 'PRO' | '';
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getUserDetails: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
  updateUser: async (userId: string, data: {
    plan?: 'FREE' | 'PRO';
  }) => {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// Agent API
export const agentApi = {
  startTask: async () => {
    const response = await api.post('/agent/start');
    return response.data;
  },
  sendMessage: async (taskId: string, message: string) => {
    const response = await api.post('/agent/message', { taskId, message });
    return response.data;
  },
  createAd: async (taskId: string, creativeFile?: File) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    if (creativeFile) {
      formData.append('creative', creativeFile);
    }
    const response = await api.post('/agent/create-ad', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getTasks: async (limit?: number) => {
    const response = await api.get('/agent/tasks', { params: { limit } });
    return response.data;
  },
  selectVariant: async (taskId: string, creativeId: string, type: string) => {
    const response = await api.post('/agent/select-variant', { taskId, creativeId, type });
    return response.data;
  },
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/agent/task/${taskId}`);
    return response.data;
  },
};
