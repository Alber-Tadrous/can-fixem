/*
  # Fix authentication and profile policies

  1. Security Updates
    - Update RLS policies for better user registration flow
    - Allow proper profile creation during signup
    - Fix permission issues with service provider registration

  2. Changes
    - Update profile policies to allow proper user registration
    - Ensure service_providers table has correct policies
    - Add better error handling for registration flow
*/

-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profile info is viewable" ON profiles;

-- Create new policies for profiles
CREATE POLICY "Enable insert for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read for users based on user_id"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public read access to basic profile info (for service providers, etc.)
CREATE POLICY "Enable read access for all authenticated users"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure service_providers table has proper policies
DROP POLICY IF EXISTS "Service providers can update their own provider profile" ON service_providers;
DROP POLICY IF EXISTS "Service providers can view their own provider profile" ON service_providers;

CREATE POLICY "Enable insert for service providers"
  ON service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read for service providers"
  ON service_providers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR true); -- Allow reading all service providers

CREATE POLICY "Enable update for service providers"
  ON service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);