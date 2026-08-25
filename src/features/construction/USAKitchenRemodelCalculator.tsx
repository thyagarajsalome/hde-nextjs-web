"use client";
import React, { useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';
const formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');

const QUALITY_LEVELS = {
  budget: { name: "Budget", mult: 1, desc: "Stock cabinets, laminate counters, basic appliances" },
  standard: { name: "Standard", mult: 2.2, desc: "Semi-custom cabinets, granite/quartz, stainless appliances" },
  luxury: { name: "Luxury", mult: 4.5, desc: "Custom cabinets, premium stone, pro-grade appliances" }
};

const LAYOUTS = {
  galley: { name: "Galley", desc: "Two parallel runs of cabinets" },
  lshape: { name: "L-Shape", desc: "Cabinets on two perpendicular walls" },
  ushape: { name: "U-Shape", desc: "Cabinets on three walls" }
};

const CHART_COLORS = ["#c5a059", "#0f2042", "#5c473c", "#dfd0bf", "#8e9aaf"];

const USAKitchenRemodelCalculator: React.FC = () => {
  const { hasPaid } = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-kitchen-remodel");

  const [area, setArea] = useState("150");
  const [quality, setQuality] = useState<keyof typeof QUALITY_LEVELS>("standard");
  const [layout, setLayout] = useState<keyof typeof LAYOUTS>("lshape");

  const parsedArea = parseFloat(area) || 0;

  const breakdown = useMemo(() => {
    if (parsedArea <= 0) return null;
    const mult = QUALITY_LEVELS[quality].mult;
    
    const cabinets = 60 * parsedArea * mult;
    const countertops = 30 * parsedArea * mult;
    const appliances = 20 * parsedArea * mult;
    const flooring = 10 * parsedArea * mult;
    const labor = 40 * parsedArea * mult;

    const total = cabinets + countertops + appliances + flooring + labor;

    return { cabinets, countertops, appliances, flooring, labor, totalCost: total };
  }, [parsedArea, quality]);

  const handleSave = () => {
    if (breakdown) saveProject({ area, quality, layout, breakdown }, breakdown.totalCost);
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Cabinets", QUALITY_LEVELS[quality].name, formatCurrency(breakdown.cabinets)],
      ["Countertops", "Material & Install", formatCurrency(breakdown.countertops)],
      ["Appliances", "Appliance Package", formatCurrency(breakdown.appliances)],
      ["Flooring", "Material & Install", formatCurrency(breakdown.flooring)],
      ["Labor", "Contractor Labor", formatCurrency(breakdown.labor)],
    ];
    downloadSpreadsheetPDF(`Kitchen-Remodel-${area}sqft`, ["Component", "Details", "Cost"], rows, "TOTAL ESTIMATE", formatCurrency(breakdown.totalCost));
  };

  const isLocked = false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <Card title="Kitchen Remodel Details (USA)">
          {isLocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold text-center">
              <i className="fas fa-lock mr-2"></i> Upgrade to Pro for detailed estimates.
            </div>
          )}

          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            <Input label="Kitchen Area (sq. ft.)" icon="fas fa-ruler-combined" type="number" placeholder="e.g., 150" value={area} onChange={e => setArea(e.target.value)} disabled={isLocked} />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quality Level</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(QUALITY_LEVELS).map(([key, val]) => (
                  <label key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${quality === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="quality" value={key} checked={quality === key} onChange={() => setQuality(key as any)} disabled={isLocked} className="mt-1 text-primary" />
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Layout</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(LAYOUTS).map(([key, val]) => (
                  <label key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${layout === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="layout" value={key} checked={layout === key} onChange={() => setLayout(key as any)} disabled={isLocked} className="mt-1 text-primary" />
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
          </form>
        </Card>
      </div>

      <div>
        {breakdown && breakdown.totalCost > 0 ? (
          <Card title="Remodel Cost Estimate" className="border-primary/20 shadow-glow">
            <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Estimate</p>
              <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(breakdown.totalCost)}</h2>
              <p className="text-xs text-gray-400 mt-1">for {parsedArea} sq.ft — {QUALITY_LEVELS[quality].name}</p>
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
                    <td className="px-4 py-3 font-medium">Cabinets</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(breakdown.cabinets)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Countertops</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.countertops)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Appliances</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.appliances)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Flooring</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.flooring)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Labor</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.labor)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-56 mb-5">
              <Chart data={{ Cabinets: breakdown.cabinets, Countertops: breakdown.countertops, Appliances: breakdown.appliances, Flooring: breakdown.flooring, Labor: breakdown.labor }} colors={CHART_COLORS} />
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
            <i className="fas fa-layer-group text-4xl mb-4 text-gray-300"></i>
            <p className="font-medium">Enter area to view estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USAKitchenRemodelCalculator;
