import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { store } from '../store/store';
import { isNetworkError, getErrorMessage, createApiError } from '../lib/error-handler';

// Base URL from environment or fallback
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: any) => {
    // Get token from Redux store first, fallback to cookies
    const state = store.getState();
    const token = state.auth.accessToken || Cookies.get('hakim_auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Mask sensitive data in request body for logging
    let safeData = config.data;
    if (config.data && typeof config.data === 'object') {
      safeData = { ...config.data };
      // Mask password field if present
      if (safeData.password) {
        safeData.password = '***';
      }
      // Mask any other sensitive fields
      if (safeData.oldPassword) {
        safeData.oldPassword = '***';
      }
      if (safeData.newPassword) {
        safeData.newPassword = '***';
      }
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token,
      data: safeData,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error: AxiosError) => {
    // Check if it's a network error
    if (isNetworkError(error)) {
      const apiError = createApiError(error);
      console.error('Network Error:', {
        message: apiError.message,
        originalError: error,
      });
      return Promise.reject(apiError);
    }

    const originalRequest = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if we're explicitly logging in or already refreshing to avoid loops
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      console.log('🔄 Token expired (401), attempting refresh...');

      try {
        const state = store.getState();
        const refreshToken = state.auth.refreshToken || Cookies.get('hakim_refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use a generic axios instance to avoid circular dependency loops with apiClient
        // and to avoid the interceptor itself
        const refreshResponse = await axios.post(
          `${BASE_URL}/customers/v1/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token } = refreshResponse.data.data;

        console.log('✅ Token refresh successful');

        // Dynamically import action to avoid circular dependency
        const { updateTokens } = require('../store/slices/authSlice');
        store.dispatch(updateTokens({ accessToken: access_token, refreshToken: refresh_token }));

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);

        // Check if we're on the login page
        const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

        // Clear state
        const { clearAuth } = require('../store/slices/authSlice');
        store.dispatch(clearAuth());

        if (typeof window !== 'undefined' && !isLoginPage) {
          // Explicitly clear all potential auth storage to prevent redirect loops
          localStorage.removeItem('persist:auth');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('hakim_auth_token');
          localStorage.removeItem('hakim_access_token');
          localStorage.removeItem('hakim_refresh_token');

          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Default error logging
    console.error('Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });

    return Promise.reject(error);
  }
);

export default apiClient;

