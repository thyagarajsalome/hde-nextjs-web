// src/types/realEstate.ts

export type ListingIntent = 'sale' | 'rent';
export type PropertyCategory = 'flat' | 'villa' | 'plot' | 'independent_house' | 'penthouse';
export type BhkType = '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | '4+BHK' | 'NA_PLOT';
export type FurnishingStatus = 'unfurnished' | 'semi_furnished' | 'fully_furnished';
export type FacingDirection = 'East' | 'North' | 'North-East' | 'West' | 'South' | 'South-East' | 'North-West' | 'South-West';
export type ListingStatus = 'pending_approval' | 'active' | 'sold_or_rented' | 'rejected';
export type PosterRole = 'owner' | 'agent' | 'builder';
export type BuyerTimeline = 'within_3_months' | 'within_6_months' | 'more_than_6_months';

export interface PropertyConnectivity {
  airport_km?: number;
  railway_station_name?: string;
  railway_km?: number;
  metro_bus_stop_name?: string;
  metro_bus_km?: number;
  famous_mall_name?: string;
  mall_km?: number;
  tech_park_name?: string;
  tech_park_km?: number;
  tourist_landmark_name?: string;
  landmark_km?: number;
}

export interface RealEstateLocality {
  id: string;
  city: string;
  name: string;
  slug: string;
  zone: string;
  pincode?: string;
  is_active?: boolean;
}

export interface RealEstateProperty {
  id: string;
  user_id?: string;
  intent: ListingIntent;
  category: PropertyCategory;
  bhk: BhkType;
  city: string;
  locality_id?: string;
  locality_name: string;
  sub_locality?: string;
  
  super_builtup_sqft?: number;
  carpet_area_sqft?: number;
  plot_area_sqft?: number;
  price: number;
  maintenance_monthly?: number;
  deposit_amount?: number;
  
  floor_number?: number;
  total_floors?: number;
  facing?: FacingDirection;
  furnishing?: FurnishingStatus;
  available_from?: string;
  khata_type?: string; // 'A Khata' | 'B Khata' | 'E Khata'
  
  title: string;
  description: string;
  images: string[]; // 1 to 3 Cloudflare R2 WebP URLs
  connectivity?: PropertyConnectivity;
  
  poster_type: PosterRole;
  contact_name: string;
  contact_phone: string;
  contact_whatsapp?: string;
  rera_id?: string;
  agency_name?: string;
  is_rera_verified?: boolean;
  is_featured?: boolean;
  
  status: ListingStatus;
  views_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at?: string;
}

export interface RealEstateLeadInput {
  property_id: string;
  seller_user_id?: string;
  is_dealer: boolean;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string;
  purchase_timeline: BuyerTimeline;
  interested_in_home_loan: boolean;
  interested_in_site_visits: boolean;
  agreed_to_terms: boolean;
}

export interface PropertyFilterState {
  intent: ListingIntent;
  category?: PropertyCategory | 'all';
  bhk?: BhkType | 'all';
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  khataType?: string;
  posterType?: PosterRole | 'all';
  searchQuery?: string;
}
