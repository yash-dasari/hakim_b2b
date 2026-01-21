export interface IraqiGovernorate {
  code: string;
  name: string;
}

export interface LicensePlateFormat {
  governorateCode: string;
  governorateName: string;
  letter: string;
  numbers: string;
}

export const iraqiGovernorates: IraqiGovernorate[] = [
  { code: '11', name: 'Baghdad Governorate' },
  { code: '12', name: 'Nineveh Governorate' },
  { code: '13', name: 'Maysan Governorate' },
  { code: '14', name: 'Basra Governorate' },
  { code: '15', name: 'Al Anbar Governorate' },
  { code: '16', name: 'Al-Qādisiyyah Governorate' },
  { code: '17', name: 'Muthanna Governorate' },
  { code: '18', name: 'Babil Governorate' },
  { code: '19', name: 'Karbala Governorate' },
  { code: '20', name: 'Diyala Governorate' },
  { code: '21', name: 'Sulaymaniyah Governorate' },
  { code: '22', name: 'Erbil Governorate' },
  { code: '23', name: 'Halabja Governorate' },
  { code: '24', name: 'Duhok Governorate' },
  { code: '25', name: 'Kirkuk Governorate' },
  { code: '26', name: 'Saladin Governorate' },
  { code: '27', name: 'Dhi Qar Governorate' },
  { code: '28', name: 'Najaf Governorate' },
  { code: '29', name: 'Wasit Governorate' },
];

export const licensePlateLetters = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// License plate colors based on vehicle type (based on Iraqi standards)
export const getLicensePlateColor = (vehicleType: string): string => {
  switch (vehicleType) {
    case 'Sedan':
    case 'SUV':
    case 'Luxury':
    case 'Sports Car':
    case 'Hybrid':
    case 'Electric':
      return '#ffffff'; // White background for private vehicles
    case 'Truck':
      return '#ffeb3b'; // Yellow background for commercial vehicles
    case 'Van':
      return '#ff9800'; // Orange background for vans/minibuses
    default:
      return '#ffffff'; // Default white
  }
};

// Function to format license plate as GG X ####
export const formatLicensePlate = (governorateCode: string, letter: string, numbers: string): string => {
  return `${governorateCode} ${letter} ${numbers}`;
};

// Function to parse license plate from GG X #### format
export const parseLicensePlate = (licensePlate: string): LicensePlateFormat | null => {
  const match = licensePlate.match(/^(\d{2})\s+([A-Z])\s+(\d{1,4})$/);
  if (match) {
    return {
      governorateCode: match[1],
      governorateName: iraqiGovernorates.find(g => g.code === match[1])?.name || '',
      letter: match[2],
      numbers: match[3]
    };
  }
  return null;
}; 