import apiClient from '../../config/api.config';

export interface ServiceProvider {
  provider_id: string;
  name: string;
  description: string;
  logo_url: string;
  is_active: boolean;
  logo_signed_url: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvidersResponse {
  success: boolean;
  data: {
    providers: ServiceProvider[];
    total: number;
  };
  error: any;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export const serviceProvidersAPI = {
  /**
   * Get all service providers
   * @returns ServiceProvidersResponse
   */
  getServiceProviders: async (): Promise<ServiceProvidersResponse> => {
    try {
      console.log('🏢 Calling Get Service Providers API');
      console.log('🌐 Full API URL:', `${apiClient.defaults.baseURL}service-providers/service-providers`);
      
      const response = await apiClient.get<ServiceProvidersResponse>('/customers/v1/service-providers/service-providers');
      
      console.log('✅ Service Providers API Success:', response.data);
      console.log('📊 Response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasProviders: !!response.data.data?.providers,
        providersCount: response.data.data?.providers?.length || 0,
        total: response.data.data?.total
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Service Providers API Error:', error.response?.data || error.message);
      console.error('❌ Full error object:', error);
      throw error;
    }
  },
};
