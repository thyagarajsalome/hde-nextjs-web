// src/app/api/real-estate/delete/route.ts
import { NextResponse } from 'next/server';
import { deleteFromR2, isR2Configured, R2_PUBLIC_URL } from '@/lib/r2';
import { supabase } from '@/config/supabaseClient';

const ADMIN_EMAIL = 'thyagaraja1983@gmail.com';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { propertyId, imageUrls = [], userId, userEmail } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    // 1. Authenticate user from session token
    const authHeader = request.headers.get('authorization');
    let user: any = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
      }
    }

    // Fallback: check session from supabase client
    if (!user) {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }

    // 2. Fetch the property to verify ownership
    const { data: property, error: fetchErr } = await supabase
      .from('real_estate_properties')
      .select('id, user_id, contact_phone, images')
      .eq('id', propertyId)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error fetching property for deletion:', fetchErr);
    }

    // If property not found, it might already be deleted
    if (!property) {
      return NextResponse.json({ success: true, deletedId: propertyId, note: 'Listing already deleted' });
    }

    const effectiveEmail = (user?.email || userEmail || '').toLowerCase();
    const effectiveUserId = user?.id || userId;

    const isAdmin = Boolean(effectiveEmail && effectiveEmail === ADMIN_EMAIL.toLowerCase());
    const isOwner = Boolean(
      (effectiveUserId && property.user_id && property.user_id === effectiveUserId) ||
      (property.user_id == null) // Legacy properties without user_id can be cleared
    );

    // In local dev/test or when authorized as admin/owner
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isAdmin && !isOwner && !isDev) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the property owner or administrator can delete this listing' },
        { status: 403 }
      );
    }

    // 3. Purge images from Cloudflare R2
    const allImages: string[] = [
      ...(Array.isArray(imageUrls) ? imageUrls : []),
      ...(property && Array.isArray(property.images) ? property.images : [])
    ];
    const uniqueImages = Array.from(new Set(allImages));

    if (isR2Configured && uniqueImages.length > 0) {
      for (const imgUrl of uniqueImages) {
        try {
          // Extract R2 key from full public URL
          let key = '';
          if (imgUrl.includes('/real-estate/')) {
            key = 'real-estate/' + imgUrl.split('/real-estate/')[1];
          } else if (R2_PUBLIC_URL && imgUrl.startsWith(R2_PUBLIC_URL)) {
            key = imgUrl.replace(R2_PUBLIC_URL, '').replace(/^\/+/, '');
          }

          if (key) {
            await deleteFromR2(key);
            console.log(`[R2 Purged] Deleted ${key}`);
          }
        } catch (imgPurgeErr) {
          console.warn('Failed to delete image from R2:', imgUrl, imgPurgeErr);
        }
      }
    }

    // 4. Delete property from Supabase
    const { error: deleteErr } = await supabase
      .from('real_estate_properties')
      .delete()
      .eq('id', propertyId);

    if (deleteErr) {
      console.error('Failed to delete property from database:', deleteErr);
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedId: propertyId,
      purgedImagesCount: uniqueImages.length,
      deletedByAdmin: isAdmin
    });
  } catch (error: any) {
    console.error('Error in real-estate delete route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
