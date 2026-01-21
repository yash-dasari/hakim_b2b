import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const checkAuth = () => {
    console.log('AuthContext: Checking authentication state...');
    
    // Check for customer auth
    const customerToken = localStorage.getItem('token');
    const customerUser = localStorage.getItem('user');
    
    // Check for admin auth
    const adminToken = localStorage.getItem('hakim_auth_token') || localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    console.log('AuthContext: Tokens found:', { 
      customerToken: !!customerToken, 
      adminToken: !!adminToken,
      customerUser: !!customerUser,
      adminUser: !!adminUser
    });

    if (customerToken && customerUser) {
      try {
        const parsedUser = JSON.parse(customerUser);
        console.log('AuthContext: Customer logged in:', parsedUser.email);
        setUser(parsedUser);
        setIsLoggedIn(true);
        return;
      } catch (error) {
        console.error('AuthContext: Error parsing customer user data:', error);
      }
    }

    if (adminToken && adminUser) {
      try {
        const parsedUser = JSON.parse(adminUser);
        console.log('AuthContext: Admin logged in:', parsedUser.email);
        setUser(parsedUser);
        setIsLoggedIn(true);
        return;
      } catch (error) {
        console.error('AuthContext: Error parsing admin user data:', error);
      }
    }

    console.log('AuthContext: No user logged in');
    setUser(null);
    setIsLoggedIn(false);
  };

  const login = (token: string, userData: User) => {
    console.log('AuthContext: Logging in user:', userData.email);
    
    if (userData.role === 'ADMIN') {
      localStorage.setItem('hakim_auth_token', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hakim_auth_token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    
    setUser(null);
    setIsLoggedIn(false);
    
    // Redirect to home
    router.push('/');
  };

  useEffect(() => {
    // Check auth on mount
    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'hakim_auth_token' || e.key === 'user' || e.key === 'adminUser' || e.key === 'adminToken') {
        console.log('AuthContext: Storage changed, re-checking auth...');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for route changes
    const handleRouteChange = () => {
      console.log('AuthContext: Route changed, re-checking auth...');
      setTimeout(checkAuth, 100);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoggedIn,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 