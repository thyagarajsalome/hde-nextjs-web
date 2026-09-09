import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ncontvjtfhsabphxfuhb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: No Supabase API key found in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'dubai_leads',
  'dubai_agents',
  'profiles',
  'user_projects',
  'hero_banners'
];

async function runBackup() {
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', dateStr);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`\n📦 Starting Supabase Database Backup: ${dateStr}`);
  console.log(`📁 Saving to: ${backupDir}\n`);

  let totalRows = 0;

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`⚠️ Table "${table}": ${error.message} (may require service role or does not exist)`);
        continue;
      }

      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data || [], null, 2), 'utf8');
      console.log(`✅ Table "${table}": Exported ${(data || []).length} rows -> ${table}.json`);
      totalRows += (data || []).length;
    } catch (err) {
      console.error(`❌ Failed to backup table "${table}":`, err);
    }
  }

  console.log(`\n🎉 Backup complete! Total records saved: ${totalRows}`);
  console.log(`💡 You can copy the "${backupDir}" folder to your Google Drive or USB drive anytime.\n`);
}

runBackup();