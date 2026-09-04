"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Chart from "@/components/ui/Chart";

export default function DubaiPropertyCalculatorPage() {
  const [propertyPrice, setPropertyPrice] = useState(1500000);
  const [propertyType, setPropertyType] = useState("Apartment");
  const [purchaseType, setPurchaseType] = useState("Ready Property");
  const [paymentMethod, setPaymentMethod] = useState("Mortgage");
  
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  const [interestRate, setInterestRate] = useState(4.5);
  
  const [serviceChargeRate, setServiceChargeRate] = useState(15);
  const [propertySize, setPropertySize] = useState(800);
  const [currency, setCurrency] = useState("AED");

  const exchangeRates: Record<string, number> = { AED: 1, USD: 0.272, INR: 22.8 };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    const oldRate = exchangeRates[currency];
    const newRate = exchangeRates[newCurrency];
    const multiplier = newRate / oldRate;

    setPropertyPrice(Math.round(propertyPrice * multiplier));
    setServiceChargeRate(Math.round(serviceChargeRate * multiplier * 100) / 100);
    setCurrency(newCurrency);
  };

  // Calculations
  const isMortgage = paymentMethod === "Mortgage";
  const isReady = purchaseType === "Ready Property";

  // Fixed fees are defined in AED, so we must multiply them by the current exchange rate
  const rate = exchangeRates[currency];

  const dldRegistrationFee = propertyPrice * 0.04;
  const dldAdminFee = 580 * rate;
  const agentCommission = isReady ? propertyPrice * 0.02 : 0;
  
  const downPayment = isMortgage ? propertyPrice * (downPaymentPct / 100) : propertyPrice;
  const mortgageAmount = isMortgage ? propertyPrice - downPayment : 0;

  const mortgageRegistrationFee = isMortgage ? mortgageAmount * 0.0025 : 0;
  const mortgageArrangementFee = isMortgage ? mortgageAmount * 0.01 : 0;
  const propertyValuationFee = isMortgage ? 3000 * rate : 0;
  
  const conveyancingFee = 4000 * rate;
  const nocFee = isReady ? 1000 * rate : 0;

  const totalOneTimeCosts = 
    dldRegistrationFee +
    dldAdminFee +
    agentCommission +
    mortgageRegistrationFee +
    mortgageArrangementFee +
    propertyValuationFee +
    conveyancingFee +
    nocFee;

  const totalUpfrontCash = downPayment + totalOneTimeCosts;
  const effectivePurchaseCost = propertyPrice + totalOneTimeCosts;
  const annualServiceCharge = propertySize * serviceChargeRate;

  // Monthly Mortgage Calculation
  let monthlyMortgagePayment = 0;
  if (isMortgage && mortgageAmount > 0 && interestRate > 0) {
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalPayments = mortgageTerm * 12;
    monthlyMortgagePayment =
      mortgageAmount *
      ((monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1));
  }

  // Format helper
  const formatCurrency = (val: number) => {
    if (currency === "INR") {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-AE", { 
      style: "currency", 
      currency: currency, 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Chart data
  const chartData = {
    "DLD Registration (4%)": dldRegistrationFee,
    "DLD Admin": dldAdminFee,
    "Conveyancing": conveyancingFee,
    ...(isReady && { "Agent Commission": agentCommission }),
    ...(isReady && { "NOC Fee": nocFee }),
    ...(isMortgage && {
      "Mortgage Registration": mortgageRegistrationFee,
      "Mortgage Arrangement": mortgageArrangementFee,
      "Valuation Fee": propertyValuationFee,
    })
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dubai Property Buying Cost Calculator</h1>
          <p className="mt-2 text-gray-600">Calculate the true cost of buying property in Dubai, including all fees and charges.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">Currency:</span>
          <select 
            value={currency} 
            onChange={handleCurrencyChange}
            className="bg-white border-2 border-gray-200 rounded-lg py-2 px-4 outline-none focus:border-primary font-bold text-gray-800"
          >
            <option value="AED">AED (Dirham)</option>
            <option value="USD">USD (Dollar)</option>
            <option value="INR">INR (Rupee)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Dubai Property Details">
            <div className="space-y-4">
              <Input
                label={`Property Price (${currency})`}
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                icon="fas fa-coins"
              />

              <div className="relative mb-0 group">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
                <label className="absolute z-20 text-xs font-bold text-primary bg-white px-2 rounded-md -top-2.5 left-3">
                  Property Type
                </label>
              </div>

              <div className="relative mb-0 group">
                <select
                  value={purchaseType}
                  onChange={(e) => setPurchaseType(e.target.value)}
                  className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  <option value="Ready Property">Ready Property</option>
                  <option value="Off-Plan">Off-Plan (from Developer)</option>
                </select>
                <label className="absolute z-20 text-xs font-bold text-primary bg-white px-2 rounded-md -top-2.5 left-3">
                  Purchase Type
                </label>
              </div>

              <div className="relative mb-0 group">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                >
                  <option value="Cash">Cash</option>
                  <option value="Mortgage">Mortgage</option>
                </select>
                <label className="absolute z-20 text-xs font-bold text-primary bg-white px-2 rounded-md -top-2.5 left-3">
                  Payment Method
                </label>
              </div>

              {isMortgage && (
                <>
                  <Input
                    label="Down Payment (%)"
                    type="number"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    icon="fas fa-percent"
                  />
                  
                  <div className="relative mb-0 group">
                    <select
                      value={mortgageTerm}
                      onChange={(e) => setMortgageTerm(Number(e.target.value))}
                      className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    >
                      <option value="15">15 Years</option>
                      <option value="20">20 Years</option>
                      <option value="25">25 Years</option>
                    </select>
                    <label className="absolute z-20 text-xs font-bold text-primary bg-white px-2 rounded-md -top-2.5 left-3">
                      Mortgage Term (years)
                    </label>
                  </div>

                  <Input
                    label="Interest Rate (%)"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    icon="fas fa-chart-line"
                  />
                </>
              )}

              <Input
                label="Property Size (sqft)"
                type="number"
                value={propertySize}
                onChange={(e) => setPropertySize(Number(e.target.value))}
                icon="fas fa-ruler-combined"
              />
              
              <Input
                label={`Est. Annual Service Charge (${currency}/sqft)`}
                type="number"
                value={serviceChargeRate}
                onChange={(e) => setServiceChargeRate(Number(e.target.value))}
                icon="fas fa-tools"
              />
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="!p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Upfront Cash Required</h3>
            <div className="text-4xl font-black text-primary">{formatCurrency(totalUpfrontCash)}</div>
            <p className="text-sm text-gray-500 mt-2">
              Includes {isMortgage ? "Down Payment" : "Property Price"} and all one-time fees.
            </p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isMortgage && (
              <Card className="!p-4 bg-blue-50 border-blue-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Payment</h3>
                <div className="text-2xl font-black text-blue-600">{formatCurrency(monthlyMortgagePayment)}</div>
                <p className="text-xs text-gray-500 mt-1">Estimated Mortgage (P&I)</p>
              </Card>
            )}
            <Card className="!p-4 bg-green-50 border-green-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Service Charge</h3>
              <div className="text-2xl font-black text-green-600">{formatCurrency(annualServiceCharge)}</div>
              <p className="text-xs text-gray-500 mt-1">Estimated Annual Fee</p>
            </Card>
          </div>

          <Card title="Fee Breakdown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="space-y-3">
                  {Object.entries(chartData).map(([key, value]) => (
                    value > 0 && (
                      <div key={key} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{key}</span>
                        <span className="text-sm font-black text-gray-900 dark:text-zinc-100">{formatCurrency(value)}</span>
                      </div>
                    )
                  ))}
                  <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 mt-3">
                    <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                      <span className="font-bold text-gray-800 dark:text-zinc-200">Total Fees</span>
                      <span className="font-black text-gray-900 dark:text-zinc-100">{formatCurrency(totalOneTimeCosts)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30">
                    <span className="font-semibold text-primary dark:text-blue-400">Effective Cost</span>
                    <span className="font-black text-primary dark:text-blue-400">{formatCurrency(effectivePurchaseCost)}</span>
                  </div>
                </div>
              </div>

              <div className="h-64">
                <Chart 
                  data={chartData}
                  colors={['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#f59e0b', '#fbbf24']}
                />
              </div>
            </div>
          </Card>
          
          <div className="text-xs text-gray-400 dark:text-zinc-500 text-center mt-6 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-800">
            <strong>Disclaimer:</strong> The figures provided by this calculator are for illustrative purposes only to give you a clear perspective on property costs. Actual values, taxes, and developer fees may fluctuate based on current market updates and government regulations. Home Design English (HDE) is an informational platform; please verify all final costs with our network of verified real estate professionals before making any financial commitments.
          </div>
        </div>
      </div>
    </div>
  );
}
