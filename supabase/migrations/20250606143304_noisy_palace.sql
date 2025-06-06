/*
  # Fix profiles table constraints

  1. Address Fields
    - Make address fields nullable initially to allow existing users
    - Add proper validation for new signups
    
  2. Role Constraints
    - Ensure role constraint includes all valid roles
*/

-- Make address fields nullable for existing users
ALTER TABLE profiles 
ALTER COLUMN street1 DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN zip DROP NOT NULL;

-- Update the role constraint to be more flexible
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['car-owner'::text, 'service-provider'::text, 'admin'::text]));

-- Add a function to validate complete address for new signups
CREATE OR REPLACE FUNCTION validate_profile_address()
RETURNS TRIGGER AS $$
BEGIN
  -- For new inserts, require complete address
  IF TG_OP = 'INSERT' THEN
    IF NEW.street1 IS NULL OR NEW.street1 = '' THEN
      RAISE EXCEPTION 'Street address is required for new profiles';
    END IF;
    IF NEW.city IS NULL OR NEW.city = '' THEN
      RAISE EXCEPTION 'City is required for new profiles';
    END IF;
    IF NEW.state IS NULL OR NEW.state = '' THEN
      RAISE EXCEPTION 'State is required for new profiles';
    END IF;
    IF NEW.zip IS NULL OR NEW.zip = '' THEN
      RAISE EXCEPTION 'ZIP code is required for new profiles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for address validation
DROP TRIGGER IF EXISTS validate_profile_address_trigger ON profiles;
CREATE TRIGGER validate_profile_address_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_profile_address();