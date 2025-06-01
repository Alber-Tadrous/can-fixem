-- Insert maintenance services
INSERT INTO public.services (name, description, category, duration, base_price) VALUES
-- Fluid Checks & Top-offs
('Engine Oil Check & Top-off', 'Visual inspection and top-off of engine oil level using appropriate grade oil', 'maintenance', 15, 19.99),
('Coolant Check & Top-off', 'Inspection and top-off of coolant level with correct antifreeze mixture', 'maintenance', 15, 19.99),
('Windshield Washer Fluid Top-off', 'Refill windshield washer fluid reservoir', 'maintenance', 10, 14.99),
('Brake Fluid Check & Top-off', 'Inspection and top-off of brake fluid level using DOT-specified fluid', 'maintenance', 15, 19.99),
('Power Steering Fluid Check & Top-off', 'Check and replenish power steering fluid level', 'maintenance', 15, 19.99),

-- Tire Services
('Tire Pressure Check', 'Check and adjust tire pressure to manufacturer specifications', 'tires', 15, 19.99),
('Tire Tread Depth Check', 'Measure and assess tire tread depth for safety and wear', 'tires', 15, 19.99),
('Tire Rotation', 'Rotate tires to ensure even wear and extended life', 'tires', 45, 49.99),

-- Inspection Services
('Belt Inspection', 'Visual inspection of serpentine, timing, and V-belts for wear and tension', 'inspection', 20, 29.99),
('Hose Inspection', 'Comprehensive inspection of all major hoses including radiator, heater, fuel, brake, and AC', 'inspection', 25, 34.99),

-- Replacement Services
('Windshield Wiper Blade Replacement', 'Remove old wiper blades and install new ones', 'maintenance', 20, 39.99),
('Cabin Air Filter Replacement', 'Replace cabin air filter to improve air quality', 'maintenance', 30, 49.99),
('Engine Air Filter Replacement', 'Replace engine air filter to maintain engine performance', 'maintenance', 25, 44.99),
('Light Bulb Replacement', 'Replace faulty light bulbs (headlights, taillights, turn signals)', 'maintenance', 30, 39.99),
('Fuse Replacement', 'Replace blown fuses to restore electrical functionality', 'maintenance', 20, 24.99),
('Oil Change Service', 'Complete oil and filter change using high-quality synthetic oil', 'maintenance', 45, 69.99),
('Spark Plug Replacement', 'Replace spark plugs to maintain engine performance', 'maintenance', 60, 89.99),

-- Cleaning Services
('Interior Cleaning', 'Thorough interior cleaning including vacuum and surface cleaning', 'cleaning', 60, 79.99),
('Exterior Wash', 'Complete exterior wash including wheels and windows', 'cleaning', 45, 49.99),
('Exterior Waxing', 'Apply protective wax coating to maintain paint finish', 'cleaning', 90, 129.99),

-- Battery Services
('Battery Terminal Cleaning', 'Clean and protect battery terminals from corrosion', 'maintenance', 30, 34.99),
('Battery Jump Start', 'Jump start vehicle with dead battery', 'maintenance', 30, 49.99),
('Battery Replacement', 'Replace old battery with new one', 'maintenance', 45, 159.99),

-- Mirror Service
('Side Mirror Replacement', 'Replace damaged side mirror including necessary adjustments', 'repair', 60, 199.99),

-- General Service
('Custom Service', 'Custom maintenance or repair service as needed', 'other', 60, 89.99);