-- Seed: Properties
INSERT INTO properties (name, address, property_type, bedrooms, bathrooms, max_guests, base_nightly_rate, square_footage, year_built, listing_urls, property_manager, emergency_contact, insurance_provider, policy_number, annual_premium, str_license_number, license_expiry, business_license)
VALUES ('Cozy Downtown Retreat', '742 Broadway, Nashville, TN 37203', 'Condo', 2, 1, 4, 120.00, 850, 2018, 'https://airbnb.com/rooms/12345678, https://vrbo.com/2345678', 'Sarah Mitchell', '615-555-0199', 'State Farm Insurance', 'HO-2025-88421', 2400.00, 'STR-NSH-2025-4821', '2026-12-31', 'BL-TN-2024-09912');

INSERT INTO properties (name, address, property_type, bedrooms, bathrooms, max_guests, base_nightly_rate, square_footage, year_built, listing_urls, property_manager, emergency_contact, insurance_provider, policy_number, annual_premium, str_license_number, license_expiry, business_license)
VALUES ('Lakeside Cottage', '15 Lakeshore Drive, South Lake Tahoe, CA 96150', 'Cottage', 3, 2, 6, 180.00, 1400, 2005, 'https://airbnb.com/rooms/87654321', 'David Harrison', '530-555-0177', 'Allstate Insurance', 'COT-2025-33190', 3100.00, 'STR-SLT-2025-7734', '2027-03-15', 'BL-CA-2024-15567');

-- Seed: Bookings (50 realistic entries across 2024-2025)
INSERT INTO bookings (guest_name, check_in, check_out, guests, platform, nightly_rate, cleaning_fee, airbnb_fee, pet_fee, other_fee, airbnb_payout, rating, has_pet, has_damage, has_review, review_notes, status) VALUES
('Emma Wilson', '2024-01-05', '2024-01-09', 2, 'Airbnb', 90, 75, 28, 0, 0, 407, 5.0, 0, 0, 1, 'Amazing place, very clean!', 'completed'),
('James Chen', '2024-01-15', '2024-01-20', 3, 'Airbnb', 95, 75, 35, 0, 0, 510, 4.8, 0, 0, 1, 'Great location, would return', 'completed'),
('Sophie Martin', '2024-02-01', '2024-02-04', 2, 'VRBO', 88, 65, 22, 0, 0, 307, 5.0, 0, 0, 1, 'Perfect weekend getaway', 'completed'),
('Lucas Brown', '2024-02-14', '2024-02-17', 2, 'Airbnb', 110, 75, 30, 0, 0, 375, 4.5, 0, 0, 1, 'Good but noisy neighbors', 'completed'),
('Olivia Davis', '2024-03-01', '2024-03-07', 4, 'Airbnb', 120, 85, 55, 25, 0, 775, 4.9, 1, 0, 1, 'Dog-friendly, loved it', 'completed'),
('Noah Garcia', '2024-03-15', '2024-03-18', 2, 'Airbnb', 120, 75, 30, 0, 0, 405, 4.7, 0, 0, 1, 'Clean and comfortable', 'completed'),
('Ava Rodriguez', '2024-04-01', '2024-04-05', 3, 'VRBO', 115, 75, 38, 0, 0, 497, 5.0, 0, 0, 1, 'Best Airbnb experience ever', 'completed'),
('Liam Martinez', '2024-04-12', '2024-04-14', 2, 'Airbnb', 120, 75, 25, 0, 0, 310, 4.6, 0, 0, 1, 'Nice place, short stay', 'completed'),
('Isabella Anderson', '2024-05-01', '2024-05-08', 2, 'Airbnb', 120, 85, 65, 0, 0, 925, 4.8, 0, 0, 1, 'Week-long retreat, loved it', 'completed'),
('Mason Thompson', '2024-05-15', '2024-05-19', 4, 'Airbnb', 130, 85, 45, 30, 0, 615, 4.4, 1, 1, 1, 'Pet caused minor scratch on floor', 'completed'),
('Mia White', '2024-06-01', '2024-06-07', 2, 'Airbnb', 168, 95, 80, 0, 0, 1023, 5.0, 0, 0, 1, 'Summer vibes, perfect!', 'completed'),
('Ethan Harris', '2024-06-15', '2024-06-20', 3, 'VRBO', 168, 95, 65, 0, 0, 870, 4.9, 0, 0, 1, 'Great summer spot', 'completed'),
('Charlotte Clark', '2024-07-01', '2024-07-10', 4, 'Airbnb', 168, 95, 120, 0, 0, 1487, 4.7, 0, 0, 1, 'Long summer stay', 'completed'),
('Alexander Lewis', '2024-07-15', '2024-07-19', 2, 'Airbnb', 168, 95, 55, 0, 0, 712, 4.8, 0, 0, 1, 'Great AC for summer', 'completed'),
('Amelia Walker', '2024-08-01', '2024-08-05', 3, 'Airbnb', 168, 95, 55, 25, 0, 737, 5.0, 1, 0, 1, 'Cat was welcome, wonderful', 'completed'),
('Benjamin Hall', '2024-08-12', '2024-08-18', 2, 'Airbnb', 168, 95, 75, 0, 0, 1028, 4.6, 0, 0, 1, 'Good value for summer', 'completed'),
('Harper Allen', '2024-09-01', '2024-09-04', 2, 'VRBO', 132, 85, 32, 0, 0, 449, 4.9, 0, 0, 1, 'Fall colors were beautiful', 'completed'),
('Daniel Young', '2024-09-15', '2024-09-20', 3, 'Airbnb', 132, 85, 55, 0, 0, 690, 4.7, 0, 0, 1, 'Great autumn getaway', 'completed'),
('Evelyn King', '2024-10-01', '2024-10-05', 2, 'Airbnb', 132, 85, 45, 0, 0, 568, 5.0, 0, 0, 1, 'October was magical here', 'completed'),
('Henry Wright', '2024-10-20', '2024-10-24', 4, 'Airbnb', 132, 85, 45, 0, 0, 568, 4.5, 0, 0, 1, 'Good, a bit cold at night', 'completed'),
('Scarlett Lopez', '2024-11-01', '2024-11-04', 2, 'Airbnb', 90, 75, 22, 0, 0, 323, 4.8, 0, 0, 1, 'Cozy off-season stay', 'completed'),
('Sebastian Hill', '2024-11-15', '2024-11-18', 2, 'VRBO', 90, 75, 22, 0, 0, 323, 4.6, 0, 0, 1, 'Quiet neighborhood', 'completed'),
('Grace Green', '2024-12-01', '2024-12-05', 3, 'Airbnb', 90, 75, 30, 0, 0, 395, 4.9, 0, 0, 1, 'Pre-holiday escape', 'completed'),
('Jack Adams', '2024-12-23', '2024-12-28', 4, 'Airbnb', 216, 95, 85, 0, 0, 1090, 5.0, 0, 0, 1, 'Christmas was magical!', 'completed'),
('Chloe Baker', '2024-12-29', '2025-01-02', 2, 'Airbnb', 216, 95, 70, 0, 0, 889, 4.8, 0, 0, 1, 'NYE downtown was amazing', 'completed'),
('William Nelson', '2025-01-10', '2025-01-14', 2, 'Airbnb', 90, 75, 28, 0, 0, 407, 4.7, 0, 0, 1, 'Nice winter retreat', 'completed'),
('Ella Carter', '2025-01-25', '2025-01-30', 3, 'VRBO', 90, 75, 35, 0, 0, 490, 5.0, 0, 0, 1, 'Loved the snow view', 'completed'),
('Michael Mitchell', '2025-02-08', '2025-02-12', 2, 'Airbnb', 90, 75, 28, 0, 0, 407, 4.5, 0, 0, 1, 'Valentines trip, romantic', 'completed'),
('Aria Roberts', '2025-02-20', '2025-02-23', 2, 'Airbnb', 90, 75, 22, 0, 0, 323, 4.8, 0, 0, 1, 'Short but sweet', 'completed'),
('Logan Turner', '2025-03-05', '2025-03-10', 4, 'Airbnb', 120, 85, 48, 25, 0, 662, 4.6, 1, 0, 1, 'Brought our pup, great', 'completed'),
('Layla Phillips', '2025-03-18', '2025-03-22', 2, 'Airbnb', 120, 75, 38, 0, 0, 517, 4.9, 0, 0, 1, 'Spring is lovely here', 'completed'),
('Aiden Campbell', '2025-04-01', '2025-04-06', 3, 'VRBO', 120, 85, 50, 0, 0, 635, 5.0, 0, 0, 1, 'Excellent host', 'completed'),
('Zoe Parker', '2025-04-15', '2025-04-18', 2, 'Airbnb', 120, 75, 30, 0, 0, 405, 4.7, 0, 0, 1, 'Easy check-in', 'completed'),
('Matthew Evans', '2025-05-01', '2025-05-07', 2, 'Airbnb', 120, 85, 55, 0, 0, 750, 4.8, 0, 0, 1, 'May flowers everywhere', 'completed'),
('Lily Edwards', '2025-05-16', '2025-05-19', 3, 'Airbnb', 130, 75, 35, 0, 0, 430, 5.0, 0, 0, 0, NULL, 'completed'),
('Jackson Collins', '2025-06-01', '2025-06-08', 4, 'Airbnb', 168, 95, 90, 30, 0, 1211, 4.9, 1, 0, 1, 'Summer kickoff!', 'completed'),
('Penelope Stewart', '2025-06-15', '2025-06-20', 2, 'VRBO', 168, 95, 65, 0, 0, 870, NULL, 0, 0, 0, NULL, 'completed'),
('Luke Sanchez', '2025-07-01', '2025-07-05', 3, 'Airbnb', 168, 95, 55, 0, 0, 712, NULL, 0, 0, 0, NULL, 'confirmed'),
('Hannah Morris', '2025-07-12', '2025-07-18', 2, 'Airbnb', 168, 95, 75, 0, 0, 1028, NULL, 0, 0, 0, NULL, 'confirmed'),
('Owen Rogers', '2025-07-25', '2025-07-28', 4, 'Airbnb', 168, 95, 40, 25, 0, 564, NULL, 1, 0, 0, NULL, 'pending'),
('Riley Cook', '2025-08-02', '2025-08-09', 2, 'Airbnb', 168, 95, 90, 0, 0, 1271, NULL, 0, 0, 0, NULL, 'pending'),
('Thomas Bergeron', '2025-08-15', '2025-08-20', 2, 'Direct', 155, 0, 0, 0, 0, 775, NULL, 0, 0, 0, NULL, 'confirmed'),
('Sarah Mitchell', '2025-09-01', '2025-09-05', 3, 'Booking.com', 140, 85, 50, 0, 0, 595, NULL, 0, 0, 0, NULL, 'confirmed'),
('Kevin O''Brien', '2025-09-12', '2025-09-15', 2, 'Direct', 145, 0, 0, 0, 0, 435, NULL, 0, 0, 0, NULL, 'pending'),
('Rachel Kim', '2025-10-05', '2025-10-10', 3, 'Airbnb', 135, 85, 52, 0, 0, 708, 4.9, 0, 0, 1, 'Fall colours were stunning', 'completed'),
('Thomas Baker', '2025-11-20', '2025-11-25', 2, 'VRBO', 120, 75, 40, 0, 0, 635, 4.7, 0, 0, 1, 'Cozy November stay', 'completed'),
('Emma Fournier', '2025-12-22', '2025-12-28', 4, 'Airbnb', 185, 95, 85, 0, 0, 1120, 5.0, 0, 0, 1, 'Perfect holiday retreat', 'completed'),
('Daniel Martinez', '2026-01-10', '2026-01-15', 2, 'Booking.com', 110, 75, 35, 0, 0, 590, 4.8, 0, 0, 1, 'Great winter getaway', 'completed'),
('Sophie Tremblay', '2026-01-25', '2026-01-30', 3, 'Airbnb', 115, 85, 42, 0, 0, 618, 4.6, 0, 0, 1, 'Loved the neighbourhood', 'completed'),
('James Wilson', '2026-02-14', '2026-02-18', 2, 'Direct', 125, 0, 0, 0, 0, 500, 5.0, 0, 0, 1, 'Valentine getaway', 'completed'),
('Olivia Chen', '2026-02-28', '2026-03-04', 2, 'Airbnb', 120, 85, 38, 0, 0, 527, 4.9, 0, 0, 1, 'Clean and comfortable', 'completed'),
('Lucas Gagnon', '2026-03-15', '2026-03-20', 4, 'VRBO', 130, 85, 55, 30, 0, 710, 4.8, 1, 0, 1, 'Dog-friendly was key', 'completed'),
('Mia Johnson', '2026-03-28', '2026-04-02', 2, 'Airbnb', 140, 85, 55, 0, 0, 730, 4.7, 0, 0, 1, 'Sugar shack season!', 'completed'),
('Nathan Roy', '2026-04-10', '2026-04-15', 3, 'Airbnb', 135, 85, 48, 0, 0, 712, 5.0, 0, 0, 1, 'Springtime in Nashville', 'completed'),
('Chloe Dubois', '2026-04-22', '2026-04-26', 2, 'Booking.com', 130, 75, 38, 0, 0, 557, 4.8, 0, 0, 1, 'Convenient location', 'completed'),
('Ethan Lawrence', '2026-05-01', '2026-05-05', 2, 'Airbnb', 150, 85, 50, 0, 0, 635, 4.9, 0, 0, 1, 'May in Nashville is beautiful', 'completed'),
('Isabella Martin', '2026-05-10', '2026-05-14', 3, 'VRBO', 155, 85, 52, 0, 0, 653, 5.0, 0, 0, 1, 'Everything was perfect', 'completed'),
('William Bergeron', '2026-05-18', '2026-05-22', 2, 'Direct', 145, 0, 0, 0, 0, 580, 4.8, 0, 0, 1, 'Great host communication', 'completed'),
('Ava Pelletier', '2026-05-24', '2026-05-28', 4, 'Airbnb', 160, 95, 58, 30, 0, 707, NULL, 1, 0, 0, NULL, 'confirmed'),
('Liam Côté', '2026-06-05', '2026-06-12', 3, 'Airbnb', 175, 95, 85, 0, 0, 1135, NULL, 0, 0, 0, NULL, 'confirmed'),
('Charlotte Morin', '2026-06-20', '2026-06-25', 2, 'VRBO', 175, 85, 60, 0, 0, 900, NULL, 0, 0, 0, NULL, 'confirmed'),
('Noah Gauthier', '2026-07-01', '2026-07-08', 4, 'Airbnb', 190, 95, 100, 0, 0, 1325, NULL, 0, 0, 0, NULL, 'confirmed');

-- Seed: Bookings for Property 2 (Lakeside Cottage)
INSERT INTO bookings (property_id, guest_name, check_in, check_out, guests, platform, nightly_rate, cleaning_fee, airbnb_fee, pet_fee, other_fee, airbnb_payout, rating, has_pet, has_damage, has_review, review_notes, status) VALUES
(2, 'Marc Lefebvre', '2024-06-15', '2024-06-22', 4, 'Airbnb', 220, 120, 110, 0, 0, 1570, 5.0, 0, 0, 1, 'Incredible lake views!', 'completed'),
(2, 'Julia Hernandez', '2024-07-01', '2024-07-08', 6, 'VRBO', 250, 120, 130, 0, 0, 1740, 4.8, 0, 0, 1, 'Perfect family vacation', 'completed'),
(2, 'David Kim', '2024-07-15', '2024-07-20', 4, 'Airbnb', 250, 120, 95, 30, 0, 1405, 4.9, 1, 0, 1, 'Dog loved the lake', 'completed'),
(2, 'Anne-Marie Roy', '2024-08-01', '2024-08-10', 5, 'Direct', 230, 0, 0, 0, 0, 2070, 5.0, 0, 0, 1, 'Best cottage ever', 'completed'),
(2, 'Robert Zhang', '2024-08-20', '2024-08-25', 4, 'Airbnb', 250, 120, 100, 0, 0, 1370, 4.7, 0, 0, 1, 'Beautiful setting', 'completed'),
(2, 'Laura Tremblay', '2024-09-15', '2024-09-22', 3, 'Airbnb', 200, 120, 100, 0, 0, 1420, 4.9, 0, 0, 1, 'Fall colours amazing', 'completed'),
(2, 'Chris Patterson', '2024-12-26', '2025-01-02', 6, 'Airbnb', 320, 150, 170, 0, 0, 2220, 5.0, 0, 0, 1, 'Magical winter retreat', 'completed'),
(2, 'Nathalie Gagnon', '2025-02-14', '2025-02-17', 2, 'Direct', 180, 0, 0, 0, 0, 540, 4.8, 0, 0, 1, 'Romantic getaway', 'completed'),
(2, 'Steve Murray', '2025-05-20', '2025-05-25', 4, 'Airbnb', 200, 120, 80, 0, 0, 1040, 4.9, 0, 0, 0, NULL, 'completed'),
(2, 'Isabelle Mercier', '2025-06-20', '2025-06-28', 5, 'VRBO', 250, 120, 140, 0, 0, 1980, NULL, 0, 0, 0, NULL, 'confirmed'),
(2, 'Paul Anderson', '2025-07-10', '2025-07-17', 6, 'Airbnb', 280, 150, 150, 30, 0, 2000, NULL, 1, 0, 0, NULL, 'confirmed'),
(2, 'Catherine Bouchard', '2025-08-01', '2025-08-08', 4, 'Direct', 240, 0, 0, 0, 0, 1680, NULL, 0, 0, 0, NULL, 'pending'),
(2, 'Michel Bélanger', '2025-12-20', '2025-12-27', 5, 'Airbnb', 310, 150, 160, 0, 0, 2160, 5.0, 0, 0, 1, 'Magical winter', 'completed'),
(2, 'Sarah Thompson', '2026-01-15', '2026-01-20', 4, 'VRBO', 170, 120, 60, 0, 0, 910, 4.7, 0, 0, 1, 'Snowy paradise', 'completed'),
(2, 'Pierre Lachance', '2026-02-20', '2026-02-24', 2, 'Direct', 165, 0, 0, 0, 0, 660, 4.9, 0, 0, 1, 'Ski weekend', 'completed'),
(2, 'Jennifer Walsh', '2026-03-10', '2026-03-15', 4, 'Airbnb', 180, 120, 65, 0, 0, 955, 4.8, 0, 0, 1, 'Spring break', 'completed'),
(2, 'François Lemieux', '2026-04-18', '2026-04-23', 3, 'Airbnb', 200, 120, 70, 30, 0, 1080, 5.0, 1, 0, 1, 'Dog loved it', 'completed'),
(2, 'Amy Richards', '2026-05-08', '2026-05-12', 4, 'VRBO', 210, 120, 65, 0, 0, 895, 4.9, 0, 0, 1, 'Lake was gorgeous', 'completed'),
(2, 'Marc-André Dupont', '2026-05-20', '2026-05-25', 6, 'Airbnb', 230, 150, 85, 0, 0, 1215, NULL, 0, 0, 0, NULL, 'confirmed'),
(2, 'Lisa Chen-Murray', '2026-06-10', '2026-06-17', 5, 'Airbnb', 260, 150, 130, 0, 0, 1840, NULL, 0, 0, 0, NULL, 'confirmed'),
(2, 'Robert Paradis', '2026-07-05', '2026-07-12', 6, 'Direct', 280, 0, 0, 0, 0, 1960, NULL, 0, 0, 0, NULL, 'confirmed');

-- Seed: Expenses
INSERT INTO expenses (date, description, amount, category, notes, is_recurring, recurrence) VALUES
('2024-01-01', 'Hydro/Electricity', 85, 'Utilities', 'Monthly hydro', 1, 'monthly'),
('2024-01-01', 'Internet', 65, 'Utilities', 'Fiber plan', 1, 'monthly'),
('2024-01-01', 'Gas', 120, 'Utilities', 'Winter heating', 1, 'monthly'),
('2024-01-01', 'Water/Sewer', 45, 'Utilities', 'Municipal water', 1, 'monthly'),
('2024-01-15', 'Professional Cleaning', 150, 'Cleaning', 'Per turnover cleaning', 0, NULL),
('2024-02-01', 'Professional Cleaning', 150, 'Cleaning', NULL, 0, NULL),
('2024-02-15', 'Cleaning Supplies', 85, 'Cleaning', 'Restocked all supplies', 0, NULL),
('2024-03-01', 'Professional Cleaning', 300, 'Cleaning', 'Two turnovers', 0, NULL),
('2024-03-10', 'Plumbing Repair', 280, 'Maintenance', 'Bathroom faucet leak', 0, NULL),
('2024-04-01', 'Professional Cleaning', 300, 'Cleaning', 'Two turnovers', 0, NULL),
('2024-04-15', 'HVAC Service', 195, 'Maintenance', 'Spring tune-up', 0, NULL),
('2024-05-01', 'Professional Cleaning', 300, 'Cleaning', 'Two turnovers', 0, NULL),
('2024-05-10', 'Lawn Service', 120, 'Maintenance', 'Spring cleanup', 0, NULL),
('2024-06-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2024-06-15', 'Linens/Towels', 340, 'Supplies', 'New summer set', 0, NULL),
('2024-07-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2024-07-20', 'Photography', 250, 'Marketing', 'Updated listing photos', 0, NULL),
('2024-08-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2024-09-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2024-09-15', 'Electrical Work', 350, 'Maintenance', 'New smart lock install', 0, NULL),
('2024-10-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2024-10-20', 'HVAC Service', 195, 'Maintenance', 'Fall tune-up', 0, NULL),
('2024-11-01', 'Professional Cleaning', 150, 'Cleaning', NULL, 0, NULL),
('2024-12-01', 'Professional Cleaning', 300, 'Cleaning', 'Deep holiday clean', 0, NULL),
('2024-01-01', 'Property Insurance', 1800, 'Insurance', 'Annual premium', 1, 'annual'),
('2024-01-01', 'Property Tax', 3200, 'Tax', 'Annual property tax', 1, 'annual'),
('2024-06-01', 'Toiletries/Consumables', 180, 'Supplies', 'Half-year restock', 0, NULL),
('2024-01-01', 'STR License', 150, 'Tax', 'Annual permit', 1, 'annual'),
('2024-01-01', 'Airbnb Host Service Fee', 50, 'Platform Fees', 'Monthly avg', 1, 'monthly'),
('2025-01-01', 'Professional Cleaning', 150, 'Cleaning', NULL, 0, NULL),
('2025-02-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2025-03-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2025-04-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2025-05-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2025-06-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2025-03-15', 'General Maintenance', 165, 'Maintenance', 'Door hinge + touch-up paint', 0, NULL),
('2025-04-10', 'Welcome Gifts', 95, 'Supplies', 'Local chocolates', 0, NULL),
('2026-01-01', 'Property Insurance — 2026', 1800, 'Insurance', 'Annual renewal', 1, 'annual'),
('2026-01-01', 'Hydro/Electricity — Jan', 95, 'Utilities', NULL, 1, 'monthly'),
('2026-02-01', 'Hydro/Electricity — Feb', 105, 'Utilities', NULL, 1, 'monthly'),
('2026-03-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2026-03-15', 'Minor Repairs', 120, 'Maintenance', 'Bathroom caulking', 0, NULL),
('2026-04-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2026-04-15', 'Spring Refresh', 250, 'Supplies', 'New towels and linens', 0, NULL),
('2026-05-01', 'Professional Cleaning', 300, 'Cleaning', NULL, 0, NULL),
('2026-05-10', 'Internet — May', 65, 'Utilities', NULL, 1, 'monthly'),
('2026-05-18', 'Welcome Gifts', 85, 'Supplies', 'Local treats', 0, NULL);

-- Seed: Expenses for Property 2
INSERT INTO expenses (property_id, date, description, amount, category, notes, is_recurring, recurrence) VALUES
(2, '2024-01-01', 'Property Insurance', 2400, 'Insurance', 'Cottage policy', 1, 'annual'),
(2, '2024-01-01', 'Property Tax', 4200, 'Tax', 'South Lake Tahoe tax', 1, 'annual'),
(2, '2024-01-01', 'Hydro/Electricity', 150, 'Utilities', 'Higher for cottage', 1, 'monthly'),
(2, '2024-01-01', 'Internet/Satellite', 95, 'Utilities', 'Rural internet', 1, 'monthly'),
(2, '2024-05-01', 'Dock Repair', 850, 'Maintenance', 'Spring dock work', 0, NULL),
(2, '2024-06-01', 'Professional Cleaning', 200, 'Cleaning', 'Cottage turnover', 0, NULL),
(2, '2024-07-01', 'Professional Cleaning', 400, 'Cleaning', 'Two turnovers', 0, NULL),
(2, '2024-08-01', 'Professional Cleaning', 400, 'Cleaning', 'Two turnovers', 0, NULL),
(2, '2024-09-15', 'Winterization', 450, 'Maintenance', 'Pipes, dock removal', 0, NULL),
(2, '2024-06-15', 'Kayaks & Gear', 600, 'Supplies', 'Guest recreation', 0, NULL),
(2, '2025-05-01', 'Spring Opening', 350, 'Maintenance', 'De-winterize, dock install', 0, NULL),
(2, '2025-06-01', 'Professional Cleaning', 200, 'Cleaning', NULL, 0, NULL),
(2, '2026-01-01', 'Property Insurance — 2026', 2400, 'Insurance', 'Annual renewal', 1, 'annual'),
(2, '2026-01-01', 'Hydro/Electricity — Jan', 160, 'Utilities', 'Winter heating', 1, 'monthly'),
(2, '2026-02-01', 'Hydro/Electricity — Feb', 155, 'Utilities', NULL, 1, 'monthly'),
(2, '2026-03-01', 'Hydro/Electricity — Mar', 130, 'Utilities', NULL, 1, 'monthly'),
(2, '2026-04-01', 'Hydro/Electricity — Apr', 110, 'Utilities', NULL, 1, 'monthly'),
(2, '2026-05-01', 'Spring Opening', 380, 'Maintenance', 'De-winterize, dock install', 0, NULL),
(2, '2026-05-05', 'Professional Cleaning', 200, 'Cleaning', NULL, 0, NULL),
(2, '2026-05-15', 'Kayak Maintenance', 150, 'Supplies', 'Season prep', 0, NULL);

-- Seed: Guests
INSERT INTO guests (first_name, last_name, email, phone, country_city, total_stays, total_nights, total_spend, last_rating, is_pet_owner, preferences, marketing_optin, status) VALUES
('Emma', 'Wilson', 'emma.w@email.com', '+1-615-555-0101', 'Chicago, US', 1, 4, 407, 5.0, 0, 'Early check-in preferred', 1, 'active'),
('James', 'Chen', 'james.c@email.com', '+1-206-555-0102', 'Seattle, US', 1, 5, 510, 4.8, 0, 'Needs parking spot', 1, 'active'),
('Olivia', 'Davis', 'olivia.d@email.com', '+1-312-555-0103', 'Denver, US', 2, 10, 1537, 4.9, 1, 'Traveling with golden retriever', 1, 'active'),
('Charlotte', 'Clark', 'charlotte.c@email.com', '+1-212-555-0104', 'New York, US', 1, 9, 1487, 4.7, 0, 'Late check-out requested', 0, 'active'),
('Jack', 'Adams', 'jack.a@email.com', '+1-310-555-0105', 'Nashville, US', 1, 5, 1090, 5.0, 0, 'Holiday traveler', 1, 'active'),
('Mia', 'White', 'mia.w@email.com', NULL, 'Boston, US', 1, 6, 1023, 5.0, 0, NULL, 0, 'active'),
('Aiden', 'Campbell', 'aiden.c@email.com', '+1-615-555-0106', 'Nashville, US', 1, 5, 635, 5.0, 0, 'Return guest potential', 1, 'active'),
('Jackson', 'Collins', 'jackson.c@email.com', '+1-415-555-0107', 'Chicago, US', 1, 7, 1211, 4.9, 1, 'Dog owner, needs yard access', 1, 'active');

-- Seed: Maintenance
INSERT INTO maintenance (date, description, category, vendor, cost, status, priority, has_warranty, next_service, notes) VALUES
('2024-03-10', 'Bathroom faucet leak repair', 'Plumbing', 'QuickFix Plumbing', 280, 'completed', 'high', 1, '2025-03-10', 'Replaced cartridge, 1yr warranty'),
('2024-04-15', 'HVAC spring tune-up', 'HVAC', 'CoolAir Services', 195, 'completed', 'medium', 0, '2024-10-15', 'Filters replaced, refrigerant topped'),
('2024-06-01', 'Smart lock installation', 'Electrical', 'TechHome Install', 350, 'completed', 'medium', 1, NULL, 'Yale Assure Lock, 2yr warranty'),
('2024-10-20', 'HVAC fall tune-up', 'HVAC', 'CoolAir Services', 195, 'completed', 'medium', 0, '2025-04-15', 'Ready for winter'),
('2025-03-15', 'Door hinge + paint touch-up', 'General', 'Self', 165, 'completed', 'low', 0, NULL, 'Bedroom door was squeaking'),
('2025-05-01', 'Dishwasher not draining', 'Appliance', 'AppliancePro', 0, 'pending', 'high', 1, NULL, 'Under manufacturer warranty, called for service'),
('2025-06-10', 'Deck power wash', 'General', NULL, 0, 'pending', 'medium', 0, NULL, 'Schedule for early July before peak');

-- Seed: Pricing Seasons
INSERT INTO pricing_seasons (name, start_date, end_date, multiplier, min_nights, notes) VALUES
('Spring (Mar-May)', '03-01', '05-31', 1.0, 2, 'Standard spring rates'),
('Summer Peak (Jun-Aug)', '06-01', '08-31', 1.4, 3, 'Highest demand'),
('Fall (Sep-Oct)', '09-01', '10-31', 1.1, 2, 'Leaf season premium'),
('Off-Season (Nov-Feb)', '11-01', '02-28', 0.75, 1, 'Reduce for occupancy'),
('Holiday Premium (Dec 23-Jan 2)', '12-23', '01-02', 1.8, 4, 'Max rate'),
('Special Events', NULL, NULL, 1.5, 2, 'Local festivals'),
('Last-Minute (3 days)', NULL, NULL, 0.8, 1, 'Fill gaps'),
('Weekly Stay (7+ nights)', NULL, NULL, 0.88, 7, 'Incentivize long stays'),
('Monthly Stay (28+ nights)', NULL, NULL, 0.75, 28, 'Best for off-season');

-- Seed: Surveys
INSERT INTO surveys (guest_name, email, stay_date, overall_rating, cleanliness, communication, checkin, accuracy, location, value, recommend, comments) VALUES
('Emma Wilson', 'emma.w@email.com', '2024-01-05', 5, 5, 5, 5, 5, 4, 5, 'Definitely', 'Spotless apartment, great host communication'),
('James Chen', 'james.c@email.com', '2024-01-15', 5, 5, 5, 4, 5, 5, 4, 'Definitely', 'Location was perfect for our trip'),
('Olivia Davis', 'olivia.d@email.com', '2024-03-01', 5, 5, 5, 5, 5, 5, 5, 'Definitely', 'So happy our dog was welcome! Will return'),
('Mia White', 'mia.w@email.com', '2024-06-01', 5, 5, 5, 5, 5, 4, 5, 'Definitely', 'Perfect summer escape'),
('Jack Adams', 'jack.a@email.com', '2024-12-23', 5, 5, 5, 5, 5, 5, 5, 'Definitely', 'Christmas downtown was unforgettable'),
('Aiden Campbell', 'aiden.c@email.com', '2025-04-01', 5, 5, 5, 5, 5, 4, 5, 'Definitely', 'Will come back next spring');

-- Seed: Property Codes
INSERT INTO property_codes (property_id, label, value, icon, sort_order) VALUES
(1, 'Front Door Code', '4829', 'door', 1),
(1, 'WiFi Network', 'CozyRetreat_5G', 'wifi', 2),
(1, 'WiFi Password', 'Welcome2Nashville!', 'wifi', 3),
(1, 'Lockbox Code', '1234', 'lock', 4),
(1, 'Building Entry', '#502', 'building', 5),
(1, 'Garage Code', '7710', 'car', 6),
(1, 'Thermostat PIN', '0000', 'thermometer', 7),
(1, 'Alarm Code', '9876', 'shield', 8),
(2, 'Front Door Code', '5173', 'door', 1),
(2, 'WiFi Network', 'LakeCottage_Net', 'wifi', 2),
(2, 'WiFi Password', 'Tahoe2024!', 'wifi', 3),
(2, 'Lockbox Code', '8844', 'lock', 4),
(2, 'Gate Code', '2266', 'gate', 5),
(2, 'Boat House', '3311', 'anchor', 6);

-- Seed: Cleaning Checklist
INSERT INTO cleaning_tasks (area, task, priority, sort_order) VALUES
('Bedrooms', 'Strip and wash all bedding', 'high', 1),
('Bedrooms', 'Replace with fresh clean bedding', 'high', 2),
('Bedrooms', 'Vacuum/mop floors and under bed', 'medium', 3),
('Bedrooms', 'Dust all surfaces, nightstands, lamps', 'medium', 4),
('Bedrooms', 'Empty all trash cans', 'high', 5),
('Bedrooms', 'Check for items left behind', 'high', 6),
('Bathrooms', 'Scrub toilet inside, outside, base', 'high', 7),
('Bathrooms', 'Clean and disinfect sink and counter', 'high', 8),
('Bathrooms', 'Clean shower/tub, remove soap scum', 'high', 9),
('Bathrooms', 'Replace toilet paper (min 2 rolls)', 'high', 10),
('Bathrooms', 'Restock shampoo, conditioner, body wash', 'high', 11),
('Bathrooms', 'Hang fresh clean towels', 'high', 12),
('Kitchen', 'Wash all dishes, dry and put away', 'high', 13),
('Kitchen', 'Wipe inside microwave', 'high', 14),
('Kitchen', 'Clean stovetop and oven', 'high', 15),
('Kitchen', 'Wipe countertops and backsplash', 'high', 16),
('Kitchen', 'Mop floor', 'high', 17),
('Kitchen', 'Restock coffee, tea, sugar', 'medium', 18),
('Living Areas', 'Vacuum all sofas and cushions', 'high', 19),
('Living Areas', 'Vacuum or mop floors', 'high', 20),
('Living Areas', 'Wipe TV remotes (disinfect)', 'high', 21),
('Living Areas', 'Return furniture to original position', 'high', 22),
('Living Areas', 'Ensure WiFi is working', 'high', 23),
('General', 'Check all windows and doors lock', 'high', 24),
('General', 'Test smoke and CO detectors', 'high', 25),
('General', 'Take out all garbage/recycling', 'high', 26),
('General', 'Confirm key/lockbox is working', 'high', 27),
('General', 'Take photos of clean unit', 'medium', 28);

-- Seed: Documents
INSERT INTO documents (date, name, category, amount, vendor, tax_year, status, is_deductible) VALUES
('2024-01-15', 'Property Insurance Policy', 'Insurance', 1800, 'ABC Insurance', 2024, 'filed', 1),
('2024-01-01', 'Property Tax Notice 2024', 'Tax', 3200, 'City of Nashville', 2024, 'filed', 1),
('2024-04-15', 'HVAC Service Invoice', 'Maintenance', 195, 'CoolAir Services', 2024, 'filed', 1),
('2024-06-15', 'Listing Photography Invoice', 'Marketing', 250, 'ProShot Studios', 2024, 'filed', 1),
('2024-01-01', 'STR License 2024', 'Legal', 150, 'City of Nashville', 2024, 'filed', 0);

-- Seed: Vendors
INSERT INTO vendors (name, company, category, phone, email, website, address, notes, is_favorite) VALUES
('Claire Johnson', 'SparkleClean Nashville', 'Cleaning', '+1-615-555-2001', 'claire@sparkleclean.com', 'sparkleclean.com', '123 Broadway, Nashville, TN', 'Turnover cleans, very reliable. $150/visit.', 1),
('Pete Thompson', 'QuickFix Plumbing', 'Plumbing', '+1-615-555-2002', 'pete@quickfixplumb.com', NULL, NULL, 'Emergency availability. 1hr warranty on parts.', 1),
('John Morales', 'CoolAir Services', 'HVAC', '+1-615-555-2003', 'service@coolair.com', 'coolair.com', '45 Music Row, Nashville, TN', 'Spring and fall tune-ups. Very professional.', 1),
('Alex Nguyen', 'TechHome Install', 'Electrical', '+1-615-555-2004', 'alex@techhome.com', 'techhome.com', NULL, 'Smart lock & smart home installs. Good prices.', 0),
('Amy Bergman', 'Bergman Lawn & Snow', 'Snow Removal', '+1-615-555-2005', 'amy@bergmanlawn.com', NULL, '890 West End Ave, Nashville, TN', 'Seasonal contract Nov-Apr, $800/season. Very dependable.', 1),
('Mark Lewis', 'Green Thumb Lawn Care', 'Lawn Care', '+1-615-555-2006', 'mark@greenthumb.com', 'greenthumb.com', NULL, 'Weekly mowing May-Oct, spring/fall cleanup. $120/visit.', 0),
('Isabella Costa', 'ABC Insurance', 'Insurance', '+1-615-555-2007', 'icosta@abcinsurance.com', 'abcinsurance.com', '200 Commerce St, Nashville, TN', 'STR coverage included. Annual renewal Jan 15.', 1),
('David Chen', 'ProShot Studios', 'Photography', '+1-615-555-2008', 'david@proshotstudios.com', 'proshotstudios.com', NULL, 'Listing photos & video tours. $250/session.', 0),
('Nadia Khoury', 'AppliancePro', 'Appliance Repair', '+1-615-555-2009', 'nadia@appliancepro.com', 'appliancepro.com', '567 Church St, Nashville, TN', 'All major appliances. Warranty work authorized.', 0),
('Frank Garcia', NULL, 'Locksmith', '+1-615-555-2010', 'fgarcia@gmail.com', NULL, NULL, 'Emergency lockout service. 24/7 availability.', 0);

-- Seed: Email Templates
INSERT INTO email_templates (name, subject, body, category) VALUES
('Welcome New Guest', 'Welcome to Cozy Downtown Retreat!', 'Hi {{first_name}},

Thank you for booking with us! We''re thrilled to host you at Cozy Downtown Retreat.

Here are a few things to know before your stay:
- Check-in is at 3:00 PM, check-out at 11:00 AM
- Self check-in via smart lock — code will be sent 24 hours before arrival
- Free WiFi, parking info in the guidebook
- We''re pet-friendly! Just let us know in advance

If you have any questions before your arrival, don''t hesitate to reach out.

Looking forward to hosting you!

Best regards,
Your Host', 'welcome'),

('Thank You After Stay', 'Thank you for staying with us, {{first_name}}!', 'Hi {{first_name}},

We hope you had a wonderful stay at Cozy Downtown Retreat!

If you enjoyed your experience, we''d really appreciate a review — it helps other travelers find us and helps us keep improving.

As a returning guest, you''ll always get 10% off your next booking when you book direct. Just mention this email!

We''d love to have you back anytime.

Warm regards,
Your Host', 'thank_you'),

('Seasonal Promo — Summer', 'Summer is calling! Special rates at Cozy Downtown Retreat', 'Hi {{first_name}},

Summer in Nashville is magical — live music, patios, and perfect weather await!

We''re offering exclusive rates for our past guests:
- 15% off any 3+ night stay in June-August
- Free early check-in (subject to availability)
- Complimentary welcome basket with local treats

Book direct to get these perks — just reply to this email or visit our listing.

Hope to see you this summer!

Cheers,
Your Host', 'promo'),

('Review Reminder', 'Quick favor, {{first_name}}?', 'Hi {{first_name}},

I hope you''re doing well! I noticed we didn''t get a chance to connect after your recent stay.

If you have a moment, leaving a review would mean the world to us. It only takes a minute and helps us so much.

Thanks for being a great guest — hope to see you again!

All the best,
Your Host', 'reminder'),

('Holiday Newsletter', 'Happy Holidays from Cozy Downtown Retreat!', 'Hi {{first_name}},

Wishing you a wonderful holiday season from Nashville!

Quick update: We''ve made some great improvements to the property this year — new linens, upgraded kitchen, and a refreshed living space.

Planning a winter getaway? Nashville''s holiday lights, honky-tonks, and cozy cafés are waiting. As a past guest, you get priority booking and our best rates.

Warmest wishes,
Your Host', 'newsletter');
