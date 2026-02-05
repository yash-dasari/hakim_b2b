import { useState, useCallback } from 'react';
import { createApiError, ApiError } from '../lib/error-handler';

interface UseApiErrorReturn {
  error: ApiError | null;
  errorMessage: string | null;
  isNetworkError: boolean;
  setError: (error: unknown) => void;
  clearError: () => void;
}

/**
 * Hook for handling API errors in components
 * Automatically detects network errors and provides user-friendly messages
 */
export function useApiError(): UseApiErrorReturn {
  const [error, setErrorState] = useState<ApiError | null>(null);

  const setError = useCallback((error: unknown) => {
    const apiError = createApiError(error);
    setErrorState(apiError);
    console.error('API Error:', apiError);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error,
    errorMessage: error ? error.message : null,
    isNetworkError: error ? error.isNetworkError : false,
    setError,
    clearError,
  };
}

/**
 * Helper function to handle API errors in try-catch blocks
 */
export function handleApiError(error: unknown, onError?: (message: string, isNetwork: boolean) => void): void {
  const apiError = createApiError(error);
  
  if (onError) {
    onError(apiError.message, apiError.isNetworkError);
  } else {
    // Default behavior: log error
    console.error('API Error:', apiError);
  }
}

