/**
 * Error Handler Utility
 * 
 * Centralized error handling for API failures.
 * Detects network errors and provides user-friendly error messages.
 */

export interface ApiError {
  message: string;
  isNetworkError: boolean;
  originalError?: unknown;
}

/**
 * Check if an error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  // Check for fetch network errors
  if (error instanceof TypeError) {
    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('failed to fetch') ||
      message.includes('networkerror') ||
      message.includes('network error') ||
      message.includes('load failed') ||
      message.includes('err_network')
    );
  }

  // Check for axios network errors
  if (typeof error === 'object' && error !== null) {
    const err = error as { isAxiosError?: boolean; response?: unknown; message?: string; code?: string };
    
    // Axios network error
    if (err.isAxiosError && !err.response) {
      return true;
    }

    // Check error message
    const message = String(err.message || '').toLowerCase();
    if (
      message.includes('network error') ||
      message.includes('networkerror') ||
      message.includes('err_network') ||
      message.includes('failed to fetch') ||
      message.includes('load failed') ||
      message.includes('timeout') ||
      message.includes('enotfound') ||
      message.includes('econnrefused') ||
      message.includes('econnreset')
    ) {
      return true;
    }

    // Check error code
    const code = String((err as { code?: string }).code || '').toLowerCase();
    if (
      code === 'enotfound' ||
      code === 'econnrefused' ||
      code === 'econnreset' ||
      code === 'enetunreach' ||
      code === 'etimedout'
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get user-friendly error message from an error
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  // Check for network errors first
  if (isNetworkError(error)) {
    return 'You are currently offline. Please check your internet connection and try again.';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || 'An error occurred. Please try again.';
  }

  // Handle axios errors
  if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };

    // Try to get message from response data
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    // Try to get message from error object
    if (err.message) {
      return err.message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Create a standardized API error object
 */
export function createApiError(error: unknown): ApiError {
  const isNetwork = isNetworkError(error);
  return {
    message: getErrorMessage(error),
    isNetworkError: isNetwork,
    originalError: error,
  };
}

/**
 * Show error message to user (can be extended with toast/notification system)
 */
export function showError(error: unknown, customMessage?: string): void {
  const apiError = createApiError(error);
  const message = customMessage || apiError.message;

  // Log error for debugging
  console.error('API Error:', {
    message,
    isNetworkError: apiError.isNetworkError,
    originalError: apiError.originalError,
  });

  // You can integrate with a toast/notification library here
  // For now, we'll use alert as a fallback
  if (typeof window !== 'undefined') {
    // If there's a global notification system, use it
    // Otherwise, alert is shown as last resort
    // window.showNotification?.(message, 'error');
  }
}

