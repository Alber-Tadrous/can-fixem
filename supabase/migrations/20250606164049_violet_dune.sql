/*
  # Fix profiles table RLS policies

  1. Security Updates
    - Drop existing restrictive policies
    - Add proper policies for profile access
    - Allow users to read their own profiles
    - Allow authenticated users to read public profile data
    - Allow users to insert their own profiles during registration

  2. Changes
    - Remove overly restrictive policies
    - Add INSERT policy for registration
    - Update SELECT policies for better access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to insert their own profile during registration
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public read access to basic profile info (for service providers, etc.)
CREATE POLICY "Public profile info is viewable"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);