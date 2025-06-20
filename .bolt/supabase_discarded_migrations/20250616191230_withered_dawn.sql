/*
  # Fix Profile Creation Issues

  1. Remove the problematic address validation trigger
  2. Update RLS policies to be more permissive for registration
  3. Ensure proper profile creation flow

  2. Changes
    - Drop the address validation trigger that's causing registration failures
    - Update profile policies to allow proper registration
    - Make address fields optional for initial registration
*/

-- Drop the problematic address validation trigger
DROP TRIGGER IF EXISTS validate_profile_address_trigger ON profiles;
DROP FUNCTION IF EXISTS validate_profile_address();

-- Make sure address fields are nullable
ALTER TABLE profiles 
ALTER COLUMN street1 DROP NOT NULL,
ALTER COLUMN street2 DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN zip DROP NOT NULL;

-- Update RLS policies to be more permissive for registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read public profile info" ON profiles;

-- Create new, more permissive policies
CREATE POLICY "Allow profile creation during registration"
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

-- Allow reading service provider profiles for discovery
CREATE POLICY "Allow reading service provider profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (role = 'service-provider');

-- Ensure service_providers table has proper policies
DROP POLICY IF EXISTS "Service providers can insert their own record" ON service_providers;
DROP POLICY IF EXISTS "Service providers can read their own record" ON service_providers;
DROP POLICY IF EXISTS "Service providers can update their own record" ON service_providers;
DROP POLICY IF EXISTS "Authenticated users can read service provider records" ON service_providers;

CREATE POLICY "Allow service provider record creation"
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

-- Allow reading all service provider records for discovery
CREATE POLICY "Allow reading service provider records"
  ON service_providers
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure cars table has proper policies
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Car owners can manage their cars" ON cars;

CREATE POLICY "Car owners can insert their cars"
  ON cars
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Car owners can read their cars"
  ON cars
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Car owners can update their cars"
  ON cars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Car owners can delete their cars"
  ON cars
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);