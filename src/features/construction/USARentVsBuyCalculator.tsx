"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Chart from "@/components/ui/Chart";

export default function USARentVsBuyCalculator() {
  const [rent, setRent] = useState(2500);
  const [homePrice, setHomePrice] = useState(400000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.8);
  const [loanTerm, setLoanTerm] = useState(30);

  // Mortgage calculations
  const downPayment = homePrice * (downPaymentPct / 100);
  const principal = homePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;

  // Monthly P&I
  const monthlyPrincipalInterest =
    principal *
    ((monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1));

  // Taxes and Insurance
  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = 100;

  const piti = monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance;

  // 5-Year comparison (60 months)
  const yearsToCompare = 5;
  const monthsToCompare = yearsToCompare * 12;

  const totalRentPaid = rent * monthsToCompare;

  let balance = principal;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  for (let i = 0; i < monthsToCompare; i++) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = monthlyPrincipalInterest - interestPayment;
    totalInterestPaid += interestPayment;
    totalPrincipalPaid += principalPayment;
    balance -= principalPayment;
  }

  const totalPropertyTaxPaid = monthlyPropertyTax * monthsToCompare;
  const totalInsurancePaid = monthlyInsurance * monthsToCompare;
  const totalMortgagePaid = piti * monthsToCompare;

  // Format helper
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Section */}
      <div className="lg:col-span-4 space-y-6">
        <Card title="Input Details">
          <div className="space-y-4">
            <Input
              label="Current Monthly Rent ($)"
              type="number"
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              icon="fas fa-home"
            />
            <Input
              label="Target Home Price ($)"
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              icon="fas fa-dollar-sign"
            />
            <Input
              label="Down Payment (%)"
              type="number"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              icon="fas fa-percent"
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              icon="fas fa-chart-line"
            />
            <Input
              label="Property Tax Rate (%)"
              type="number"
              value={propertyTaxRate}
              onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
              icon="fas fa-building"
            />
            <Input
              label="Loan Term (years)"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              icon="fas fa-calendar-alt"
            />
          </div>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="!p-4 sm:!p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly PITI</h3>
            <div className="text-3xl font-black text-primary">{formatCurrency(piti)}</div>
            <p className="text-xs text-gray-500 mt-2">Principal, Interest, Taxes & Insurance</p>
          </Card>
          <Card className="!p-4 sm:!p-6 bg-blue-50 border-blue-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Rent</h3>
            <div className="text-3xl font-black text-blue-600">{formatCurrency(rent)}</div>
            <p className="text-xs text-gray-500 mt-2">Current estimated rent</p>
          </Card>
        </div>

        <Card title="5-Year Financial Comparison">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4">Total Spent Over 5 Years</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Total Rent</span>
                  <span className="font-black text-gray-900">{formatCurrency(totalRentPaid)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Total Mortgage Payments</span>
                  <span className="font-black text-gray-900">{formatCurrency(totalMortgagePaid)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Note:</strong> While mortgage payments might be higher, a portion of it builds equity.
                  </p>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="font-semibold text-green-800">Equity Built (Principal)</span>
                    <span className="font-black text-green-600">{formatCurrency(totalPrincipalPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64">
              <Chart 
                data={{
                  "Rent Paid": totalRentPaid,
                  "Mortgage Interest": totalInterestPaid,
                  "Property Taxes": totalPropertyTaxPaid,
                  "Insurance": totalInsurancePaid,
                  "Principal (Equity)": totalPrincipalPaid,
                }}
                colors={["#ef4444", "#f97316", "#eab308", "#3b82f6", "#22c55e"]}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
