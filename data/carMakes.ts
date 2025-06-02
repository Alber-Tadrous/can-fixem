export const carMakes = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 
  'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 
  'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 
  'Lincoln', 'Maserati', 'Mazda', 'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Porsche', 
  'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

export const carModels: { [key: string]: string[] } = {
  'Toyota': [
    'Avalon', 'Camry', 'Corolla', 'Crown', 'GR86', 'GR Corolla', 'GR Supra', 
    'Highlander', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza'
  ],
  'Honda': [
    'Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'
  ],
  'Ford': [
    'Bronco', 'Bronco Sport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150',
    'F-250', 'F-350', 'Maverick', 'Mustang', 'Ranger', 'Transit'
  ],
  'Chevrolet': [
    'Blazer', 'Bolt EV', 'Camaro', 'Colorado', 'Corvette', 'Equinox', 'Malibu',
    'Silverado 1500', 'Silverado 2500HD', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse'
  ],
  'BMW': [
    '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'iX',
    'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4'
  ],
  'Mercedes-Benz': [
    'A-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'EQE', 'EQS', 'G-Class',
    'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Class', 'SL'
  ],
  'Audi': [
    'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q3', 'Q4 e-tron', 'Q5',
    'Q7', 'Q8', 'R8', 'RS e-tron GT', 'RS3', 'RS5', 'RS6', 'RS7', 'S3', 'S4',
    'S5', 'S6', 'S7', 'S8', 'TT'
  ],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'Lexus': [
    'ES', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'UX'
  ],
  'Porsche': [
    '718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'
  ]
};

export function getModelsForMake(make: string): string[] {
  return carModels[make] || [];
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getYearRange(): number[] {
  const currentYear = getCurrentYear();
  const years: number[] = [];
  for (let year = currentYear + 1; year >= 1900; year--) {
    years.push(year);
  }
  return years;
}