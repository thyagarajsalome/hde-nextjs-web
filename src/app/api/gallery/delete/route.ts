// src/app/api/gallery/delete/route.ts
import { NextResponse } from 'next/server';
import { deleteFromR2, isR2Configured } from '@/lib/r2';
import { supabase } from '@/config/supabaseClient';

const ADMIN_EMAIL = 'thyagaraja1983@gmail.com';

export async function POST(request: Request) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.json({
          error: `Unauthorized: Deletions are strictly restricted to administrator ${ADMIN_EMAIL}`
        }, { status: 403 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        error: 'Unauthorized: Admin authentication required for deletions'
      }, { status: 401 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: 'Storage key is required' }, { status: 400 });
    }

    if (!isR2Configured) {
      return NextResponse.json({
        error: 'Cloudflare R2 is not configured.'
      }, { status: 503 });
    }

    // Clean key and ensure safe path
    const cleanKey = key.replace(/^\/+/, '');
    await deleteFromR2(cleanKey);

    return NextResponse.json({ success: true, deletedKey: cleanKey });
  } catch (error: any) {
    console.error('Error deleting from R2:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
