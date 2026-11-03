#!/usr/bin/env node

/**
 * HDE Admin CLI (Developer Tool)
 * Unified command-line interface for Home Design English developers.
 * 
 * Usage:
 *   npm run hde
 *   npm run hde health
 *   npm run hde backup
 *   npm run hde plans
 *   npm run hde hero
 *   npm run hde storage
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Load environment files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ncontvjtfhsabphxfuhb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: No Supabase API key found in .env.local or environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Cloudflare R2 S3 Client
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'hde-gallery';

let r2Client = null;
if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

// Colors for terminal output
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  gold: '\x1b[38;2;197;160;89m',
  navy: '\x1b[38;2;15;32;66m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function printBanner() {
  console.log(`
${c.gold}==============================================================================${c.reset}
${c.bold}${c.gold} ██╗  ██╗██████╗ ███████╗   █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗${c.reset}
${c.bold}${c.gold} ██║  ██║██╔══██╗██╔════╝  ██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║${c.reset}
${c.bold}${c.gold} ███████║██║  ██║█████╗    ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║${c.reset}
${c.bold}${c.gold} ██╔══██║██║  ██║██╔══╝    ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║${c.reset}
${c.bold}${c.gold} ██║  ██║██████╔╝███████╗  ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║${c.reset}
${c.bold}${c.gold} ╚═╝  ╚═╝╚═════╝ ╚══════╝  ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝${c.reset}
${c.dim}               Home Design English (HDE) Developer Admin CLI v1.0${c.reset}
${c.gold}==============================================================================${c.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`${c.bold}Available Commands:${c.reset}

  ${c.gold}hde health${c.reset}              Verify Supabase & Cloudflare R2 live status and table counts
  ${c.gold}hde backup${c.reset}              Export complete snapshot of all database tables to /backups
  ${c.gold}hde plans${c.reset}               List all architectural pdf-plans, vector blueprints, and prices
  ${c.gold}hde hero${c.reset}                List active homepage hero banners
  ${c.gold}hde hero:add${c.reset} <url> [t]  Add a new homepage hero banner (image URL, title, subtitle)
  ${c.gold}hde hero:del${c.reset} <id>       Remove a hero banner by ID
  ${c.gold}hde storage${c.reset} [prefix]    Inspect files inside Cloudflare R2 (e.g. pdf-plans)
  ${c.gold}hde clean${c.reset}                Audit and purge orphaned storage files not linked in Supabase
  ${c.gold}hde help${c.reset}                Show this command manual
`);
}

// 1. Health Command
async function cmdHealth() {
  printBanner();
  console.log(`${c.bold}🩺 System & Diagnostic Health Check:${c.reset}\n`);

  // Supabase check
  const startDb = Date.now();
  try {
    const { count, error } = await supabase.from('house_plans').select('*', { count: 'exact', head: true });
    const latencyDb = Date.now() - startDb;
    if (error) {
      console.log(`  ${c.red}✖ Supabase Database:${c.reset} Error - ${error.message}`);
    } else {
      console.log(`  ${c.green}✔ Supabase Database:${c.reset} Connected (${latencyDb}ms)`);
    }
  } catch (err) {
    console.log(`  ${c.red}✖ Supabase Database:${c.reset} Exception - ${err.message}`);
  }

  // Cloudflare R2 check
  if (r2Client) {
    const startR2 = Date.now();
    try {
      const cmd = new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 5 });
      await r2Client.send(cmd);
      const latencyR2 = Date.now() - startR2;
      console.log(`  ${c.green}✔ Cloudflare R2 Storage:${c.reset} Connected (${latencyR2}ms) [Bucket: ${R2_BUCKET}]`);
    } catch (err) {
      console.log(`  ${c.red}✖ Cloudflare R2 Storage:${c.reset} Error - ${err.message}`);
    }
  } else {
    console.log(`  ${c.yellow}⚠ Cloudflare R2 Storage:${c.reset} Credentials missing in environment`);
  }

  // Key Table Counts
  console.log(`\n${c.bold}📊 Live Database Table Counts:${c.reset}`);
  const tables = ['house_plans', 'real_estate_properties', 'hero_banners', 'cad_tutorials', 'user_projects', 'dubai_leads'];
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`  • ${table.padEnd(25)}: ${c.yellow}(unavailable: ${error.message})${c.reset}`);
      } else {
        console.log(`  • ${table.padEnd(25)}: ${c.bold}${count ?? 0}${c.reset} records`);
      }
    } catch (err) {
      console.log(`  • ${table.padEnd(25)}: ${c.red}Failed${c.reset}`);
    }
  }
  console.log('');
}

// 2. Backup Command
async function cmdBackup() {
  printBanner();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`📦 ${c.bold}Starting Full Database Backup Snapshot...${c.reset}\n`);

  const TABLES = [
    'house_plans',
    'real_estate_properties',
    'hero_banners',
    'cad_tutorials',
    'user_projects',
    'dubai_leads',
    'dubai_agents',
    'profiles',
  ];

  const fullSnapshot = {
    meta: {
      platform: 'Home Design English (HDE)',
      cliVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
    },
    tables: {},
  };

  let totalRows = 0;

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.log(`  ${c.yellow}⚠ Table "${table}":${c.reset} ${error.message}`);
        continue;
      }
      const count = (data || []).length;
      fullSnapshot.tables[table] = data || [];
      totalRows += count;
      console.log(`  ${c.green}✔ Table "${table}":${c.reset} Exported ${c.bold}${count}${c.reset} records`);
    } catch (err) {
      console.log(`  ${c.red}✖ Table "${table}":${c.reset} ${err.message}`);
    }
  }

  const filename = `hde_backup_${dateStr}.json`;
  const filePath = path.join(backupDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(fullSnapshot, null, 2), 'utf8');

  console.log(`\n${c.green}🎉 Backup completed successfully!${c.reset}`);
  console.log(`📁 File saved to: ${c.bold}${filePath}${c.reset}`);
  console.log(`📊 Total records backed up: ${c.bold}${totalRows}${c.reset}\n`);
}

// 3. Plans Command
async function cmdPlans() {
  printBanner();
  console.log(`📐 ${c.bold}Architectural pdf-plans & Blueprints (Supabase):${c.reset}\n`);

  try {
    const { data, error } = await supabase
      .from('house_plans')
      .select('id, title, dimensions, facing, built_up_area_sqft, price_inr, pdf_url')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log(`  ${c.yellow}No plans found in database.${c.reset}\n`);
      return;
    }

    console.log(`Found ${c.bold}${data.length}${c.reset} plans in catalog:\n`);
    console.log(`  ${'ID'.padEnd(38)} | ${'Title'.padEnd(32)} | ${'Facing'.padEnd(8)} | ${'Price'.padEnd(8)} | ${'PDF Blueprint'.padEnd(12)}`);
    console.log(`  ${'-'.repeat(38)}-+-${'-'.repeat(32)}-+-${'-'.repeat(8)}-+-${'-'.repeat(8)}-+-${'-'.repeat(12)}`);

    for (const p of data) {
      const idStr = String(p.id).padEnd(38);
      const titleStr = String(p.title || 'Untitled').slice(0, 30).padEnd(32);
      const facingStr = String(p.facing || 'East').padEnd(8);
      const priceStr = (p.price_inr ? `₹${p.price_inr}` : 'Free').padEnd(8);
      const hasPdf = p.pdf_url ? `${c.green}✔ Vector PDF${c.reset}` : `${c.gray}No PDF${c.reset}`;
      console.log(`  ${idStr} | ${titleStr} | ${facingStr} | ${priceStr} | ${hasPdf}`);
    }
    console.log('');
  } catch (err) {
    console.error(`  ${c.red}Failed to fetch plans:${c.reset}`, err.message);
  }
}

// 4. Hero Banners Command
async function cmdHero() {
  printBanner();
  console.log(`🖼️  ${c.bold}Active Homepage Hero Banners:${c.reset}\n`);

  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log(`  ${c.yellow}No hero banners configured.${c.reset}\n`);
      return;
    }

    console.log(`Found ${c.bold}${data.length}${c.reset} active hero slides:\n`);
    data.forEach((banner, idx) => {
      console.log(`  ${c.bold}[Slide #${idx + 1}]${c.reset} ID: ${c.dim}${banner.id}${c.reset}`);
      console.log(`    Title:    ${c.bold}${banner.title || 'Untitled'}${c.reset}`);
      console.log(`    Subtitle: ${banner.subtitle || '—'}`);
      console.log(`    URL:      ${c.cyan}${banner.image_url}${c.reset}\n`);
    });
  } catch (err) {
    console.error(`  ${c.red}Failed to fetch hero banners:${c.reset}`, err.message);
  }
}

// 5. Add Hero Banner
async function cmdHeroAdd(url, title, subtitle) {
  if (!url) {
    console.error(`\n${c.red}❌ Error:${c.reset} Please provide an image URL. Example:`);
    console.log(`  npm run hde hero:add "https://example.com/banner.webp" "Luxury Villa" "2026 Turnkey"\n`);
    return;
  }

  try {
    const { data: current } = await supabase.from('hero_banners').select('id');
    const orderIndex = current?.length || 0;

    const { data, error } = await supabase.from('hero_banners').insert({
      image_url: url,
      title: title || 'Modern Architecture',
      subtitle: subtitle || 'HDE Premium Planning',
      order_index: orderIndex,
    }).select();

    if (error) throw error;
    console.log(`\n${c.green}✔ Hero banner slide added successfully!${c.reset}`);
    console.log(`  ID: ${data[0]?.id}\n`);
  } catch (err) {
    console.error(`\n${c.red}❌ Failed to add banner:${c.reset}`, err.message);
  }
}

// 6. Delete Hero Banner
async function cmdHeroDelete(id) {
  if (!id) {
    console.error(`\n${c.red}❌ Error:${c.reset} Please provide the banner ID to delete.\n`);
    return;
  }

  try {
    const { error } = await supabase.from('hero_banners').delete().eq('id', id);
    if (error) throw error;
    console.log(`\n${c.green}✔ Hero banner slide deleted successfully!${c.reset} [ID: ${id}]\n`);
  } catch (err) {
    console.error(`\n${c.red}❌ Failed to delete banner:${c.reset}`, err.message);
  }
}

// 7. Storage Command (Cloudflare R2)
async function cmdStorage(prefix = '') {
  printBanner();
  console.log(`☁️  ${c.bold}Cloudflare R2 Storage Objects (Bucket: ${R2_BUCKET}):${c.reset}`);
  if (prefix) console.log(`   Prefix Filter: "${prefix}"`);
  console.log('');

  if (!r2Client) {
    console.log(`  ${c.red}❌ Cloudflare R2 credentials not configured in environment.${c.reset}\n`);
    return;
  }

  try {
    const cmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      MaxKeys: 40,
    });
    const res = await r2Client.send(cmd);
    const contents = res.Contents || [];

    if (contents.length === 0) {
      console.log(`  ${c.yellow}No files found under prefix "${prefix}".${c.reset}\n`);
      return;
    }

    console.log(`Found ${c.bold}${contents.length}${c.reset} objects:\n`);
    console.log(`  ${'Key'.padEnd(55)} | ${'Size (KB)'.padStart(10)} | ${'Last Modified'}`);
    console.log(`  ${'-'.repeat(55)}-+-${'-'.repeat(10)}-+-${'-'.repeat(24)}`);

    for (const obj of contents) {
      const keyStr = obj.Key.slice(0, 53).padEnd(55);
      const sizeStr = (obj.Size / 1024).toFixed(1).padStart(10);
      const dateStr = obj.LastModified ? new Date(obj.LastModified).toISOString().slice(0, 19).replace('T', ' ') : '—';
      console.log(`  ${keyStr} | ${sizeStr} | ${dateStr}`);
    }
    console.log('');
  } catch (err) {
    console.error(`  ${c.red}Failed to list R2 storage:${c.reset}`, err.message);
  }
}

// 8. Storage Clean Command (Audit and delete orphaned files)
async function cmdCleanStorage() {
  printBanner();
  console.log(`🧹 ${c.bold}Storage Orphan Auditor & Cleaner (Bucket: ${R2_BUCKET}):${c.reset}\n`);

  if (!r2Client) {
    console.log(`  ${c.red}❌ Cloudflare R2 credentials not configured.${c.reset}\n`);
    return;
  }

  try {
    // 1. Fetch all active files from Supabase
    const { data: plans } = await supabase.from('house_plans').select('file_url, pdf_url');
    const activeUrls = new Set();
    (plans || []).forEach(p => {
      if (p.file_url) activeUrls.add(p.file_url);
      if (p.pdf_url) activeUrls.add(p.pdf_url);
    });

    // 2. Fetch all objects in pdf-plans/
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const cmd = new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: 'pdf-plans/' });
    const res = await r2Client.send(cmd);
    const objects = res.Contents || [];

    let purged = 0;
    for (const obj of objects) {
      if (obj.Key === 'pdf-plans/' || obj.Key === 'pdf-plans/.folder-created') {
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: obj.Key }));
        console.log(`  ${c.yellow}Deleted placeholder:${c.reset} ${obj.Key}`);
        purged++;
        continue;
      }

      const isReferenced = Array.from(activeUrls).some(url => url && url.includes(obj.Key));
      if (!isReferenced) {
        console.log(`  ${c.red}✖ Orphan found:${c.reset} ${obj.Key} (${(obj.Size / 1024).toFixed(1)} KB)`);
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: obj.Key }));
        console.log(`    ${c.green}✔ Deleted${c.reset}`);
        purged++;
      } else {
        console.log(`  ${c.green}✔ Active in database:${c.reset} ${obj.Key}`);
      }
    }

    console.log(`\n${c.bold}Audit Summary:${c.reset} ${objects.length} scanned, ${purged} orphaned files purged.\n`);
  } catch (err) {
    console.error(`  ${c.red}Failed to clean storage:${c.reset}`, err.message);
  }
}

// Router for CLI commands
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

switch (command) {
  case 'health':
  case 'status':
    await cmdHealth();
    break;

  case 'backup':
  case 'dump':
    await cmdBackup();
    break;

  case 'plans':
    await cmdPlans();
    break;

  case 'hero':
    await cmdHero();
    break;

  case 'hero:add':
    await cmdHeroAdd(args[1], args[2], args[3]);
    break;

  case 'hero:del':
  case 'hero:delete':
    await cmdHeroDelete(args[1]);
    break;

  case 'storage':
  case 'r2':
    await cmdStorage(args[1] || '');
    break;

  case 'clean':
  case 'storage:clean':
    await cmdCleanStorage();
    break;

  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;

  default:
    if (!command) {
      printHelp();
    } else {
      console.log(`\n${c.red}Unknown command:${c.reset} "${command}"`);
      printHelp();
    }
    break;
}
