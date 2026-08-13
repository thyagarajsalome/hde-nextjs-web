"use client";
import React, { useState } from "react";

const CostCard = ({ title, amount, icon, color, subtitle, prefix }: any) => {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${colorClasses[color] || colorClasses.gray}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">{title}</p>
        <p className="text-xl font-black text-gray-900 dark:text-zinc-100">{prefix}{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default function USARoofingCalculator() {
  const [baseArea, setBaseArea] = useState<number>(2000);
  const [pitch, setPitch] = useState<number>(1.16); // 6/12 pitch multiplier
  
  // USA Avg Prices
  const [shinglePrice, setShinglePrice] = useState<number>(35.00); // Per bundle
  const [underlaymentPrice, setUnderlaymentPrice] = useState<number>(45.00); // Per roll

  // Calculations
  const roofArea = Math.ceil(baseArea * pitch); // true roof area accounting for slope
  const roofAreaWithWaste = Math.ceil(roofArea * 1.15); // 15% waste factor for hips/valleys
  
  // Roofing is measured in "Squares" (100 sq ft)
  const squares = Math.ceil(roofAreaWithWaste / 100);
  
  // 3 bundles of architectural shingles per square
  const bundles = squares * 3;
  
  // 1 roll of synthetic underlayment covers ~400 sq ft (4 squares)
  const underlaymentRolls = Math.ceil(squares / 4);
  
  // 1 box of nails (1.25" coil) per 20 squares
  const nailBoxes = Math.ceil(squares / 20) || 1;

  const costs = {
    shingles: bundles * shinglePrice,
    underlayment: underlaymentRolls * underlaymentPrice,
    nails: nailBoxes * 40.00, // $40 per box
    dripEdge: Math.ceil(Math.sqrt(baseArea) * 4) * 1.50, // rough perimeter estimate x $1.50/ft
  };

  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-xl shadow-inner">
          <i className="fas fa-home"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Roofing Cost & Material Calculator</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Estimate architectural shingles, squares, and underlayment for USA roofs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-ruler-combined text-primary"></i> Roof Dimensions
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Ground Floor Area (sq.ft)</label>
              <input
                type="number"
                value={baseArea}
                onChange={(e) => setBaseArea(Number(e.target.value))}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
              />
              <p className="text-[10px] text-gray-500 mt-1">Include garage and overhangs if applicable.</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Roof Pitch (Slope)</label>
              <select
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
              >
                <option value={1.05}>Low (4/12 Pitch)</option>
                <option value={1.16}>Medium (6/12 Pitch)</option>
                <option value={1.30}>Steep (9/12 Pitch)</option>
                <option value={1.41}>Very Steep (12/12 Pitch)</option>
              </select>
            </div>
          </div>

          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-tag text-primary"></i> Local Prices (USD)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Shingle Bundle ($)</label>
                <input
                  type="number"
                  value={shinglePrice}
                  onChange={(e) => setShinglePrice(Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Underlayment ($)</label>
                <input
                  type="number"
                  value={underlaymentPrice}
                  onChange={(e) => setUnderlaymentPrice(Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <h3 className="text-purple-200 font-semibold mb-2 text-sm uppercase tracking-wider">Total Material Cost</h3>
            <p className="text-5xl font-black tracking-tight">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm font-medium">
              <span>Total Area: {roofAreaWithWaste.toLocaleString()} sq.ft</span>
              <span>Roof Squares: {squares}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CostCard 
              title="Asphalt Shingles" 
              amount={costs.shingles} 
              icon="fa-layer-group"
              color="purple"
              subtitle={`${bundles} Bundles (3 per sq)`}
              prefix="$"
            />
            <CostCard 
              title="Underlayment" 
              amount={costs.underlayment} 
              icon="fa-scroll"
              color="blue"
              subtitle={`${underlaymentRolls} Rolls`}
              prefix="$"
            />
            <CostCard 
              title="Coil Nails" 
              amount={costs.nails} 
              icon="fa-hammer"
              color="gray"
              subtitle={`${nailBoxes} Boxes`}
              prefix="$"
            />
            <CostCard 
              title="Drip Edge Flashing" 
              amount={costs.dripEdge} 
              icon="fa-grip-lines"
              color="amber"
              subtitle="Perimeter Estimate"
              prefix="$"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
