"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Chart from "@/components/ui/Chart";

export default function USAPropertyTaxCalculator() {
  const [assessedValue, setAssessedValue] = useState(400000);
  const [taxRate, setTaxRate] = useState(1.8);
  const [annualInsurance, setAnnualInsurance] = useState(1200);
  const [monthlyHoa, setMonthlyHoa] = useState(0);

  // Calculations
  const annualPropertyTax = assessedValue * (taxRate / 100);
  const monthlyPropertyTax = annualPropertyTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthlyEscrow = monthlyPropertyTax + monthlyInsurance + monthlyHoa;

  // Format helper
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Section */}
      <div className="lg:col-span-4 space-y-6">
        <Card title="Property Details">
          <div className="space-y-4">
            <Input
              label="Home Assessed Value ($)"
              type="number"
              value={assessedValue}
              onChange={(e) => setAssessedValue(Number(e.target.value))}
              icon="fas fa-home"
            />
            <Input
              label="Local Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              icon="fas fa-percent"
            />
            <Input
              label="Annual Home Insurance ($)"
              type="number"
              value={annualInsurance}
              onChange={(e) => setAnnualInsurance(Number(e.target.value))}
              icon="fas fa-shield-alt"
            />
            <Input
              label="Monthly HOA Fees ($)"
              type="number"
              value={monthlyHoa}
              onChange={(e) => setMonthlyHoa(Number(e.target.value))}
              icon="fas fa-users"
            />
          </div>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="!p-4 sm:!p-6 bg-primary/5 border-primary/20">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Annual Tax</h3>
            <div className="text-3xl font-black text-primary">{formatCurrency(annualPropertyTax)}</div>
            <p className="text-xs text-gray-500 mt-2">Total Yearly Property Tax</p>
          </Card>
          <Card className="!p-4 sm:!p-6 bg-blue-50 border-blue-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Tax</h3>
            <div className="text-3xl font-black text-blue-600">{formatCurrency(monthlyPropertyTax)}</div>
            <p className="text-xs text-gray-500 mt-2">Paid Monthly (Escrow)</p>
          </Card>
          <Card className="!p-4 sm:!p-6 bg-green-50 border-green-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Escrow</h3>
            <div className="text-3xl font-black text-green-600">{formatCurrency(totalMonthlyEscrow)}</div>
            <p className="text-xs text-gray-500 mt-2">Tax + Ins + HOA (Monthly)</p>
          </Card>
        </div>

        <Card title="Monthly Payment Breakdown (Escrow)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Property Tax</span>
                  <span className="font-black text-gray-900">{formatCurrency(monthlyPropertyTax)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">Home Insurance</span>
                  <span className="font-black text-gray-900">{formatCurrency(monthlyInsurance)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-700">HOA Fees</span>
                  <span className="font-black text-gray-900">{formatCurrency(monthlyHoa)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="font-semibold text-primary">Total Monthly</span>
                    <span className="font-black text-primary">{formatCurrency(totalMonthlyEscrow)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64">
              <Chart 
                data={{
                  "Property Tax": monthlyPropertyTax,
                  "Home Insurance": monthlyInsurance,
                  "HOA Fees": monthlyHoa,
                }}
                colors={["#f97316", "#3b82f6", "#22c55e"]}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
