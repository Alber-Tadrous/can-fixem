/*
  # Fix RLS policies for profiles table

  1. Security Updates
    - Update profiles table RLS policies to allow signup
    - Add proper policies for profile creation and management
    - Ensure users can create and manage their own profiles

  2. Changes
    - Add policy for profile creation during signup
    - Update existing policies for better security
    - Add policy for users to read their own profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies for profiles table
CREATE POLICY "Users can insert their own profile during signup" ON profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service providers to be viewed by car owners (for browsing)
CREATE POLICY "Service providers are viewable by authenticated users" ON profiles
  FOR SELECT 
  TO authenticated
  USING (role = 'service-provider');

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );