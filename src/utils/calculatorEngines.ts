/**
 * Centralized, pure calculation engines for HDE (India, USA, UAE modes)
 * Used by unit tests, live health diagnostics, and interactive calculators.
 */

// ==========================================
// 1. INDIA REGION ENGINES
// ==========================================

export interface IndiaEMIResult {
  monthlyEmi: number;
  totalAmountPayable: number;
  totalInterest: number;
  processingFee: number;
  totalCost: number;
}

export function calculateIndiaEMI(
  loanAmount: number,
  annualInterestRate: number,
  tenureYears: number,
  processingFeePercent: number = 0.5
): IndiaEMIResult {
  const P = Math.max(0, loanAmount);
  const r = (annualInterestRate || 0) / 12 / 100;
  const n = Math.max(1, (tenureYears || 1) * 12);

  let monthlyEmi = 0;
  if (r === 0) {
    monthlyEmi = P / n;
  } else {
    monthlyEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalAmountPayable = monthlyEmi * n;
  const totalInterest = Math.max(0, totalAmountPayable - P);
  const processingFee = P * (processingFeePercent / 100);
  const totalCost = totalAmountPayable + processingFee;

  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalAmountPayable: Math.round(totalAmountPayable),
    totalInterest: Math.round(totalInterest),
    processingFee: Math.round(processingFee),
    totalCost: Math.round(totalCost),
  };
}

export interface IndiaConstructionResult {
  sqft: number;
  basicCost: number;
  standardCost: number;
  premiumCost: number;
  breakdown: {
    foundation: number;
    structure: number;
    masonry: number;
    finishing: number;
    electricalPlumbing: number;
    misc: number;
  };
}

export function calculateIndiaConstruction(
  sqft: number,
  basicRate: number = 1650,
  standardRate: number = 2350,
  premiumRate: number = 3400
): IndiaConstructionResult {
  const area = Math.max(0, sqft);
  const basicCost = area * basicRate;
  const standardCost = area * standardRate;
  const premiumCost = area * premiumRate;

  return {
    sqft: area,
    basicCost,
    standardCost,
    premiumCost,
    breakdown: {
      foundation: Math.round(standardCost * 0.12),
      structure: Math.round(standardCost * 0.30),
      masonry: Math.round(standardCost * 0.12),
      finishing: Math.round(standardCost * 0.20),
      electricalPlumbing: Math.round(standardCost * 0.10),
      misc: Math.round(standardCost * 0.16),
    }
  };
}

export interface HousePlanCostEstimate {
  plotAreaSqft: number;
  builtUpAreaSqft: number;
  basicCost: number;
  standardCost: number;
  premiumCost: number;
  minLakhs: string;
  maxLakhs: string;
  monthlyEmi: number;
  seoSlug?: string;
}

export function getHousePlanEstimate(
  areaSqft: number,
  floors: string = "",
  dimensions: string = ""
): HousePlanCostEstimate {
  const plotArea = Math.max(0, Number(areaSqft) || 1200);
  const fl = (floors || "").toLowerCase().trim();

  // Accurate Indian residential construction floor multipliers
  let multiplier = 0.85; // default Ground Floor (setbacks + compound)
  if (fl.includes("g+3") || fl.includes("4 floors") || fl === "4") {
    multiplier = 3.4; // Ground + 3 floors
  } else if (fl.includes("g+2") || fl.includes("3 floors") || fl.includes("triple") || fl === "3") {
    multiplier = 2.55; // Ground + 2 floors
  } else if (fl.includes("g+1") || fl.includes("duplex") || fl.includes("2 floors") || fl === "2") {
    multiplier = 1.7; // Ground + 1 floor (Duplex)
  } else if (fl.includes("ground") || fl.includes("single") || fl.includes("g+0") || fl === "1" || fl === "g") {
    multiplier = 0.85; // Ground floor only
  } else {
    // fallback based on floor string if present
    multiplier = 0.85;
  }

  const builtUpAreaSqft = Math.round(plotArea * multiplier);
  const basicCost = builtUpAreaSqft * 1650;
  const standardCost = builtUpAreaSqft * 2200;
  const premiumCost = builtUpAreaSqft * 3000;

  const minLakhs = (basicCost / 100000).toFixed(1);
  const maxLakhs = (standardCost / 100000).toFixed(1);

  // 80% loan at 8.5% for 20 years
  const loanAmount = standardCost * 0.8;
  const emiRes = calculateIndiaEMI(loanAmount, 8.5, 20, 0.5);

  let seoSlug: string | undefined = undefined;
  const dimClean = (dimensions || "").replace(/[^0-9xX]/g, "").toLowerCase();
  if (dimClean.includes("30x40") || plotArea === 1200) seoSlug = "30x40-house-plans";
  else if (dimClean.includes("20x30") || plotArea === 600) seoSlug = "20x30-house-plans";
  else if (dimClean.includes("30x50") || plotArea === 1500) seoSlug = "30x50-house-plans";
  else if (dimClean.includes("40x60") || plotArea === 2400) seoSlug = "40x60-house-plans";
  else if (dimClean.includes("20x40") || plotArea === 800) seoSlug = "20x40-house-plans";
  else if (dimClean.includes("20x50") || plotArea === 1000) seoSlug = "20x50-house-plans";

  return {
    plotAreaSqft: plotArea,
    builtUpAreaSqft,
    basicCost,
    standardCost,
    premiumCost,
    minLakhs,
    maxLakhs,
    monthlyEmi: emiRes.monthlyEmi,
    seoSlug,
  };
}

export interface TradeItemEstimate {
  id: string;
  name: string;
  calcType: string;
  icon: string;
  specs: string;
  cost: number;
  costFormatted: string;
  costLakhs: string;
  pctOfTotal: number;
}

export interface HousePlanTradeBreakdown {
  builtUpAreaSqft: number;
  carpetAreaSqft: number;
  totalTurnkeyCost: number;
  totalTurnkeyCostLakhs: string;
  tradeList: TradeItemEstimate[];
}

export function getHousePlanTradeBreakdown(
  areaSqft: number,
  floors: string = "",
  bedrooms: number = 3,
  bathrooms: number = 2,
  dimensions: string = ""
): HousePlanTradeBreakdown {
  const est = getHousePlanEstimate(areaSqft, floors, dimensions);
  const builtUp = est.builtUpAreaSqft;
  const carpetArea = Math.round(builtUp * 0.75);

  // Compute floor multiplier scale for bedrooms and bathrooms
  const fl = (floors || "").toLowerCase().trim();
  let floorCount = 1;
  if (fl.includes("g+3") || fl.includes("4")) floorCount = 4;
  else if (fl.includes("g+2") || fl.includes("3")) floorCount = 3;
  else if (fl.includes("g+1") || fl.includes("2")) floorCount = 2;

  const baseBedrooms = Math.max(1, Number(bedrooms) || 2);
  const baseBathrooms = Math.max(1, Number(bathrooms) || 2);

  // Scale bedrooms and bathrooms proportionally if building multiple floors
  const bCount = floorCount === 1 ? baseBedrooms : Math.round(baseBedrooms * (1 + (floorCount - 1) * 0.75));
  const bathCount = floorCount === 1 ? baseBathrooms : Math.round(baseBathrooms * (1 + (floorCount - 1) * 0.75));

  // 1. Civil Structure (foundation, RCC columns/slabs, brickwork, plaster)
  const civilCost = Math.round(builtUp * 1250);

  // 2. Interior Design & Woodwork (modular kitchen, wardrobes, TV unit, false ceiling)
  const kitchenCost = 160000 * Math.max(1, Math.round(floorCount * 0.8));
  const wardrobesCost = bCount * 70000;
  const livingWoodwork = 60000 * floorCount;
  const falseCeiling = Math.round(carpetArea * 70);
  const interiorCost = kitchenCost + wardrobesCost + livingWoodwork + falseCeiling;

  // 3. Flooring & Tiling (vitrified 800x800 + bathroom tiles + labor)
  const flooringCost = Math.round((carpetArea * 150) + (bathCount * 250 * 90));

  // 4. Doors & Windows (1 main teak door + internal doors + UPVC sliding windows)
  const mainDoorCost = 40000 * floorCount;
  const internalDoorsCost = (bCount + bathCount + 1) * 7500;
  const windowsCost = Math.round((bCount * 2 + 2) * 20 * 600);
  const doorsWindowsCost = mainDoorCost + internalDoorsCost + windowsCost;

  // 5. Bathrooms & Plumbing (sanitaryware, CPVC piping, motor, overhead water tanks)
  const sanitaryCost = bathCount * 42000;
  const pipingAndTank = 45000 + (floorCount - 1) * 25000;
  const plumbingCost = sanitaryCost + pipingAndTank;

  // 6. Electrical & Lighting (FR-LSH wiring, modular switches, points, MCB)
  const electricalCost = Math.round(builtUp * 110);

  // 7. Painting & Putty (2 coats putty + primer + 2 coats interior & exterior emulsion)
  const wallArea = Math.round(carpetArea * 3.5);
  const paintingCost = Math.round(wallArea * 42);

  const totalTurnkeyCost = civilCost + interiorCost + flooringCost + doorsWindowsCost + plumbingCost + electricalCost + paintingCost;
  const totalTurnkeyCostLakhs = (totalTurnkeyCost / 100000).toFixed(1);

  const formatCost = (val: number) => {
    return `₹${(val / 100000).toFixed(2)} L`;
  };

  const tradeList: TradeItemEstimate[] = [
    {
      id: "civil",
      name: "Civil & Structure",
      calcType: "construction",
      icon: "fas fa-trowel-bricks",
      specs: `Foundation, RCC columns, slabs & brickwork (~${builtUp} sq.ft)`,
      cost: civilCost,
      costFormatted: formatCost(civilCost),
      costLakhs: (civilCost / 100000).toFixed(1),
      pctOfTotal: Math.round((civilCost / totalTurnkeyCost) * 100),
    },
    {
      id: "interior",
      name: "Interior & Woodwork",
      calcType: "interior",
      icon: "fas fa-couch",
      specs: `Modular kitchen, ${bCount} wardrobes, TV unit & false ceiling`,
      cost: interiorCost,
      costFormatted: formatCost(interiorCost),
      costLakhs: (interiorCost / 100000).toFixed(1),
      pctOfTotal: Math.round((interiorCost / totalTurnkeyCost) * 100),
    },
    {
      id: "flooring",
      name: "Flooring & Tiling",
      calcType: "flooring",
      icon: "fas fa-border-all",
      specs: `800×800 GVT vitrified + anti-skid bath tiles (~${carpetArea} sq.ft)`,
      cost: flooringCost,
      costFormatted: formatCost(flooringCost),
      costLakhs: (flooringCost / 100000).toFixed(1),
      pctOfTotal: Math.round((flooringCost / totalTurnkeyCost) * 100),
    },
    {
      id: "doors-windows",
      name: "Doors & Windows",
      calcType: "doors-windows",
      icon: "fas fa-door-open",
      specs: `Main teak door, ${bCount + bathCount + 1} flush doors & UPVC windows`,
      cost: doorsWindowsCost,
      costFormatted: formatCost(doorsWindowsCost),
      costLakhs: (doorsWindowsCost / 100000).toFixed(1),
      pctOfTotal: Math.round((doorsWindowsCost / totalTurnkeyCost) * 100),
    },
    {
      id: "plumbing",
      name: "Bathrooms & Plumbing",
      calcType: "plumbing",
      icon: "fas fa-faucet-drip",
      specs: `${bathCount} bathrooms, CPVC piping, fixtures & 1000L tank`,
      cost: plumbingCost,
      costFormatted: formatCost(plumbingCost),
      costLakhs: (plumbingCost / 100000).toFixed(1),
      pctOfTotal: Math.round((plumbingCost / totalTurnkeyCost) * 100),
    },
    {
      id: "electrical",
      name: "Electrical & Lighting",
      calcType: "electrical",
      icon: "fas fa-bolt",
      specs: `FR-LSH wiring, modular switches, MCBs & power points`,
      cost: electricalCost,
      costFormatted: formatCost(electricalCost),
      costLakhs: (electricalCost / 100000).toFixed(1),
      pctOfTotal: Math.round((electricalCost / totalTurnkeyCost) * 100),
    },
    {
      id: "painting",
      name: "Painting & Finishing",
      calcType: "painting",
      icon: "fas fa-paint-roller",
      specs: `2 coats putty + primer + premium interior/exterior emulsion`,
      cost: paintingCost,
      costFormatted: formatCost(paintingCost),
      costLakhs: (paintingCost / 100000).toFixed(1),
      pctOfTotal: Math.round((paintingCost / totalTurnkeyCost) * 100),
    },
  ];

  return {
    builtUpAreaSqft: builtUp,
    carpetAreaSqft: carpetArea,
    totalTurnkeyCost,
    totalTurnkeyCostLakhs,
    tradeList,
  };
}

// ==========================================
// 2. USA REGION ENGINES
// ==========================================

export interface USARentVsBuyResult {
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPiti: number;
  totalRent5Years: number;
  totalMortgage5Years: number;
  equityBuilt5Years: number;
  netCostBuy5Years: number;
  cheaperOption: 'rent' | 'buy';
}

export function calculateUSARentVsBuy(
  homePrice: number,
  downPaymentPct: number,
  annualInterestRate: number,
  loanTermYears: number = 30,
  monthlyRent: number = 2200,
  propertyTaxRatePct: number = 1.8
): USARentVsBuyResult {
  const price = Math.max(0, homePrice);
  const downPayment = price * (downPaymentPct / 100);
  const principal = price - downPayment;
  const monthlyRate = (annualInterestRate || 0) / 100 / 12;
  const totalMonths = Math.max(1, loanTermYears * 12);

  let monthlyPI = 0;
  if (monthlyRate === 0) {
    monthlyPI = principal / totalMonths;
  } else {
    monthlyPI =
      principal *
      ((monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1));
  }

  const monthlyPropertyTax = (price * (propertyTaxRatePct / 100)) / 12;
  const monthlyInsurance = 100;
  const monthlyPiti = monthlyPI + monthlyPropertyTax + monthlyInsurance;

  const compareMonths = 60; // 5 years
  const totalRent5Years = monthlyRent * compareMonths;
  const totalMortgage5Years = monthlyPiti * compareMonths;

  let balance = principal;
  let totalPrincipalPaid = 0;
  for (let i = 0; i < compareMonths; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPI - interestPayment;
    totalPrincipalPaid += principalPayment;
    balance -= principalPayment;
  }

  const equityBuilt5Years = downPayment + totalPrincipalPaid;
  const netCostBuy5Years = totalMortgage5Years - totalPrincipalPaid;
  const cheaperOption = totalRent5Years < netCostBuy5Years ? 'rent' : 'buy';

  return {
    monthlyPrincipalInterest: Math.round(monthlyPI),
    monthlyPropertyTax: Math.round(monthlyPropertyTax),
    monthlyInsurance: Math.round(monthlyInsurance),
    monthlyPiti: Math.round(monthlyPiti),
    totalRent5Years: Math.round(totalRent5Years),
    totalMortgage5Years: Math.round(totalMortgage5Years),
    equityBuilt5Years: Math.round(equityBuilt5Years),
    netCostBuy5Years: Math.round(netCostBuy5Years),
    cheaperOption,
  };
}

export function calculateUSAPropertyTax(
  assessedHomeValue: number,
  annualTaxRatePct: number = 1.8,
  annualInsurance: number = 1200
) {
  const annualTax = assessedHomeValue * (annualTaxRatePct / 100);
  const monthlyTaxEscrow = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthlyEscrow = monthlyTaxEscrow + monthlyInsurance;

  return {
    annualPropertyTax: Math.round(annualTax),
    monthlyTaxEscrow: Math.round(monthlyTaxEscrow),
    annualInsurance: Math.round(annualInsurance),
    totalMonthlyEscrow: Math.round(totalMonthlyEscrow),
  };
}

export function calculateUSASwimmingPool(
  poolType: 'gunite' | 'fiberglass' | 'vinyl' | 'above-ground',
  sizeSqft: number,
  extras: { heater?: boolean; decking?: boolean; hotTub?: boolean } = {}
) {
  const baseRatePerSqft = {
    'above-ground': 25,
    vinyl: 70,
    fiberglass: 110,
    gunite: 140,
  }[poolType] || 110;

  const shellCost = sizeSqft * baseRatePerSqft;
  const excavation = poolType === 'above-ground' ? 1200 : 5500;
  const plumbingFiltration = 6500;
  
  let extrasCost = 0;
  if (extras.heater) extrasCost += 4000;
  if (extras.decking) extrasCost += 8500;
  if (extras.hotTub) extrasCost += 12000;

  const totalCost = shellCost + excavation + plumbingFiltration + extrasCost;

  return {
    poolType,
    sizeSqft,
    shellCost,
    excavation,
    plumbingFiltration,
    extrasCost,
    totalCost,
  };
}

// ==========================================
// 3. UAE REGION ENGINES
// ==========================================

export interface DubaiBuyingCostResult {
  propertyPrice: number;
  dldRegistrationFee: number; // 4%
  dldAdminFee: number; // AED 580
  agentCommission: number; // 2% for ready, 0% for off-plan
  mortgageRegistrationFee: number; // 0.25% if mortgage
  mortgageArrangementFee: number; // 1% if mortgage
  propertyValuationFee: number; // AED 3000 if mortgage
  trusteeFee: number; // AED 4000
  nocFee: number; // AED 1000 for ready
  totalOneTimeCosts: number;
  downPayment: number;
  totalUpfrontCash: number;
  annualServiceCharge: number;
}

export function calculateDubaiBuyingCost(
  propertyPrice: number,
  purchaseType: 'Ready Property' | 'Off-Plan',
  paymentMethod: 'Cash' | 'Mortgage',
  downPaymentPct: number = 20,
  propertySizeSqft: number = 1000,
  serviceChargeRateAed: number = 16
): DubaiBuyingCostResult {
  const price = Math.max(0, propertyPrice);
  const isMortgage = paymentMethod === 'Mortgage';
  const isReady = purchaseType === 'Ready Property';

  const dldRegistrationFee = price * 0.04;
  const dldAdminFee = 580;
  const agentCommission = isReady ? price * 0.02 : 0;

  const downPayment = isMortgage ? price * (downPaymentPct / 100) : price;
  const mortgageAmount = isMortgage ? price - downPayment : 0;

  const mortgageRegistrationFee = isMortgage ? mortgageAmount * 0.0025 : 0;
  const mortgageArrangementFee = isMortgage ? mortgageAmount * 0.01 : 0;
  const propertyValuationFee = isMortgage ? 3000 : 0;
  const trusteeFee = 4000;
  const nocFee = isReady ? 1000 : 0;

  const totalOneTimeCosts =
    dldRegistrationFee +
    dldAdminFee +
    agentCommission +
    mortgageRegistrationFee +
    mortgageArrangementFee +
    propertyValuationFee +
    trusteeFee +
    nocFee;

  const totalUpfrontCash = downPayment + totalOneTimeCosts;
  const annualServiceCharge = propertySizeSqft * serviceChargeRateAed;

  return {
    propertyPrice: price,
    dldRegistrationFee: Math.round(dldRegistrationFee),
    dldAdminFee,
    agentCommission: Math.round(agentCommission),
    mortgageRegistrationFee: Math.round(mortgageRegistrationFee),
    mortgageArrangementFee: Math.round(mortgageArrangementFee),
    propertyValuationFee,
    trusteeFee,
    nocFee,
    totalOneTimeCosts: Math.round(totalOneTimeCosts),
    downPayment: Math.round(downPayment),
    totalUpfrontCash: Math.round(totalUpfrontCash),
    annualServiceCharge: Math.round(annualServiceCharge),
  };
}
