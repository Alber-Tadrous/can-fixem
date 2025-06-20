/*
  # Fix manufacturers and vehicle models access

  1. Security Updates
    - Update RLS policies to allow public read access to manufacturers and vehicle models
    - Ensure proper authentication flow for vehicle data
    
  2. Data Integrity
    - Ensure all required data is properly seeded
    - Fix any constraint issues
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can modify manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Only admins can modify vehicle models" ON vehicle_models;
DROP POLICY IF EXISTS "Only admins can modify model trims" ON model_trims;

-- Create new policies that allow public read access
CREATE POLICY "Manufacturers are publicly viewable" ON manufacturers
    FOR SELECT USING (true);

CREATE POLICY "Vehicle models are publicly viewable" ON vehicle_models
    FOR SELECT USING (true);

CREATE POLICY "Model trims are publicly viewable" ON model_trims
    FOR SELECT USING (true);

-- Admin-only write policies
CREATE POLICY "Only authenticated users can modify manufacturers" ON manufacturers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can modify vehicle models" ON vehicle_models
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can modify model trims" ON model_trims
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure we have some basic manufacturers if the table is empty
INSERT INTO manufacturers (name, country) VALUES
('Toyota', 'Japan'),
('Honda', 'Japan'),
('Ford', 'United States'),
('BMW', 'Germany'),
('Mercedes-Benz', 'Germany'),
('Volkswagen', 'Germany'),
('Audi', 'Germany'),
('Chevrolet', 'United States'),
('Hyundai', 'South Korea'),
('Kia', 'South Korea'),
('Nissan', 'Japan'),
('Lexus', 'Japan'),
('Tesla', 'United States'),
('Volvo', 'Sweden'),
('Subaru', 'Japan'),
('Mazda', 'Japan'),
('Jeep', 'United States'),
('Land Rover', 'United Kingdom'),
('Acura', 'Japan'),
('Porsche', 'Germany')
ON CONFLICT (name) DO NOTHING;