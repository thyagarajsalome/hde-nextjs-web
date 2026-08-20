"use client";
import React, { useState } from "react";

const CostCard = ({ title, amount, icon, color, subtitle, prefix, suffix = "" }: any) => {
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
        <p className="text-xl font-black text-gray-900 dark:text-zinc-100">{prefix}{amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}{suffix}</p>
        <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
};

export default function USARemodelROICalculator() {
  const [currentValue, setCurrentValue] = useState<number>(350000);
  const [projectCost, setProjectCost] = useState<number>(25000);
  const [projectType, setProjectType] = useState<string>("minor_kitchen");

  const projects: Record<string, { name: string; roi: number }> = {
    minor_kitchen: { name: "Minor Kitchen Remodel", roi: 0.85 },
    major_kitchen: { name: "Major Kitchen Remodel", roi: 0.60 },
    bathroom: { name: "Bathroom Remodel", roi: 0.70 },
    deck: { name: "Deck Addition", roi: 0.50 },
    windows: { name: "Window Replacement", roi: 0.68 },
  };

  const selectedProject = projects[projectType];
  const roiPercentage = selectedProject.roi;
  const valueAdded = projectCost * roiPercentage;
  const newEstimatedValue = currentValue + valueAdded;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xl shadow-inner">
          <i className="fas fa-chart-line"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Remodel ROI Calculator</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm font-medium">Estimate the return on investment for common home remodeling projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-home text-primary"></i> Current Property Details
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Current Home Value ($)</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-5 bg-gray-50 dark:bg-zinc-950/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <h3 className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <i className="fas fa-hammer text-primary"></i> Remodel Project
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
              >
                {Object.entries(projects).map(([key, proj]) => (
                  <option key={key} value={key}>{proj.name} ({(proj.roi * 100).toFixed(0)}% ROI)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Project Cost ($)</label>
              <input
                type="number"
                value={projectCost}
                onChange={(e) => setProjectCost(Number(e.target.value))}
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
            <h3 className="text-emerald-100 font-semibold mb-2 text-sm uppercase tracking-wider">New Estimated Value</h3>
            <p className="text-5xl font-black tracking-tight">${newEstimatedValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm font-medium">
              <span>Value Added: ${valueAdded.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span>ROI: {(roiPercentage * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CostCard 
              title="Value Added" 
              amount={valueAdded} 
              icon="fa-arrow-trend-up"
              color="emerald"
              subtitle={`From ${selectedProject.name}`}
              prefix="$"
            />
            <CostCard 
              title="Cost Recouped" 
              amount={roiPercentage * 100} 
              icon="fa-percent"
              color="blue"
              subtitle="Return on Investment"
              prefix=""
              suffix="%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
