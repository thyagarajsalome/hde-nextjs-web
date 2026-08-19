"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Chart from "@/components/ui/Chart";

export default function USASalaryCalculator() {
  const [homePrice, setHomePrice] = useState(400000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.8);
  const [monthlyDebts, setMonthlyDebts] = useState(500);

  // Mortgage calculations
  const downPayment = homePrice * (downPaymentPct / 100);
  const principal = homePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const loanTerm = 30; // 30 years fixed
  const totalPayments = loanTerm * 12;

  // Monthly P&I
  const monthlyPrincipalInterest =
    principal *
    ((monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1));

  // Taxes and Insurance
  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = 100; // Estimated monthly insurance

  const piti = monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance;

  // 28/36 Rule calculations
  const reqMonthlyIncome28 = piti / 0.28;
  const reqMonthlyIncome36 = (piti + monthlyDebts) / 0.36;

  const requiredMonthlyIncome = Math.max(reqMonthlyIncome28, reqMonthlyIncome36);
  const requiredAnnualSalary = requiredMonthlyIncome * 12;

  const limitingFactor = reqMonthlyIncome28 > reqMonthlyIncome36 ? "Housing (28% Rule)" : "Total Debt (36% Rule)";

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
              label="Target Home Price ($)"
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              icon="fas fa-home"
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
              label="Annual Property Tax (%)"
              type="number"
              value={propertyTaxRate}
              onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
              icon="fas fa-building"
            />
            <Input
              label="Monthly Debts ($)"
              type="number"
              value={monthlyDebts}
              onChange={(e) => setMonthlyDebts(Number(e.target.value))}
              icon="fas fa-credit-card"
            />
          </div>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="!p-4 sm:!p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Required Annual Salary</h3>
            <div className="text-4xl font-black text-primary">{formatCurrency(requiredAnnualSalary)}</div>
            <p className="text-xs text-gray-500 mt-2">Based on the 28/36 Rule (Limited by {limitingFactor})</p>
          </Card>
          <Card className="!p-4 sm:!p-6 bg-blue-50 border-blue-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly PITI</h3>
            <div className="text-3xl font-black text-blue-600">{formatCurrency(piti)}</div>
            <p className="text-xs text-gray-500 mt-2">Principal, Interest, Taxes & Insurance</p>
          </Card>
        </div>

        <Card title="Income & Debt Breakdown (Monthly)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-4">Required Monthly Income</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Gross Monthly Income</span>
                  <span className="font-black text-gray-900">{formatCurrency(requiredMonthlyIncome)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Housing Payment (PITI)</span>
                  <span className="font-black text-gray-900">{formatCurrency(piti)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Other Monthly Debts</span>
                  <span className="font-black text-gray-900">{formatCurrency(monthlyDebts)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Note:</strong> Lenders prefer housing costs ≤ 28% and total debts ≤ 36% of gross income.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-64">
              <Chart 
                data={{
                  "Housing (PITI)": piti,
                  "Other Debts": monthlyDebts,
                  "Remaining Income": requiredMonthlyIncome - piti - monthlyDebts,
                }}
                colors={["#3b82f6", "#ef4444", "#22c55e"]}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
