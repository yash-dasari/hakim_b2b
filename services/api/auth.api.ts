import apiClient from '../../config/api.config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
    scope: string;
    first_login: boolean | null;
    role: string;
  };
  error: any;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email_verified: boolean;
    full_name?: string;
    job_title?: string;
    phone?: string;
    realm_access?: {
      roles: string[];
    };
    [key: string]: any;
  };
  error: any;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export interface CompanyProfileResponse {
  success: boolean;
  data: {
    company_id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    location: {
      latitude: number;
      longitude: number;
    };
    trade_license_number: string;
    trade_license_url: string;
    trade_license_signed_url?: string;
    estimated_fleet_size: number;
    primary_vehicle_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users: Array<{
      user_id: string;
      role: string;
    }>;
    [key: string]: any;
  };
  error: any;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export const authAPI = {
  /**
   * Login API call
   * @param payload - username and password
   * @returns LoginResponse
   */
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    try {
      // Log without password for security
      const safePayload = { email: payload.email, password: '***' };
      console.log('🔐 Calling Login API:', safePayload);

      const response = await apiClient.post<LoginResponse>('/customers/v1/companies/login', payload);

      console.log('✅ Login API Success:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Login API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get Company Profile API call
   */
  getCompanyProfile: async (): Promise<CompanyProfileResponse> => {
    try {
      console.log('🏢 Calling Get Company Profile API (/companies/me)');
      const response = await apiClient.get<CompanyProfileResponse>('/customers/v1/companies/me');
      console.log('✅ Get Company Profile API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get Company Profile API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register Company API call
   * @param formData - Multipart form data including company_data and trade_license_file
   */
  registerCompany: async (formData: FormData): Promise<any> => {
    try {
      console.log('📝 Calling Register Company API');

      const response = await apiClient.post('/customers/v1/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Register Company API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Register Company API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get current user profile from /users/me
   */
  getUserProfile: async (): Promise<UserProfileResponse> => {
    try {
      console.log('👤 Calling Get User Profile API (/users/me)');
      console.log('🌐 Full User Profile URL:', `${apiClient.defaults.baseURL}customers/v1/users/me`);
      const response = await apiClient.get<UserProfileResponse>('/customers/v1/users/me');
      console.log('✅ Get User Profile API Success:', response.data);
      console.log('👤 Raw API Response Data:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('❌ Get User Profile API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout API call (if needed)
   */
  logout: async (): Promise<void> => {
    try {
      console.log('🔓 Calling Logout API');
      await apiClient.post('/auth/logout');
      console.log('✅ Logout API Success');
    } catch (error: any) {
      console.error('❌ Logout API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Legacy getProfile for backward compatibility
   */
  getProfile: async (): Promise<any> => {
    try {
      console.log('👤 Calling Get Profile API');
      const response = await apiClient.get('/auth/profile');
      console.log('✅ Get Profile API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get Profile API Error:', error.response?.data || error.message);
      throw error;
    }
  },
  /**
   * Refresh Access Token
   * @param refreshToken - The refresh token
   */
  refreshToken: async (refreshToken: string): Promise<any> => {
    try {
      console.log('🔄 Calling Refresh Token API');
      const response = await apiClient.post('/customers/v1/auth/refresh', { refresh_token: refreshToken });
      console.log('✅ Refresh Token API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Refresh Token API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update Company Information API call
   * @param companyId - The ID of the company to update
   * @param companyData - JSON string of company data
   * @param tradeLicenseFile - Optional trade license file
   */
  updateCompanyInformation: async (companyId: string, companyData: any, tradeLicenseFile?: File): Promise<any> => {
    try {
      console.log('📝 Calling Update Company Information API');
      const formData = new FormData();

      // If companyData is provided, append it
      if (companyData) {
        formData.append('company_data', JSON.stringify(companyData));
      }

      // If tradeLicenseFile is provided, append it
      if (tradeLicenseFile) {
        formData.append('trade_license_file', tradeLicenseFile);
      }

      const response = await apiClient.put(`/customers/v1/companies/${companyId}/information`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Update Company Information API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update Company Information API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update Primary Contact API call
   * @param companyId - The ID of the company
   * @param contactData - The contact data (full_name, job_title, email, phone)
   */
  updatePrimaryContact: async (companyId: string, contactData: any): Promise<any> => {
    try {
      console.log('👤 Calling Update Primary Contact API');
      const response = await apiClient.put(`/customers/v1/companies/${companyId}/primary-contact`, contactData);
      console.log('✅ Update Primary Contact API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update Primary Contact API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Change Password API call
   * @param companyId - The ID of the company
   * @param newPassword - The new password
   */
  changePassword: async (companyId: string, newPassword: string): Promise<any> => {
    try {
      console.log('🔐 Calling Change Password API');
      const response = await apiClient.post(`/customers/v1/companies/${companyId}/change-password`, {
        new_password: newPassword
      });
      console.log('✅ Change Password API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Change Password API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get Primary Contact Me API call
   * Fetches the primary contact details for the current user/company
   */
  getPrimaryContactMe: async (): Promise<any> => {
    try {
      console.log('👤 Calling Get Primary Contact Me API');
      const response = await apiClient.get('/customers/v1/companies/primary-contact/me');
      console.log('✅ Get Primary Contact Me API Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get Primary Contact Me API Error:', error.response?.data || error.message);
      throw error;
    }
  },
};

