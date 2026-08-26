"use client";
import React, { useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';
const formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');

const MASONRY_TYPES = {
  stucco: { name: "Stucco", costPerLf: 150 },
  brick: { name: "Brick", costPerLf: 250 },
  stackedStone: { name: "Stacked Stone", costPerLf: 400 },
};

const COUNTERTOP_TYPES = {
  concrete: { name: "Poured Concrete", costPerLf: 80 },
  granite: { name: "Premium Granite", costPerLf: 150 },
  dekton: { name: "Dekton/Porcelain", costPerLf: 250 },
};

const APPLIANCE_PACKAGES = {
  standard: { name: "Standard (Drop-in Grill)", cost: 2500 },
  premium: { name: "Premium (Grill, Mini-fridge, Side Burner)", cost: 6000 },
  ultraLuxury: { name: "Ultra-Luxury (Wolf/Sub-Zero, Pizza Oven, Ice Maker)", cost: 18000 },
};

const UTILITIES = {
  electricOnly: { name: "Electric Only", cost: 500 },
  electricGas: { name: "Electric + Gas Trenching", cost: 2500 },
  electricGasPlumbing: { name: "Electric + Gas + Plumbing Sink", cost: 4500 },
};

const OVERHEAD_STRUCTURES = {
  none: { name: "None", cost: 0 },
  pergola: { name: "Cedar Pergola", cost: 6000 },
  pavilion: { name: "Fully Roofed Pavilion", cost: 15000 },
};

const CHART_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

const USAOutdoorKitchenCalculator: React.FC = () => {
  const { hasPaid } = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-outdoor-kitchen");

  const [linearFeet, setLinearFeet] = useState("12");
  const [masonry, setMasonry] = useState<keyof typeof MASONRY_TYPES>("stackedStone");
  const [countertop, setCountertop] = useState<keyof typeof COUNTERTOP_TYPES>("granite");
  const [appliances, setAppliances] = useState<keyof typeof APPLIANCE_PACKAGES>("premium");
  const [utilities, setUtilities] = useState<keyof typeof UTILITIES>("electricGas");
  const [structure, setStructure] = useState<keyof typeof OVERHEAD_STRUCTURES>("pergola");

  const parsedFeet = parseFloat(linearFeet) || 0;

  const breakdown = useMemo(() => {
    if (parsedFeet <= 0) return null;
    
    const masonryCost = parsedFeet * MASONRY_TYPES[masonry].costPerLf;
    const countertopCost = parsedFeet * COUNTERTOP_TYPES[countertop].costPerLf;
    const masonryAndCounters = masonryCost + countertopCost;
    
    const appliancesCost = APPLIANCE_PACKAGES[appliances].cost;
    const utilitiesCost = UTILITIES[utilities].cost;
    const structureCost = OVERHEAD_STRUCTURES[structure].cost;

    const totalCost = masonryAndCounters + appliancesCost + utilitiesCost + structureCost;

    return { masonryAndCounters, appliancesCost, utilitiesCost, structureCost, totalCost };
  }, [parsedFeet, masonry, countertop, appliances, utilities, structure]);

  const handleSave = () => {
    if (breakdown) saveProject({ linearFeet, masonry, countertop, appliances, utilities, structure, breakdown }, breakdown.totalCost);
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Masonry & Counters", `${MASONRY_TYPES[masonry].name} / ${COUNTERTOP_TYPES[countertop].name}`, formatCurrency(breakdown.masonryAndCounters)],
      ["Appliances", APPLIANCE_PACKAGES[appliances].name, formatCurrency(breakdown.appliancesCost)],
      ["Utilities", UTILITIES[utilities].name, formatCurrency(breakdown.utilitiesCost)],
      ["Overhead Structure", OVERHEAD_STRUCTURES[structure].name, formatCurrency(breakdown.structureCost)],
    ];
    downloadSpreadsheetPDF(`OutdoorKitchen-${linearFeet}LF`, ["Component", "Details", "Cost"], rows, "TOTAL ESTIMATE", formatCurrency(breakdown.totalCost));
  };

  const isLocked = false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <Card title="Outdoor Kitchen Details (USA)">
          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            <Input label="Linear Feet of Kitchen Island" icon="fas fa-ruler-horizontal" type="number" placeholder="e.g., 12" value={linearFeet} onChange={e => setLinearFeet(e.target.value)} disabled={isLocked} />

            <div className="relative mb-0 group">
              <select className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none" value={masonry} onChange={e => setMasonry(e.target.value as any)}>
                {Object.entries(MASONRY_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.costPerLf}/lf)</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 text-gray-400"><i className="fas fa-chevron-down text-sm"></i></div>
              <label className="absolute z-20 pointer-events-none text-xs font-bold text-primary bg-white px-2 rounded-md transition-all duration-200 -top-2.5 left-3">Base Masonry</label>
            </div>

            <div className="relative mb-0 group">
              <select className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none" value={countertop} onChange={e => setCountertop(e.target.value as any)}>
                {Object.entries(COUNTERTOP_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.costPerLf}/lf)</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 text-gray-400"><i className="fas fa-chevron-down text-sm"></i></div>
              <label className="absolute z-20 pointer-events-none text-xs font-bold text-primary bg-white px-2 rounded-md transition-all duration-200 -top-2.5 left-3">Countertops</label>
            </div>

            <div className="relative mb-0 group">
              <select className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none" value={appliances} onChange={e => setAppliances(e.target.value as any)}>
                {Object.entries(APPLIANCE_PACKAGES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.cost.toLocaleString()})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 text-gray-400"><i className="fas fa-chevron-down text-sm"></i></div>
              <label className="absolute z-20 pointer-events-none text-xs font-bold text-primary bg-white px-2 rounded-md transition-all duration-200 -top-2.5 left-3">Appliance Package</label>
            </div>

            <div className="relative mb-0 group">
              <select className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none" value={utilities} onChange={e => setUtilities(e.target.value as any)}>
                {Object.entries(UTILITIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.cost.toLocaleString()})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 text-gray-400"><i className="fas fa-chevron-down text-sm"></i></div>
              <label className="absolute z-20 pointer-events-none text-xs font-bold text-primary bg-white px-2 rounded-md transition-all duration-200 -top-2.5 left-3">Utilities</label>
            </div>

            <div className="relative mb-0 group">
              <select className="peer w-full py-3.5 px-4 border-2 border-gray-200 rounded-xl outline-none text-gray-700 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none" value={structure} onChange={e => setStructure(e.target.value as any)}>
                {Object.entries(OVERHEAD_STRUCTURES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name} (${val.cost.toLocaleString()})</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 text-gray-400"><i className="fas fa-chevron-down text-sm"></i></div>
              <label className="absolute z-20 pointer-events-none text-xs font-bold text-primary bg-white px-2 rounded-md transition-all duration-200 -top-2.5 left-3">Overhead Structure</label>
            </div>

          </form>
        </Card>
      </div>

      <div>
        {breakdown && breakdown.totalCost > 0 ? (
          <Card title="Outdoor Kitchen Estimate" className="border-primary/20 shadow-glow">
            <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Estimate</p>
              <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(breakdown.totalCost)}</h2>
              <p className="text-xs text-gray-400 mt-1">for {parsedFeet} LF Outdoor Kitchen</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 mb-5">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">Component</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">Masonry & Counters</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(breakdown.masonryAndCounters)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Appliances</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.appliancesCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Utilities</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.utilitiesCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Overhead Structure</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.structureCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-56 mb-5">
              <Chart data={{ "Masonry/Counters": breakdown.masonryAndCounters, "Appliances": breakdown.appliancesCost, "Utilities": breakdown.utilitiesCost, "Structure": breakdown.structureCost }} colors={CHART_COLORS} />
            </div>

            {hasPaid && (
              <div className="grid grid-cols-2 gap-4">
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
            )}
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400 min-h-[400px]">
            <i className="fas fa-fire-burner text-4xl mb-4 text-gray-300"></i>
            <p className="font-medium">Enter linear feet to view estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USAOutdoorKitchenCalculator;
