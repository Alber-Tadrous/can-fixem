/*
  # Update profiles table structure

  1. Schema Updates
    - Replace location field with separate address fields
    - Add proper constraints and defaults
    - Update existing data structure

  2. Changes
    - Drop location column
    - Add street1, street2, city, state, zip columns
    - Update role constraint to include admin role
*/

-- Add new address columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS street1 text,
ADD COLUMN IF NOT EXISTS street2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip text;

-- Drop the old location column if it exists
ALTER TABLE profiles DROP COLUMN IF EXISTS location;

-- Update role constraint to include admin
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['car-owner'::text, 'service-provider'::text, 'admin'::text]));

-- Make street1, city, state, zip required for new profiles
ALTER TABLE profiles 
ALTER COLUMN street1 SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN state SET NOT NULL,
ALTER COLUMN zip SET NOT NULL;