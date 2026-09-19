// src/utils/realEstateFlow.ts

/**
 * Maps a plot area in sq ft to the closest architectural blueprint slug in HDE
 */
export interface MatchingPlanResult {
  slug: string;
  title: string;
  dimensions: string;
  plotAreaSqft: number;
  recommendedBuiltUpSqft: number;
}

export function getMatchingPlanForPlot(plotAreaSqft?: number): MatchingPlanResult {
  const area = plotAreaSqft && plotAreaSqft > 0 ? plotAreaSqft : 1200;

  if (area <= 750) {
    return {
      slug: "20x30-house-plans",
      title: "20×30 House Plans (600 sq ft)",
      dimensions: "20 ft × 30 ft",
      plotAreaSqft: 600,
      recommendedBuiltUpSqft: 1050,
    };
  }
  if (area <= 900) {
    return {
      slug: "20x40-house-plans",
      title: "20×40 House Plans (800 sq ft)",
      dimensions: "20 ft × 40 ft",
      plotAreaSqft: 800,
      recommendedBuiltUpSqft: 1300,
    };
  }
  if (area <= 1100) {
    return {
      slug: "20x50-house-plans",
      title: "20×50 House Plans (1,000 sq ft)",
      dimensions: "20 ft × 50 ft",
      plotAreaSqft: 1000,
      recommendedBuiltUpSqft: 1550,
    };
  }
  if (area <= 1350) {
    return {
      slug: "30x40-house-plans",
      title: "30×40 House Plans (1,200 sq ft)",
      dimensions: "30 ft × 40 ft",
      plotAreaSqft: 1200,
      recommendedBuiltUpSqft: 1800,
    };
  }
  if (area <= 1650) {
    return {
      slug: "30x50-house-plans",
      title: "30×50 House Plans (1,500 sq ft)",
      dimensions: "30 ft × 50 ft",
      plotAreaSqft: 1500,
      recommendedBuiltUpSqft: 2250,
    };
  }
  if (area <= 2000) {
    return {
      slug: "30x60-house-plans",
      title: "30×60 House Plans (1,800 sq ft)",
      dimensions: "30 ft × 60 ft",
      plotAreaSqft: 1800,
      recommendedBuiltUpSqft: 2700,
    };
  }
  return {
    slug: "40x60-house-plans",
    title: "40×60 House Plans (2,400 sq ft)",
    dimensions: "40 ft × 60 ft",
    plotAreaSqft: 2400,
    recommendedBuiltUpSqft: 3600,
  };
}

/**
 * Calculates estimated construction budget for a given plot size (assuming standard G+1 structure)
 */
export function calculatePlotConstruction(plotAreaSqft?: number) {
  const plan = getMatchingPlanForPlot(plotAreaSqft);
  const builtUp = plan.recommendedBuiltUpSqft;

  const basicTotal = builtUp * 1750;
  const standardTotal = builtUp * 2200;
  const premiumTotal = builtUp * 3000;

  return {
    recommendedBuiltUpSqft: builtUp,
    basicCost: basicTotal,
    standardCost: standardTotal,
    premiumCost: premiumTotal,
    standardLakhs: (standardTotal / 100000).toFixed(1),
  };
}

/**
 * Calculates monthly home loan EMI
 */
export function calculateMonthlyEMI(
  principal: number,
  annualInterestRate: number = 8.5,
  tenureYears: number = 20
): number {
  if (principal <= 0) return 0;
  const r = annualInterestRate / 12 / 100;
  const n = tenureYears * 12;
  if (r === 0) return Math.round(principal / n);
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Calculates Karnataka statutory registration and stamp duty
 * Stamp duty: ~5%, Registration: 1%, Surcharge/Cess: 0.6% (~6.6% total)
 */
export function calculateKarnatakaRegistration(propertyPrice: number) {
  const stampDutyRate = propertyPrice <= 4500000 ? 0.03 : 0.05;
  const stampDuty = Math.round(propertyPrice * stampDutyRate);
  const registrationFee = Math.round(propertyPrice * 0.01);
  const cess = Math.round(stampDuty * 0.1); // 10% cess on stamp duty = ~0.5%
  const totalGovtCharges = stampDuty + registrationFee + cess;

  return {
    stampDuty,
    registrationFee,
    cess,
    totalGovtCharges,
    effectivePercentage: ((totalGovtCharges / propertyPrice) * 100).toFixed(1),
  };
}

/**
 * Calculates estimated interior design and woodwork cost based on BHK configuration
 */
export function calculateApproxInteriorCost(bhk?: string) {
  const cleanBhk = (bhk || "").toUpperCase();
  if (cleanBhk.includes("1BHK") || cleanBhk.includes("1RK")) {
    return { minLakhs: 3.5, maxLakhs: 5.5, label: "1 BHK Interior & Woodwork" };
  }
  if (cleanBhk.includes("2BHK")) {
    return { minLakhs: 6.0, maxLakhs: 9.5, label: "2 BHK Interior & Modular Kitchen" };
  }
  if (cleanBhk.includes("3BHK")) {
    return { minLakhs: 9.0, maxLakhs: 14.5, label: "3 BHK Full Woodwork & Interiors" };
  }
  if (cleanBhk.includes("4BHK") || cleanBhk.includes("4+BHK")) {
    return { minLakhs: 14.0, maxLakhs: 22.0, label: "4 BHK Premium Interior Design" };
  }
  return { minLakhs: 6.5, maxLakhs: 11.0, label: "Residential Interior & Woodwork" };
}

/**
 * Formats a number in Indian Lakhs/Crores for compact display
 */
export function formatINRCompact(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} Lakhs`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}
