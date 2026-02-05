import Cookies from 'js-cookie';
import { mockDataHelpers } from '../data/mockData';

// Ensure we're using the correct backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = Cookies.get('hakim_auth_token') || null;
    }
  }

  async login(email: string, password: string, role: 'ADMIN' | 'STAFF' | 'CUSTOMER'): Promise<LoginResponse> {
    try {
      console.log('Attempting login with mock data:', { email, role });
      
      // Mock authentication - check credentials
      const mockUser = mockDataHelpers.findUserByEmail(email);
      
      if (!mockUser) {
        throw new Error('User not found');
      }

      // Check if user role matches requested role
      if (mockUser.role !== role) {
        throw new Error('You do not have permission to access this area');
      }

      // Mock password validation - accept specific credentials
      const validCredentials = email === 'sandeep@suqesayarath.com' && password === '123456789';
      const validStaffCredentials = email === 'staff1@hakim.com' && password === '123456789';
      const validCustomerCredentials = email === 'customer1@example.com' && password === '123456789';
      const validCustomer2Credentials = email === 'customer2@example.com' && password === '123456789';

      if (!validCredentials && !validStaffCredentials && !validCustomerCredentials && !validCustomer2Credentials) {
        throw new Error('Invalid email or password');
      }

      // Generate mock token
      const mockToken = `mock_token_${mockUser.id}_${Date.now()}`;
      
      const loginResponse: LoginResponse = {
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role
        }
      };

      console.log('Mock login successful:', loginResponse);

      if (loginResponse.access_token) {
        this.token = loginResponse.access_token;
        // Set cookie with 7 days expiration
        Cookies.set('hakim_auth_token', loginResponse.access_token, { expires: 7 });
        
        // Store user data in cookies only (Redux will handle state management)
        if (role === 'ADMIN') {
          // Store admin data in cookies
          Cookies.set('admin_user', JSON.stringify(loginResponse.user), { expires: 7 });
        } else {
          // Store customer data in cookies
          Cookies.set('user', JSON.stringify(loginResponse.user), { expires: 7 });
        }
        
        console.log('✅ Auth: Tokens stored in cookies, Redux will manage state');
      }

      return loginResponse;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  logout() {
    this.token = null;
    Cookies.remove('hakim_auth_token');
    Cookies.remove('admin_user');
    Cookies.remove('user');
    console.log('✅ Auth: Logout complete, cookies cleared');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService(); 