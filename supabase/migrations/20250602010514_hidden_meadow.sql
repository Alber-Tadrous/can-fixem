-- Populate model_trims table with specific trim levels
WITH model_ids AS (
  SELECT vm.id, vm.name, m.name as manufacturer
  FROM vehicle_models vm
  JOIN manufacturers m ON vm.manufacturer_id = m.id
)
INSERT INTO model_trims (model_id, name, engine_type, transmission_type, drive_type)
SELECT 
  m.id,
  t.trim_name,
  t.engine::engine_type,
  t.transmission::transmission_type,
  t.drive::drive_type
FROM model_ids m
CROSS JOIN LATERAL (
  VALUES 
    -- Toyota Camry Trims
    ('Camry', 'LE', 'gasoline', 'automatic', 'fwd'),
    ('Camry', 'SE', 'gasoline', 'automatic', 'fwd'),
    ('Camry', 'XLE', 'hybrid', 'cvt', 'fwd'),
    ('Camry', 'XSE', 'gasoline', 'automatic', 'fwd'),
    
    -- Honda Civic Trims
    ('Civic', 'LX', 'gasoline', 'cvt', 'fwd'),
    ('Civic', 'Sport', 'gasoline', 'manual', 'fwd'),
    ('Civic', 'EX', 'gasoline', 'cvt', 'fwd'),
    ('Civic', 'Touring', 'gasoline', 'cvt', 'fwd'),
    
    -- Ford F-150 Trims
    ('F-150', 'XL', 'gasoline', 'automatic', '4wd'),
    ('F-150', 'XLT', 'gasoline', 'automatic', '4wd'),
    ('F-150', 'Lariat', 'gasoline', 'automatic', '4wd'),
    ('F-150', 'Platinum', 'hybrid', 'automatic', '4wd'),
    
    -- BMW 3 Series Trims
    ('3 Series', '330i', 'gasoline', 'automatic', 'rwd'),
    ('3 Series', '330e', 'hybrid', 'automatic', 'rwd'),
    ('3 Series', 'M340i', 'gasoline', 'automatic', 'awd'),
    
    -- Tesla Model 3 Trims
    ('Model 3', 'Standard Range Plus', 'electric', 'single-speed', 'rwd'),
    ('Model 3', 'Long Range', 'electric', 'single-speed', 'awd'),
    ('Model 3', 'Performance', 'electric', 'single-speed', 'awd')
) t(model_name, trim_name, engine, transmission, drive)
WHERE m.name = t.model_name;