export interface VehicleMake {
  id: string;
  name: string;
  models: string[];
}

export const vehicleMakes: VehicleMake[] = [
  {
    id: 'toyota',
    name: 'Toyota',
    models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', '4Runner', 'Tacoma', 'Tundra', 'Sienna']
  },
  {
    id: 'honda',
    name: 'Honda',
    models: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline']
  },
  {
    id: 'ford',
    name: 'Ford',
    models: ['F-150', 'Explorer', 'Escape', 'Mustang', 'Edge', 'Expedition', 'Ranger', 'Bronco']
  },
  {
    id: 'bmw',
    name: 'BMW',
    models: ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'X7', 'M3', 'M5']
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'G-Class', 'CLA', 'GLA']
  },
  {
    id: 'audi',
    name: 'Audi',
    models: ['A4', 'A6', 'Q5', 'Q7', 'Q3', 'A8', 'e-tron', 'RS']
  },
  {
    id: 'lexus',
    name: 'Lexus',
    models: ['RX', 'NX', 'ES', 'IS', 'GX', 'LX', 'UX', 'LC']
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    models: ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Palisade', 'Kona', 'Venue', 'Ioniq']
  },
  {
    id: 'kia',
    name: 'Kia',
    models: ['Sportage', 'Sorento', 'Telluride', 'Forte', 'K5', 'Seltos', 'Carnival', 'EV6']
  },
  {
    id: 'nissan',
    name: 'Nissan',
    models: ['Rogue', 'Altima', 'Murano', 'Pathfinder', 'Maxima', 'Frontier', 'Titan', 'Ariya']
  }
]; 