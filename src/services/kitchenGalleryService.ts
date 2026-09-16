// src/services/kitchenGalleryService.ts
import { supabase } from '@/config/supabaseClient';
import { KitchenDesign, CreateKitchenDesignInput } from '@/types/gallery';

// ── Column sets for bandwidth optimization ──────────────────────────────────
// Card grid: only the fields needed for the gallery card view
const CARD_COLUMNS = 'id,title,slug,image_url,alt_text,layout_shape,dimensions,cabinet_finish,countertop_material,min_cost,max_cost,rate_per_unit,formatted_budget,is_featured,is_active,display_order';

// Full detail: all columns (used for modal view and admin)
const FULL_COLUMNS = '*';

// ── Lazy fallback loader (keeps main bundle small) ──────────────────────────
async function loadFallbackDesigns(): Promise<KitchenDesign[]> {
  const mod = await import('@/data/kitchenFallbackDesigns');
  return mod.default;
}

export const KitchenGalleryService = {
  /**
   * Fetch all kitchen designs for admin management (all columns, active and inactive)
   */
  async getAllDesignsForAdmin(): Promise<KitchenDesign[]> {
    try {
      const { data, error } = await supabase
        .from('kitchen_designs')
        .select(FULL_COLUMNS)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return loadFallbackDesigns();
      }

      return data as KitchenDesign[];
    } catch {
      return loadFallbackDesigns();
    }
  },

  /**
   * Fetch kitchen designs for the public gallery grid (lightweight card columns only)
   */
  async getDesigns(shapeFilter?: string, activeOnly: boolean = true): Promise<KitchenDesign[]> {
    try {
      let query = supabase.from('kitchen_designs').select(CARD_COLUMNS).order('display_order', { ascending: true }).order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      if (shapeFilter && shapeFilter !== 'All') {
        query = query.eq('layout_shape', shapeFilter);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to static items if DB table is not yet created or empty
        let list = await loadFallbackDesigns();
        if (activeOnly) list = list.filter(item => item.is_active);
        if (shapeFilter && shapeFilter !== 'All') list = list.filter(item => item.layout_shape === shapeFilter);
        return list;
      }

      return data as KitchenDesign[];
    } catch (err) {
      console.warn('Error fetching kitchen designs from Supabase, using fallback:', err);
      let list = await loadFallbackDesigns();
      if (activeOnly) list = list.filter(item => item.is_active);
      if (shapeFilter && shapeFilter !== 'All') list = list.filter(item => item.layout_shape === shapeFilter);
      return list;
    }
  },

  /**
   * Fetch a single kitchen design by ID with ALL columns (for modal detail view)
   */
  async getDesignById(id: string): Promise<KitchenDesign | null> {
    try {
      const { data, error } = await supabase
        .from('kitchen_designs')
        .select(FULL_COLUMNS)
        .eq('id', id)
        .single();

      if (error || !data) {
        const fallback = await loadFallbackDesigns();
        return fallback.find(item => item.id === id) || null;
      }

      return data as KitchenDesign;
    } catch {
      const fallback = await loadFallbackDesigns();
      return fallback.find(item => item.id === id) || null;
    }
  },

  /**
   * Fetch a single kitchen design by slug
   */
  async getBySlug(slug: string): Promise<KitchenDesign | null> {
    try {
      const { data, error } = await supabase
        .from('kitchen_designs')
        .select(FULL_COLUMNS)
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        const fallback = await loadFallbackDesigns();
        return fallback.find(item => item.slug === slug) || null;
      }

      return data as KitchenDesign;
    } catch {
      const fallback = await loadFallbackDesigns();
      return fallback.find(item => item.slug === slug) || null;
    }
  },

  /**
   * Create a new kitchen design entry (Admin)
   */
  async createDesign(input: CreateKitchenDesignInput): Promise<{ data?: KitchenDesign; error?: string }> {
    try {
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const payload = {
        ...input,
        slug,
        meta_title: input.meta_title || `${input.title} | Kitchen Design & Cost`,
        meta_description: input.meta_description || `Explore this ${input.layout_shape} modular kitchen design (${input.dimensions}) with approximate cost of ${input.formatted_budget}.`,
        features: input.features || [],
        keywords: input.keywords || [],
        is_active: input.is_active ?? true,
        is_featured: input.is_featured ?? false,
        display_order: input.display_order ?? 0,
        aspect_ratio: input.aspect_ratio || '9:16'
      };

      const { data, error } = await supabase
        .from('kitchen_designs')
        .insert([payload])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: data as KitchenDesign };
    } catch (err: any) {
      return { error: err.message || 'Failed to create kitchen design' };
    }
  },

  /**
   * Update an existing design entry (Admin)
   */
  async updateDesign(id: string, updates: Partial<CreateKitchenDesignInput>): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('kitchen_designs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to update kitchen design' };
    }
  },

  /**
   * Delete an existing design entry (Admin)
   */
  async deleteDesign(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('kitchen_designs')
        .delete()
        .eq('id', id);

      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to delete kitchen design' };
    }
  }
};
