-- 1. Insert 15 Wealthy Texas Suburbs (High Intent, Low Competition)
INSERT INTO pseo_locations (country, state_name, city_name, slug, currency_symbol, climate_zone, soil_type, neighborhoods, labor_multiplier) VALUES 
('USA', 'Texas', 'Round Rock', 'round-rock-texas', '$', 'Humid subtropical', 'Limestone rock', 'Forest Creek, Teravista, Brushy Creek', '1.05'),
('USA', 'Texas', 'Georgetown', 'georgetown-texas', '$', 'Humid subtropical', 'Limestone rock', 'Sun City, Berry Creek, Wolf Ranch', '1.05'),
('USA', 'Texas', 'Cedar Park', 'cedar-park-texas', '$', 'Humid subtropical', 'Limestone rock', 'Twin Creeks, Buttercup Creek, Cypress Canyon', '1.05'),
('USA', 'Texas', 'Pflugerville', 'pflugerville-texas', '$', 'Humid subtropical', 'Blackland prairie', 'Blackhawk, Falcon Pointe, Highland Park', '1.00'),
('USA', 'Texas', 'Leander', 'leander-texas', '$', 'Humid subtropical', 'Limestone rock', 'Crystal Falls, Block House Creek, Mason Hills', '1.00'),
('USA', 'Texas', 'Plano', 'plano-texas', '$', 'Humid subtropical', 'Clay and limestone', 'Legacy West, Willow Bend, Deerfield', '1.15'),
('USA', 'Texas', 'Frisco', 'frisco-texas', '$', 'Humid subtropical', 'Clay and limestone', 'Starwood, Stonebriar, Newman Village', '1.15'),
('USA', 'Texas', 'McKinney', 'mckinney-texas', '$', 'Humid subtropical', 'Clay and limestone', 'Stonebridge Ranch, Craig Ranch, Tucker Hill', '1.10'),
('USA', 'Texas', 'Allen', 'allen-texas', '$', 'Humid subtropical', 'Clay and limestone', 'Twin Creeks, Starcreek, Watters Crossing', '1.10'),
('USA', 'Texas', 'Richardson', 'richardson-texas', '$', 'Humid subtropical', 'Clay and limestone', 'Canyon Creek, Reservation, Prairie Creek', '1.10'),
('USA', 'Texas', 'Sugar Land', 'sugar-land-texas', '$', 'Humid subtropical', 'Clay and loam', 'First Colony, Sweetwater, Riverstone', '1.15'),
('USA', 'Texas', 'The Woodlands', 'the-woodlands-texas', '$', 'Humid subtropical', 'Piney woods', 'Carlton Woods, Sterling Ridge, Alden Bridge', '1.20'),
('USA', 'Texas', 'Katy', 'katy-texas', '$', 'Humid subtropical', 'Clay and loam', 'Cinco Ranch, Seven Meadows, Firethorne', '1.10'),
('USA', 'Texas', 'Pearland', 'pearland-texas', '$', 'Humid subtropical', 'Clay and loam', 'Shadow Creek Ranch, Silverlake, Sedona Lakes', '1.05'),
('USA', 'Texas', 'Cypress', 'cypress-texas', '$', 'Humid subtropical', 'Clay and loam', 'Bridgeland, Towne Lake, Coles Crossing', '1.10');

-- 2. Insert Pricing Data
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '158', '210', '315', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'round-rock-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '158', '210', '315', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'georgetown-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '158', '210', '315', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'cedar-park-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '150', '200', '300', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'pflugerville-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '150', '200', '300', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'leander-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '173', '230', '345', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'plano-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '173', '230', '345', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'frisco-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '165', '220', '330', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'mckinney-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '165', '220', '330', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'allen-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '165', '220', '330', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'richardson-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '173', '230', '345', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'sugar-land-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '180', '240', '360', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'the-woodlands-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '165', '220', '330', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'katy-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '158', '210', '315', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'pearland-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '165', '220', '330', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'cypress-texas';
