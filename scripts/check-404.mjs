import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check404() {
  console.log('Fetching all cities from Supabase...');
  
  const { data: locations, error: locError } = await supabase
    .from('pseo_locations')
    .select('*, pseo_construction_rates(*)');
    
  if (locError) {
    console.error('Error fetching data:', locError);
    return;
  }
  
  console.log('Found ' + locations.length + ' total cities in the database.\n');
  
  let missingRates = [];
  let workingCities = [];
  
  for (const loc of locations) {
    if (!loc.pseo_construction_rates || loc.pseo_construction_rates.length === 0) {
      missingRates.push(loc.slug);
    } else {
      workingCities.push(loc.slug);
    }
  }
  
  console.log('? WORKING CITIES (' + workingCities.length + '):');
  console.log(workingCities.join(', '));
  
  console.log('\n? CITIES MISSING DATA (WILL 404 ERROR) (' + missingRates.length + '):');
  if (missingRates.length > 0) {
    console.log(missingRates.join(', '));
  } else {
    console.log('NONE! Every single city has perfect pricing data.');
  }
}
check404();
