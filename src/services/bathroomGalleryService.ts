// src/services/bathroomGalleryService.ts
import { supabase } from '@/config/supabaseClient';
import { BathroomDesign, CreateBathroomDesignInput, BathroomLayoutType } from '@/types/gallery';

// ── Column sets for bandwidth optimization ──────────────────────────────────
// Card grid: only the fields needed for the gallery card view
const CARD_COLUMNS = 'id,title,slug,image_url,alt_text,layout_type,dimensions,tile_concept,partition_type,formatted_budget,is_featured,is_active,display_order';

// Full detail: all columns (used for modal view and admin)
const FULL_COLUMNS = '*';

// ── Lazy fallback loader (keeps main bundle small) ──────────────────────────
async function loadFallbackDesigns(): Promise<BathroomDesign[]> {
  const mod = await import('@/data/bathroomFallbackDesigns');
  return mod.default;
}

export const bathroomGalleryService = {
  /**
   * Fetch active bathroom designs for the public gallery grid (lightweight card columns only)
   */
  async getActiveDesigns(layoutType?: BathroomLayoutType): Promise<BathroomDesign[]> {
    try {
      let query = supabase
        .from('bathroom_designs')
        .select(CARD_COLUMNS)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (layoutType) {
        query = query.eq('layout_type', layoutType);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        let fallback = await loadFallbackDesigns();
        fallback = fallback.filter(d => d.is_active);
        if (layoutType) fallback = fallback.filter(d => d.layout_type === layoutType);
        return fallback;
      }

      return data as BathroomDesign[];
    } catch {
      let fallback = await loadFallbackDesigns();
      fallback = fallback.filter(d => d.is_active);
      if (layoutType) fallback = fallback.filter(d => d.layout_type === layoutType);
      return fallback;
    }
  },

  /**
   * Fetch a single design by ID with ALL columns (for modal detail view)
   */
  async getDesignById(id: string): Promise<BathroomDesign | null> {
    try {
      const { data, error } = await supabase
        .from('bathroom_designs')
        .select(FULL_COLUMNS)
        .eq('id', id)
        .single();

      if (error || !data) {
        const fallback = await loadFallbackDesigns();
        return fallback.find(d => d.id === id) || null;
      }

      return data as BathroomDesign;
    } catch {
      const fallback = await loadFallbackDesigns();
      return fallback.find(d => d.id === id) || null;
    }
  },

  /**
   * Fetch a single design by slug for detail view or SEO landing
   */
  async getDesignBySlug(slug: string): Promise<BathroomDesign | null> {
    try {
      const { data, error } = await supabase
        .from('bathroom_designs')
        .select(FULL_COLUMNS)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        const fallback = await loadFallbackDesigns();
        return fallback.find(d => d.slug === slug) || null;
      }

      return data as BathroomDesign;
    } catch {
      const fallback = await loadFallbackDesigns();
      return fallback.find(d => d.slug === slug) || null;
    }
  },

  /**
   * Admin: Fetch all designs including inactive (paginated, default 50)
   */
  async getAllDesignsForAdmin(limit: number = 50, offset: number = 0): Promise<BathroomDesign[]> {
    try {
      const { data, error } = await supabase
        .from('bathroom_designs')
        .select(FULL_COLUMNS)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error || !data || data.length === 0) {
        return await loadFallbackDesigns();
      }

      return data as BathroomDesign[];
    } catch {
      return await loadFallbackDesigns();
    }
  },

  /**
   * Admin: Create a new bathroom design entry
   */
  async createDesign(input: CreateBathroomDesignInput): Promise<{ success: boolean; data?: BathroomDesign; error?: string }> {
    try {
      const generatedSlug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const newRecord = {
        title: input.title,
        slug: generatedSlug,
        meta_title: input.meta_title || `${input.title} | HDE Bathroom Gallery`,
        meta_description: input.meta_description || `View specs and approximate cost for ${input.title}.`,
        alt_text: input.alt_text || input.title,
        layout_type: input.layout_type,
        dimensions: input.dimensions,
        tile_concept: input.tile_concept,
        vanity_type: input.vanity_type,
        fittings_brand: input.fittings_brand,
        partition_type: input.partition_type,
        features: input.features || [],
        min_cost: input.min_cost,
        max_cost: input.max_cost,
        formatted_budget: input.formatted_budget,
        rate_per_unit: input.rate_per_unit || '₹1,800 / sq ft',
        image_url: input.image_url,
        thumbnail_url: input.thumbnail_url || input.image_url,
        file_name: input.file_name,
        aspect_ratio: input.aspect_ratio || '9:16',
        file_size_kb: input.file_size_kb || 80,
        keywords: input.keywords || [],
        is_featured: input.is_featured ?? false,
        is_active: input.is_active ?? true,
        display_order: input.display_order ?? 0,
      };

      const { data, error } = await supabase
        .from('bathroom_designs')
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as BathroomDesign };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create bathroom design' };
    }
  },

  /**
   * Admin: Update an existing bathroom design entry
   */
  async updateDesign(id: string, updates: Partial<CreateBathroomDesignInput>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bathroom_designs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update bathroom design' };
    }
  },

  /**
   * Admin: Toggle active status
   */
  async toggleActive(id: string, currentState: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bathroom_designs')
        .update({ is_active: !currentState, updated_at: new Date().toISOString() })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Admin: Delete a design entry
   */
  async deleteDesign(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bathroom_designs')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }
};
