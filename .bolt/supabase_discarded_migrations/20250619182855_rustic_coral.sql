/*
  # Add unique constraint for service providers

  1. Changes
    - Add unique constraint on user_id in service_providers table
    - This allows proper upsert operations during registration

  2. Security
    - Ensures one service provider record per user
    - Prevents duplicate service provider records
*/

-- Add unique constraint on user_id
ALTER TABLE service_providers 
ADD CONSTRAINT service_providers_user_id_unique UNIQUE (user_id);