export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  avatar_url?: string;
  role: 'car-owner' | 'service-provider';
  phone: string;
  location?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  businessName?: string;
  description?: string;
  services?: string[];
  serviceRadius?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Car {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  base_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  business_name?: string;
  description?: string;
  services: string[];
  service_radius: number;
  rating?: number;
  review_count?: number;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRequest {
  id: string;
  car_owner_id: string;
  provider_id?: string;
  car_id: string;
  service_id: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  notes?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}