// src/utils/indiaCostEstimator.ts
import { KitchenLayoutShape, BathroomLayoutType } from '@/types/gallery';

export interface KitchenEstimateInput {
  lengthFt?: number;
  widthFt?: number;
  areaSqFt?: number;
  layoutShape: KitchenLayoutShape;
  qualityTier: 'Economy' | 'Standard' | 'Premium' | 'Ultra Luxury';
  cabinetFinish?: string;
  countertopMaterial?: string;
}

export interface BathroomEstimateInput {
  lengthFt?: number;
  widthFt?: number;
  areaSqFt?: number;
  layoutType: BathroomLayoutType;
  qualityTier: 'Standard' | 'Premium' | 'Luxury';
  hasPartition?: boolean;
}

export interface IndianKitchenBOQ {
  baseCabinets: number;
  wallCabinets: number;
  loftCabinets: number;
  countertop: number;
  hardwareBaskets: number;
  dadoTiles: number;
  chimneyHob: number;
  labor: number;
  totalCost: number;
}

export interface IndianBathroomBOQ {
  waterproofing: number;
  tiling: number;
  plumbingPiping: number;
  sanitaryware: number;
  cpFittings: number;
  glassPartition: number;
  vanityCounter: number;
  electricalMirror: number;
  labor: number;
  totalCost: number;
}

export interface CostEstimateResult {
  minCost: number;
  maxCost: number;
  ratePerUnit: string;
  formattedBudget: string;
  dimensionsStr: string;
  totalSqFt: number;
  kitchenBOQ?: IndianKitchenBOQ;
  bathroomBOQ?: IndianBathroomBOQ;
}

/**
 * Format Indian Lakhs / Thousands currency string
 */
export function formatIndianBudget(min?: number | null, max?: number | null): string {
  const format = (num?: number | null) => {
    const val = Number(num);
    if (isNaN(val) || val <= 0) return '₹0';
    if (val >= 100000) {
      const lakhs = val / 100000;
      return `₹${lakhs.toFixed(2).replace(/\.00$/, '')} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };
  return `${format(min)} - ${format(max)}`;
}

/**
 * Estimate Modular Kitchen Cost in India based on Indian standard methods, IS:710 materials, and layouts
 */
export function estimateIndiaKitchenCost(input: KitchenEstimateInput): CostEstimateResult {
  const length = input.lengthFt || 0;
  const width = input.widthFt || 0;
  const totalSqFt = input.areaSqFt && input.areaSqFt > 0 ? input.areaSqFt : (length > 0 && width > 0 ? length * width : 80);

  // Shape multipliers based on running feet (Rft) counter requirements in India
  const shapeMultiplier: Record<KitchenLayoutShape, number> = {
    'Straight': 0.85,
    'Parallel': 1.0,
    'L-Shape': 1.15,
    'U-Shape': 1.35,
    'Island': 1.55,
  };

  // Base rate per sq ft in Tier 1/2 Indian cities (IS:710 BWP Plywood, Tandem drawers, Jet Black Granite / Quartz)
  // Calibrated to realistic turnkey market pricing (35-40% inflation-adjusted & aligned with turnkey carpentry rates)
  const tierRates: Record<string, { minRate: number; maxRate: number; mult: number }> = {
    'Economy': { minRate: 1650, maxRate: 2200, mult: 0.85 },       // Basic Laminate, Commercial Ply / MDF
    'Standard': { minRate: 2250, maxRate: 3250, mult: 1.0 },       // BWP 710 Marine Ply, 1mm High-Gloss Laminate, Jet Black Granite
    'Premium': { minRate: 3200, maxRate: 4850, mult: 1.5 },       // Anti-Fingerprint Acrylic, Quartz Counter, Blum/Hettich Tandem
    'Ultra Luxury': { minRate: 4850, maxRate: 7600, mult: 2.3 },  // PU Lacquer, Ceramic/Dekton, Profile LED, Electric Lift-ups
  };

  const selectedTier = tierRates[input.qualityTier] || tierRates['Standard'];
  const shapeMult = shapeMultiplier[input.layoutShape] || 1.15;

  const minRate = Math.round(selectedTier.minRate * shapeMult);
  const maxRate = Math.round(selectedTier.maxRate * shapeMult);

  // Round to nearest ₹5,000 for realistic client budgets
  const minCost = Math.round((totalSqFt * minRate) / 5000) * 5000;
  const maxCost = Math.round((totalSqFt * maxRate) / 5000) * 5000;
  const avgCost = Math.round((minCost + maxCost) / 2);

  const avgRate = Math.round((minRate + maxRate) / 2);
  const ratePerUnit = `₹${avgRate.toLocaleString('en-IN')} / sq ft`;
  const formattedBudget = formatIndianBudget(minCost, maxCost);

  const dimensionsStr = length > 0 && width > 0 
    ? `${length} ft × ${width} ft (${totalSqFt} sq ft)`
    : `${totalSqFt} sq ft`;

  // Itemized Indian Standard BOQ breakdown based on typical Indian modular carpentry distribution
  const kitchenBOQ: IndianKitchenBOQ = {
    baseCabinets: Math.round(avgCost * 0.32),      // 34" ht BWP 710 carcass + shutters + PVC skirting
    wallCabinets: Math.round(avgCost * 0.18),      // Overhead wall units with soft-close hydraulic stays
    loftCabinets: Math.round(avgCost * 0.10),      // Ceiling-height seasonal storage lofts
    countertop: Math.round(avgCost * 0.12),        // Granite / Quartz with full bullnose molding & sink cutout
    hardwareBaskets: Math.round(avgCost * 0.11),   // Thali basket, Cutlery tray, Bottle pullout, Tandem channels
    dadoTiles: Math.round(avgCost * 0.05),         // 2 ft height vitrified backsplash & epoxy grouting
    chimneyHob: Math.round(avgCost * 0.08),        // Heavy-suction baffle chimney & brass burner hob
    labor: Math.round(avgCost * 0.04),             // Factory fabrication & site carpentry installation
    totalCost: avgCost,
  };

  return {
    minCost,
    maxCost,
    ratePerUnit,
    formattedBudget,
    dimensionsStr,
    totalSqFt,
    kitchenBOQ,
  };
}

/**
 * Estimate Modern Bathroom Renovation / Interior Cost in India based on Indian plumbing & waterproofing standards
 */
export function estimateIndiaBathroomCost(input: BathroomEstimateInput): CostEstimateResult {
  const length = input.lengthFt || 0;
  const width = input.widthFt || 0;
  const totalSqFt = input.areaSqFt && input.areaSqFt > 0 ? input.areaSqFt : (length > 0 && width > 0 ? length * width : 45);

  // Layout multipliers based on plumbing, wet/dry partitions, and vanity requirements
  const layoutMultiplier: Record<BathroomLayoutType, number> = {
    'Compact 3-Fixture': 0.9,
    'Powder Room': 1.1,           // Statement bowl, boutique vanity (dry area only)
    'Wet & Dry Partition': 1.25,   // Toughened glass, separate drainage slope
    'Master Bathroom': 1.45,       // Large vanity, dual lighting, shower niches
    'Luxury Suite': 1.9,           // Freestanding acrylic tub, thermostatic shower
  };

  // Calibrated to realistic Indian bathroom turnkey renovation costs (+35% to 40%)
  const tierRates: Record<string, { minRate: number; maxRate: number; mult: number }> = {
    'Standard': { minRate: 1900, maxRate: 2650, mult: 1.0 },      // Ceramic Tiles, Jaquar Single-Lever Diverter, Wall-Hung EWC
    'Premium': { minRate: 2800, maxRate: 4450, mult: 1.5 },       // 2x4 Vitrified, 10mm Toughened Glass, Kohler/Jaquar, Slim Cistern
    'Luxury': { minRate: 4550, maxRate: 7200, mult: 2.4 },        // Statuario Porcelain, Grohe/Hansgrohe Thermostat, Rain Canopy
  };

  const selectedTier = tierRates[input.qualityTier] || tierRates['Premium'];
  const layoutMult = layoutMultiplier[input.layoutType] || 1.25;

  const minRate = Math.round(selectedTier.minRate * layoutMult);
  const maxRate = Math.round(selectedTier.maxRate * layoutMult);

  const minCost = Math.round((totalSqFt * minRate) / 5000) * 5000;
  const maxCost = Math.round((totalSqFt * maxRate) / 5000) * 5000;
  const avgCost = Math.round((minCost + maxCost) / 2);

  const avgRate = Math.round((minRate + maxRate) / 2);
  const ratePerUnit = `₹${avgRate.toLocaleString('en-IN')} / sq ft`;
  const formattedBudget = formatIndianBudget(minCost, maxCost);

  const dimensionsStr = length > 0 && width > 0
    ? `${length} ft × ${width} ft (${totalSqFt} sq ft)`
    : `${totalSqFt} sq ft`;

  // Itemized Indian Standard BOQ breakdown based on typical Indian bathroom renovation trades
  const bathroomBOQ: IndianBathroomBOQ = {
    waterproofing: Math.round(avgCost * 0.10),     // Sunken slab 2-coat elastomeric (Dr. Fixit) + 48hr ponding test
    tiling: Math.round(avgCost * 0.24),            // Anti-skid floor + 7ft/ceiling vitrified wall dado & epoxy grout
    plumbingPiping: Math.round(avgCost * 0.12),    // Astral/Ashirvad CPVC hot/cold & PVC drainage concealed lines
    sanitaryware: Math.round(avgCost * 0.15),      // Rimless wall-hung EWC with concealed slim flush tank & basin
    cpFittings: Math.round(avgCost * 0.16),        // Concealed 3-in-1 diverter, rain shower, spout & health faucet
    glassPartition: Math.round(avgCost * 0.08),    // 10mm toughened clear glass partition with SS 304 fittings
    vanityCounter: Math.round(avgCost * 0.06),     // BWP marine ply floating vanity with quartz/granite top
    electricalMirror: Math.round(avgCost * 0.04),  // LED backlit smart mirror, exhaust fan & geyser point
    labor: Math.round(avgCost * 0.05),             // Skilled plumbing contractor, tile laying & core cutting labor
    totalCost: avgCost,
  };

  return {
    minCost,
    maxCost,
    ratePerUnit,
    formattedBudget,
    dimensionsStr,
    totalSqFt,
    bathroomBOQ,
  };
}
