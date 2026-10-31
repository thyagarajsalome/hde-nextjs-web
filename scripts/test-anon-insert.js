const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  const k = parts[0];
  const v = parts.slice(1).join('=');
  if (k) env[k.trim()] = v.trim().replace(/^['"]|['"]$/g, '');
});

// Test with Anon key (which client browser uses)
const anonSupabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  console.log('Testing insert with ANON key...');
  const { data, error } = await anonSupabase.from('house_plans').insert([{
    title: 'Test House Plan Anon Insert',
    dimensions: '30x40',
    area_sqft: 1200,
    facing: 'East',
    floors: 'G+1',
    bedrooms: 3,
    bathrooms: 3,
    parking: '1 Car',
    description: 'Test description',
    file_url: 'test.webp',
    is_active: true
  }]).select();

  if (error) {
    console.error('ANON INSERT ERROR:', error);
  } else {
    console.log('ANON INSERT SUCCESS:', data);
  }
}
testInsert();
