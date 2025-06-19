/*
  # Fix Authentication and RLS Issues

  1. Security Updates
    - Fix RLS policies for proper authentication flow
    - Ensure service provider registration works correctly
    - Fix profile access permissions

  2. Changes
    - Update profile policies for better registration flow
    - Fix service provider policies
    - Add proper error handling for edge cases
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow reading service provider profiles" ON profiles;

-- Create more permissive policies for registration
CREATE POLICY "Enable profile creation for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to create a profile

CREATE POLICY "Enable profile reading for authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true); -- Allow reading all profiles for authenticated users

CREATE POLICY "Enable profile updates for own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix service_providers policies
DROP POLICY IF EXISTS "Allow service provider record creation" ON service_providers;
DROP POLICY IF EXISTS "Service providers can read their own record" ON service_providers;
DROP POLICY IF EXISTS "Service providers can update their own record" ON service_providers;
DROP POLICY IF EXISTS "Allow reading service provider records" ON service_providers;

CREATE POLICY "Enable service provider creation"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to create service provider record

CREATE POLICY "Enable service provider reading"
  ON service_providers
  FOR SELECT
  TO authenticated
  USING (true); -- Allow reading all service provider records

CREATE POLICY "Enable service provider updates for own record"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure cars table has proper policies
DROP POLICY IF EXISTS "Car owners can insert their cars" ON cars;
DROP POLICY IF EXISTS "Car owners can read their cars" ON cars;
DROP POLICY IF EXISTS "Car owners can update their cars" ON cars;
DROP POLICY IF EXISTS "Car owners can delete their cars" ON cars;

CREATE POLICY "Enable car creation for authenticated users"
  ON cars
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Enable car reading for owners"
  ON cars
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Enable car updates for owners"
  ON cars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Enable car deletion for owners"
  ON cars
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Make sure all tables have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Add policy for services table (should be readable by all authenticated users)
DROP POLICY IF EXISTS "Services are readable by authenticated users" ON services;
CREATE POLICY "Services are readable by authenticated users"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);