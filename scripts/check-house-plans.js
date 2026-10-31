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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('house_plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Total plans found in Supabase:', data ? data.length : 0);
    if (data) {
      data.forEach(p => {
        console.log(`Plan ID: ${p.id} | Title: "${p.title}" | is_active: ${p.is_active} | price_inr: ${p.price_inr} | file_url: ${p.file_url} | pdf_url: ${p.pdf_url}`);
      });
    }
  }
}
check();
