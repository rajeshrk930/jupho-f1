import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  createOrder: async (plan: 'PRO' | 'AGENCY') => {
    const response = await api.post('/payments/create-order', { plan });
    return response.data;
  },
  verifyPayment: async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ) => {
    const response = await api.post('/payments/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};
