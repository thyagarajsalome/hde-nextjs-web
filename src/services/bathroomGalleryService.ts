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

// ── Layout Normalizer & Sanitizer ──────────────────────────────────────────
// Supabase live database check constraint currently allows:
// ('Master Bathroom', 'Wet & Dry Partition', 'Powder Room', 'Luxury Suite')
// 'Compact 3-Fixture' is safely stored as 'Wet & Dry Partition' with the 'Compact 3-Fixture' keyword,
// and transparently restored to 'Compact 3-Fixture' on read so the UI always has the right layout.
function normalizeBathroomDesign(d: any): BathroomDesign {
  if (!d) return d;
  if (
    d.layout_type === 'Compact 3-Fixture' ||
    (d.layout_type === 'Wet & Dry Partition' &&
      (d.slug?.toLowerCase().includes('3-fixture') ||
       d.title?.toLowerCase().includes('3-fixture') ||
       (Array.isArray(d.keywords) && d.keywords.includes('Compact 3-Fixture'))))
  ) {
    return { ...d, layout_type: 'Compact 3-Fixture' };
  }
  if (
    d.layout_type === 'Luxury Suite' ||
    (d.layout_type === 'Wet & Dry Partition' &&
      (d.slug?.toLowerCase().includes('luxury') ||
       d.title?.toLowerCase().includes('luxury suite') ||
       (Array.isArray(d.keywords) && d.keywords.includes('Luxury Suite'))))
  ) {
    return { ...d, layout_type: 'Luxury Suite' };
  }
  return d as BathroomDesign;
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
        if (layoutType === 'Compact 3-Fixture') {
          query = query.in('layout_type', ['Wet & Dry Partition', 'Compact 3-Fixture']);
        } else if (layoutType === 'Wet & Dry Partition') {
          query = query.eq('layout_type', 'Wet & Dry Partition');
        } else {
          query = query.eq('layout_type', layoutType);
        }
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        let fallback = await loadFallbackDesigns();
        fallback = fallback.filter(d => d.is_active);
        if (layoutType) fallback = fallback.filter(d => d.layout_type === layoutType);
        return fallback;
      }

      let normalized = data.map(normalizeBathroomDesign);
      if (layoutType) {
        normalized = normalized.filter(d => d.layout_type === layoutType);
      }
      return normalized;
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

      return normalizeBathroomDesign(data);
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

      return normalizeBathroomDesign(data);
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

      return data.map(normalizeBathroomDesign);
    } catch {
      return await loadFallbackDesigns();
    }
  },

  /**
   * Admin: Create a new bathroom design entry
   */
  async createDesign(input: CreateBathroomDesignInput): Promise<{ success: boolean; data?: BathroomDesign; error?: string }> {
    try {
      // 1. Sanitize Layout to strictly match SQL check constraint
      const isCompact = input.layout_type === 'Compact 3-Fixture' ||
        input.layout_type?.toLowerCase().includes('compact') ||
        input.layout_type?.toLowerCase().includes('3-fixture');

      let dbLayoutType: string;
      if (isCompact) {
        // Supabase DB check constraint currently restricts layout_type to:
        // ('Master Bathroom', 'Wet & Dry Partition', 'Powder Room', 'Luxury Suite')
        // We safely store as 'Wet & Dry Partition' with 'Compact 3-Fixture' keyword tag
        dbLayoutType = 'Wet & Dry Partition';
      } else if (input.layout_type?.toLowerCase().includes('master')) {
        dbLayoutType = 'Master Bathroom';
      } else if (input.layout_type?.toLowerCase().includes('powder')) {
        dbLayoutType = 'Powder Room';
      } else if (input.layout_type?.toLowerCase().includes('luxury') || input.layout_type?.toLowerCase().includes('suite')) {
        dbLayoutType = 'Luxury Suite';
      } else {
        dbLayoutType = 'Wet & Dry Partition';
      }

      const keywords = Array.isArray(input.keywords) && input.keywords.length > 0
        ? [...input.keywords]
        : ['bathroom design india', 'modern bathroom cost'];
      if (isCompact && !keywords.includes('Compact 3-Fixture')) {
        keywords.push('Compact 3-Fixture');
      }

      // 2. Generate clean, unique slug
      let generatedSlug = (input.slug || input.title || 'bathroom-design')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (!generatedSlug) {
        generatedSlug = `bathroom-design-${Date.now()}`;
      }

      // Prevent duplicate slug collision (409 Conflict)
      try {
        const { data: existing } = await supabase
          .from('bathroom_designs')
          .select('id')
          .eq('slug', generatedSlug)
          .maybeSingle();

        if (existing) {
          generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`;
        }
      } catch (slugCheckErr) {
        // Continue if check fails
      }

      // 3. Fallbacks for all NOT NULL table constraints
      const minCost = (typeof input.min_cost === 'number' && !isNaN(input.min_cost) && input.min_cost > 0)
        ? input.min_cost
        : 120000;
      const maxCost = (typeof input.max_cost === 'number' && !isNaN(input.max_cost) && input.max_cost > 0)
        ? input.max_cost
        : 195000;

      const newRecord = {
        title: input.title || 'Modern Bathroom Design',
        slug: generatedSlug,
        meta_title: input.meta_title || `${input.title || 'Modern Bathroom'} | HDE Bathroom Gallery`,
        meta_description: input.meta_description || `View specs and approximate cost for ${input.title || 'this bathroom design'}.`,
        alt_text: (input.alt_text && input.alt_text.trim()) || `${input.title || 'Modern'} - ${input.layout_type || 'Modern'} bathroom design`,
        layout_type: dbLayoutType,
        dimensions: (input.dimensions && input.dimensions.trim()) || '8 ft × 6 ft (48 sq ft)',
        tile_concept: (input.tile_concept && input.tile_concept.trim()) || 'Vitrified Matte (2x4 ft) + Accent Highlighter',
        vanity_type: (input.vanity_type && input.vanity_type.trim()) || 'Wall-Hung Floating Vanity with Quartz Top',
        fittings_brand: (input.fittings_brand && input.fittings_brand.trim()) || 'Jaquar Concealed Diverter & Rain Shower',
        partition_type: (input.partition_type && input.partition_type.trim()) || '10mm Toughened Frameless Glass Partition',
        features: Array.isArray(input.features) && input.features.length > 0 ? input.features : ['Toughened Glass Partition', 'Wall-Hung WC', 'Anti-Skid Tiles'],
        min_cost: minCost,
        max_cost: maxCost,
        formatted_budget: (input.formatted_budget && input.formatted_budget.trim()) || '₹1.20 Lakhs - ₹1.95 Lakhs',
        rate_per_unit: (input.rate_per_unit && input.rate_per_unit.trim()) || '₹2,450 / sq ft',
        image_url: input.image_url,
        thumbnail_url: input.thumbnail_url || input.image_url,
        file_name: input.file_name || `${generatedSlug}.webp`,
        aspect_ratio: input.aspect_ratio || '9:16',
        file_size_kb: (typeof input.file_size_kb === 'number' && !isNaN(input.file_size_kb)) ? input.file_size_kb : 80,
        keywords: keywords,
        is_featured: input.is_featured ?? false,
        is_active: input.is_active ?? true,
        display_order: (typeof input.display_order === 'number' && !isNaN(input.display_order)) ? input.display_order : 0,
      };

      let { data, error } = await supabase
        .from('bathroom_designs')
        .insert([newRecord])
        .select()
        .single();

      if (error && (error.code === '23514' || error.message?.includes('bathroom_designs_layout_type_check'))) {
        console.warn('Check constraint violation on layout_type, falling back to Wet & Dry Partition with keyword tag');
        newRecord.layout_type = 'Wet & Dry Partition';
        const retryRes = await supabase
          .from('bathroom_designs')
          .insert([newRecord])
          .select()
          .single();
        data = retryRes.data;
        error = retryRes.error;
      }

      if (error) {
        console.error('Supabase bathroom_designs insert error:', error);
        return { success: false, error: `${error.message} (${error.code || '400'})` };
      }

      return { success: true, data: normalizeBathroomDesign(data) };
    } catch (err: any) {
      console.error('BathroomGalleryService createDesign exception:', err);
      return { success: false, error: err.message || 'Failed to create bathroom design' };
    }
  },

  /**
   * Admin: Update an existing bathroom design entry
   */
  async updateDesign(id: string, updates: Partial<CreateBathroomDesignInput>): Promise<{ success: boolean; error?: string }> {
    try {
      const sanitizedUpdates: any = { ...updates };
      if (sanitizedUpdates.layout_type) {
        const isCompact = sanitizedUpdates.layout_type === 'Compact 3-Fixture' ||
          sanitizedUpdates.layout_type.toLowerCase().includes('compact') ||
          sanitizedUpdates.layout_type.toLowerCase().includes('3-fixture');

        if (isCompact) {
          sanitizedUpdates.layout_type = 'Wet & Dry Partition';
          const keywords = Array.isArray(sanitizedUpdates.keywords) ? [...sanitizedUpdates.keywords] : [];
          if (!keywords.includes('Compact 3-Fixture')) {
            keywords.push('Compact 3-Fixture');
          }
          sanitizedUpdates.keywords = keywords;
        } else if (sanitizedUpdates.layout_type.toLowerCase().includes('master')) {
          sanitizedUpdates.layout_type = 'Master Bathroom';
        } else if (sanitizedUpdates.layout_type.toLowerCase().includes('powder')) {
          sanitizedUpdates.layout_type = 'Powder Room';
        } else if (sanitizedUpdates.layout_type.toLowerCase().includes('luxury') || sanitizedUpdates.layout_type.toLowerCase().includes('suite')) {
          sanitizedUpdates.layout_type = 'Luxury Suite';
        } else {
          sanitizedUpdates.layout_type = 'Wet & Dry Partition';
        }
      }
      if (sanitizedUpdates.min_cost !== undefined) {
        sanitizedUpdates.min_cost = Number(sanitizedUpdates.min_cost) || 120000;
      }
      if (sanitizedUpdates.max_cost !== undefined) {
        sanitizedUpdates.max_cost = Number(sanitizedUpdates.max_cost) || 195000;
      }
      sanitizedUpdates.updated_at = new Date().toISOString();

      let { error } = await supabase
        .from('bathroom_designs')
        .update(sanitizedUpdates)
        .eq('id', id);

      if (error && (error.code === '23514' || error.message?.includes('bathroom_designs_layout_type_check'))) {
        console.warn('Check constraint violation on layout_type update, falling back to Wet & Dry Partition');
        sanitizedUpdates.layout_type = 'Wet & Dry Partition';
        const retryRes = await supabase
          .from('bathroom_designs')
          .update(sanitizedUpdates)
          .eq('id', id);
        error = retryRes.error;
      }

      if (error) {
        console.error('Supabase bathroom_designs update error:', error);
        return { success: false, error: `${error.message} (${error.code || '400'})` };
      }

      return { success: true };
    } catch (err: any) {
      console.error('BathroomGalleryService updateDesign exception:', err);
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
