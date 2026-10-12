"use client";
import React, { useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import ProCalculatorGate from "../../components/ui/ProCalculatorGate";
import { formatCurrency as formatCurrencyOrig } from "../../utils/currency";

const formatCurrency = (val: number) => formatCurrencyOrig(val, "US");

const PRESETS = [
  { label: "30' x 40' (1,200 sq ft)", width: 30, length: 40 },
  { label: "40' x 60' (2,400 sq ft)", width: 40, length: 60 },
  { label: "40' x 75' (3,000 sq ft)", width: 40, length: 75 },
  { label: "50' x 100' (5,000 sq ft)", width: 50, length: 100 },
];

const SCOPE_LEVELS = {
  shell: {
    name: "Shell Only (Kit + Erection)",
    desc: "Slab, steel/wood frame, metal siding, roof & exterior doors/windows. Ready for DIY interior finish.",
    livingRate: 42,
    shopRate: 36,
  },
  dryIn: {
    name: "Dry-In Stage (Rough-Ins)",
    desc: "Shell plus framing, rough plumbing, rough electrical, HVAC ducting, and spray foam insulation.",
    livingRate: 85,
    shopRate: 52,
  },
  turnkey: {
    name: "Full Turnkey Finished",
    desc: "Complete move-in ready home: drywall, cabinets, quartz counters, flooring, lighting, and fixtures.",
    livingRate: 145,
    shopRate: 65,
  },
};

const CHART_COLORS = ["#c5a059", "#0f2042", "#2563eb", "#10b981", "#8b5cf6", "#f59e0b"];

const USABarndominiumCalculator: React.FC = () => {
  const { hasPaid, planTier, role } = useUser();
  const isUserPaid = Boolean(hasPaid || role === "admin" || (planTier && planTier !== "free"));
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-barndominium");

  const [width, setWidth] = useState("40");
  const [length, setLength] = useState("60");
  const [livingPct, setLivingPct] = useState("60"); // 60% living quarters, 40% garage/shop
  const [scope, setScope] = useState<keyof typeof SCOPE_LEVELS>("turnkey");
  const [slabType, setSlabType] = useState<"standard" | "heavy">("standard"); // 4" vs 6"
  const [insulationType, setInsulationType] = useState<"sprayFoam" | "fiberglass">("sprayFoam");

  // Rural Site Prep Addons
  const [includeWell, setIncludeWell] = useState(true);
  const [includeSeptic, setIncludeSeptic] = useState(true);
  const [includeDriveway, setIncludeDriveway] = useState(true);
  const [includePower, setIncludePower] = useState(true);
  const [includeLandClearing, setIncludeLandClearing] = useState(false);

  const parsedWidth = parseFloat(width) || 0;
  const parsedLength = parseFloat(length) || 0;
  const totalSqFt = parsedWidth * parsedLength;
  const parsedLivingPct = Math.min(100, Math.max(0, parseFloat(livingPct) || 0));

  const applyPreset = (pWidth: number, pLength: number) => {
    setWidth(pWidth.toString());
    setLength(pLength.toString());
  };

  const calculation = useMemo(() => {
    if (totalSqFt <= 0) return null;

    const livingSqFt = (totalSqFt * parsedLivingPct) / 100;
    const shopSqFt = totalSqFt - livingSqFt;

    const scopeConfig = SCOPE_LEVELS[scope];

    // Building Structure & Finishes
    const livingCost = livingSqFt * scopeConfig.livingRate;
    const shopCost = shopSqFt * scopeConfig.shopRate;
    const baseBuilding = livingCost + shopCost;

    // Foundation Slab Upgrade
    const slabCost = slabType === "heavy" ? totalSqFt * 12.5 : totalSqFt * 8.5;

    // Insulation Upgrade (Spray foam is critical for steel barndominiums to prevent condensation)
    const insulationCost = insulationType === "sprayFoam" ? totalSqFt * 3.75 : totalSqFt * 1.85;

    // Rural Site Infrastructure
    const wellCost = includeWell ? 8500 : 0;
    const septicCost = includeSeptic ? 9000 : 0;
    const drivewayCost = includeDriveway ? 3500 : 0;
    const powerCost = includePower ? 4200 : 0;
    const clearingCost = includeLandClearing ? 3800 : 0;
    const siteInfrastructure = wellCost + septicCost + drivewayCost + powerCost + clearingCost;

    const totalCost = baseBuilding + slabCost + insulationCost + siteInfrastructure;
    const costPerSqFt = totalCost / totalSqFt;

    return {
      totalSqFt,
      livingSqFt,
      shopSqFt,
      baseBuilding,
      slabCost,
      insulationCost,
      siteInfrastructure,
      wellCost,
      septicCost,
      drivewayCost,
      powerCost,
      clearingCost,
      totalCost,
      costPerSqFt,
    };
  }, [
    totalSqFt,
    parsedLivingPct,
    scope,
    slabType,
    insulationType,
    includeWell,
    includeSeptic,
    includeDriveway,
    includePower,
    includeLandClearing,
  ]);

  const handleSave = () => {
    if (calculation) {
      saveProject(
        {
          dimensions: `${width}x${length}`,
          totalSqFt,
          scope,
          slabType,
          insulationType,
          breakdown: calculation,
        },
        calculation.totalCost
      );
    }
  };

  const handleDownloadPDF = () => {
    if (!calculation) return;
    const rows: [string, string, string][] = [
      ["Building Shell & Living Quarters", `${calculation.livingSqFt.toFixed(0)} sq ft living / ${calculation.shopSqFt.toFixed(0)} sq ft shop`, formatCurrency(calculation.baseBuilding)],
      ["Concrete Slab Foundation", `${slabType === 'heavy' ? '6" Reinforced Heavy Slab' : '4" Engineered Slab'}`, formatCurrency(calculation.slabCost)],
      ["Thermal Envelope & Insulation", `${insulationType === 'sprayFoam' ? 'Closed-Cell Spray Foam' : 'Batt Fiberglass'}`, formatCurrency(calculation.insulationCost)],
      ["Rural Site Preparation & Utilities", "Well, Septic, Electric, Driveway", formatCurrency(calculation.siteInfrastructure)],
    ];
    downloadSpreadsheetPDF(
      `Barndominium-${calculation.totalSqFt.toFixed(0)}sqft-Estimate`,
      ["Component", "Description", "Cost (USD)"],
      rows,
      "TOTAL PROJECT ESTIMATE",
      formatCurrency(calculation.totalCost)
    );
  };

  return (
    <Card className="p-6 md:p-8 bg-white border border-slate-200/90 shadow-sm rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <span>🌾</span> Farmer &amp; Acreage Owner Edition
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Barndominium &amp; Pole Barn Cost Estimator
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Calculate turn-key metal barn home construction, slab foundations, and rural acreage site preparation costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Popular Building Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.width, p.length)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                    parsedWidth === p.width && parsedLength === p.length
                      ? "bg-primary-900 text-white border-primary-900 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {p.width}&apos; &times; {p.length}&apos;
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Building Width (ft)"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="20"
                max="150"
              />
            </div>
            <div>
              <Input
                label="Building Length (ft)"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                min="20"
                max="250"
              />
            </div>
          </div>

          {/* Living vs Shop Split */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Living Space Allocation: <span className="text-primary-700">{parsedLivingPct}% Living</span> /{" "}
                <span className="text-slate-500">{100 - parsedLivingPct}% Shop &amp; Garage</span>
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={livingPct}
              onChange={(e) => setLivingPct(e.target.value)}
              className="w-full accent-primary-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>100% Workshop / Barn</span>
              <span>50 / 50 Split</span>
              <span>100% Residential Home</span>
            </div>
          </div>

          {/* Construction Scope */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Construction Scope
            </label>
            <div className="space-y-2">
              {(Object.keys(SCOPE_LEVELS) as (keyof typeof SCOPE_LEVELS)[]).map((key) => {
                const s = SCOPE_LEVELS[key];
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      scope === key
                        ? "bg-primary-50/70 border-primary-500 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === key}
                      onChange={() => setScope(key)}
                      className="mt-1 accent-primary-600"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{s.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Foundation & Insulation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Engineered Concrete Slab</label>
              <select
                value={slabType}
                onChange={(e) => setSlabType(e.target.value as "standard" | "heavy")}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              >
                <option value="standard">4&quot; Standard Slab ($8.50/sq ft)</option>
                <option value="heavy">6&quot; Heavy Machinery Slab ($12.50/sq ft)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Insulation Package</label>
              <select
                value={insulationType}
                onChange={(e) => setInsulationType(e.target.value as "sprayFoam" | "fiberglass")}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary-500"
              >
                <option value="sprayFoam">Closed-Cell Spray Foam (Recommended)</option>
                <option value="fiberglass">Fiberglass Batt Insulation</option>
              </select>
            </div>
          </div>

          {/* Rural Site Preparation & Utilities */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Rural Land &amp; Homestead Site Prep (Add-ons)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWell}
                  onChange={(e) => setIncludeWell(e.target.checked)}
                  className="accent-primary-600 rounded"
                />
                <span className="font-medium text-slate-800">Water Well System (+$8,500)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSeptic}
                  onChange={(e) => setIncludeSeptic(e.target.checked)}
                  className="accent-primary-600 rounded"
                />
                <span className="font-medium text-slate-800">Septic System (+$9,000)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDriveway}
                  onChange={(e) => setIncludeDriveway(e.target.checked)}
                  className="accent-primary-600 rounded"
                />
                <span className="font-medium text-slate-800">Gravel Driveway 150ft (+$3,500)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePower}
                  onChange={(e) => setIncludePower(e.target.checked)}
                  className="accent-primary-600 rounded"
                />
                <span className="font-medium text-slate-800">Electric Grid Drop &amp; Panel (+$4,200)</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={includeLandClearing}
                  onChange={(e) => setIncludeLandClearing(e.target.checked)}
                  className="accent-primary-600 rounded"
                />
                <span className="font-medium text-slate-800">1-Acre Land Clearing &amp; Pad Grading (+$3,800)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {calculation ? (
            <div className="space-y-6">
              {/* Grand Total Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white shadow-md">
                <div className="text-xs uppercase font-bold tracking-widest text-primary-300 mb-1">
                  Total Estimated Build Budget
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                  {formatCurrency(calculation.totalCost)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <span>Footprint: <strong>{calculation.totalSqFt.toLocaleString()} sq ft</strong></span>
                  <span>Average Rate: <strong>${calculation.costPerSqFt.toFixed(0)} / sq ft</strong></span>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 text-center">
                  Cost Distribution
                </div>
                <div className="h-52">
                  <Chart
                    data={{
                      "Building & Interior": calculation.baseBuilding,
                      "Slab Foundation": calculation.slabCost,
                      "Spray Foam Insulation": calculation.insulationCost,
                      "Rural Utilities & Site Prep": calculation.siteInfrastructure,
                    }}
                    colors={CHART_COLORS}
                  />
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 font-bold text-slate-700 border-b border-slate-200 flex justify-between">
                  <span>Project Line Item</span>
                  <span>Estimated Cost</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">Building Shell &amp; Living Finish</div>
                      <div className="text-[11px] text-slate-500">
                        {calculation.livingSqFt.toFixed(0)} sq ft living ({parsedLivingPct}%) + {calculation.shopSqFt.toFixed(0)} sq ft shop
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(calculation.baseBuilding)}</span>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">Concrete Slab Foundation</div>
                      <div className="text-[11px] text-slate-500">
                        {slabType === "heavy" ? '6" Heavy Commercial Slab' : '4" Standard Engineered Slab'}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(calculation.slabCost)}</span>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">Insulation &amp; Vapor Barrier</div>
                      <div className="text-[11px] text-slate-500">
                        {insulationType === "sprayFoam" ? "Closed-Cell Spray Foam" : "Fiberglass Batt"}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(calculation.insulationCost)}</span>
                  </div>

                  {calculation.siteInfrastructure > 0 && (
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">Rural Site Infrastructure</div>
                        <div className="text-[11px] text-slate-500">Well, Septic, Electric, Driveway</div>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(calculation.siteInfrastructure)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-save"></i>
                  {isSaving ? "Saving..." : "Save Project"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#c5a059] hover:bg-[#b38e47] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-file-pdf"></i>
                  {isDownloading ? "Generating..." : "Download Estimate PDF"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Enter building dimensions to generate your Barndominium estimate.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default USABarndominiumCalculator;
