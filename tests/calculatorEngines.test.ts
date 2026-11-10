import { describe, it, expect } from 'vitest';
import {
  calculateIndiaEMI,
  calculateIndiaConstruction,
  calculateIndiaBorewell,
  calculateIndiaSolarRooftop,
  calculateUSARentVsBuy,
  calculateUSAPropertyTax,
  calculateUSASwimmingPool,
  calculateDubaiBuyingCost,
} from '../src/utils/calculatorEngines';

describe('India Calculation Engines', () => {
  it('calculates accurate Home Loan EMI based on standard banking amortization formula', () => {
    // Benchmark: 30 Lakhs (3,000,000 INR) at 8.5% for 20 years
    const result = calculateIndiaEMI(3000000, 8.5, 20, 0.5);

    // Monthly EMI should be approx 26,035 INR
    expect(result.monthlyEmi).toBeGreaterThan(25900);
    expect(result.monthlyEmi).toBeLessThan(26200);

    // Total amount payable = ~62.48 Lakhs
    expect(result.totalAmountPayable).toBeGreaterThan(6000000);
    expect(result.totalInterest).toBe(result.totalAmountPayable - 3000000);

    // Processing fee = 0.5% of 30L = 15,000 INR
    expect(result.processingFee).toBe(15000);
  });

  it('calculates residential turnkey construction costs with correct trade percentage allocations', () => {
    const result = calculateIndiaConstruction(1200, 1600, 2300, 3300);

    expect(result.sqft).toBe(1200);
    expect(result.basicCost).toBe(1200 * 1600); // 19,20,000
    expect(result.standardCost).toBe(1200 * 2300); // 27,60,000
    expect(result.premiumCost).toBe(1200 * 3300); // 39,60,000

    // Verify trade allocations add up to 100% of standard cost
    const sum =
      result.breakdown.foundation +
      result.breakdown.structure +
      result.breakdown.masonry +
      result.breakdown.finishing +
      result.breakdown.electricalPlumbing +
      result.breakdown.misc;
    expect(sum).toBe(result.standardCost);
  });

  it('calculates Borewell Drilling & Submersible Pump turnkey costs accurately', () => {
    // 600 ft borewell with 80 ft PVC casing
    const result = calculateIndiaBorewell(600, 'PVC', 80);

    // Drilling: 300*35 + 300*45 = 10,500 + 13,500 = 24,000
    expect(result.drillingCost).toBe(24000);
    // Casing: 80 * 380 = 30,400
    expect(result.casingCost).toBe(30400);
    // 600ft recommends 5 HP pump (42,000)
    expect(result.recommendedMotorHp).toBe(5);
    expect(result.pumpCost).toBe(42000);
    // Accessories: 600*55 (delivery pipes) + 600*48 (cable) + 8500 (starter) + 6000 (chamber/cap)
    expect(result.accessoriesCost).toBe(600 * 55 + 600 * 48 + 8500 + 6000);
    expect(result.totalCost).toBe(
      result.drillingCost + result.casingCost + result.pumpCost + result.accessoriesCost
    );
  });

  it('calculates PM Surya Ghar Solar Rooftop DBT subsidy and payback ROI accurately', () => {
    // 3 kW residential setup in Karnataka at ₹8.5/unit
    const result = calculateIndiaSolarRooftop(3, 'Karnataka', 8.5);

    // Gross cost: 3 * 62,000 = 1,86,000
    expect(result.grossCost).toBe(186000);
    // Official central DBT subsidy for 3 kW = ₹78,000
    expect(result.centralSubsidy).toBe(78000);
    // Net out-of-pocket: 1,86,000 - 78,000 = 1,08,000
    expect(result.netCost).toBe(108000);
    // Annual units: 3 * 1440 = 4,320 kWh
    expect(result.annualGenerationUnits).toBe(4320);
    // Annual savings: 4320 * 8.5 = ₹36,720
    expect(result.annualSavings).toBe(4320 * 8.5);
    // Payback period ~ 2.9 years
    expect(result.paybackYears).toBeLessThan(3.5);
    expect(result.paybackYears).toBeGreaterThan(2.5);
    // 25-year cumulative savings > ₹7 Lakhs
    expect(result.cumulative25YearSavings).toBeGreaterThan(700000);
  });
});

describe('USA Calculation Engines', () => {
  it('calculates Rent vs Buy comparison and 5-year equity accurately', () => {
    const result = calculateUSARentVsBuy(400000, 20, 6.5, 30, 2200, 1.8);

    expect(result.monthlyPrincipalInterest).toBeGreaterThan(2000);
    expect(result.monthlyPropertyTax).toBe(600); // 400000 * 0.018 / 12 = 600
    expect(result.monthlyPiti).toBe(result.monthlyPrincipalInterest + 600 + 100);

    // 5-year comparison numbers
    expect(result.totalRent5Years).toBe(2200 * 60); // $132,000
    expect(result.equityBuilt5Years).toBeGreaterThan(80000); // Initial 80k down payment + principal
    expect(['rent', 'buy']).toContain(result.cheaperOption);
  });

  it('calculates local county property taxes with escrow breakdown', () => {
    const result = calculateUSAPropertyTax(350000, 1.8, 1200);

    expect(result.annualPropertyTax).toBe(6300); // 350000 * 0.018 = 6,300
    expect(result.monthlyTaxEscrow).toBe(525); // 6300 / 12 = 525
    expect(result.totalMonthlyEscrow).toBe(525 + 100); // 625
  });

  it('calculates swimming pool turnkey costs based on shell type and extras', () => {
    const gunitePool = calculateUSASwimmingPool('gunite', 400, { heater: true, decking: true });
    expect(gunitePool.shellCost).toBe(400 * 140); // $56,000
    expect(gunitePool.extrasCost).toBe(4000 + 8500); // $12,500
    expect(gunitePool.totalCost).toBeGreaterThan(60000);
  });
});

describe('UAE Dubai Calculation Engines', () => {
  it('calculates exact Dubai Land Department (DLD 4%) fees and buying overheads for ready properties', () => {
    const readyCash = calculateDubaiBuyingCost(1500000, 'Ready Property', 'Cash');

    // DLD = 4% of 1.5M = 60,000 AED
    expect(readyCash.dldRegistrationFee).toBe(60000);
    expect(readyCash.dldAdminFee).toBe(580);
    // Ready agent commission = 2% = 30,000 AED
    expect(readyCash.agentCommission).toBe(30000);
    // Trustee fee = 4,000 AED, NOC = 1,000 AED
    expect(readyCash.trusteeFee).toBe(4000);
    expect(readyCash.nocFee).toBe(1000);

    // Off-plan has 0% agent commission and 0 NOC fee
    const offPlan = calculateDubaiBuyingCost(1500000, 'Off-Plan', 'Cash');
    expect(offPlan.agentCommission).toBe(0);
    expect(offPlan.nocFee).toBe(0);
  });

  it('calculates mortgage registration and arrangement fees for UAE financing', () => {
    // 2,000,000 AED price, 20% down payment = 1.6M mortgage
    const readyMortgage = calculateDubaiBuyingCost(2000000, 'Ready Property', 'Mortgage', 20);

    expect(readyMortgage.downPayment).toBe(400000);
    // Mortgage registration = 0.25% of 1.6M = 4,000 AED
    expect(readyMortgage.mortgageRegistrationFee).toBe(1600000 * 0.0025);
    // Mortgage arrangement fee = 1% of 1.6M = 16,000 AED
    expect(readyMortgage.mortgageArrangementFee).toBe(1600000 * 0.01);
    // Valuation fee = 3000 AED
    expect(readyMortgage.propertyValuationFee).toBe(3000);
  });
});
