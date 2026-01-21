/**
 * Comprehensive logout utility
 * Clears all authentication data from localStorage, sessionStorage, and cookies
 */

import Cookies from 'js-cookie';

/**
 * List of all possible authentication keys in localStorage
 */
const LOCAL_STORAGE_KEYS = [
  'token',
  'user',
  'adminToken',
  'adminUser',
  'adminToken',
  'hakim_auth_token',
  'staffToken',
  'staffInfo',
  'refresh_token',
  'access_token'
];

/**
 * List of all possible cookie names
 */
const COOKIE_NAMES = [
  'hakim_auth_token',
  'admin_user',
  'refresh_token',
  'access_token'
];

/**
 * Clear all authentication data from localStorage
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  // Clear all known auth keys
  LOCAL_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove localStorage key: ${key}`, e);
    }
  });
  
  // Also try to clear any other auth-related keys
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('admin')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('Failed to clear additional localStorage keys', e);
  }
}

/**
 * Clear all authentication data from sessionStorage
 */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all known auth keys from sessionStorage
    LOCAL_STORAGE_KEYS.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove sessionStorage key: ${key}`, e);
      }
    });
    
    // Clear any other auth-related keys
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('user') ||
          key.toLowerCase().includes('admin')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('Failed to clear sessionStorage', e);
  }
}

/**
 * Clear all authentication cookies
 */
export function clearCookies(): void {
  if (typeof window === 'undefined') return;
  
  // Clear all known cookie names
  COOKIE_NAMES.forEach(name => {
    try {
      // Remove with js-cookie
      Cookies.remove(name);
      Cookies.remove(name, { path: '/' });
      Cookies.remove(name, { path: '/', domain: window.location.hostname });
      
      // Also try direct cookie removal for different paths
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    } catch (e) {
      console.warn(`Failed to remove cookie: ${name}`, e);
    }
  });
  
  // Clear any cookies that might contain auth data
  try {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.toLowerCase().includes('token') || 
          name.toLowerCase().includes('auth') || 
          name.toLowerCase().includes('user') ||
          name.toLowerCase().includes('admin')) {
        Cookies.remove(name);
        Cookies.remove(name, { path: '/' });
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  } catch (e) {
    console.warn('Failed to clear additional cookies', e);
  }
}

/**
 * Comprehensive logout function that clears all authentication data
 * @param redirectUrl - URL to redirect to after logout (default: '/login')
 * @param useHardRedirect - Use window.location.href instead of router.push (default: true)
 */
export function performLogout(redirectUrl: string = '/login', useHardRedirect: boolean = true): void {
  // Clear all storage types
  clearLocalStorage();
  clearSessionStorage();
  clearCookies();
  
  // Use hard redirect to prevent redirect loops
  if (useHardRedirect && typeof window !== 'undefined') {
    // Set a flag to prevent redirect loops
    sessionStorage.setItem('_logout_in_progress', 'true');
    
    // Use setTimeout to ensure storage is cleared before redirect
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 100);
  }
}

/**
 * Check if logout is in progress (to prevent redirect loops)
 */
export function isLogoutInProgress(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('_logout_in_progress') === 'true';
}

/**
 * Clear the logout in progress flag
 */
export function clearLogoutFlag(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('_logout_in_progress');
}

