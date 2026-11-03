import fs from 'fs';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const content = fs.readFileSync('src/features/plans/PlanGallery.tsx', 'utf8');
const regex = /file_url:\s*"([^"]+)"/g;
let match;
const urls = [];
while ((match = regex.exec(content)) !== null) {
  urls.push(match[1]);
}

const r2Res = await s3.send(new ListObjectsV2Command({
  Bucket: process.env.R2_BUCKET_NAME || 'hde-gallery',
  Prefix: 'house-plans/',
  MaxKeys: 1000,
}));

const existingKeys = new Set((r2Res.Contents || []).map(c => c.Key));

console.log('Testing replacement of vertical-images/ with full-plans/:');
let okCount = 0;
let failCount = 0;

for (const u of urls) {
  const normalized = u.replace('vertical-images/', 'full-plans/');
  const r2Key = `house-plans/${normalized.replace(/^\/+/, '')}`;
  if (existingKeys.has(r2Key)) {
    console.log(`[PASS] ${u} -> ${r2Key}`);
    okCount++;
  } else {
    console.log(`[FAIL] ${u} -> ${r2Key} NOT FOUND`);
    failCount++;
  }
}

console.log(`\nResult: ${okCount} passed, ${failCount} failed out of ${urls.length} plans.`);
