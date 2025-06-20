-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create manufacturers table
CREATE TABLE public.manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create vehicle_models table
CREATE TABLE public.vehicle_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    first_production_year INTEGER NOT NULL,
    last_production_year INTEGER,
    body_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(manufacturer_id, name),
    CONSTRAINT valid_production_years CHECK (
        first_production_year <= EXTRACT(YEAR FROM CURRENT_DATE) AND
        (last_production_year IS NULL OR last_production_year >= first_production_year)
    )
);

-- Create model_trims table
CREATE TABLE public.model_trims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    engine_type TEXT NOT NULL,
    transmission_type TEXT NOT NULL,
    drive_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(model_id, name)
);

-- Create enum types for consistent values
CREATE TYPE body_type AS ENUM (
    'sedan', 'suv', 'coupe', 'truck', 'van', 'wagon', 'hatchback', 'convertible'
);

CREATE TYPE engine_type AS ENUM (
    'gasoline', 'diesel', 'hybrid', 'electric', 'hydrogen'
);

CREATE TYPE transmission_type AS ENUM (
    'manual', 'automatic', 'cvt', 'dual-clutch', 'single-speed'
);

CREATE TYPE drive_type AS ENUM (
    'fwd', 'rwd', 'awd', '4wd'
);

-- Add column type constraints
ALTER TABLE public.vehicle_models
    ALTER COLUMN body_type TYPE body_type USING body_type::body_type;

ALTER TABLE public.model_trims
    ALTER COLUMN engine_type TYPE engine_type USING engine_type::engine_type,
    ALTER COLUMN transmission_type TYPE transmission_type USING transmission_type::transmission_type,
    ALTER COLUMN drive_type TYPE drive_type USING drive_type::drive_type;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_manufacturers_updated_at
    BEFORE UPDATE ON manufacturers
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_vehicle_models_updated_at
    BEFORE UPDATE ON vehicle_models
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_model_trims_updated_at
    BEFORE UPDATE ON model_trims
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_manufacturers_name ON manufacturers (name);
CREATE INDEX idx_vehicle_models_manufacturer_id ON vehicle_models (manufacturer_id);
CREATE INDEX idx_vehicle_models_name ON vehicle_models (name);
CREATE INDEX idx_model_trims_model_id ON model_trims (model_id);

-- Add RLS policies
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_trims ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Manufacturers are viewable by everyone" ON manufacturers
    FOR SELECT USING (true);

CREATE POLICY "Vehicle models are viewable by everyone" ON vehicle_models
    FOR SELECT USING (true);

CREATE POLICY "Model trims are viewable by everyone" ON model_trims
    FOR SELECT USING (true);

-- Create policies for write access (restricted to authenticated users with admin role)
CREATE POLICY "Only admins can modify manufacturers" ON manufacturers
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify vehicle models" ON vehicle_models
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify model trims" ON model_trims
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );