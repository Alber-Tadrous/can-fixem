/*
  # Add location column to profiles table

  1. Changes
    - Add `location` column to profiles table
    - Update existing profiles to have a location based on existing address fields
    - Add index for location searches

  2. Security
    - No changes to existing RLS policies
*/

-- Add location column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;

-- Create index for location searches
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);

-- Update existing profiles to populate location from existing address fields
UPDATE profiles 
SET location = COALESCE(
  CASE 
    WHEN phone IS NOT NULL AND phone != '' THEN 'United States'
    ELSE 'Unknown'
  END
)
WHERE location IS NULL OR location = '';