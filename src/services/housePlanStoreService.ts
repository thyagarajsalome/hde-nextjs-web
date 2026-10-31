// src/services/housePlanStoreService.ts
import { supabase } from '../config/supabaseClient';

export interface HousePlanRecord {
  id: string;
  title: string;
  area_sqft: number;
  built_up_area_sqft?: number;
  carpet_area_sqft?: number;
  dimensions: string;
  facing: string;
  floors: string;
  bedrooms: number;
  bathrooms: number;
  living_hall_sqft?: number;
  kitchen_sqft?: number;
  parking: string;
  electrical_points_count?: number;
  orientation_notes?: string;
  description: string;
  file_url: string;        // Preview image in Cloudflare R2
  pdf_url?: string;        // High-res vector drawing pack PDF in Cloudflare R2
  price_inr?: number;      // Default 499
  is_featured?: boolean;
  is_active?: boolean;
  youtube_url?: string;
  created_at?: string;
}

export interface SmartPlanMetrics {
  plotAreaSqft: number;
  builtUpAreaSqft: number;
  carpetAreaSqft: number;
  livingHallSqft: number;
  kitchenSqft: number;
  electricalPointsCount: number;
  orientationNotes: string;
  autoDescription: string;
}

/**
 * Automatically calculates standard Indian spatial metrics, built-up areas,
 * room breakdowns, and electrical points to eliminate manual typing for admins.
 */
export function calculateSmartPlanMetrics(
  dimensions: string,
  floors: string = "G+1",
  bedrooms: number = 3,
  bathrooms: number = 3,
  facing: string = "East"
): SmartPlanMetrics {
  // Parse dimensions e.g. "30x40" -> 30 and 40
  const dimParts = dimensions.toLowerCase().replace(/[^0-9x]/g, '').split('x');
  let width = 30;
  let length = 40;
  if (dimParts.length === 2) {
    width = parseInt(dimParts[0], 10) || 30;
    length = parseInt(dimParts[1], 10) || 40;
  }
  const plotArea = width * length;

  // Floor scale multiplier
  const fl = (floors || "").toLowerCase().trim();
  let floorMultiplier = 0.85; // Ground floor only
  if (fl.includes("g+3") || fl.includes("4")) floorMultiplier = 3.4;
  else if (fl.includes("g+2") || fl.includes("3")) floorMultiplier = 2.55;
  else if (fl.includes("g+1") || fl.includes("duplex") || fl.includes("2")) floorMultiplier = 1.7;

  const builtUp = Math.round(plotArea * floorMultiplier);
  const carpet = Math.round(builtUp * 0.75);

  const livingHallSqft = Math.round(Math.min(320, Math.max(160, carpet * 0.22)));
  const kitchenSqft = Math.round(Math.min(130, Math.max(70, carpet * 0.10)));

  // CPWD norms for residential electrical points (~12-15 points per bedroom + living + kitchen)
  const electricalPoints = Math.round((bedrooms * 12) + (bathrooms * 4) + 18);

  const orientationNotes = `${facing}-Facing Directional Alignment with optimized solar daylighting and cross-ventilation flow.`;

  const autoDescription = `Architectural ${dimensions} (${plotArea.toLocaleString('en-IN')} sq.ft plot) ${bedrooms} BHK ${floors} residential blueprint. Designed with ${facing}-facing solar orientation, featuring a spacious ${livingHallSqft} sq.ft living hall, ${kitchenSqft} sq.ft modular kitchen, ${bedrooms} dedicated bedrooms, ${bathrooms} bathrooms, and covered parking. Built-up area: ${builtUp.toLocaleString('en-IN')} sq.ft (Carpet: ${carpet.toLocaleString('en-IN')} sq.ft) with ~${electricalPoints} planned electrical points.`;

  return {
    plotAreaSqft: plotArea,
    builtUpAreaSqft: builtUp,
    carpetAreaSqft: carpet,
    livingHallSqft,
    kitchenSqft,
    electricalPointsCount: electricalPoints,
    orientationNotes,
    autoDescription,
  };
}

export const HousePlanStoreService = {
  /**
   * Fetch all house plans with optional filtering
   */
  async getAllPlans(options?: { activeOnly?: boolean; dimension?: string; facing?: string }): Promise<HousePlanRecord[]> {
    try {
      let query = supabase
        .from('house_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.activeOnly) {
        query = query.neq('is_active', false);
      }

      if (options?.dimension && options.dimension !== 'all') {
        query = query.ilike('dimensions', `%${options.dimension}%`);
      }

      if (options?.facing && options.facing !== 'all') {
        query = query.ilike('facing', `%${options.facing}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching house_plans from Supabase:', error.message);
        return [];
      }

      return (data || []).map((row: any) => {
        // Hydrate smart computed metrics if columns are not yet present in database
        const metrics = calculateSmartPlanMetrics(
          row.dimensions || '30x40',
          row.floors || 'G+1',
          row.bedrooms || 3,
          row.bathrooms || 3,
          row.facing || 'East'
        );

        return {
          ...row,
          built_up_area_sqft: row.built_up_area_sqft || metrics.builtUpAreaSqft,
          carpet_area_sqft: row.carpet_area_sqft || metrics.carpetAreaSqft,
          living_hall_sqft: row.living_hall_sqft || metrics.livingHallSqft,
          kitchen_sqft: row.kitchen_sqft || metrics.kitchenSqft,
          electrical_points_count: row.electrical_points_count || metrics.electricalPointsCount,
          orientation_notes: row.orientation_notes || metrics.orientationNotes,
          price_inr: row.price_inr || 499,
          is_active: row.is_active !== undefined ? row.is_active : true,
        };
      });
    } catch (err) {
      console.error('HousePlanStoreService.getAllPlans error:', err);
      return [];
    }
  },

  /**
   * Fetch a single house plan by ID
   */
  async getPlanById(id: string): Promise<HousePlanRecord | null> {
    try {
      const { data, error } = await supabase
        .from('house_plans')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;

      const metrics = calculateSmartPlanMetrics(
        data.dimensions || '30x40',
        data.floors || 'G+1',
        data.bedrooms || 3,
        data.bathrooms || 3,
        data.facing || 'East'
      );

      return {
        ...data,
        built_up_area_sqft: data.built_up_area_sqft || metrics.builtUpAreaSqft,
        carpet_area_sqft: data.carpet_area_sqft || metrics.carpetAreaSqft,
        living_hall_sqft: data.living_hall_sqft || metrics.livingHallSqft,
        kitchen_sqft: data.kitchen_sqft || metrics.kitchenSqft,
        electrical_points_count: data.electrical_points_count || metrics.electricalPointsCount,
        orientation_notes: data.orientation_notes || metrics.orientationNotes,
        price_inr: data.price_inr || 499,
        is_active: data.is_active !== undefined ? data.is_active : true,
      };
    } catch (err) {
      console.error('HousePlanStoreService.getPlanById error:', err);
      return null;
    }
  },

  /**
   * Create a new plan in Supabase
   */
  async createPlan(input: Partial<HousePlanRecord>): Promise<{ success: boolean; data?: HousePlanRecord; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('house_plans')
        .insert([input])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create plan' };
    }
  },

  /**
   * Update an existing plan in Supabase
   */
  async updatePlan(id: string, updates: Partial<HousePlanRecord>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('house_plans')
        .update(updates)
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update plan' };
    }
  },

  /**
   * Delete a plan from Supabase
   */
  async deletePlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('house_plans')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete plan' };
    }
  },
};
