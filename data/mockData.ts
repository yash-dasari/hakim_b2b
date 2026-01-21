import { VehicleType } from '../types/vehicle';

// Mock User Data
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  phone?: string;
  createdAt: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'sandeep@suqesayarath.com',
    firstName: 'Sandeep',
    lastName: 'Suqesayarath',
    role: 'ADMIN',
    phone: '+964-123-456-7890',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'staff1@hakim.com',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    role: 'STAFF',
    phone: '+964-123-456-7891',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    email: 'customer1@example.com',
    firstName: 'Omar',
    lastName: 'Ali',
    role: 'CUSTOMER',
    phone: '+964-123-456-7892',
    createdAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    email: 'customer2@example.com',
    firstName: 'Fatima',
    lastName: 'Mahmoud',
    role: 'CUSTOMER',
    phone: '+964-123-456-7893',
    createdAt: '2024-01-04T00:00:00Z'
  }
];

// Mock Vehicle Data
export interface MockVehicle {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  vinImage?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const mockVehicles: MockVehicle[] = [
  {
    id: '1',
    type: VehicleType.SEDAN,
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: '12345-ABC',
    vin: '1HGBH41JXMN109186',
    userId: '3',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '2',
    type: VehicleType.SUV,
    make: 'Honda',
    model: 'CR-V',
    year: 2021,
    licensePlate: '67890-DEF',
    vin: '2HGBH41JXMN109187',
    userId: '3',
    createdAt: '2024-01-06T00:00:00Z',
    updatedAt: '2024-01-06T00:00:00Z'
  },
  {
    id: '3',
    type: VehicleType.TRUCK,
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    licensePlate: '11111-GHI',
    vin: '3HGBH41JXMN109188',
    userId: '4',
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-07T00:00:00Z'
  }
];

// Mock Service Request Data
export interface MockServiceRequest {
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
  assignedStaffId?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  completionTime?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export const mockServiceRequests: MockServiceRequest[] = [
  {
    id: '1',
    serviceType: 'EMERGENCY',
    location: {
      latitude: 33.3152,
      longitude: 44.3661,
      address: 'Baghdad, Iraq - Al-Mansour District'
    },
    description: 'Engine overheating, car stopped on highway',
    customerName: 'Omar Ali',
    customerPhone: '+964-123-456-7892',
    vehicleType: 'Sedan',
    make: 'Toyota',
    model: 'Camry',
    status: 'COMPLETED',
    assignedStaffId: '2',
    estimatedArrival: '2024-01-10T10:30:00Z',
    actualArrival: '2024-01-10T10:45:00Z',
    completionTime: '2024-01-10T12:00:00Z',
    cost: 150.00,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z'
  },
  {
    id: '2',
    serviceType: 'TOW',
    location: {
      latitude: 33.3406,
      longitude: 44.4009,
      address: 'Baghdad, Iraq - Karrada District'
    },
    description: 'Flat tire, need towing to nearest garage',
    customerName: 'Fatima Mahmoud',
    customerPhone: '+964-123-456-7893',
    vehicleType: 'Truck',
    make: 'Ford',
    model: 'F-150',
    status: 'IN_PROGRESS',
    assignedStaffId: '2',
    estimatedArrival: '2024-01-15T14:00:00Z',
    actualArrival: '2024-01-15T14:15:00Z',
    createdAt: '2024-01-15T13:30:00Z',
    updatedAt: '2024-01-15T14:15:00Z'
  },
  {
    id: '3',
    serviceType: 'EMERGENCY',
    location: {
      latitude: 33.3122,
      longitude: 44.3615,
      address: 'Baghdad, Iraq - Al-Karkh District'
    },
    description: 'Battery dead, need jump start',
    customerName: 'Omar Ali',
    customerPhone: '+964-123-456-7892',
    vehicleType: 'SUV',
    make: 'Honda',
    model: 'CR-V',
    status: 'PENDING',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  }
];

// Mock Payment Data
export interface MockPayment {
  id: string;
  serviceRequestId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockPayments: MockPayment[] = [
  {
    id: '1',
    serviceRequestId: '1',
    amount: 150.00,
    currency: 'IQD',
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    transactionId: 'TXN-001',
    createdAt: '2024-01-10T12:30:00Z',
    updatedAt: '2024-01-10T12:30:00Z'
  },
  {
    id: '2',
    serviceRequestId: '2',
    amount: 200.00,
    currency: 'IQD',
    status: 'PENDING',
    paymentMethod: 'CARD',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  }
];

// Mock Staff Data
export interface MockStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'TECHNICIAN' | 'DRIVER' | 'MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'BUSY';
  location?: {
    latitude: number;
    longitude: number;
  };
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

export const mockStaff: MockStaff[] = [
  {
    id: '2',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'staff1@hakim.com',
    phone: '+964-123-456-7891',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    location: {
      latitude: 33.3152,
      longitude: 44.3661
    },
    walletBalance: 500.00,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  },
  {
    id: '5',
    firstName: 'Mohammed',
    lastName: 'Ibrahim',
    email: 'staff2@hakim.com',
    phone: '+964-123-456-7894',
    role: 'DRIVER',
    status: 'ACTIVE',
    location: {
      latitude: 33.3406,
      longitude: 44.4009
    },
    walletBalance: 300.00,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z'
  }
];

// Mock Settings Data
export interface MockSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export const mockSettings: MockSettings[] = [
  {
    id: '1',
    key: 'SERVICE_FEE_BASE',
    value: '50',
    description: 'Base service fee in IQD',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    key: 'EMERGENCY_FEE_MULTIPLIER',
    value: '2.0',
    description: 'Emergency service fee multiplier',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    key: 'TOW_FEE_PER_KM',
    value: '5',
    description: 'Towing fee per kilometer in IQD',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    key: 'COMPANY_NAME',
    value: 'Hakim Car Service',
    description: 'Company name',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    key: 'COMPANY_PHONE',
    value: '+964-1-234-5678',
    description: 'Company contact phone',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Helper functions for mock data operations
export const mockDataHelpers = {
  // User operations
  findUserByEmail: (email: string): MockUser | undefined => {
    return mockUsers.find(user => user.email === email);
  },
  
  findUserById: (id: string): MockUser | undefined => {
    return mockUsers.find(user => user.id === id);
  },

  // Vehicle operations
  getVehiclesByUserId: (userId: string): MockVehicle[] => {
    return mockVehicles.filter(vehicle => vehicle.userId === userId);
  },

  findVehicleById: (id: string): MockVehicle | undefined => {
    return mockVehicles.find(vehicle => vehicle.id === id);
  },

  // Service request operations
  getServiceRequestsByUserId: (userId: string): MockServiceRequest[] => {
    const userVehicles = mockDataHelpers.getVehiclesByUserId(userId);
    const vehicleIds = userVehicles.map(v => v.id);
    return mockServiceRequests.filter(request => 
      vehicleIds.some(vId => 
        request.make === mockVehicles.find(v => v.id === vId)?.make &&
        request.model === mockVehicles.find(v => v.id === vId)?.model
      )
    );
  },

  findServiceRequestById: (id: string): MockServiceRequest | undefined => {
    return mockServiceRequests.find(request => request.id === id);
  },

  // Staff operations
  findStaffById: (id: string): MockStaff | undefined => {
    return mockStaff.find(staff => staff.id === id);
  },

  getActiveStaff: (): MockStaff[] => {
    return mockStaff.filter(staff => staff.status === 'ACTIVE');
  },

  // Payment operations
  getPaymentsByServiceRequestId: (serviceRequestId: string): MockPayment[] => {
    return mockPayments.filter(payment => payment.serviceRequestId === serviceRequestId);
  },

  // Settings operations
  getSettingByKey: (key: string): MockSettings | undefined => {
    return mockSettings.find(setting => setting.key === key);
  }
};
