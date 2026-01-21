import axios from 'axios';
import Cookies from 'js-cookie';
import { mockDataHelpers, mockVehicles, MockVehicle } from '../data/mockData';
import { VehicleType } from '../types/vehicle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Re-export VehicleType for backward compatibility
export { VehicleType };

export interface Vehicle {
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

export interface CreateVehicleDto {
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  vinImage?: string;
}

export const vehiclesApi = {
  async getVehicles(): Promise<Vehicle[]> {
    console.log('Getting vehicles from mock data');
    
    // Get current user from localStorage (only available in browser)
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }
    
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Return vehicles for the current user
    const userVehicles = mockDataHelpers.getVehiclesByUserId(user.id);
    console.log('Found vehicles for user:', userVehicles);
    
    return userVehicles.map(vehicle => ({
      id: vehicle.id,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      vinImage: vehicle.vinImage,
      userId: vehicle.userId,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    }));
  },

  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    console.log('Creating vehicle with mock data:', data);
    
    // Get current user from localStorage (only available in browser)
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }
    
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Create new vehicle
    const newVehicle: MockVehicle = {
      id: `vehicle_${Date.now()}`,
      type: data.type,
      make: data.make,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
      vin: data.vin,
      vinImage: data.vinImage,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock data (in a real app, this would be persisted)
    mockVehicles.push(newVehicle);
    
    console.log('Created vehicle:', newVehicle);
    
    return {
      id: newVehicle.id,
      type: newVehicle.type,
      make: newVehicle.make,
      model: newVehicle.model,
      year: newVehicle.year,
      licensePlate: newVehicle.licensePlate,
      vin: newVehicle.vin,
      vinImage: newVehicle.vinImage,
      userId: newVehicle.userId,
      createdAt: newVehicle.createdAt,
      updatedAt: newVehicle.updatedAt
    };
  },

  async updateVehicle(id: string, data: CreateVehicleDto): Promise<Vehicle> {
    console.log('Updating vehicle with mock data:', { id, data });
    
    // Get current user from localStorage (only available in browser)
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }
    
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Find and update vehicle
    const vehicleIndex = mockVehicles.findIndex(v => v.id === id && v.userId === user.id);
    if (vehicleIndex === -1) {
      throw new Error('Vehicle not found');
    }
    
    const updatedVehicle: MockVehicle = {
      ...mockVehicles[vehicleIndex],
      type: data.type,
      make: data.make,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
      vin: data.vin,
      vinImage: data.vinImage,
      updatedAt: new Date().toISOString()
    };
    
    mockVehicles[vehicleIndex] = updatedVehicle;
    
    console.log('Updated vehicle:', updatedVehicle);
    
    return {
      id: updatedVehicle.id,
      type: updatedVehicle.type,
      make: updatedVehicle.make,
      model: updatedVehicle.model,
      year: updatedVehicle.year,
      licensePlate: updatedVehicle.licensePlate,
      vin: updatedVehicle.vin,
      vinImage: updatedVehicle.vinImage,
      userId: updatedVehicle.userId,
      createdAt: updatedVehicle.createdAt,
      updatedAt: updatedVehicle.updatedAt
    };
  },

  async deleteVehicle(id: string): Promise<void> {
    console.log('Deleting vehicle with mock data:', id);
    
    // Get current user from localStorage (only available in browser)
    if (typeof window === 'undefined') {
      throw new Error('This function can only be called on the client side');
    }
    
    const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
    if (!userStr) {
      throw new Error('No authentication token found');
    }
    
    const user = JSON.parse(userStr);
    
    // Find and remove vehicle
    const vehicleIndex = mockVehicles.findIndex(v => v.id === id && v.userId === user.id);
    if (vehicleIndex === -1) {
      throw new Error('Vehicle not found');
    }
    
    mockVehicles.splice(vehicleIndex, 1);
    
    console.log('Deleted vehicle:', id);
  },
}; 