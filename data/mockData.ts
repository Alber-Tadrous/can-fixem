// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'car-owner' | 'service-provider';
  phone: string;
  location: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  duration: number;
  startingPrice: number;
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  distance: number;
  verified: boolean;
}

export interface Request {
  id: string;
  serviceType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
  date: string;
  time: string;
  provider?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Mock Data
export const ServiceCategory = {
  All: 'all',
  Maintenance: 'maintenance',
  Repair: 'repair',
  Cleaning: 'cleaning',
  Tires: 'tires',
  Inspection: 'inspection',
};

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Oil Change',
    description: 'Complete oil change service using high-quality synthetic oil for optimal engine performance.',
    category: 'maintenance',
    image: 'https://images.pexels.com/photos/5534614/pexels-photo-5534614.jpeg',
    duration: 45,
    startingPrice: 69.99,
  },
  {
    id: '2',
    name: 'Tire Rotation',
    description: 'Professional tire rotation service to ensure even wear and extended tire life.',
    category: 'tires',
    image: 'https://images.pexels.com/photos/6977931/pexels-photo-6977931.jpeg',
    duration: 30,
    startingPrice: 49.99,
  },
  {
    id: '3',
    name: 'Mobile Car Wash',
    description: 'Comprehensive car wash service that comes to your location for convenience.',
    category: 'cleaning',
    image: 'https://images.pexels.com/photos/5762255/pexels-photo-5762255.jpeg',
    duration: 60,
    startingPrice: 59.99,
  },
  {
    id: '4',
    name: 'Battery Replacement',
    description: 'Quick and reliable battery replacement service with quality batteries.',
    category: 'repair',
    image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
    duration: 40,
    startingPrice: 129.99,
  },
  {
    id: '5',
    name: 'Pre-Purchase Inspection',
    description: 'Thorough inspection of a vehicle before purchase to identify any potential issues.',
    category: 'inspection',
    image: 'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg',
    duration: 90,
    startingPrice: 149.99,
  },
];

export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    rating: 4.8,
    reviewCount: 124,
    specialties: ['Oil Change', 'Brake Service', 'Tune-Up'],
    distance: 2.4,
    verified: true,
  },
  {
    id: '2',
    name: 'Sarah Williams',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    rating: 4.9,
    reviewCount: 87,
    specialties: ['Tire Service', 'Battery Replacement'],
    distance: 3.7,
    verified: true,
  },
  {
    id: '3',
    name: 'David Martinez',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    rating: 4.6,
    reviewCount: 56,
    specialties: ['Mobile Car Wash', 'Interior Cleaning'],
    distance: 1.9,
    verified: false,
  },
  {
    id: '4',
    name: 'Emily Chen',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    rating: 4.7,
    reviewCount: 92,
    specialties: ['Diagnostics', 'Electrical Systems', 'Oil Change'],
    distance: 4.2,
    verified: true,
  },
];

export const mockRequests: Request[] = [
  {
    id: '1',
    serviceType: 'Oil Change',
    status: 'confirmed',
    date: 'May 15, 2025',
    time: '10:30 AM',
    provider: {
      id: '1',
      name: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    },
  },
  {
    id: '2',
    serviceType: 'Tire Rotation',
    status: 'pending',
    date: 'May 20, 2025',
    time: '2:00 PM',
  },
  {
    id: '3',
    serviceType: 'Mobile Car Wash',
    status: 'completed',
    date: 'May 10, 2025',
    time: '11:00 AM',
    provider: {
      id: '3',
      name: 'David Martinez',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    },
  },
  {
    id: '4',
    serviceType: 'Battery Replacement',
    status: 'in-progress',
    date: 'May 17, 2025',
    time: '9:15 AM',
    provider: {
      id: '4',
      name: 'Emily Chen',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    },
  },
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: {
      id: '1',
      name: 'Mike Johnson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      online: true,
    },
    lastMessage: 'I\'ll be at your location in about 15 minutes.',
    lastMessageTime: '10:32 AM',
    unreadCount: 2,
  },
  {
    id: '2',
    participant: {
      id: '3',
      name: 'David Martinez',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      online: false,
    },
    lastMessage: 'Thanks for the payment! Your car is all clean now.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: '3',
    participant: {
      id: '2',
      name: 'Sarah Williams',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
      online: true,
    },
    lastMessage: 'Would you like to confirm the appointment for tomorrow?',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
  },
];