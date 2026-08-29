"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Chart from '@/components/ui/Chart';
import { formatCurrency } from '@/utils/currency';
import { useProjectActions } from '@/hooks/useProjectActions';

export default function IndiaEMICalculator() {
  const { isSaving, saveProject } = useProjectActions('india-emi');

  const [loanAmount, setLoanAmount] = useState<number>(3000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(0.5);

  const calculateEMI = () => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    if (r === 0) return P / n;
    
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const emi = calculateEMI();
  const totalAmountPayable = emi * tenureYears * 12;
  const totalInterest = totalAmountPayable - loanAmount;
  const processingFee = loanAmount * (processingFeePercent / 100);
  const totalCost = totalAmountPayable + processingFee;

  const chartData = {
    'Principal Amount': loanAmount,
    'Total Interest': totalInterest,
  };

  // Generate Amortization Table for first 5 years
  const generateAmortization = () => {
    const table = [];
    let balance = loanAmount;
    const r = interestRate / 12 / 100;

    for (let year = 1; year <= 5; year++) {
      if (year > tenureYears) break;
      
      let yearPrincipal = 0;
      let yearInterest = 0;

      for (let month = 1; month <= 12; month++) {
        const interestForMonth = balance * r;
        const principalForMonth = emi - interestForMonth;
        
        yearInterest += interestForMonth;
        yearPrincipal += principalForMonth;
        balance -= principalForMonth;
      }

      table.push({
        year,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(0, balance),
      });
    }
    return table;
  };

  const amortizationTable = generateAmortization();

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary dark:text-white mb-2">
            Home Loan EMI Calculator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Calculate your monthly EMI, total interest, and amortization schedule for Indian home loans.
          </p>
        </div>
        <button
          onClick={() =>
            saveProject({
              loanAmount,
              interestRate,
              tenureYears,
              processingFeePercent,
              emi,
              totalInterest,
            }, 0)
          }
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
          {isSaving ? 'Saving...' : 'Save Result'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-lg font-bold mb-4 text-secondary dark:text-white">Loan Details</h3>
            
            <div className="space-y-4">
              <div>
                <Input
                  label="Loan Amount (₹)"
                  type="number"
                  value={loanAmount || ''}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  min={100000}
                />
              </div>

              <div>
                <Input
                  label="Interest Rate (%)"
                  type="number"
                  value={interestRate || ''}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min={6}
                  max={15}
                  step={0.1}
                />
                <input
                  type="range"
                  min="6"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full mt-2 accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Loan Tenure (Years)</label>
                <select
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[5, 10, 15, 20, 25, 30].map(y => (
                    <option key={y} value={y}>{y} Years</option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Processing Fee (%)"
                  type="number"
                  value={processingFeePercent || ''}
                  onChange={(e) => setProcessingFeePercent(Number(e.target.value))}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Results & Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly EMI</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(emi, 'IN')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
              <p className="text-2xl font-bold text-secondary dark:text-white">{formatCurrency(totalInterest, 'IN')}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Payment (inc. fee)</p>
              <p className="text-2xl font-bold text-secondary dark:text-white">{formatCurrency(totalCost, 'IN')}</p>
            </Card>
          </div>

          <Card className="p-5 flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 self-start text-secondary dark:text-white">Breakdown</h3>
            <div className="w-64 h-64">
              <Chart data={chartData} colors={['#1e3a8a', '#d4af37']} />
            </div>
          </Card>
        </div>
      </div>

      {/* Amortization Table */}
      <Card className="p-5 overflow-hidden">
        <h3 className="text-lg font-bold mb-4 text-secondary dark:text-white">Amortization Schedule (First 5 Years)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                <th className="p-3 text-sm font-semibold">Year</th>
                <th className="p-3 text-sm font-semibold">Principal Paid</th>
                <th className="p-3 text-sm font-semibold">Interest Paid</th>
                <th className="p-3 text-sm font-semibold">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              {amortizationTable.map((row) => (
                <tr key={row.year} className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50">
                  <td className="p-3 text-sm">{row.year}</td>
                  <td className="p-3 text-sm">{formatCurrency(row.principal, 'IN')}</td>
                  <td className="p-3 text-sm text-yellow-600 dark:text-yellow-500">{formatCurrency(row.interest, 'IN')}</td>
                  <td className="p-3 text-sm font-medium">{formatCurrency(row.balance, 'IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bank Rates Comparison */}
      <Card className="p-5">
        <h3 className="text-lg font-bold mb-4 text-secondary dark:text-white">Current Home Loan Interest Rates (Approximate)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="font-semibold mb-1">SBI</p>
            <p className="text-primary font-bold">8.40%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="font-semibold mb-1">HDFC</p>
            <p className="text-primary font-bold">8.70%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="font-semibold mb-1">ICICI</p>
            <p className="text-primary font-bold">8.75%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="font-semibold mb-1">Axis Bank</p>
            <p className="text-primary font-bold">8.90%</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            <p className="font-semibold mb-1">PNB</p>
            <p className="text-primary font-bold">8.45%</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          *Rates are subject to change and depend on credit score and loan amount.
        </p>
      </Card>
    </div>
  );
}
