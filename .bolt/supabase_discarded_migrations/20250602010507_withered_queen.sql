-- Populate vehicle_models table with popular models
WITH manufacturer_ids AS (
  SELECT id, name FROM manufacturers
)
INSERT INTO vehicle_models (manufacturer_id, name, first_production_year, last_production_year, body_type)
SELECT 
  m.id,
  v.name,
  v.first_year,
  v.last_year,
  v.body_type::body_type
FROM manufacturer_ids m
CROSS JOIN LATERAL (
  VALUES 
    -- Toyota Models
    ('Toyota', 'Camry', 2000, NULL, 'sedan'),
    ('Toyota', 'RAV4', 2000, NULL, 'suv'),
    ('Toyota', 'Corolla', 2000, NULL, 'sedan'),
    ('Toyota', 'Highlander', 2001, NULL, 'suv'),
    ('Toyota', 'Tacoma', 2000, NULL, 'truck'),
    
    -- Honda Models
    ('Honda', 'Civic', 2000, NULL, 'sedan'),
    ('Honda', 'CR-V', 2000, NULL, 'suv'),
    ('Honda', 'Accord', 2000, NULL, 'sedan'),
    ('Honda', 'Pilot', 2003, NULL, 'suv'),
    
    -- Ford Models
    ('Ford', 'F-150', 2000, NULL, 'truck'),
    ('Ford', 'Mustang', 2000, NULL, 'coupe'),
    ('Ford', 'Explorer', 2000, NULL, 'suv'),
    ('Ford', 'Escape', 2001, NULL, 'suv'),
    
    -- BMW Models
    ('BMW', '3 Series', 2000, NULL, 'sedan'),
    ('BMW', '5 Series', 2000, NULL, 'sedan'),
    ('BMW', 'X5', 2000, NULL, 'suv'),
    ('BMW', 'M3', 2000, NULL, 'coupe'),
    
    -- Tesla Models
    ('Tesla', 'Model S', 2012, NULL, 'sedan'),
    ('Tesla', 'Model 3', 2017, NULL, 'sedan'),
    ('Tesla', 'Model X', 2015, NULL, 'suv'),
    ('Tesla', 'Model Y', 2020, NULL, 'suv')
) v(manufacturer_name, name, first_year, last_year, body_type)
WHERE m.name = v.manufacturer_name;