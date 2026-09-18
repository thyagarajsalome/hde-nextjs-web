// src/app/api/real-estate/upload/route.ts
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    if (!isR2Configured) {
      return NextResponse.json(
        { error: 'Cloudflare R2 is not configured in environment variables.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slotIndex = formData.get('slotIndex') || '0';
    const propertyId = formData.get('propertyId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Safety check size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 2 MB limit' }, { status: 400 });
    }

    // Strict image MIME type whitelist to prevent malicious uploads
    const ALLOWED_MIME_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only WebP, JPEG, and PNG images are allowed.' },
        { status: 400 }
      );
    }

    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    const timestamp = Date.now();
    const propFolder = propertyId ? `prop_${propertyId}` : `draft_${timestamp}`;
    const key = `real-estate/${propFolder}/photo_${slotIndex}_${timestamp}_${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || 'image/webp';

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Body: buffer,
    });

    await r2Client.send(command);

    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      success: true,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error('Real estate server upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload photo to Cloudflare R2' },
      { status: 500 }
    );
  }
}
