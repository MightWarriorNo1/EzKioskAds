-- Migration to fix kiosk data mismatch
-- This script will replace existing kiosks with the ones that match the frontend

-- First, delete existing kiosks (this will cascade delete any kiosk_campaigns)
DELETE FROM kiosks;

-- Insert the correct kiosks that match the frontend mock data
INSERT INTO kiosks (id, name, location, address, city, state, traffic_level, base_rate, price, coordinates, description) VALUES
('a1b2c3d4-e5f6-4789-abcd-ef1234567890', 'Murrieta Town Center', 'Murrieta Town Center', '123 Main St, Murrieta, CA 92562', 'Murrieta', 'CA', 'high', 90.00, 90.00, '{"lat": 33.5689, "lng": -117.1865}', 'High-traffic location in the heart of Murrieta'),
('b2c3d4e5-f6a7-4801-bcde-f23456789012', 'California Oaks Shopping Center', 'California Oaks Shopping Center', '456 California Oaks Rd, Murrieta, CA 92562', 'Murrieta', 'CA', 'medium', 50.00, 50.00, '{"lat": 33.5721, "lng": -117.1892}', 'Popular shopping destination with steady foot traffic'),
('c3d4e5f6-a7b8-4012-cdef-345678901234', 'North Jeffe Plaza', 'North Jeffe Plaza', '789 North Jeffe St, Murrieta, CA 92562', 'Murrieta', 'CA', 'low', 40.00, 40.00, '{"lat": 33.5750, "lng": -117.1920}', 'Affordable option in growing neighborhood'),
('d4e5f6a7-b8c9-4123-defa-456789012345', 'Murrieta Hot Springs', 'Murrieta Hot Springs', '321 Hot Springs Blvd, Murrieta, CA 92562', 'Murrieta', 'CA', 'high', 90.00, 90.00, '{"lat": 33.5660, "lng": -117.1840}', 'Premium location near popular attractions'),
('e5f6a7b8-c9d0-4234-efab-567890123456', 'Murrieta Valley Plaza', 'Murrieta Valley Plaza', '654 Valley Blvd, Murrieta, CA 92562', 'Murrieta', 'CA', 'medium', 50.00, 50.00, '{"lat": 33.5700, "lng": -117.1880}', 'Well-established retail area with good visibility');

-- Refresh the schema cache (force PostgREST to reload)
NOTIFY pgrst, 'reload schema';
