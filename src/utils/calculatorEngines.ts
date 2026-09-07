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
