export const carMakes = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 
  'Chevrolet', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 
  'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 
  'Lincoln', 'Maserati', 'Mazda', 'Mercedes-Benz', 'MINI', 'Mitsubishi', 'Nissan', 'Porsche', 
  'Ram', 'Rolls-Royce', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

export const carModels: { [key: string]: string[] } = {
  'Toyota': ['4Runner', 'Avalon', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sienna', 'Tacoma', 'Tundra'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'HR-V', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
  'Ford': ['Bronco', 'Edge', 'Escape', 'Explorer', 'F-150', 'Mustang', 'Ranger'],
  // Add more models for other makes as needed
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
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
  }
  return years;
}