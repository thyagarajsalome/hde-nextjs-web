"use client";
import React, { useState } from "react";

const CostCard = ({ title, amount, icon, color, subtitle, prefix = "" }: any) => {
  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  };

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${colorClasses[color] || colorClasses.gray}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-500 dark:text-zinc-400">{title}</p>
        <p className="text-xl font-black text-gray-900 dark:text-zinc-100">
          {prefix}{typeof amount === 'number' ? amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : amount}
        </p>
        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default function USAAccentWallCalculator() {
  const [wallWidthInches, setWallWidthInches] = useState<number>(144); // 12 ft
  const [wallHeightInches, setWallHeightInches] = useState<number>(96); // 8 ft
  const [numPanels, setNumPanels] = useState<number>(5); // 5 spaces means 6 vertical battens
  const [battenWidth, setBattenWidth] = useState<number>(2.5); // 1x3 actual width is 2.5"
  
  // USA Avg Prices
  const [lumberPricePerFt, setLumberPricePerFt] = useState<number>(1.25); // Primed MDF 1x3
  const [paintPrice, setPaintPrice] = useState<number>(45.00); // 1 Gallon high quality enamel

  // Calculations
  const numBattens = numPanels + 1; // E.g., 5 spaces require 6 vertical boards
  
  // Total width taken up by battens
  const totalBattenWidth = numBattens * battenWidth;
  
  // Available width for spacing
  const availableSpaceWidth = wallWidthInches - totalBattenWidth;
  
  // Exact spacing between each batten
  const spacingBetweenBattens = availableSpaceWidth / numPanels;

  // Linear footage of lumber (Top board + Bottom board + Verticals)
  const horizontalLinearFeet = (wallWidthInches * 2) / 12; // Top & Bottom rail
  const verticalLinearFeet = (wallHeightInches * numBattens) / 12;
  const totalLinearFeet = Math.ceil(horizontalLinearFeet + verticalLinearFeet);
  const linearFeetWithWaste = Math.ceil(totalLinearFeet * 1.15); // 15% waste

  // Accessories
  const adhesiveTubes = Math.ceil(linearFeetWithWaste / 30); // 1 tube per 30 feet
  const nailsBoxes = 1; // 1 box of brad nails is plenty
  const caulkTubes = Math.ceil(linearFeetWithWaste / 25); // 1 tube of paintable caulk per 25 ft

  const costs = {
    lumber: linearFeetWithWaste * lumberPricePerFt,
    paint: paintPrice, // usually 1 gallon is more than enough for a standard accent wall
    adhesive: adhesiveTubes * 4.50, // Liquid nails
    caulk: caulkTubes * 5.00,
    nails: 12.00, // Box of brad nails
  };

  const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-xl shadow-inner">
          <i className="fas fa-border-all"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Board & Batten Spacing Calculator</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Calculate exact panel spacing, linear feet of MDF/wood, and total DIY cost.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-ruler-combined text-primary"></i> Wall Dimensions (Inches)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Wall Width (in)</label>
                <input
                  type="number"
                  value={wallWidthInches || ""}
                  onChange={(e) => setWallWidthInches(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Wall Height (in)</label>
                <input
                  type="number"
                  value={wallHeightInches || ""}
                  onChange={(e) => setWallHeightInches(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Target Panels (Spaces)</label>
                <input
                  type="number"
                  value={numPanels || ""}
                  onChange={(e) => setNumPanels(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Batten Width (in)</label>
                <input
                  type="number"
                  step="0.5"
                  value={battenWidth || ""}
                  onChange={(e) => setBattenWidth(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-tag text-primary"></i> Local Prices (USD)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Lumber ($/Lin.Ft)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lumberPricePerFt}
                  onChange={(e) => setLumberPricePerFt(Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Premium Paint ($/Gal)</label>
                <input
                  type="number"
                  value={paintPrice}
                  onChange={(e) => setPaintPrice(Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-600 to-red-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <h3 className="text-rose-100 font-semibold mb-2 text-sm uppercase tracking-wider">Exact Panel Spacing</h3>
            <p className="text-5xl font-black tracking-tight mb-4">{spacingBetweenBattens.toFixed(2)}"</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Total Linear Feet</p>
                <p className="text-xl font-bold">{linearFeetWithWaste} ft</p>
              </div>
              <div>
                <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Total DIY Cost</p>
                <p className="text-xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CostCard 
              title="Lumber / MDF" 
              amount={costs.lumber} 
              icon="fa-tree"
              color="amber"
              subtitle={`${numBattens} Vertical Battens`}
              prefix="$"
            />
            <CostCard 
              title="Enamel Paint" 
              amount={costs.paint} 
              icon="fa-paint-roller"
              color="blue"
              subtitle="1 Gallon"
              prefix="$"
            />
            <CostCard 
              title="Construction Adhesive" 
              amount={costs.adhesive} 
              icon="fa-fill-drip"
              color="purple"
              subtitle={`${adhesiveTubes} Tubes`}
              prefix="$"
            />
            <CostCard 
              title="Paintable Caulk" 
              amount={costs.caulk} 
              icon="fa-magic"
              color="gray"
              subtitle={`${caulkTubes} Tubes`}
              prefix="$"
            />
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl text-amber-800 dark:text-amber-400 text-sm font-medium flex gap-3">
            <i className="fas fa-lightbulb mt-0.5"></i>
            <p><strong>Pro Tip:</strong> Always measure your wall width in 3 different spots (top, middle, bottom) and use the smallest measurement. Walls are rarely perfectly square!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
