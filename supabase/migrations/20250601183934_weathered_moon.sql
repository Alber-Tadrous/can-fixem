-- Add new maintenance services
INSERT INTO public.services (id, name, description, category, duration, base_price) VALUES
  -- Basic Fluid Checks & Top-offs
  (
    uuid_generate_v4(),
    'Engine Oil Check & Top-off',
    'Visual inspection and top-off of engine oil to maintain proper levels for optimal engine performance.',
    'maintenance',
    15,
    19.99
  ),
  (
    uuid_generate_v4(),
    'Coolant Check & Top-off',
    'Inspection and top-off of engine coolant to prevent overheating and maintain proper engine temperature.',
    'maintenance',
    15,
    19.99
  ),
  (
    uuid_generate_v4(),
    'Windshield Washer Fluid Service',
    'Check and refill windshield washer fluid to ensure clear visibility while driving.',
    'maintenance',
    10,
    14.99
  ),
  (
    uuid_generate_v4(),
    'Brake Fluid Check & Top-off',
    'Inspection and top-off of brake fluid to maintain proper brake system operation.',
    'maintenance',
    15,
    19.99
  ),
  (
    uuid_generate_v4(),
    'Power Steering Fluid Service',
    'Check and top-off power steering fluid to ensure smooth steering operation.',
    'maintenance',
    15,
    19.99
  ),

  -- Tire Services
  (
    uuid_generate_v4(),
    'Tire Pressure Check & Adjustment',
    'Check and adjust tire pressure to manufacturer specifications for optimal performance and safety.',
    'tires',
    20,
    24.99
  ),
  (
    uuid_generate_v4(),
    'Tire Tread Depth Inspection',
    'Professional inspection of tire tread depth and wear patterns with detailed report.',
    'tires',
    15,
    19.99
  ),

  -- Belt & Hose Inspections
  (
    uuid_generate_v4(),
    'Belt Inspection Service',
    'Comprehensive inspection of serpentine, timing, and V-belts for wear and proper tension.',
    'maintenance',
    30,
    39.99
  ),
  (
    uuid_generate_v4(),
    'Hose Inspection Service',
    'Thorough inspection of all major hoses including radiator, heater, fuel, brake, vacuum, power steering, and AC.',
    'maintenance',
    30,
    39.99
  ),

  -- Replacement Services
  (
    uuid_generate_v4(),
    'Wiper Blade Replacement',
    'Remove old wiper blades and install new ones for improved visibility in wet conditions.',
    'maintenance',
    20,
    49.99
  ),
  (
    uuid_generate_v4(),
    'Cabin Air Filter Replacement',
    'Replace cabin air filter to improve air quality inside the vehicle.',
    'maintenance',
    30,
    59.99
  ),
  (
    uuid_generate_v4(),
    'Engine Air Filter Replacement',
    'Replace engine air filter to maintain proper air flow and engine performance.',
    'maintenance',
    30,
    49.99
  ),
  (
    uuid_generate_v4(),
    'Light Bulb Replacement',
    'Replace burnt-out bulbs for headlights, taillights, or turn signals. Price per bulb.',
    'maintenance',
    20,
    29.99
  ),
  (
    uuid_generate_v4(),
    'Fuse Replacement',
    'Diagnose and replace blown fuses to restore electrical system functionality.',
    'maintenance',
    20,
    24.99
  ),

  -- Cleaning Services
  (
    uuid_generate_v4(),
    'Interior Surface Cleaning',
    'Professional cleaning of interior surfaces using appropriate cleaners and microfiber cloths.',
    'cleaning',
    60,
    79.99
  ),
  (
    uuid_generate_v4(),
    'Exterior Wash Service',
    'Complete exterior wash including wheels and windows.',
    'cleaning',
    45,
    49.99
  ),
  (
    uuid_generate_v4(),
    'Exterior Wax Service',
    'Application of protective wax coating to preserve paint and finish.',
    'cleaning',
    90,
    129.99
  ),

  -- Battery Services
  (
    uuid_generate_v4(),
    'Battery Terminal Cleaning',
    'Professional cleaning of battery terminals to ensure proper electrical connection.',
    'maintenance',
    30,
    39.99
  ),
  (
    uuid_generate_v4(),
    'Battery Jump-Start Service',
    'Jump-start service for dead batteries using professional equipment.',
    'maintenance',
    30,
    49.99
  ),
  (
    uuid_generate_v4(),
    'Battery Replacement Service',
    'Remove old battery and install new one. Battery cost not included.',
    'maintenance',
    45,
    69.99
  ),

  -- Mirror Service
  (
    uuid_generate_v4(),
    'Side Mirror Replacement',
    'Remove damaged side mirror and install replacement. Mirror cost not included.',
    'repair',
    60,
    89.99
  ),

  -- General Service
  (
    uuid_generate_v4(),
    'Custom Maintenance Service',
    'Custom maintenance service for specific needs not covered by standard services.',
    'maintenance',
    60,
    89.99
  );