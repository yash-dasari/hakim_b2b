import apiClient, { BASE_URL } from '../../config/api.config';

export interface Vehicle {
    id: string;
    vehicle_id: string; // Mapped from backend ID or specific field
    make: string;
    model: string;
    year: string;
    plate_number: string;
    vin: string;
    last_service_date?: string;
    status: string; // e.g., 'Ongoing', 'Active', etc.
}

export interface VehiclesResponse {
    success: boolean;
    data: {
        vehicles: Vehicle[];
        total: number;
    };
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export interface VehicleBrand {
    brand_id: string;
    brand_name: string;
    logo_url?: string;
}

export interface VehicleModel {
    model_id: string;
    model_name: string;
}

export interface City {
    id: number;
    name: string;
    description?: string;
}

export const vehiclesAPI = {
    /**
     * Get all cities
     */
    getCities: async (): Promise<City[]> => {
        try {
            const response = await apiClient.get<any>(`${BASE_URL}/customers/v1/cities`, {
                params: {
                    is_active: true
                }
            });
            console.log('✅ Get Cities API Response (Raw):', JSON.stringify(response.data, null, 2));

            const ensureArray = (data: any) => {
                if (Array.isArray(data)) return data;
                if (data && Array.isArray(data.data)) return data.data;
                if (data && Array.isArray(data.cities)) return data.cities;
                if (data && Array.isArray(data.items)) return data.items;
                if (data && Array.isArray(data.results)) return data.results;
                return [];
            };

            const list = ensureArray(response.data);
            console.log(`🏙️ Found ${list.length} cities. First item:`, list[0]);

            if (list.length === 0) {
                console.warn('⚠️ No cities found in API response. Using Mock Data for testing.');
                return [
                    { id: 1, name: 'Dubai' },
                    { id: 2, name: 'Abu Dhabi' },
                    { id: 3, name: 'Sharjah' },
                    { id: 4, name: 'Ajman' },
                    { id: 5, name: 'Riyadh' },
                    { id: 6, name: 'Jeddah' },
                    { id: 7, name: 'Makkah' },
                    { id: 8, name: 'Madinah' }
                ];
            }

            return list.map((item: any, index: number) => {
                // Handle array of strings
                if (typeof item === 'string') {
                    return { id: index, name: item };
                }
                // Handle various object structures
                return {
                    id: item.id || item.city_id || index,
                    name: item.name || item.city_name || item.name_en || item.label || JSON.stringify(item)
                };
            });
        } catch (error: any) {
            console.error('❌ Get Cities API Error:', error.response?.data || error.message);
            return [];
        }
    },
    /**
     * Get vehicles list for a company
     * @param companyId - The ID of the company
     * @param params - Optional search and pagination parameters
     */
    getVehicles: async (companyId: string, params?: {
        search?: string;
        make?: string;
        status?: string;
        page?: number;
        per_page?: number;
    }): Promise<VehiclesResponse> => {
        try {
            console.log(`🚗 Calling Get Vehicles API for company: ${companyId}`, params);
            const response = await apiClient.get<VehiclesResponse>(`${BASE_URL}/customers/v1/companies/${companyId}/vehicles`, {
                params: params
            });

            console.log('✅ Get Vehicles API Success:', response.data);
            console.log('📊 Response structure:', {
                success: response.data.success,
                hasData: !!response.data.data,
                vehiclesCount: response.data.data?.vehicles?.length || 0
            });

            return response.data;
        } catch (error: any) {
            console.error('❌ Get Vehicles API Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Create a new vehicle
     * @param companyId - The ID of the company
     * @param data - FormData containing vehicle details and optional image
     */
    createVehicle: async (companyId: string, data: FormData): Promise<any> => {
        try {
            console.log(`🚗 Calling Create Vehicle API for company: ${companyId}`);
            // Swagger endpoint: /customers/v1/companies/{company_id}/vehicles
            const response = await apiClient.post(`${BASE_URL}/customers/v1/companies/${companyId}/vehicles`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Create Vehicle API Success:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Create Vehicle API Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Update an existing vehicle
     * @param vehicleId - The ID of the vehicle to update
     * @param data - FormData containing vehicle details and optional image
     */
    updateVehicle: async (vehicleId: string, data: FormData): Promise<any> => {
        try {
            console.log(`🚗 Calling Update Vehicle API for vehicle: ${vehicleId}`);
            // Swagger endpoint: /customers/v1/vehicles/{vehicle_id}
            const response = await apiClient.put(`${BASE_URL}/customers/v1/vehicles/${vehicleId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Update Vehicle API Success:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Update Vehicle API Error:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Delete a vehicle
     * @param vehicleId - The ID of the vehicle to delete
     */
    deleteVehicle: async (vehicleId: string): Promise<any> => {
        try {
            console.log(`🗑️ Calling Delete Vehicle API for vehicle: ${vehicleId}`);
            // Swagger endpoint: /customers/v1/vehicles/{vehicle_id}
            const response = await apiClient.delete(`${BASE_URL}/customers/v1/vehicles/${vehicleId}`);

            console.log('✅ Delete Vehicle API Success:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Delete Vehicle API Error:', error.response?.data || error.message);
            throw error;
        }
    },

    getBrands: async (): Promise<VehicleBrand[]> => {
        try {
            const response = await apiClient.get<any>(`${BASE_URL}/customers/v1/cars/brands`);
            console.log('✅ Get Brands API Response:', response.data);

            // Helper to ensure we get an array
            const ensureArray = (data: any) => {
                if (Array.isArray(data)) return data;
                if (data && Array.isArray(data.data)) return data.data;
                if (data && Array.isArray(data.brands)) return data.brands;
                return [];
            };

            return ensureArray(response.data);
        } catch (error: any) {
            console.error('❌ Get Brands API Error:', error.response?.data || error.message);
            return [];
        }
    },

    getModels: async (brandId: string): Promise<VehicleModel[]> => {
        try {
            const response = await apiClient.get<any>(`${BASE_URL}/customers/v1/cars/models`, {
                params: { brand_id: brandId }
            });
            console.log(`✅ Get Models API Response for ${brandId}:`, response.data);

            const ensureArray = (data: any) => {
                if (Array.isArray(data)) return data;
                if (data && Array.isArray(data.data)) return data.data;
                if (data && Array.isArray(data.models)) return data.models;
                return [];
            };

            return ensureArray(response.data);
        } catch (error: any) {
            console.error('❌ Get Models API Error:', error.response?.data || error.message);
            return [];
        }
    },

    /**
     * Download vehicle upload template
     * @param companyId - The ID of the company
     */
    downloadTemplate: async (companyId: string): Promise<Blob> => {
        try {
            console.log(`📥 Downloading template for company: ${companyId}`);
            const response = await apiClient.get(`${BASE_URL}/customers/v1/companies/${companyId}/vehicles/template`, {
                responseType: 'blob'
            });

            console.log('✅ Download Template API Success');
            return response.data;
        } catch (error: any) {
            console.error('❌ Download Template API Error:', error.response?.data || error.message);
            throw error;
        }
    }
};
