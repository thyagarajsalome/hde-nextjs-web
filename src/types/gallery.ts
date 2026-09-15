// src/types/gallery.ts

export type KitchenLayoutShape = 'L-Shape' | 'U-Shape' | 'Parallel' | 'Straight' | 'Island';

export interface KitchenDesign {
  id: string;
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  alt_text: string;
  
  // Kitchen Specifications
  layout_shape: KitchenLayoutShape;
  dimensions: string;                  // e.g. "10 ft × 8 ft (80 sq ft)"
  countertop_length_ft?: number;       // e.g. 18.0
  cabinet_finish: string;              // e.g. "High-Gloss Acrylic", "Matte Laminate"
  countertop_material: string;         // e.g. "Jet Black Granite", "Engineered Quartz"
  features: string[];                  // e.g. ["Tandem Drawers", "Loft Storage", "Profile LED"]
  
  // Cost Estimation (INR)
  min_cost: number;                     // e.g. 140000
  max_cost: number;                     // e.g. 210000
  formatted_budget: string;            // e.g. "₹1.40L - ₹2.10L"
  rate_per_unit?: string;              // e.g. "₹1,600 / sq ft"
  
  // Image & Cloudflare R2 Asset Details
  image_url: string;                   // Public CDN URL
  thumbnail_url?: string;
  file_name: string;
  aspect_ratio?: string;               // default '9:16'
  file_size_kb?: number;
  
  // Search & Status
  keywords: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateKitchenDesignInput {
  title: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  alt_text: string;
  layout_shape: KitchenLayoutShape;
  dimensions: string;
  countertop_length_ft?: number;
  cabinet_finish: string;
  countertop_material: string;
  features?: string[];
  min_cost: number;
  max_cost: number;
  formatted_budget: string;
  rate_per_unit?: string;
  image_url: string;
  thumbnail_url?: string;
  file_name: string;
  aspect_ratio?: string;
  file_size_kb?: number;
  keywords?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
}
