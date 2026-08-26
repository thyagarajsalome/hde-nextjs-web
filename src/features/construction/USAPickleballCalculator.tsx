"use client";
import React, { useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';
const formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');

const SURFACE_TYPES = {
  concrete: { name: "Concrete Pad", costPerSqFt: 6, desc: "Durable, lower maintenance" },
  asphalt: { name: "Asphalt Pad", costPerSqFt: 4, desc: "Cost-effective, easier on joints" }
};

const ACRYLIC_LAYERS = {
  standard: { name: "Standard (3 Layers)", costPerSqFt: 3, desc: "Basic acrylic surfacing" },
  premium: { name: "Premium (5 Layers)", costPerSqFt: 5, desc: "Cushioned, professional feel" }
};

const FENCING_TYPES = {
  chainlink: { name: "Standard Chainlink", costPerFt: 25, desc: "10ft high basic chainlink" },
  premium: { name: "Premium Mesh", costPerFt: 40, desc: "Vinyl coated, padded" },
  none: { name: "No Fencing", costPerFt: 0, desc: "Open court" }
};

const CHART_COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

const USAPickleballCalculator: React.FC = () => {
  const { hasPaid } = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-pickleball-court");

  const [length, setLength] = useState("60");
  const [width, setWidth] = useState("30");
  const [surfaceType, setSurfaceType] = useState<keyof typeof SURFACE_TYPES>("concrete");
  const [acrylicType, setAcrylicType] = useState<keyof typeof ACRYLIC_LAYERS>("standard");
  const [fencingType, setFencingType] = useState<keyof typeof FENCING_TYPES>("chainlink");
  const [hasLighting, setHasLighting] = useState(false);

  const parsedLength = parseFloat(length) || 0;
  const parsedWidth = parseFloat(width) || 0;

  const breakdown = useMemo(() => {
    if (parsedLength <= 0 || parsedWidth <= 0) return null;
    
    const area = parsedLength * parsedWidth;
    const perimeter = 2 * (parsedLength + parsedWidth);
    
    // Base Pad Cost
    const padCost = area * SURFACE_TYPES[surfaceType].costPerSqFt;
    
    // Surfacing Cost
    const surfacingCost = area * ACRYLIC_LAYERS[acrylicType].costPerSqFt;
    
    // Fencing Cost
    const fencingCost = perimeter * FENCING_TYPES[fencingType].costPerFt;
    
    // Lighting Cost
    const lightingCost = hasLighting ? 5000 : 0;
    
    const totalCost = padCost + surfacingCost + fencingCost + lightingCost;

    return { area, perimeter, padCost, surfacingCost, fencingCost, lightingCost, totalCost };
  }, [parsedLength, parsedWidth, surfaceType, acrylicType, fencingType, hasLighting]);

  const handleSave = () => {
    if (breakdown) saveProject({ length, width, surfaceType, acrylicType, fencingType, hasLighting, breakdown }, breakdown.totalCost);
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Base Pad", SURFACE_TYPES[surfaceType].name, formatCurrency(breakdown.padCost)],
      ["Acrylic Surfacing", ACRYLIC_LAYERS[acrylicType].name, formatCurrency(breakdown.surfacingCost)],
      ["Fencing", FENCING_TYPES[fencingType].name, formatCurrency(breakdown.fencingCost)],
      ["Lighting", hasLighting ? "Court Lighting Included" : "None", formatCurrency(breakdown.lightingCost)],
    ];
    downloadSpreadsheetPDF(`PickleballCourt-${length}x${width}`, ["Component", "Details", "Cost"], rows, "TOTAL ESTIMATE", formatCurrency(breakdown.totalCost));
  };

  const isLocked = false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <Card title="Pickleball Court Details (USA)">
          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Length (ft)" icon="fas fa-arrows-alt-v" type="number" placeholder="e.g., 60" value={length} onChange={e => setLength(e.target.value)} disabled={isLocked} />
              <Input label="Width (ft)" icon="fas fa-arrows-alt-h" type="number" placeholder="e.g., 30" value={width} onChange={e => setWidth(e.target.value)} disabled={isLocked} />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Base Surface Type</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(SURFACE_TYPES).map(([key, val]) => (
                  <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${surfaceType === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="surfaceType" value={key} checked={surfaceType === key} onChange={() => setSurfaceType(key as any)} disabled={isLocked} className="mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{val.name}</div>
                      <p className="text-xs text-gray-500 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Acrylic Surfacing</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(ACRYLIC_LAYERS).map(([key, val]) => (
                  <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${acrylicType === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="acrylicType" value={key} checked={acrylicType === key} onChange={() => setAcrylicType(key as any)} disabled={isLocked} className="mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{val.name}</div>
                      <p className="text-xs text-gray-500 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fencing</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(FENCING_TYPES).map(([key, val]) => (
                  <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${fencingType === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="fencingType" value={key} checked={fencingType === key} onChange={() => setFencingType(key as any)} disabled={isLocked} className="mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{val.name}</div>
                      <p className="text-xs text-gray-500 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Extras</label>
              <div className="grid grid-cols-1 gap-2">
                <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${hasLighting ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="checkbox" checked={hasLighting} onChange={e => setHasLighting(e.target.checked)} disabled={isLocked} className="text-primary w-4 h-4" />
                  <span className="text-sm font-bold text-gray-800">Court Lighting</span>
                </label>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <div>
        {breakdown && breakdown.totalCost > 0 ? (
          <Card title="Court Cost Estimate" className="border-primary/20 shadow-glow">
            <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Estimate</p>
              <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(breakdown.totalCost)}</h2>
              <p className="text-xs text-gray-400 mt-1">for {breakdown.area} sq.ft Court</p>
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
                    <td className="px-4 py-3 font-medium">Base Pad</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(breakdown.padCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Acrylic Surfacing</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.surfacingCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Fencing</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.fencingCost)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Lighting</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.lightingCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="h-56 mb-5">
              <Chart data={{ "Base Pad": breakdown.padCost, "Surfacing": breakdown.surfacingCost, "Fencing": breakdown.fencingCost, "Lighting": breakdown.lightingCost }} colors={CHART_COLORS} />
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
            <i className="fas fa-table-tennis text-4xl mb-4 text-gray-300"></i>
            <p className="font-medium">Enter dimensions to view estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USAPickleballCalculator;
