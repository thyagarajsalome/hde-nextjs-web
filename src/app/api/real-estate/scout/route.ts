// src/app/api/real-estate/scout/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/config/supabaseClient";

// 1. GET /api/real-estate/scout - Fetch scout leads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locality = searchParams.get("locality");
    const category = searchParams.get("category");
    const intent = searchParams.get("intent");
    const userId = searchParams.get("userId");

    let query = supabase
      .from("property_scout_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      // Public only sees active leads (deal_closed leads are hidden)
      query = query.eq("status", "active");
    }

    if (locality && locality !== "all") {
      query = query.ilike("locality_name", `%${locality}%`);
    }
    if (category && category !== "all") {
      query = query.eq("property_category", category);
    }
    if (intent && intent !== "all") {
      query = query.eq("intent", intent);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch scout leads" }, { status: 500 });
  }
}

// 2. POST /api/real-estate/scout - Create a new scout lead
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      user_id,
      locality_name,
      property_category = "flat",
      intent = "rent",
      approx_price_or_rent,
      expected_finders_fee = 2000,
      finders_fee_type = "fixed_amount",
      board_photo_url,
      property_address_hint,
      owner_name,
      owner_phone,
      scout_name,
      scout_phone,
      scout_upi_id,
    } = body;

    if (!locality_name || !property_address_hint || !owner_phone || !scout_name || !scout_phone) {
      return NextResponse.json(
        { error: "Missing required fields: locality_name, property_address_hint, owner_phone, scout_name, scout_phone" },
        { status: 400 }
      );
    }

    const isUuid = (val?: string) =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const payload: Record<string, any> = {
      user_id: isUuid(user_id) ? user_id : null,
      locality_name,
      property_category,
      intent,
      approx_price_or_rent: approx_price_or_rent ? Number(approx_price_or_rent) : null,
      expected_finders_fee: Number(expected_finders_fee),
      finders_fee_type,
      board_photo_url: board_photo_url || null,
      property_address_hint,
      owner_name: owner_name || null,
      owner_phone: String(owner_phone).replace(/[^0-9]/g, ""),
      scout_name,
      scout_phone: String(scout_phone).replace(/[^0-9]/g, ""),
      scout_upi_id: scout_upi_id || null,
      status: "active",
      views_count: 0,
    };

    const { data, error } = await supabase
      .from("property_scout_leads")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("API createScoutLead error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("API scout POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to create scout lead" }, { status: 500 });
  }
}

// 3. PATCH /api/real-estate/scout - Update scout lead (edit or mark as deal closed)
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("property_scout_leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update scout lead" }, { status: 500 });
  }
}

// 4. DELETE /api/real-estate/scout - Delete scout lead permanently
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("property_scout_leads")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete scout lead" }, { status: 500 });
  }
}
