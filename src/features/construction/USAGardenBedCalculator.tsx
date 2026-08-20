"use client";
import React, { useState, useRef } from "react";
import { useProjectActions } from "../../hooks/useProjectActions";
import { useUser } from "../../context/UserContext";

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

export default function USAGardenBedCalculator() {
  const { hasPaid } = useUser();
  const { saveProject, downloadPDF, isSaving, isDownloading } = useProjectActions("usa-garden-bed");
  
  const [length, setLength] = useState<number>(8);
  const [width, setWidth] = useState<number>(4);
  const [height, setHeight] = useState<number>(12); // inches
  const [material, setMaterial] = useState<string>("Pine");
  
  const contentRef = useRef<any>(null);

  // Calculations
  const soilVolumeCY = (length * width * (height / 12)) / 27;
  const soilCost = soilVolumeCY * 35; // ~$35/cubic yard
  
  const perimeter = (length * 2) + (width * 2);
  const boardsNeeded = Math.ceil(height / 6); // roughly assuming 6" boards
  
  let lumberPricePerFt = 2; // Pine
  if (material === "Cedar") lumberPricePerFt = 4;
  if (material === "Composite") lumberPricePerFt = 6;
  
  const lumberCost = perimeter * boardsNeeded * lumberPricePerFt;
  const totalCost = soilCost + lumberCost;

  const handleSave = () => {
    saveProject({ length, width, height, material, soilVolumeCY, soilCost, lumberCost }, totalCost);
  };

  const handleDownloadPDF = () => {
    downloadPDF(contentRef, `Garden-Bed-${length}x${width}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8">
      <div id="usa-garden-bed" ref={contentRef}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xl shadow-inner">
            <i className="fas fa-leaf"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">USA Raised Garden Bed Calculator</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Estimate soil volume and lumber cost for raised beds.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <i className="fas fa-ruler-combined text-primary"></i> Dimensions & Material
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Length (ft)</label>
                  <input
                    type="number"
                    value={length || ""}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Width (ft)</label>
                  <input
                    type="number"
                    value={width || ""}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Height (inches)</label>
                <input
                  type="number"
                  value={height || ""}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Material</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
                >
                  <option value="Pine">Pine (Cheap)</option>
                  <option value="Cedar">Cedar (Expensive)</option>
                  <option value="Composite">Composite</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-700 to-green-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              <h3 className="text-emerald-200 font-semibold mb-2 text-sm uppercase tracking-wider">Total Project Cost</h3>
              <p className="text-5xl font-black tracking-tight">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CostCard 
                title="Soil Needed" 
                amount={soilVolumeCY} 
                icon="fa-seedling"
                color="amber"
                subtitle="Cubic Yards"
                prefix=""
              />
              <CostCard 
                title="Soil Cost" 
                amount={soilCost} 
                icon="fa-dollar-sign"
                color="amber"
                subtitle="~$35 / cubic yard"
                prefix="$"
              />
              <CostCard 
                title="Lumber Needed" 
                amount={perimeter * boardsNeeded} 
                icon="fa-tree"
                color="emerald"
                subtitle="Linear feet total"
                prefix=""
              />
              <CostCard 
                title="Lumber Cost" 
                amount={lumberCost} 
                icon="fa-hammer"
                color="emerald"
                subtitle={`${material} Wood`}
                prefix="$"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
        <button onClick={handleDownloadPDF} disabled={isDownloading}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-900 border-2 border-secondary dark:border-zinc-700 text-secondary dark:text-zinc-100 font-bold rounded-xl hover:bg-secondary dark:hover:bg-zinc-800 hover:text-white transition-all">
          <i className={`fas ${isDownloading ? "fa-spinner fa-spin" : "fa-file-pdf"}`}></i>
          <span>Download PDF</span>
        </button>
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white dark:text-zinc-950 font-bold rounded-xl hover:bg-primary-hover transition-all shadow-float active:scale-95">
          <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
          <span>{isSaving ? "Saving..." : "Save Project"}</span>
        </button>
      </div>
    </div>
  );
}
