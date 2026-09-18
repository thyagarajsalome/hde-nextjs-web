// src/app/api/real-estate/upload-url/route.ts
import { NextResponse } from 'next/server';
import { getR2PresignedUploadUrl, isR2Configured } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, propertyId, slotIndex = 0, fileSize } = body;
    const contentType = body.contentType || 'image/webp';

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    const ALLOWED_CONTENT_TYPES = ['image/webp', 'image/jpeg', 'image/png'];
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ 
        error: `Unsupported contentType: ${contentType}. Allowed: image/webp, image/jpeg, image/png` 
      }, { status: 400 });
    }

    // Since files are client-compressed to WebP, reject files over 2 MB
    if (fileSize && fileSize > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Compressed file size exceeds 2 MB limit' }, { status: 400 });
    }

    if (!isR2Configured) {
      return NextResponse.json({
        error: 'Cloudflare R2 is not configured in environment variables.',
        isConfigured: false,
      }, { status: 503 });
    }

    // Clean and sanitize filename
    const cleanFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    const timestamp = Date.now();
    const propFolder = propertyId ? `prop_${propertyId}` : `draft_${timestamp}`;
    const key = `real-estate/${propFolder}/photo_${slotIndex}_${timestamp}_${cleanFileName}`;

    const { uploadUrl, publicUrl } = await getR2PresignedUploadUrl(key, contentType);

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error('Real estate upload URL error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
