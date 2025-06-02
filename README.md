# Can Fixem - Mobile Car Service Platform

Can Fixem is a comprehensive mobile platform that connects car owners with trusted service providers for on-demand car maintenance and repair services.

![Can Fixem Banner](https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg)

## Features

### For Car Owners
- Request on-demand car services
- Browse and book trusted service providers
- Real-time service tracking
- Secure in-app messaging
- Service history management
- Vehicle management system
- Rating and review system

### For Service Providers
- Business profile management
- Service area configuration
- Real-time job notifications
- Schedule management
- Secure payment processing
- Customer communication tools
- Performance analytics

## Technology Stack

- **Frontend Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **State Management**: React Context
- **UI Components**: Custom components with React Native
- **Icons**: Lucide React Native
- **Fonts**: Google Fonts via Expo
- **Type Safety**: TypeScript

## Architecture

### Database Schema

```
profiles
├── id (uuid, PK)
├── name (text)
├── email (text, unique)
├── phone (text, nullable)
├── location (text, nullable)
├── role (text: 'car-owner' | 'service-provider')
└── avatar_url (text, nullable)

cars
├── id (uuid, PK)
├── owner_id (uuid, FK -> profiles)
├── make (text)
├── model (text)
├── year (integer)
├── color (text)
└── license_plate (text)

services
├── id (uuid, PK)
├── name (text)
├── description (text)
├── category (text)
├── duration (integer)
└── base_price (numeric)

service_providers
├── id (uuid, PK)
├── user_id (uuid, FK -> profiles)
├── business_name (text)
├── description (text)
├── services (uuid[])
├── service_radius (integer)
├── rating (numeric)
└── is_verified (boolean)

service_requests
├── id (uuid, PK)
├── car_owner_id (uuid, FK -> profiles)
├── provider_id (uuid, FK -> service_providers)
├── car_id (uuid, FK -> cars)
├── service_id (uuid, FK -> services)
├── status (text)
├── scheduled_date (date)
├── scheduled_time (time)
├── location (text)
└── price (numeric)
```

### Directory Structure

```
can-fixem/
├── app/                    # Application routes
│   ├── (auth)/            # Authentication routes
│   └── (tabs)/            # Main tab navigation
├── components/            # Reusable components
│   ├── home/             # Home screen components
│   ├── messages/         # Messaging components
│   ├── profile/          # Profile components
│   ├── requests/         # Service request components
│   ├── services/         # Service listing components
│   └── ui/               # Common UI components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── data/                # Mock data and constants
```

## Key Components

### Authentication Flow
- Login screen with email/password
- Registration with role selection
- Password recovery
- Session management

### Home Screen
- Service category browsing
- Featured service providers
- Quick action buttons
- Location-based recommendations

### Service Management
- Service category filtering
- Detailed service information
- Pricing transparency
- Booking workflow

### Request Tracking
- Real-time status updates
- Service provider details
- Location tracking
- Communication channel

### Messaging System
- Real-time chat
- Message notifications
- Chat history
- Provider availability status

### Profile Management
- Personal information
- Vehicle management
- Service history
- Payment methods

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/can-fixem.git
```

2. Install dependencies:
```bash
cd can-fixem
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

Required environment variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Write meaningful comments
- Use consistent naming conventions

### Component Structure
- Implement proper prop typing
- Use functional components
- Follow single responsibility principle
- Maintain component reusability
- Document complex logic

### State Management
- Use React Context for global state
- Implement proper data fetching
- Handle loading and error states
- Maintain data consistency
- Optimize re-renders

### Testing
- Write unit tests for utilities
- Implement component testing
- Perform integration testing
- Conduct end-to-end testing
- Maintain test coverage

## Deployment

### Web Deployment
- Build optimization
- Environment configuration
- Static file hosting
- CDN integration

### Mobile Deployment
- App Store submission
- Play Store submission
- Version management
- OTA updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.