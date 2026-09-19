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

export interface LocalityTransitProfile {
  airportKm: number;
  metroName: string;
  metroKm: number;
  railwayName: string;
  railwayKm: number;
  techParkName: string;
  techParkKm: number;
}

export const LOCALITY_TRANSIT_PROFILES: Record<string, LocalityTransitProfile> = {
  "loc-whitefield": {
    airportKm: 38,
    metroName: "Kadugodi Tree Park Metro",
    metroKm: 1.2,
    railwayName: "Whitefield Railway Station",
    railwayKm: 2.0,
    techParkName: "ITPL / Prestige Shantiniketan",
    techParkKm: 1.5,
  },
  "loc-marathahalli": {
    airportKm: 42,
    metroName: "Marathahalli Metro",
    metroKm: 1.5,
    railwayName: "KR Puram Station",
    railwayKm: 6.0,
    techParkName: "Prestige Tech Park / Cessna",
    techParkKm: 2.0,
  },
  "loc-varthur": {
    airportKm: 41,
    metroName: "Hopefarm Channasandra Metro",
    metroKm: 3.8,
    railwayName: "Whitefield Station",
    railwayKm: 4.5,
    techParkName: "Sigma Tech Park",
    techParkKm: 3.0,
  },
  "loc-bellandur": {
    airportKm: 45,
    metroName: "Bellandur Metro",
    metroKm: 1.2,
    railwayName: "Carmelaram Station",
    railwayKm: 4.5,
    techParkName: "RMZ Ecospace / EcoWorld",
    techParkKm: 1.5,
  },
  "loc-hoodi": {
    airportKm: 37,
    metroName: "Hoodi Metro Station",
    metroKm: 0.8,
    railwayName: "Hoodi Halt",
    railwayKm: 1.0,
    techParkName: "ITPB / Bhoruka Tech Park",
    techParkKm: 2.0,
  },
  "loc-kadugodi": {
    airportKm: 36,
    metroName: "Whitefield (Kadugodi) Metro",
    metroKm: 0.6,
    railwayName: "Whitefield Station",
    railwayKm: 1.2,
    techParkName: "ITPL Tech Park",
    techParkKm: 2.5,
  },
  "loc-hsr-layout": {
    airportKm: 44,
    metroName: "Silk Board / HSR Metro",
    metroKm: 1.2,
    railwayName: "Carmelaram Station",
    railwayKm: 7.5,
    techParkName: "Ozone Tech Park / Ecospace",
    techParkKm: 3.5,
  },
  "loc-koramangala": {
    airportKm: 40,
    metroName: "Dairy Circle / Sony World Metro",
    metroKm: 1.5,
    railwayName: "KSR Bengaluru City",
    railwayKm: 8.5,
    techParkName: "Embassy GolfLinks (EGL)",
    techParkKm: 3.0,
  },
  "loc-btm-layout": {
    airportKm: 43,
    metroName: "Jayadeva / BTM Metro",
    metroKm: 1.0,
    railwayName: "Bangalore City Junction",
    railwayKm: 9.0,
    techParkName: "IBC Knowledge Park",
    techParkKm: 4.0,
  },
  "loc-jp-nagar": {
    airportKm: 46,
    metroName: "JP Nagar Metro (Green Line)",
    metroKm: 1.2,
    railwayName: "City Station / Banashankari",
    railwayKm: 9.5,
    techParkName: "Kalyani Magnum Tech Park",
    techParkKm: 2.0,
  },
  "loc-jayanagar": {
    airportKm: 39,
    metroName: "Jayanagar Metro (Green Line)",
    metroKm: 0.8,
    railwayName: "KSR Bengaluru Junction",
    railwayKm: 6.5,
    techParkName: "IBC Knowledge Park",
    techParkKm: 3.5,
  },
  "loc-electronic-city": {
    airportKm: 52,
    metroName: "Electronic City Metro (Yellow Line)",
    metroKm: 0.8,
    railwayName: "Heelalige Station",
    railwayKm: 5.5,
    techParkName: "Infosys / Wipro / Velankani",
    techParkKm: 1.2,
  },
  "loc-bannerghatta-road": {
    airportKm: 45,
    metroName: "Hulimavu Metro (Pink Line)",
    metroKm: 1.5,
    railwayName: "Bangalore City Station",
    railwayKm: 11.0,
    techParkName: "Kalyani Magnum / Divyasree",
    techParkKm: 2.5,
  },
  "loc-hebbal": {
    airportKm: 28,
    metroName: "Hebbal Metro Station",
    metroKm: 1.0,
    railwayName: "Hebbal Railway Station",
    railwayKm: 1.2,
    techParkName: "Manyata Tech Park",
    techParkKm: 3.0,
  },
  "loc-yelahanka": {
    airportKm: 18,
    metroName: "Yelahanka Metro (Blue Line)",
    metroKm: 1.5,
    railwayName: "Yelahanka Junction",
    railwayKm: 1.5,
    techParkName: "Manyata Tech Park",
    techParkKm: 9.0,
  },
  "loc-thanisandra": {
    airportKm: 25,
    metroName: "Nagawara Metro",
    metroKm: 3.5,
    railwayName: "Thanisandra Halt",
    railwayKm: 1.0,
    techParkName: "Manyata Tech Park (Gate 2)",
    techParkKm: 1.5,
  },
  "loc-hennur": {
    airportKm: 27,
    metroName: "Nagawara Metro",
    metroKm: 3.0,
    railwayName: "Banaswadi Station",
    railwayKm: 4.0,
    techParkName: "Manyata Tech Park",
    techParkKm: 2.5,
  },
  "loc-devanahalli": {
    airportKm: 8,
    metroName: "KIA Airport Metro",
    metroKm: 6.5,
    railwayName: "Devanahalli Railway Station",
    railwayKm: 2.0,
    techParkName: "Aerospace SEZ / Hardware Park",
    techParkKm: 4.0,
  },
  "loc-indiranagar": {
    airportKm: 38,
    metroName: "Indiranagar Metro (Purple Line)",
    metroKm: 0.6,
    railwayName: "Baiyappanahalli Junction",
    railwayKm: 2.5,
    techParkName: "Bagmane Tech Park",
    techParkKm: 2.0,
  },
  "loc-malleshwaram": {
    airportKm: 32,
    metroName: "Sampige Road Metro",
    metroKm: 0.8,
    railwayName: "Malleswaram Railway Station",
    railwayKm: 0.6,
    techParkName: "World Trade Center (WTC)",
    techParkKm: 1.5,
  },
  "loc-rajajinagar": {
    airportKm: 34,
    metroName: "Rajajinagar Metro",
    metroKm: 0.6,
    railwayName: "KSR Bengaluru Junction",
    railwayKm: 4.5,
    techParkName: "World Trade Center (WTC)",
    techParkKm: 1.8,
  },
  "loc-sarjapur-road": {
    airportKm: 46,
    metroName: "Carmelaram / Bellandur Metro",
    metroKm: 4.0,
    railwayName: "Carmelaram Railway Station",
    railwayKm: 3.0,
    techParkName: "Wipro SEZ / RMZ Ecoworld",
    techParkKm: 3.5,
  },
  "loc-kanakapura-road": {
    airportKm: 48,
    metroName: "Silk Institute / Vajarahalli Metro",
    metroKm: 1.0,
    railwayName: "KSR Bengaluru Junction",
    railwayKm: 14.0,
    techParkName: "Global Village Tech Park",
    techParkKm: 8.0,
  },
  "loc-chandapura": {
    airportKm: 58,
    metroName: "Bommasandra Metro",
    metroKm: 4.0,
    railwayName: "Anekal / Heelalige Station",
    railwayKm: 4.5,
    techParkName: "Electronic City Phase 2",
    techParkKm: 7.0,
  },
};
