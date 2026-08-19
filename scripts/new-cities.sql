-- 1. Insert the 10 New Cities
INSERT INTO pseo_locations (country, state_name, city_name, slug, currency_symbol, climate_zone, soil_type, neighborhoods, labor_multiplier) VALUES 
('INDIA', 'West Bengal', 'Kolkata', 'kolkata', '?', 'Tropical wet and dry', 'Alluvial soil', 'Salt Lake, New Town, Ballygunge', '0.95'),
('INDIA', 'Rajasthan', 'Jaipur', 'jaipur', '?', 'Hot semi-arid', 'Sandy soil', 'Malviya Nagar, Vaishali Nagar, Mansarovar', '0.9'),
('INDIA', 'Uttar Pradesh', 'Lucknow', 'lucknow', '?', 'Humid subtropical', 'Alluvial soil', 'Gomti Nagar, Indira Nagar, Hazratganj', '0.85'),
('INDIA', 'Gujarat', 'Surat', 'surat', '?', 'Tropical savanna', 'Black cotton soil', 'Vesu, Adajan, Piplod', '0.95'),
('INDIA', 'Maharashtra', 'Nagpur', 'nagpur', '?', 'Tropical savanna', 'Black cotton soil', 'Dharampeth, Wardhaman Nagar, Manish Nagar', '0.85'),
('USA', 'Texas', 'Houston', 'houston-texas', '$', 'Humid subtropical', 'Clay and loam', 'River Oaks, Montrose, The Heights', '1.05'),
('USA', 'Texas', 'Dallas', 'dallas-texas', '$', 'Humid subtropical', 'Clay and limestone', 'Uptown, Preston Hollow, Oak Lawn', '1.1'),
('USA', 'California', 'San Diego', 'san-diego-california', '$', 'Mediterranean', 'Sandy loam', 'La Jolla, Pacific Beach, North Park', '1.4'),
('USA', 'Pennsylvania', 'Philadelphia', 'philadelphia-pennsylvania', '$', 'Humid subtropical', 'Silt and clay', 'Center City, Fishtown, Rittenhouse Square', '1.25'),
('USA', 'North Carolina', 'Charlotte', 'charlotte-north-carolina', '$', 'Humid subtropical', 'Red clay', 'Uptown, South End, Myers Park', '1');

-- 2. Insert the Pricing Data for those Cities
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '1520', '1995', '2850', 'Red Bricks & Cement', '9.00' FROM pseo_locations WHERE slug = 'kolkata';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '1440', '1890', '2700', 'Red Bricks & Cement', '9.00' FROM pseo_locations WHERE slug = 'jaipur';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '1360', '1785', '2550', 'Red Bricks & Cement', '9.00' FROM pseo_locations WHERE slug = 'lucknow';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '1520', '1995', '2850', 'Red Bricks & Cement', '9.00' FROM pseo_locations WHERE slug = 'surat';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '1360', '1785', '2550', 'Red Bricks & Cement', '9.00' FROM pseo_locations WHERE slug = 'nagpur';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '158', '210', '315', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'houston-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '165', '220', '330', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'dallas-texas';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '210', '280', '420', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'san-diego-california';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '188', '250', '375', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'philadelphia-pennsylvania';
INSERT INTO pseo_construction_rates (location_id, basic_rate_per_sqft, standard_rate_per_sqft, premium_rate_per_sqft, primary_material_name, primary_material_price) SELECT id, '150', '200', '300', 'Lumber & Drywall', '15.50' FROM pseo_locations WHERE slug = 'charlotte-north-carolina';
