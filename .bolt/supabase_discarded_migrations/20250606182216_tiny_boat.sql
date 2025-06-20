/*
  # Fix Service Provider Registration Issues

  1. Database Schema Updates
    - Fix RLS policies for profiles and service_providers tables
    - Ensure proper permissions for registration flow
    - Add better error handling

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to create profiles
    - Add policies for service providers to create their records
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;

DROP POLICY IF EXISTS "Enable insert for service providers" ON service_providers;
DROP POLICY IF EXISTS "Enable read for service providers" ON service_providers;
DROP POLICY IF EXISTS "Enable update for service providers" ON service_providers;

-- Profiles table policies
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read basic profile info of others (for service discovery)
CREATE POLICY "Authenticated users can read public profile info"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'service-provider');

-- Service providers table policies
CREATE POLICY "Service providers can insert their own record"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service providers can read their own record"
  ON service_providers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service providers can update their own record"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read all service provider records (for discovery)
CREATE POLICY "Authenticated users can read service provider records"
  ON service_providers
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Add some default services if they don't exist
INSERT INTO services (name, description, category, duration, base_price) VALUES
  ('Oil Change Service', 'Complete oil change with high-quality synthetic oil', 'maintenance', 45, 69.99),
  ('Tire Rotation', 'Professional tire rotation for even wear', 'tires', 30, 49.99),
  ('Battery Replacement', 'Quick and reliable battery replacement', 'electrical', 40, 129.99),
  ('Interior Detailing', 'Comprehensive interior cleaning and detailing', 'cleaning', 90, 89.99),
  ('Exterior Wash', 'Professional exterior wash and dry', 'cleaning', 30, 39.99),
  ('Engine Oil Check', 'Check engine oil level and condition', 'maintenance', 15, 19.99),
  ('Tire Pressure Check', 'Check and adjust tire pressure', 'tires', 15, 15.99),
  ('Belt Inspection', 'Inspect belts for wear and proper tension', 'maintenance', 20, 29.99)
ON CONFLICT (name) DO NOTHING;