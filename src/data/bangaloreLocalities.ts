// src/data/bangaloreLocalities.ts
import { RealEstateLocality } from "@/types/realEstate";

export const BANGALORE_LOCALITIES: RealEstateLocality[] = [
  // East Bangalore
  { id: "loc-whitefield", city: "Bangalore", name: "Whitefield", slug: "whitefield", zone: "East Bangalore", pincode: "560066" },
  { id: "loc-marathahalli", city: "Bangalore", name: "Marathahalli", slug: "marathahalli", zone: "East Bangalore", pincode: "560037" },
  { id: "loc-varthur", city: "Bangalore", name: "Varthur", slug: "varthur", zone: "East Bangalore", pincode: "560087" },
  { id: "loc-bellandur", city: "Bangalore", name: "Bellandur", slug: "bellandur", zone: "East Bangalore", pincode: "560103" },
  { id: "loc-hoodi", city: "Bangalore", name: "Hoodi", slug: "hoodi", zone: "East Bangalore", pincode: "560048" },
  { id: "loc-kadugodi", city: "Bangalore", name: "Kadugodi", slug: "kadugodi", zone: "East Bangalore", pincode: "560067" },
  
  // South Bangalore
  { id: "loc-hsr-layout", city: "Bangalore", name: "HSR Layout", slug: "hsr-layout", zone: "South Bangalore", pincode: "560102" },
  { id: "loc-koramangala", city: "Bangalore", name: "Koramangala", slug: "koramangala", zone: "South Bangalore", pincode: "560034" },
  { id: "loc-btm-layout", city: "Bangalore", name: "BTM Layout", slug: "btm-layout", zone: "South Bangalore", pincode: "560076" },
  { id: "loc-jp-nagar", city: "Bangalore", name: "JP Nagar", slug: "jp-nagar", zone: "South Bangalore", pincode: "560078" },
  { id: "loc-jayanagar", city: "Bangalore", name: "Jayanagar", slug: "jayanagar", zone: "South Bangalore", pincode: "560011" },
  { id: "loc-electronic-city", city: "Bangalore", name: "Electronic City", slug: "electronic-city", zone: "South Bangalore", pincode: "560100" },
  { id: "loc-bannerghatta-road", city: "Bangalore", name: "Bannerghatta Road", slug: "bannerghatta-road", zone: "South Bangalore", pincode: "560076" },

  // North Bangalore
  { id: "loc-hebbal", city: "Bangalore", name: "Hebbal", slug: "hebbal", zone: "North Bangalore", pincode: "560024" },
  { id: "loc-yelahanka", city: "Bangalore", name: "Yelahanka", slug: "yelahanka", zone: "North Bangalore", pincode: "560064" },
  { id: "loc-thanisandra", city: "Bangalore", name: "Thanisandra", slug: "thanisandra", zone: "North Bangalore", pincode: "560077" },
  { id: "loc-hennur", city: "Bangalore", name: "Hennur Road", slug: "hennur-road", zone: "North Bangalore", pincode: "560043" },
  { id: "loc-devanahalli", city: "Bangalore", name: "Devanahalli (Airport Road)", slug: "devanahalli", zone: "North Bangalore", pincode: "562110" },

  // West & Central
  { id: "loc-indiranagar", city: "Bangalore", name: "Indiranagar", slug: "indiranagar", zone: "Central Bangalore", pincode: "560038" },
  { id: "loc-malleshwaram", city: "Bangalore", name: "Malleshwaram", slug: "malleshwaram", zone: "West Bangalore", pincode: "560003" },
  { id: "loc-rajajinagar", city: "Bangalore", name: "Rajajinagar", slug: "rajajinagar", zone: "West Bangalore", pincode: "560010" },

  // Growth Corridors (Plots & Villas)
  { id: "loc-sarjapur-road", city: "Bangalore", name: "Sarjapur Road", slug: "sarjapur-road", zone: "East Bangalore", pincode: "562125" },
  { id: "loc-kanakapura-road", city: "Bangalore", name: "Kanakapura Road", slug: "kanakapura-road", zone: "South Bangalore", pincode: "560062" },
  { id: "loc-chandapura", city: "Bangalore", name: "Chandapura - Anekal Road", slug: "chandapura", zone: "South Bangalore", pincode: "560099" },
];

export const KHATA_TYPES = ["A Khata", "B Khata", "E Khata", "Panchayat Khata", "BBMP Approved"] as const;
export const PROPERTY_CATEGORIES = [
  { id: "flat", label: "Flats & Apartments", icon: "fas fa-building" },
  { id: "villa", label: "Villas & Row Houses", icon: "fas fa-house" },
  { id: "plot", label: "Plots & Land Sites", icon: "fas fa-map" },
  { id: "independent_house", label: "Independent Houses", icon: "fas fa-home" },
] as const;

export const BHK_OPTIONS = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "4+BHK"] as const;
