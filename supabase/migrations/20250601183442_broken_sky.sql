-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT,
  role TEXT NOT NULL CHECK (role IN ('car-owner', 'service-provider')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create cars table
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  base_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  business_name TEXT,
  description TEXT,
  services UUID[] NOT NULL, -- Array of service IDs
  service_radius INTEGER NOT NULL, -- in miles/kilometers
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_owner_id UUID NOT NULL REFERENCES public.profiles(id),
  provider_id UUID REFERENCES public.service_providers(id),
  car_id UUID NOT NULL REFERENCES public.cars(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Cars policies
CREATE POLICY "Cars are viewable by their owners"
ON public.cars FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own cars"
ON public.cars FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own cars"
ON public.cars FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own cars"
ON public.cars FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Services policies
CREATE POLICY "Services are viewable by authenticated users"
ON public.services FOR SELECT
TO authenticated
USING (true);

-- Service providers policies
CREATE POLICY "Service providers are viewable by authenticated users"
ON public.service_providers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own provider profile"
ON public.service_providers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Providers can update their own profile"
ON public.service_providers FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service requests policies
CREATE POLICY "Users can view their own requests or assigned requests"
ON public.service_requests FOR SELECT
TO authenticated
USING (
  car_owner_id = auth.uid() OR 
  auth.uid() = (SELECT user_id FROM public.service_providers WHERE id = provider_id)
);

CREATE POLICY "Car owners can create service requests"
ON public.service_requests FOR INSERT
TO authenticated
WITH CHECK (car_owner_id = auth.uid());

CREATE POLICY "Relevant users can update service requests"
ON public.service_requests FOR UPDATE
TO authenticated
USING (
  car_owner_id = auth.uid() OR
  auth.uid() = (SELECT user_id FROM public.service_providers WHERE id = provider_id)
)
WITH CHECK (
  car_owner_id = auth.uid() OR
  auth.uid() = (SELECT user_id FROM public.service_providers WHERE id = provider_id)
);

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();