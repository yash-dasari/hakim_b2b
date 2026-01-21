import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Custom hook to access authentication data from Redux store
 * 
 * This replaces the old pattern of reading from localStorage:
 * ❌ OLD: const token = localStorage.getItem('adminToken');
 * ❌ OLD: const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
 * 
 * ✅ NEW: const { user, accessToken, isAuthenticated } = useAuth();
 * 
 * @example
 * ```tsx
 * import { useAuth } from '../hooks/useAuth';
 * 
 * function MyComponent() {
 *   const { user, accessToken, isAuthenticated } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Please login</div>;
 *   }
 *   
 *   return <div>Hello, {user?.firstName}</div>;
 * }
 * ```
 */
export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);
  
  return {
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
  };
}

