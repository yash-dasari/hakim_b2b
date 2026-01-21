import apiClient from '../../config/api.config';

export interface ServiceCategory {
    category_id: string;
    name: string;
    description: string;
    icon_url: string;
    icon_signed_url: string;
}

export interface ServiceCategoriesResponse {
    success: boolean;
    data: ServiceCategory[];
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export interface NearbyServiceCenterPayload {
    latitude: number;
    longitude: number;
    category_id?: string;
}

export interface QuotationPayload {
    booking_ids: string[];
}

export interface QuotationTotalResponse {
    success: boolean;
    data: {
        booking_id: string;
        reference_id: string;
        service_type_title: string;
        overall_status: string;
        current_step: string;
        created_at: string;
        updated_at: string;

        // Prices
        service_price: string;
        transportation_cost: string;
        total_amount: string;
        base_price?: string; // from user request context, though not top level in JSON usually it's in service_catalog
        price_mode: string;

        // Nested Objects
        vehicle: {
            make: string;
            model: string;
            year: number;
            color: string;
            license_plate: string;
            [key: string]: any;
        };
        service_catalog: {
            name: string;
            description_structured: any[];
            warranty_info: string;
            [key: string]: any;
        };

        // Other fields
        [key: string]: any;
    };
    error: any;
    meta: any;
}

export const servicesAPI = {
    /**
     * Get all service categories
     * @returns ServiceCategoriesResponse
     */
    getServiceCategories: async (): Promise<ServiceCategoriesResponse> => {
        const response = await apiClient.get<ServiceCategoriesResponse>('/customers/v1/service-categories');
        return response.data;
    },

    /**
     * Get services by category ID
     * @param categoryId - The ID of the category to filter by
     * @returns ServiceResponse
     */
    getServices: async (categoryId: string): Promise<ServiceResponse> => {
        const response = await apiClient.get<ServiceResponse>('/customers/v1/service-catalog', {
            params: { category_id: categoryId }
        });
        return response.data;
    },

    /**
     * Get nearby service centers
     * @param payload - NearbyServiceCenterPayload
     * @returns ServiceResponse
     */
    getNearbyServiceCenters: async (payload: NearbyServiceCenterPayload): Promise<ServiceResponse> => {
        const response = await apiClient.post<ServiceResponse>('/customers/v1/nearby-service-centers', payload);
        return response.data;
    },

    /**
     * Create batch bookings
     * @param payload - BatchBookingPayload
     * @returns Promise<any>
     */
    createBatchBooking: async (payload: BatchBookingPayload): Promise<any> => {
        // User requested path: /bookings/v1/bookings/batch
        // Verify if we need to prepend /customers or use absolute path if apiClient adds base.
        // Assuming apiClient adds BASE_URL. If the user provided path is absolute related to domain, we might need adjustment.
        // However, standard consistency suggests using the client.
        const response = await apiClient.post('/bookings/v1/bookings/batch', payload);
        return response.data;
    },

    /**
     * Get batch bookings list
     * @param companyId - The company ID to filter by
     * @returns Promise<BookingListResponse>
     */
    getBatchBookingsList: async (companyId: string): Promise<BookingListResponse> => {
        const response = await apiClient.get<BookingListResponse>('/bookings/v1/bookings/batch/list', {
            params: { company_id: companyId }
        });
        return response.data;
    },

    /**
     * Get quotation total for specific bookings
     * @param payload - QuotationPayload
     * @returns Promise<QuotationTotalResponse>
     */
    getQuotationTotal: async (payload: QuotationPayload): Promise<QuotationTotalResponse> => {
        const response = await apiClient.post<QuotationTotalResponse>('/bookings/v1/bookings/batch/quotations-total', payload);
        return response.data;
    },

    /**
     * Approve quotations
     * @param payload - { booking_ids: string[] }
     * @returns Promise<any>
     */
    approveQuotations: async (payload: { booking_ids: string[] }): Promise<any> => {
        const response = await apiClient.post('/bookings/v1/bookings/batch/approve-quotations', payload);
        return response.data;
    },

    /**
     * Reject quotations
     * @param payload - { booking_ids: string[], reason?: string }
     * @returns Promise<any>
     */
    rejectQuotations: async (payload: { booking_ids: string[], reason?: string }): Promise<any> => {
        const response = await apiClient.post('/bookings/v1/bookings/batch/reject-quotations', payload);
        return response.data;
    },

    /**
     * Get body check photos
     * @param payload - { booking_ids: string[], company_id: string }
     * @returns Promise<any>
     */
    getBodyCheckPhotos: async (payload: { booking_ids: string[], company_id: string }): Promise<any> => {
        const params = {
            ...payload,
            booking_ids: payload.booking_ids.join(',')
        };
        const response = await apiClient.get('/bookings/v1/bookings/batch/body-check/photos', {
            params: params
        });
        return response.data;
    },

    /**
     * Review body check photos (Approve/Reject)
     * @param payload - { booking_ids: string[], action: 'approve_all' | 'reject_all' }
     * @returns Promise<any>
     */
    reviewBodyCheckPhotos: async (payload: { booking_ids: string[], action: 'approve_all' | 'reject_all' }): Promise<any> => {
        const response = await apiClient.post('/bookings/v1/bookings/batch/body-check/approve', payload);
        return response.data;
    },

    /**
     * Get quotations list
     * @param payload - { booking_id?: string, status?: string, page?: number, page_size?: number }
     * @returns Promise<any>
     */
    getQuotations: async (payload: { booking_id?: string, status?: string, page?: number, page_size?: number }): Promise<any> => {
        const response = await apiClient.get('/bookings/v1/quotations', {
            params: payload
        });
        return response.data;
    },

    /**
     * Get body check photos for service center booking
     * @param booking_id
     */
    getServiceCenterBodyCheckPhotos: async (booking_id: string): Promise<any> => {
        const response = await apiClient.get(`/bookings/v1/bookings/${booking_id}/service-center/body-check-photos`);
        return response.data;
    },

    /**
     * Respond to body check photos (Approve/Reject)
     * @param booking_id
     * @param payload - { photo_approvals: Array<{ action: 'approve'|'reject', photo_id: string, rejection_reason?: string }> }
     */
    respondToBodyCheckPhotos: async (booking_id: string, payload: { photo_approvals: any[] }): Promise<any> => {
        const response = await apiClient.post(`/bookings/v1/bookings/${booking_id}/customer/approve-body-check-photos`, payload);
        return response.data;
    },

    /**
     * Notify arrival at service center
     * @param booking_id
     */
    customerArrivedAtServiceCenter: async (booking_id: string): Promise<any> => {
        const response = await apiClient.post(`/bookings/v1/bookings/${booking_id}/customer-arrived-at-service-center`);
        return response.data;
    }
};

export interface BookingRequestItem {
    vehicle_id: string;
    service_catalog_id: string;
    booking_type: string; // 'scheduled'
    scheduled_at: string;
    pickup_coordinates?: {
        latitude: number;
        longitude: number;
    };
    dropoff_coordinates?: {
        latitude: number;
        longitude: number;
    };
    pickup_address?: string;
    dropoff_address?: string;
    notes?: string;
    service_provider_id: string;
    routing_option?: string; // 'hakim_valet', 'hakim_van' etc
    service_center_id?: string;
    scheduled_type?: string | null;
}

export interface BatchBookingPayload {
    company_id: string;
    bookings: BookingRequestItem[];
}

export interface ServiceProviderInfo {
    provider_id: string;
    name: string;
    description: string;
    logo_url: string;
    logo_signed_url: string;
}

export interface Service {
    service_catalog_id: string;
    category_id: string;
    name: string;
    description_structured: any[];
    base_price: string;
    warranty_info: string;
    schedule: string[];
    service_provider: string[];
    service_providers_info: ServiceProviderInfo[];
    service_location: string[];
    pricing_attributes: string[];
    icon_url: string;
    icon_signed_url: string;
}

export interface ServiceResponse {
    success: boolean;
    data: Service[];
    error: any;
    meta: any;
}

export interface BookingListItem {
    booking_id: string;
    reference_id: string;
    plate_number: string;
    vehicle: string; // e.g. "uuid year"
    service_type: string; // e.g. "Service Centre", "Hakim Van"
    category: string; // e.g. "Brake Services"
    service_cost: string; // e.g. "Pending"
    status: string; // e.g. "Pending Price Estimation"
    time: string; // e.g. "7m ago"
    scheduled_at: string;
}

export interface BookingListResponse {
    success: boolean;
    data: {
        total_bookings: number;
        active_requests: number;
        completed_requests: number;
        bookings: BookingListItem[];
        page: number;
        page_size: number;
        total_pages: number;
    };
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}
