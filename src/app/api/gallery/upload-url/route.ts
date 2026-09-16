// src/app/api/gallery/upload-url/route.ts
import { NextResponse } from 'next/server';
import { getR2PresignedUploadUrl, isR2Configured } from '@/lib/r2';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, category = 'kitchen', fileSize } = body;
    const contentType = body.contentType || body.fileType || 'image/webp';

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    const ALLOWED_CATEGORIES = ['kitchen', 'bathroom', 'gallery'];
    const ALLOWED_CONTENT_TYPES = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'];

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Unsupported contentType: ${contentType}. Allowed: image/webp, image/jpeg, image/png` }, { status: 400 });
    }

    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10 MB limit' }, { status: 400 });
    }

    if (!isR2Configured) {
      return NextResponse.json({
        error: 'Cloudflare R2 is not configured in environment variables.',
        isConfigured: false,
        requiredEnvVars: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
      }, { status: 503 });
    }

    // Clean and sanitize filename to prevent path traversal or special character issues
    const cleanFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');
      
    const key = `gallery/${category}/${Date.now()}-${cleanFileName}`;

    const { uploadUrl, publicUrl } = await getR2PresignedUploadUrl(key, contentType);

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error: any) {
    console.error('Error generating R2 upload URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
