"use client";
import React, { useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';
const formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');

const POOL_TYPES = {
  gunite: { name: "Gunite/Concrete", costPerSqFt: 85, isInground: true, desc: "Customizable, durable, long installation time" },
  fiberglass: { name: "Fiberglass", costPerSqFt: 65, isInground: true, desc: "Quick install, low maintenance, preset shapes" },
  vinyl: { name: "Vinyl Liner", costPerSqFt: 45, isInground: true, desc: "Cost-effective inground, requires liner replacement" },
  aboveGround: { name: "Above-Ground", costPerSqFt: 15, isInground: false, desc: "Most affordable, fast setup" }
};

const CHART_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#1d4ed8"];

const USASwimmingPoolCalculator: React.FC = () => {
  const { hasPaid } = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-swimming-pool");

  const [area, setArea] = useState("400");
  const [type, setType] = useState<keyof typeof POOL_TYPES>("gunite");
  const [hasHeater, setHasHeater] = useState(false);
  const [hasDecking, setHasDecking] = useState(true);
  const [hasHotTub, setHasHotTub] = useState(false);

  const parsedArea = parseFloat(area) || 0;

  const breakdown = useMemo(() => {
    if (parsedArea <= 0) return null;
    
    const poolType = POOL_TYPES[type];
    
    // Excavation
    const excavation = poolType.isInground ? parsedArea * 12 : parsedArea * 3;
    
    // Pool Shell/Materials
    const shell = parsedArea * poolType.costPerSqFt;
    
    // Plumbing & Filtration
    const plumbing = poolType.isInground ? 4500 : 1500;
    
    // Decking/Extras
    let extras = 0;
    if (hasHeater) extras += 3500;
    if (hasHotTub) extras += 9500;
    if (hasDecking) extras += parsedArea * 18; // Decking roughly matches pool area size
    
    // Labor
    const labor = poolType.isInground ? (shell + excavation) * 0.4 : (shell + excavation) * 0.15;

    const totalCost = excavation + shell + plumbing + extras + labor;

    return { excavation, shell, plumbing, extras, labor, totalCost };
  }, [parsedArea, type, hasHeater, hasDecking, hasHotTub]);

  const handleSave = () => {
    if (breakdown) saveProject({ area, type, hasHeater, hasDecking, hasHotTub, breakdown }, breakdown.totalCost);
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Excavation", "Digging & Prep", formatCurrency(breakdown.excavation)],
      ["Pool Shell/Materials", POOL_TYPES[type].name, formatCurrency(breakdown.shell)],
      ["Plumbing & Filtration", "Pumps, filters, pipes", formatCurrency(breakdown.plumbing)],
      ["Decking/Extras", "Heater, Decking, Spa", formatCurrency(breakdown.extras)],
      ["Labor", "Installation labor", formatCurrency(breakdown.labor)],
    ];
    downloadSpreadsheetPDF(`SwimmingPool-${area}sqft`, ["Component", "Details", "Cost"], rows, "TOTAL ESTIMATE", formatCurrency(breakdown.totalCost));
  };

  const isLocked = false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <Card title="Swimming Pool Details (USA)">
          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            <Input label="Pool Size (sq. ft.)" icon="fas fa-water" type="number" placeholder="e.g., 400" value={area} onChange={e => setArea(e.target.value)} disabled={isLocked} />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pool Type</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(POOL_TYPES).map(([key, val]) => (
                  <label key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="type" value={key} checked={type === key} onChange={() => setType(key as any)} disabled={isLocked} className="mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">{val.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Extras</label>
              <div className="grid grid-cols-1 gap-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${hasHeater ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={hasHeater} onChange={e => setHasHeater(e.target.checked)} disabled={isLocked} className="text-primary w-4 h-4" />
                  <span className="text-sm font-bold text-gray-800">Pool Heater</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${hasDecking ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={hasDecking} onChange={e => setHasDecking(e.target.checked)} disabled={isLocked} className="text-primary w-4 h-4" />
                  <span className="text-sm font-bold text-gray-800">Surrounding Decking/Patio</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${hasHotTub ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={hasHotTub} onChange={e => setHasHotTub(e.target.checked)} disabled={isLocked} className="text-primary w-4 h-4" />
                  <span className="text-sm font-bold text-gray-800">Attached Hot Tub / Spa</span>
                </label>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <div>
        {breakdown && breakdown.totalCost > 0 ? (
          <Card title="Pool Cost Estimate" className="border-primary/20 shadow-glow">
            <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Estimate</p>
              <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(breakdown.totalCost)}</h2>
              <p className="text-xs text-gray-400 mt-1">for {parsedArea} sq.ft — {POOL_TYPES[type].name}</p>
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
                    <td className="px-4 py-3 font-medium">Excavation</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(breakdown.excavation)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Pool Shell/Materials</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.shell)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Plumbing & Filtration</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.plumbing)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Decking/Extras</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.extras)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Labor</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.labor)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-56 mb-5">
              <Chart data={{ Excavation: breakdown.excavation, "Pool Shell": breakdown.shell, Plumbing: breakdown.plumbing, "Extras": breakdown.extras, Labor: breakdown.labor }} colors={CHART_COLORS} />
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
            <i className="fas fa-water text-4xl mb-4 text-gray-300"></i>
            <p className="font-medium">Enter area to view estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USASwimmingPoolCalculator;
