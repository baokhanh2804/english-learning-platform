import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://english-learning-backend-s2v4.onrender.com/api';
if (rawBaseUrl === 'https://english-learning-backend.onrender.com/api') {
  rawBaseUrl = 'https://english-learning-backend-s2v4.onrender.com/api';
}

const API_BASE_URL = rawBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000, // 30 seconds to allow for free tier backend cold starts
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export interface HealthCheckResponse {
  status: string;
  service: string;
  database: string;
  timestamp: string;
}

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};
