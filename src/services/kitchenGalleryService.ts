// src/services/kitchenGalleryService.ts
import { supabase } from '@/config/supabaseClient';
import { KitchenDesign, CreateKitchenDesignInput, KitchenLayoutShape } from '@/types/gallery';

// Initial curated fallback items for instant display & development testing
export const INITIAL_KITCHEN_DESIGNS: KitchenDesign[] = [
  {
    id: "kit-l-shape-01",
    slug: "modern-l-shape-acrylic-modular-kitchen-grey-white",
    title: "Dual-Tone L-Shape Acrylic Kitchen with Quartz Countertop",
    meta_title: "L-Shape Acrylic Modular Kitchen Design & Cost (8x10 ft) | HDE",
    meta_description: "Explore this 80 sq ft modern L-shape modular kitchen in dual-tone grey and white acrylic finish with seamless quartz countertop and chimney loft storage.",
    alt_text: "Modern L shape modular kitchen design in grey acrylic with quartz counter",
    layout_shape: "L-Shape",
    dimensions: "10 ft × 8 ft (80 sq ft)",
    countertop_length_ft: 18,
    cabinet_finish: "High-Gloss Acrylic",
    countertop_material: "Engineered Quartz",
    features: ["Hydraulic Lift-Up Cabinets", "Tandem Box Drawers", "Concealed Profile Handles", "Full Loft Storage", "Under-Cabinet LED Strips"],
    min_cost: 145000,
    max_cost: 210000,
    formatted_budget: "₹1.45 Lakhs - ₹2.10 Lakhs",
    rate_per_unit: "₹1,650 / sq ft",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=720&q=80",
    file_name: "modern-l-shape-acrylic-modular-kitchen-grey-white.webp",
    aspect_ratio: "9:16",
    file_size_kb: 72,
    keywords: ["l shape modular kitchen", "acrylic kitchen design", "modular kitchen cost", "8x10 kitchen design"],
    is_featured: true,
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "kit-parallel-02",
    slug: "compact-parallel-modular-kitchen-matte-black-wood",
    title: "Sleek Parallel Galley Kitchen with Wooden Accent Cabinets",
    meta_title: "Parallel Modular Kitchen Design for Compact Apartments | HDE",
    meta_description: "Space-saving parallel galley modular kitchen design with matte black base units, warm wooden overhead cabinets, and heavy-duty granite countertop.",
    alt_text: "Sleek parallel galley modular kitchen design with wooden cabinets",
    layout_shape: "Parallel",
    dimensions: "12 ft × 7 ft (84 sq ft)",
    countertop_length_ft: 20,
    cabinet_finish: "Matte Laminate & Wood Grain",
    countertop_material: "Jet Black Granite",
    features: ["Opposite Counter Work Triangle", "Deep Cutlery Organizers", "Tall Spice Pull-Out", "Dual Sink Basin"],
    min_cost: 125000,
    max_cost: 180000,
    formatted_budget: "₹1.25 Lakhs - ₹1.80 Lakhs",
    rate_per_unit: "₹1,450 / sq ft",
    image_url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=720&q=80",
    file_name: "compact-parallel-modular-kitchen-matte-black-wood.webp",
    aspect_ratio: "9:16",
    file_size_kb: 68,
    keywords: ["parallel kitchen design", "galley kitchen cost", "small flat kitchen", "black and wood kitchen"],
    is_featured: true,
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: "kit-u-shape-03",
    slug: "luxury-u-shape-modular-kitchen-nano-white-breakfast-bar",
    title: "Grand U-Shape Kitchen with Breakfast Counter & Glass Cabinets",
    meta_title: "Luxury U-Shape Modular Kitchen with Breakfast Bar | HDE",
    meta_description: "Spacious U-shaped modular kitchen featuring pristine nano-white countertop, fluted glass upper cabinets, built-in microwave oven unit, and breakfast bar.",
    alt_text: "Luxury U shape modular kitchen design with breakfast counter and glass cabinets",
    layout_shape: "U-Shape",
    dimensions: "12 ft × 10 ft (120 sq ft)",
    countertop_length_ft: 26,
    cabinet_finish: "PU Lacquer Satin Finish",
    countertop_material: "Nano White Crystal",
    features: ["Built-In Appliance Tall Unit", "Breakfast Counter with Stools", "Fluted Glass Cabinets", "Corner Carousel Trays"],
    min_cost: 220000,
    max_cost: 320000,
    formatted_budget: "₹2.20 Lakhs - ₹3.20 Lakhs",
    rate_per_unit: "₹1,850 / sq ft",
    image_url: "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=720&q=80",
    file_name: "luxury-u-shape-modular-kitchen-nano-white-breakfast-bar.webp",
    aspect_ratio: "9:16",
    file_size_kb: 84,
    keywords: ["u shape modular kitchen", "luxury kitchen interior", "nano white countertop", "breakfast bar kitchen"],
    is_featured: true,
    is_active: true,
    display_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: "kit-island-04",
    slug: "contemporary-open-island-kitchen-champagne-gold-profile",
    title: "Open Island Modular Kitchen with Champagne Gold Profiles",
    meta_title: "Modern Open Concept Island Kitchen Design & Cost | HDE",
    meta_description: "Contemporary open-concept island kitchen with central prep island, integrated chimney hob, and sleek champagne gold handle profiles.",
    alt_text: "Contemporary open island kitchen design with central prep counter",
    layout_shape: "Island",
    dimensions: "14 ft × 12 ft (168 sq ft)",
    countertop_length_ft: 30,
    cabinet_finish: "Super-Matte Anti-Fingerprint Acrylic",
    countertop_material: "Calacatta Quartz",
    features: ["Freestanding Kitchen Island", "Ceiling Mounted Island Chimney", "Integrated Dishwasher Panel", "Wine Storage Rack"],
    min_cost: 310000,
    max_cost: 450000,
    formatted_budget: "₹3.10 Lakhs - ₹4.50 Lakhs",
    rate_per_unit: "₹2,100 / sq ft",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=720&q=80",
    file_name: "contemporary-open-island-kitchen-champagne-gold-profile.webp",
    aspect_ratio: "9:16",
    file_size_kb: 91,
    keywords: ["island kitchen design", "open kitchen cost", "luxury villa kitchen", "quartz island counter"],
    is_featured: false,
    is_active: true,
    display_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: "kit-straight-05",
    slug: "minimalist-single-wall-straight-kitchen-budget-friendly",
    title: "Minimalist Straight Line Kitchen for Studio & 1BHK Apartments",
    meta_title: "Straight Line Modular Kitchen Design for Small Spaces | HDE",
    meta_description: "Affordable and compact straight line modular kitchen design with glossy laminate shutters, stainless steel sink, and organized drawer units.",
    alt_text: "Minimalist straight line modular kitchen design for small apartments",
    layout_shape: "Straight",
    dimensions: "9 ft × 6 ft (54 sq ft)",
    countertop_length_ft: 9,
    cabinet_finish: "Glossy High-Pressure Laminate",
    countertop_material: "Polished Black Pearl Granite",
    features: ["Single Wall Space Optimizer", "Overhead Plate Rack", "Cutlery Basket", "Easy-Clean Backsplash"],
    min_cost: 65000,
    max_cost: 95000,
    formatted_budget: "₹65,000 - ₹95,000",
    rate_per_unit: "₹1,250 / sq ft",
    image_url: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=720&q=80",
    file_name: "minimalist-single-wall-straight-kitchen-budget-friendly.webp",
    aspect_ratio: "9:16",
    file_size_kb: 61,
    keywords: ["straight kitchen design", "single wall kitchen", "budget modular kitchen", "1bhk kitchen cost"],
    is_featured: false,
    is_active: true,
    display_order: 5,
    created_at: new Date().toISOString()
  }
];

export const KitchenGalleryService = {
  /**
   * Fetch all kitchen designs with optional layout shape filter
   */
  async getDesigns(shapeFilter?: string, activeOnly: boolean = true): Promise<KitchenDesign[]> {
    try {
      let query = supabase.from('kitchen_designs').select('*').order('display_order', { ascending: true }).order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      if (shapeFilter && shapeFilter !== 'All') {
        query = query.eq('layout_shape', shapeFilter);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to static items if DB table is not yet created or empty
        let list = INITIAL_KITCHEN_DESIGNS;
        if (activeOnly) list = list.filter(item => item.is_active);
        if (shapeFilter && shapeFilter !== 'All') list = list.filter(item => item.layout_shape === shapeFilter);
        return list;
      }

      return data as KitchenDesign[];
    } catch (err) {
      console.warn('Error fetching kitchen designs from Supabase, using initial fallback:', err);
      let list = INITIAL_KITCHEN_DESIGNS;
      if (activeOnly) list = list.filter(item => item.is_active);
      if (shapeFilter && shapeFilter !== 'All') list = list.filter(item => item.layout_shape === shapeFilter);
      return list;
    }
  },

  /**
   * Fetch a single kitchen design by slug
   */
  async getBySlug(slug: string): Promise<KitchenDesign | null> {
    try {
      const { data, error } = await supabase
        .from('kitchen_designs')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return INITIAL_KITCHEN_DESIGNS.find(item => item.slug === slug) || null;
      }

      return data as KitchenDesign;
    } catch {
      return INITIAL_KITCHEN_DESIGNS.find(item => item.slug === slug) || null;
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
