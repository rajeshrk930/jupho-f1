import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

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

// Helper to get Clerk token (must be called from React component)
let getClerkToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (getter: () => Promise<string | null>) => {
  getClerkToken = getter;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send httpOnly cookies for auth (Clerk session tokens)
  withCredentials: true,
});

// Add Clerk session token to requests
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    // Get Clerk token if getter is set
    if (getClerkToken && typeof window !== 'undefined') {
      const token = await getClerkToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // Log error but don't block the request
    console.warn('api request interceptor: could not get Clerk token', e);
  }
  return config;
});

// Handle auth errors
let isHandling401 = false;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Prevent duplicate logout/redirect attempts when multiple requests fail.
      if (isHandling401) return Promise.reject(error);
      isHandling401 = true;

      try {
        // Redirect to sign-in page on 401
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      } catch (e) {
        console.error('Error during redirect from response interceptor', e);
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
  // Step 1: Business Scan (NEW: 3-field input, LEGACY: url/manualInput supported)
  startBusinessScan: async (data: { 
    description?: string; 
    location?: string; 
    website?: string; 
    // Legacy support
    url?: string; 
    manualInput?: string;
  }) => {
    const response = await api.post('/agent/scan', data);
    return response.data;
  },
  
  // Step 2: Generate Strategy
  generateStrategy: async (
    taskId: string, 
    userGoal?: string, 
    conversionMethod?: 'lead_form' | 'website',
    objective?: 'TRAFFIC' | 'LEADS' | 'SALES',
    budget?: number
  ) => {
    const response = await api.post('/agent/strategy', { 
      taskId, 
      userGoal,
      conversionMethod: conversionMethod || 'lead_form',
      objective,
      budget
    });
    return response.data;
  },
  
  // Step 3: Launch Campaign
  launchCampaign: async (taskId: string, imageFile?: File) => {
    const formData = new FormData();
    formData.append('taskId', taskId);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await api.post('/agent/launch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get usage stats
  getUsage: async () => {
    const response = await api.get('/agent/usage');
    return response.data;
  },
  
  // Get task history
  getTasks: async (limit?: number) => {
    const response = await api.get('/agent/tasks', { params: { limit } });
    return response.data;
  },

  // Get specific task details
  getTaskDetails: async (taskId: string) => {
    const response = await api.get(`/agent/task/${taskId}`);
    return response.data;
  },

  // Sync single task performance
  syncTaskPerformance: async (taskId: string) => {
    const response = await api.post('/agent/track-performance', { taskId });
    return response.data;
  },

  // Sync all active campaigns
  syncAllActiveCampaigns: async () => {
    const response = await api.post('/agent/sync-active');
    return response.data;
  },
};
