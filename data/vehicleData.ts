import { FaCar, FaTruck, FaCarSide, FaCarAlt, FaCarBattery } from 'react-icons/fa';
import { GiCarWheel } from 'react-icons/gi';
import { MdElectricCar, MdDirectionsCar } from 'react-icons/md';
import { VehicleType } from '../types/vehicle';

export interface VehicleTypeOption {
  type: VehicleType;
  icon: any;
  label: string;
}

export interface VehicleMake {
  name: string;
  models: string[];
}

export const vehicleTypes: VehicleTypeOption[] = [
  { type: VehicleType.SEDAN, icon: FaCar, label: 'Sedan' },
  { type: VehicleType.SUV, icon: FaCarAlt, label: 'SUV' },
  { type: VehicleType.TRUCK, icon: FaTruck, label: 'Truck' },
  { type: VehicleType.VAN, icon: MdDirectionsCar, label: 'Van' },
  { type: VehicleType.SPORTS_CAR, icon: FaCarSide, label: 'Sports Car' },
  { type: VehicleType.LUXURY, icon: GiCarWheel, label: 'Luxury' },
  { type: VehicleType.HYBRID, icon: FaCarBattery, label: 'Hybrid' },
  { type: VehicleType.ELECTRIC, icon: MdElectricCar, label: 'Electric' }
];

export const vehicleMakes: Record<VehicleType, VehicleMake[]> = {
  [VehicleType.SEDAN]: [
    { name: 'Toyota', models: ['Camry', 'Corolla', 'Avalon', 'Prius'] },
    { name: 'Honda', models: ['Accord', 'Civic', 'Insight'] },
    { name: 'Nissan', models: ['Altima', 'Maxima', 'Sentra'] },
    { name: 'Hyundai', models: ['Elantra', 'Sonata', 'Accent'] },
    { name: 'Kia', models: ['Forte', 'K5', 'Rio'] }
  ],
  [VehicleType.SUV]: [
    { name: 'Toyota', models: ['RAV4', 'Highlander', '4Runner'] },
    { name: 'Honda', models: ['CR-V', 'Pilot', 'Passport'] },
    { name: 'Nissan', models: ['Rogue', 'Murano', 'Pathfinder'] },
    { name: 'Hyundai', models: ['Tucson', 'Santa Fe', 'Palisade'] },
    { name: 'Kia', models: ['Sportage', 'Sorento', 'Telluride'] }
  ],
  [VehicleType.TRUCK]: [
    { name: 'Toyota', models: ['Tacoma', 'Tundra'] },
    { name: 'Ford', models: ['F-150', 'Ranger'] },
    { name: 'Chevrolet', models: ['Silverado', 'Colorado'] },
    { name: 'Ram', models: ['1500', '2500'] },
    { name: 'GMC', models: ['Sierra', 'Canyon'] }
  ],
  [VehicleType.VAN]: [
    { name: 'Toyota', models: ['Sienna'] },
    { name: 'Honda', models: ['Odyssey'] },
    { name: 'Chrysler', models: ['Pacifica'] },
    { name: 'Kia', models: ['Carnival'] },
    { name: 'Mercedes-Benz', models: ['Sprinter'] }
  ],
  [VehicleType.SPORTS_CAR]: [
    { name: 'Toyota', models: ['Supra', '86'] },
    { name: 'Honda', models: ['Civic Type R', 'NSX'] },
    { name: 'Nissan', models: ['370Z', 'GT-R'] },
    { name: 'Chevrolet', models: ['Corvette', 'Camaro'] },
    { name: 'Ford', models: ['Mustang', 'GT'] }
  ],
  [VehicleType.LUXURY]: [
    { name: 'BMW', models: ['3 Series', '5 Series', '7 Series'] },
    { name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class'] },
    { name: 'Audi', models: ['A4', 'A6', 'A8'] },
    { name: 'Lexus', models: ['ES', 'LS', 'IS'] },
    { name: 'Genesis', models: ['G70', 'G80', 'G90'] }
  ],
  [VehicleType.HYBRID]: [
    { name: 'Toyota', models: ['Prius', 'RAV4 Hybrid', 'Camry Hybrid'] },
    { name: 'Honda', models: ['Insight', 'Accord Hybrid', 'CR-V Hybrid'] },
    { name: 'Hyundai', models: ['Ioniq', 'Sonata Hybrid', 'Tucson Hybrid'] },
    { name: 'Kia', models: ['Niro', 'Sorento Hybrid'] },
    { name: 'Ford', models: ['Escape Hybrid', 'Maverick Hybrid'] }
  ],
  [VehicleType.ELECTRIC]: [
    { name: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
    { name: 'Nissan', models: ['Leaf', 'Ariya'] },
    { name: 'Chevrolet', models: ['Bolt EV', 'Bolt EUV'] },
    { name: 'Hyundai', models: ['Kona Electric', 'Ioniq 5'] },
    { name: 'Kia', models: ['EV6', 'Niro EV'] }
  ]
}; 