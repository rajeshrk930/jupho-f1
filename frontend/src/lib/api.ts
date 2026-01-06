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

// Analysis API
export const analysisApi = {
  create: async (formData: FormData) => {
    const response = await api.post('/analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getAll: async (params?: {
    page?: number;
    limit?: number;
    industry?: string;
    resultType?: string;
    search?: string;
  }) => {
    const response = await api.get('/analysis', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/analysis/${id}`);
    return response.data;
  },
  exportPdf: async (id: string) => {
    const response = await api.get(`/analysis/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/analysis/${id}`);
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  createOrder: async () => {
    const response = await api.post('/payments/create-order');
    return response.data;
  },
  verifyPayment: async (data: { orderId: string; paymentId: string; signature: string }) => {
    const response = await api.post('/payments/verify', {
      orderId: data.orderId,
      paymentId: data.paymentId,
      signature: data.signature,
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
