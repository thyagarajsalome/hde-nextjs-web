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

const serviceSupabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testOldColumns() {
  const testObj = {
    title: 'Test Plan',
    area_sqft: 1200,
    facing: 'East',
    dimensions: '30x40',
    floors: 'G+1',
    bedrooms: 3,
    bathrooms: 3,
    parking: '1 Car',
    description: 'Test description',
    file_url: 'test.webp'
  };

  const { data, error } = await serviceSupabase.from('house_plans').insert([testObj]).select();
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success! Columns on returned object:', Object.keys(data[0]));
    // Clean up test row
    await serviceSupabase.from('house_plans').delete().eq('id', data[0].id);
  }
}
testOldColumns();
