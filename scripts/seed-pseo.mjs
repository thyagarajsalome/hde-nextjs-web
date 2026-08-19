import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Note: If you run this with just ANON_KEY, ensure RLS policies allow inserts on these tables temporarily.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const citiesData = [
  // INDIA CITIES
  { country: 'INDIA', state: 'Maharashtra', city: 'Mumbai', slug: 'mumbai', symbol: '₹', mult: 1.2, climate: 'Tropical wet and dry', soil: 'Hard basaltic rock', neighborhoods: 'Andheri, Bandra, Juhu' },
  { country: 'INDIA', state: 'Karnataka', city: 'Bengaluru', slug: 'bengaluru', symbol: '₹', mult: 1.1, climate: 'Tropical savanna', soil: 'Red laterite soil', neighborhoods: 'Whitefield, Indiranagar, Koramangala' },
  { country: 'INDIA', state: 'Delhi', city: 'Delhi', slug: 'delhi-ncr', symbol: '₹', mult: 1.05, climate: 'Humid subtropical', soil: 'Alluvial soil', neighborhoods: 'Dwarka, Vasant Kunj, Rohini' },
  { country: 'INDIA', state: 'Telangana', city: 'Hyderabad', slug: 'hyderabad', symbol: '₹', mult: 1.0, climate: 'Tropical wet and dry', soil: 'Hard granite rock', neighborhoods: 'Gachibowli, Jubilee Hills, HITEC City' },
  { country: 'INDIA', state: 'Tamil Nadu', city: 'Chennai', slug: 'chennai', symbol: '₹', mult: 1.0, climate: 'Tropical wet and dry', soil: 'Clayey coastal soil', neighborhoods: 'Adyar, Velachery, T Nagar' },
  { country: 'INDIA', state: 'Maharashtra', city: 'Pune', slug: 'pune', symbol: '₹', mult: 1.0, climate: 'Tropical wet and dry', soil: 'Black cotton soil', neighborhoods: 'Baner, Kothrud, Hinjewadi' },
  { country: 'INDIA', state: 'Gujarat', city: 'Ahmedabad', slug: 'ahmedabad', symbol: '₹', mult: 0.95, climate: 'Hot semi-arid', soil: 'Sandy loam', neighborhoods: 'Vastrapur, Navrangpura, Bopal' },
  
  // USA CITIES
  { country: 'USA', state: 'Texas', city: 'Austin', slug: 'austin-texas', symbol: '$', mult: 1.1, climate: 'Humid subtropical', soil: 'Limestone rock', neighborhoods: 'Downtown, Domain, Mueller' },
  { country: 'USA', state: 'California', city: 'Los Angeles', slug: 'los-angeles-california', symbol: '$', mult: 1.5, climate: 'Mediterranean', soil: 'Clay and loam', neighborhoods: 'Hollywood, Santa Monica, Venice' },
  { country: 'USA', state: 'New York', city: 'New York City', slug: 'new-york-city', symbol: '$', mult: 1.6, climate: 'Humid subtropical', soil: 'Glacial till', neighborhoods: 'Manhattan, Brooklyn, Queens' },
  { country: 'USA', state: 'Florida', city: 'Miami', slug: 'miami-florida', symbol: '$', mult: 1.2, climate: 'Tropical monsoon', soil: 'Limestone and sand', neighborhoods: 'Brickell, South Beach, Coral Gables' },
  { country: 'USA', state: 'Illinois', city: 'Chicago', slug: 'chicago-illinois', symbol: '$', mult: 1.3, climate: 'Humid continental', soil: 'Clay and glacial drift', neighborhoods: 'Lincoln Park, Loop, Lakeview' },
  { country: 'USA', state: 'Arizona', city: 'Phoenix', slug: 'phoenix-arizona', symbol: '$', mult: 1.0, climate: 'Hot desert', soil: 'Sandy and alkaline', neighborhoods: 'Downtown, Arcadia, Biltmore' },
  { country: 'USA', state: 'Washington', city: 'Seattle', slug: 'seattle-washington', symbol: '$', mult: 1.4, climate: 'Oceanic', soil: 'Glacial till', neighborhoods: 'Capitol Hill, Ballard, Fremont' },
];

async function seed() {
  console.log("Starting database seed...");
  
  for (const city of citiesData) {
    console.log(`Inserting location: ${city.city}...`);
    
    // 1. Insert Location
    const { data: locationData, error: locError } = await supabase
      .from('pseo_locations')
      .upsert({
        country: city.country,
        state_name: city.state,
        city_name: city.city,
        slug: city.slug,
        currency_symbol: city.symbol,
        climate_zone: city.climate,
        soil_type: city.soil,
        neighborhoods: city.neighborhoods,
        labor_multiplier: city.mult,
      }, { onConflict: 'slug' })
      .select()
      .single();
      
    if (locError) {
      console.error(`Error inserting location ${city.city}:`, locError.message);
      continue;
    }
    
    const locationId = locationData.id;
    
    // 2. Insert Construction Rates
    const isUSA = city.country === 'USA';
    const baseBasic = isUSA ? 150 : 1600; // $150/sqft vs ₹1600/sqft
    const baseStandard = isUSA ? 200 : 2100;
    const basePremium = isUSA ? 300 : 3000;
    
    // Delete existing to avoid duplicates, then insert
    await supabase.from('pseo_construction_rates').delete().eq('location_id', locationId);
    await supabase.from('pseo_construction_rates').insert({
      location_id: locationId,
      basic_rate_per_sqft: Math.round(baseBasic * city.mult),
      standard_rate_per_sqft: Math.round(baseStandard * city.mult),
      premium_rate_per_sqft: Math.round(basePremium * city.mult),
      primary_material_name: isUSA ? 'Lumber & Drywall' : 'Red Bricks & Cement',
      primary_material_price: isUSA ? 15.50 : 9.00
    });
    
    // 3. Insert Paint Data
    await supabase.from('pseo_painting_data').delete().eq('location_id', locationId);
    await supabase.from('pseo_painting_data').insert({
      location_id: locationId,
      popular_exterior_color: isUSA ? (city.climate.includes('desert') ? 'Stucco White' : 'Slate Grey') : 'Terracotta',
      recommended_paint_type: city.climate.includes('wet') || city.climate.includes('monsoon') ? 'Heavy Duty Waterproof' : 'UV Resistant Acrylic',
      avg_painting_cost_per_sqft: isUSA ? 4.50 : 25.00
    });
    
    console.log(`✅ Successfully seeded data for ${city.city}`);
  }
  
  console.log("Seed complete! You now have a massive pSEO database ready.");
}

seed();
