import { mockDataHelpers, mockServiceRequests, MockServiceRequest } from '../data/mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ServiceRequest {
  id: string;
  serviceType: 'EMERGENCY' | 'TOW';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  description?: string;
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  make: string;
  model: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestDto {
  serviceType: 'EMERGENCY' | 'TOW';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  description?: string;
  customerName: string;
  customerPhone: string;
  vehicleType: string;
  make: string;
  model: string;
}

export const serviceRequestsApi = {
  async createServiceRequest(data: CreateServiceRequestDto): Promise<ServiceRequest> {
    console.log('Creating service request with mock data:', data);
    
    // Get current user from localStorage
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Create new service request
    const newRequest: MockServiceRequest = {
      id: `request_${Date.now()}`,
      serviceType: data.serviceType,
      location: data.location,
      description: data.description,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      vehicleType: data.vehicleType,
      make: data.make,
      model: data.model,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock data (in a real app, this would be persisted)
    mockServiceRequests.push(newRequest);
    
    console.log('Created service request:', newRequest);
    
    return {
      id: newRequest.id,
      serviceType: newRequest.serviceType,
      location: newRequest.location,
      description: newRequest.description,
      customerName: newRequest.customerName,
      customerPhone: newRequest.customerPhone,
      vehicleType: newRequest.vehicleType,
      make: newRequest.make,
      model: newRequest.model,
      status: newRequest.status,
      createdAt: newRequest.createdAt,
      updatedAt: newRequest.updatedAt
    };
  },

  async getServiceRequests(): Promise<ServiceRequest[]> {
    console.log('Getting service requests from mock data');
    
    // Get current user from localStorage
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Return service requests for the current user
    const userRequests = mockDataHelpers.getServiceRequestsByUserId(user.id);
    console.log('Found service requests for user:', userRequests);
    
    return userRequests.map(request => ({
      id: request.id,
      serviceType: request.serviceType,
      location: request.location,
      description: request.description,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      vehicleType: request.vehicleType,
      make: request.make,
      model: request.model,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    }));
  },

  async getServiceRequest(id: string): Promise<ServiceRequest> {
    console.log('Getting service request by ID from mock data:', id);
    
    // Get current user from localStorage
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Find service request
    const request = mockDataHelpers.findServiceRequestById(id);
    if (!request) {
      throw new Error('Service request not found');
    }
    
    // Check if user has access to this request (simplified check)
    const userRequests = mockDataHelpers.getServiceRequestsByUserId(user.id);
    const hasAccess = userRequests.some(r => r.id === id);
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }
    
    console.log('Found service request:', request);
    
    return {
      id: request.id,
      serviceType: request.serviceType,
      location: request.location,
      description: request.description,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      vehicleType: request.vehicleType,
      make: request.make,
      model: request.model,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  },

  async updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    console.log('Updating service request with mock data:', { id, data });
    
    // Get current user from localStorage
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Find and update service request
    const requestIndex = mockServiceRequests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      throw new Error('Service request not found');
    }
    
    // Check if user has access to this request (simplified check)
    const userRequests = mockDataHelpers.getServiceRequestsByUserId(user.id);
    const hasAccess = userRequests.some(r => r.id === id);
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }
    
    const updatedRequest: MockServiceRequest = {
      ...mockServiceRequests[requestIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockServiceRequests[requestIndex] = updatedRequest;
    
    console.log('Updated service request:', updatedRequest);
    
    return {
      id: updatedRequest.id,
      serviceType: updatedRequest.serviceType,
      location: updatedRequest.location,
      description: updatedRequest.description,
      customerName: updatedRequest.customerName,
      customerPhone: updatedRequest.customerPhone,
      vehicleType: updatedRequest.vehicleType,
      make: updatedRequest.make,
      model: updatedRequest.model,
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
      updatedAt: updatedRequest.updatedAt
    };
  }
}; 