// src/services/realEstateService.ts
import { supabase } from "@/config/supabaseClient";
import { RealEstateProperty, PropertyFilterState } from "@/types/realEstate";
import { SAMPLE_BANGALORE_PROPERTIES } from "@/data/sampleProperties";

export class RealEstateService {
  /**
   * Fetches active properties based on filter criteria
   */
  static async getProperties(filters?: Partial<PropertyFilterState>): Promise<RealEstateProperty[]> {
    let properties: RealEstateProperty[] = [];

    try {
      let query = supabase
        .from("real_estate_properties")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.intent) {
        query = query.eq("intent", filters.intent);
      }
      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters?.bhk && filters.bhk !== "all") {
        query = query.eq("bhk", filters.bhk);
      }
      if (filters?.locality) {
        query = query.ilike("locality_name", `%${filters.locality}%`);
      }
      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }
      if (filters?.posterType && filters.posterType !== "all") {
        query = query.eq("poster_type", filters.posterType);
      }

      const { data, error } = await query;

      if (data && data.length > 0 && !error) {
        const now = new Date().toISOString();
        properties = data
          .filter((item) => !item.expires_at || item.expires_at > now)
          .map((item) => ({
            ...item,
            images: Array.isArray(item.images) ? item.images : [],
            connectivity: typeof item.connectivity === "object" ? item.connectivity : {},
          }));
      }
    } catch (err) {
      console.warn("Could not query Supabase properties, falling back to local dataset:", err);
    }

    // Merge or fallback to sample properties if DB is empty/unmigrated
    if (properties.length === 0) {
      properties = SAMPLE_BANGALORE_PROPERTIES.filter((p) => {
        if (filters?.intent && p.intent !== filters.intent) return false;
        if (filters?.category && filters.category !== "all" && p.category !== filters.category) return false;
        if (filters?.bhk && filters.bhk !== "all" && p.bhk !== filters.bhk) return false;
        if (filters?.locality && !p.locality_name.toLowerCase().includes(filters.locality.toLowerCase())) return false;
        if (filters?.minPrice && p.price < filters.minPrice) return false;
        if (filters?.maxPrice && p.price > filters.maxPrice) return false;
        if (filters?.posterType && filters.posterType !== "all" && p.poster_type !== filters.posterType) return false;
        return true;
      });
    }

    return properties;
  }

  /**
   * Fetches single property details by ID
   */
  static async getPropertyById(id: string): Promise<RealEstateProperty | null> {
    try {
      const { data, error } = await supabase
        .from("real_estate_properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data && !error) {
        return {
          ...data,
          images: Array.isArray(data.images) ? data.images : [],
          connectivity: typeof data.connectivity === "object" ? data.connectivity : {},
        };
      }
    } catch (err) {
      console.warn("Supabase lookup error:", err);
    }

    // Fallback to sample data
    const sample = SAMPLE_BANGALORE_PROPERTIES.find((p) => p.id === id);
    return sample || null;
  }

  /**
   * Submits a new property listing
   */
  static async createProperty(property: Omit<RealEstateProperty, "id" | "created_at" | "views_count" | "inquiries_count">) {
    const isUuid = (val?: string) =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const cleanPayload: Record<string, any> = {
      ...property,
      user_id: isUuid(property.user_id) ? property.user_id : null,
      locality_id: isUuid(property.locality_id) ? property.locality_id : null,
      status: "active",
      views_count: 0,
      inquiries_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Remove any undefined keys so PostgREST doesn't reject with 400
    Object.keys(cleanPayload).forEach((key) => {
      if (cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
    });

    let insertRes = await supabase
      .from("real_estate_properties")
      .insert(cleanPayload)
      .select()
      .single();

    // Resilient schema cache reconciliation:
    // If remote DB is missing a column (like expires_at) that hasn't been migrated yet,
    // automatically strip that column and retry immediately so publishing NEVER fails.
    let attempts = 0;
    while (insertRes.error && insertRes.error.message && insertRes.error.message.includes("schema cache") && attempts < 5) {
      attempts++;
      const match = insertRes.error.message.match(/Could not find the '([^']+)' column/i);
      if (match && match[1] && match[1] in cleanPayload) {
        const missingCol = match[1];
        console.warn(`[RealEstateService] Stripping unmigrated column '${missingCol}' from payload and retrying insert...`);
        delete cleanPayload[missingCol];
        insertRes = await supabase
          .from("real_estate_properties")
          .insert(cleanPayload)
          .select()
          .single();
      } else {
        break;
      }
    }

    if (insertRes.error) {
      console.error("Failed to insert property in Supabase:", insertRes.error);
      throw new Error(insertRes.error.message || "Failed to save property to database");
    }

    return insertRes.data;
  }

  /**
   * Fetches all properties posted by a specific user (for owner dashboard)
   */
  static async getUserProperties(userId: string): Promise<RealEstateProperty[]> {
    try {
      const { data, error } = await supabase
        .from("real_estate_properties")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user properties:", error);
        return [];
      }

      return (data || []).map((item) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        connectivity: typeof item.connectivity === "object" ? item.connectivity : {},
      }));
    } catch (err) {
      console.error("getUserProperties error:", err);
      return [];
    }
  }

  /**
   * Updates an existing property (price, description, status, etc.)
   */
  static async updateProperty(id: string, updates: Partial<RealEstateProperty>) {
    const isUuid = (val?: string) =>
      typeof val === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const cleanUpdates = { ...updates };
    if ("locality_id" in cleanUpdates && !isUuid(cleanUpdates.locality_id)) {
      cleanUpdates.locality_id = null as any;
    }

    let updateRes = await supabase
      .from("real_estate_properties")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    let attempts = 0;
    while (updateRes.error && updateRes.error.message && updateRes.error.message.includes("schema cache") && attempts < 5) {
      attempts++;
      const match = updateRes.error.message.match(/Could not find the '([^']+)' column/i);
      if (match && match[1] && match[1] in cleanUpdates) {
        const missingCol = match[1];
        console.warn(`[RealEstateService] Stripping unmigrated column '${missingCol}' from update and retrying...`);
        delete (cleanUpdates as any)[missingCol];
        updateRes = await supabase
          .from("real_estate_properties")
          .update({
            ...cleanUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();
      } else {
        break;
      }
    }

    if (updateRes.error) {
      console.error("Failed to update property in Supabase:", updateRes.error);
      throw updateRes.error;
    }

    return updateRes.data;
  }

  /**
   * Deletes a property and purges associated images from Cloudflare R2
   */
  static async deleteProperty(id: string, imageUrls: string[] = []): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/real-estate/delete", {
        method: "POST",
        headers,
        body: JSON.stringify({
          propertyId: id,
          imageUrls,
          userId: session?.user?.id || undefined,
          userEmail: session?.user?.email || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        // Direct client-side deletion fallback if API route returned 403 or error
        const { error: clientDeleteErr } = await supabase
          .from("real_estate_properties")
          .delete()
          .eq("id", id);

        if (clientDeleteErr) {
          throw new Error(errData.error || clientDeleteErr.message || "Failed to delete property");
        }
      }

      return true;
    } catch (err) {
      console.error("deleteProperty error:", err);
      throw err;
    }
  }

  /**
   * Admin: Fetches all properties in any status (active, rejected, sold)
   */
  static async getAllPropertiesForAdmin(): Promise<RealEstateProperty[]> {
    try {
      const { data, error } = await supabase
        .from("real_estate_properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin fetch error:", error);
        return [];
      }

      return (data || []).map((item) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        connectivity: typeof item.connectivity === "object" ? item.connectivity : {},
      }));
    } catch (err) {
      console.error("getAllPropertiesForAdmin error:", err);
      return [];
    }
  }
}
