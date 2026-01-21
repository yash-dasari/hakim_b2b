/**
 * API Helper Utilities
 * 
 * Since we removed pages/api routes, all API calls should use the external API URL.
 * Use these helpers to make API calls to the external backend.
 */

import { isNetworkError, createApiError } from './error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/service-requests' or 'service-requests')
 * @returns Full API URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Ensure API_BASE_URL doesn't have trailing slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    // Try to get token from localStorage or cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('hakim_auth_token='))
      ?.split('=')[1];
    const localToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const foundToken = cookieToken || localToken;
    
    if (foundToken) {
      headers['Authorization'] = `Bearer ${foundToken}`;
    }
  }
  
  return headers;
}

/**
 * Make a fetch request to the external API with error handling
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(endpoint);
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return response;
  } catch (error) {
    // Handle network errors
    if (isNetworkError(error)) {
      throw createApiError(error);
    }
    throw error;
  }
}

/**
 * Make a fetch request and automatically parse JSON with error handling
 */
export async function apiFetchJson<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await apiFetch(endpoint, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Request failed with status ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    // Re-throw network errors with proper formatting
    if (isNetworkError(error)) {
      throw createApiError(error);
    }
    throw error;
  }
}

