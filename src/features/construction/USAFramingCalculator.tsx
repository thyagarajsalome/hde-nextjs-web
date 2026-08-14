"use client";
import React, { useState } from "react";
const CostCard = ({ title, amount, icon, color, subtitle, prefix }: any) => {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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
export default function USAFramingCalculator() {
  const [length, setLength] = useState<number>(20);
  const [width, setWidth] = useState<number>(15);
  const [height, setHeight] = useState<number>(8);

  const [studPrice, setStudPrice] = useState<number>(3.50);
  const [drywallPrice, setDrywallPrice] = useState<number>(14.50);

  // Calculations
  const linearFeet = (length + width) * 2;
  const wallArea = linearFeet * height;
  const ceilingArea = length * width;
  const totalArea = wallArea + ceilingArea;

  // Materials
  // 1 stud per linear foot covers studs + top/bottom plates + some waste
  const studsNeeded = Math.ceil(linearFeet * 1.2); 
  
  // Drywall sheets (4x8 = 32 sq ft). Add 10% waste
  const drywallSheets = Math.ceil((totalArea / 32) * 1.1);

  // Joint compound (Approx 1 bucket (4.5 gal) per 400 sq ft)
  const compoundBuckets = Math.ceil(totalArea / 400);

  // Screws (Approx 1 lb per 400 sq ft)
  const screwLbs = Math.ceil(totalArea / 400);

  const costs = {
    studs: studsNeeded * studPrice,
    drywall: drywallSheets * drywallPrice,
    compound: compoundBuckets * 22.00, // Average $22 per bucket
    screws: screwLbs * 7.50, // Average $7.50 per lb
  };

  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl shadow-inner">
          <i className="fas fa-hammer"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">USA Framing & Drywall Estimator</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Calculate lumber, drywall, and hardware for standard US wood-framed walls.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-ruler-combined text-primary"></i> Room Dimensions
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Length (ft)</label>
                <input
                  type="number"
                  value={length || ""}
                  onChange={(e) => setLength(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Width (ft)</label>
                <input
                  type="number"
                  value={width || ""}
                  onChange={(e) => setWidth(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Ceiling Height (ft)</label>
              <input
                type="number"
                value={height || ""}
                onChange={(e) => setHeight(e.target.value === "" ? 0 : Number(e.target.value))}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-tag text-primary"></i> Local Prices (USD)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">2x4x8 Stud ($)</label>
                <input
                  type="number"
                  value={studPrice || ""}
                  onChange={(e) => setStudPrice(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Drywall 4x8 ($)</label>
                <input
                  type="number"
                  value={drywallPrice || ""}
                  onChange={(e) => setDrywallPrice(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <h3 className="text-blue-200 font-semibold mb-2 text-sm uppercase tracking-wider">Total Material Cost</h3>
            <p className="text-5xl font-black tracking-tight">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm font-medium">
              <span>Total Area: {totalArea.toLocaleString()} sq.ft</span>
              <span>Linear Wall: {linearFeet} ft</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CostCard 
              title="2x4 Lumber Studs" 
              amount={costs.studs} 
              icon="fa-tree"
              color="emerald"
              subtitle={`${studsNeeded} pieces`}
              prefix="$"
            />
            <CostCard 
              title="Drywall Sheets" 
              amount={costs.drywall} 
              icon="fa-layer-group"
              color="blue"
              subtitle={`${drywallSheets} sheets (4x8)`}
              prefix="$"
            />
            <CostCard 
              title="Joint Compound" 
              amount={costs.compound} 
              icon="fa-fill-drip"
              color="amber"
              subtitle={`${compoundBuckets} buckets (4.5 gal)`}
              prefix="$"
            />
            <CostCard 
              title="Screws & Hardware" 
              amount={costs.screws} 
              icon="fa-screwdriver"
              color="gray"
              subtitle={`${screwLbs} lbs box`}
              prefix="$"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
