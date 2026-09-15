// src/lib/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'hde-gallery';
export const R2_PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

// Initialize S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Generates a pre-signed PUT URL for direct browser-to-R2 upload
 */
export async function getR2PresignedUploadUrl(key: string, contentType: string = 'image/webp') {
  if (!isR2Configured) {
    throw new Error('Cloudflare R2 is not fully configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in .env.');
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // Pre-signed URL valid for 10 minutes (600 seconds)
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
  const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `https://${R2_BUCKET_NAME}.${accountId}.r2.cloudflarestorage.com/${key}`;

  return { uploadUrl, publicUrl, key };
}

/**
 * Deletes an object from the Cloudflare R2 bucket
 */
export async function deleteFromR2(key: string) {
  if (!isR2Configured) {
    console.warn('R2 credentials not set; skipping remote deletion of', key);
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return r2Client.send(command);
}
