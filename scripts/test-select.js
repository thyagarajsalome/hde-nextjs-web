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

const anonSupabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSelect() {
  const { data, error } = await anonSupabase
    .from('house_plans')
    .select('id, title, dimensions, area_sqft, file_url, description');

  console.log('Anon select without is_active:', { dataLength: data ? data.length : 0, error });
}
testSelect();
