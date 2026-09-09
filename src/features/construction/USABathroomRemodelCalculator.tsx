"use client";
import React, { useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';

const formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');

const BATHROOM_TYPES = {
  half: { name: "Half Bath / Powder Room", defaultSqft: 25, desc: "Sink, toilet, and vanity (no shower/tub)" },
  full: { name: "Full Guest Bath", defaultSqft: 45, desc: "Standard 3-piece: vanity, toilet, tub/shower combo" },
  primary: { name: "Primary / Master Suite Bath", defaultSqft: 100, desc: "Double vanity, walk-in tile shower, freestanding tub, water closet" },
};

const FINISH_TIERS = {
  budget: { name: "Budget / Rental Refresh", mult: 1.0, desc: "Prefab acrylic tub/shower, stock vanity, fiberglass fixtures, vinyl/basic ceramic tile" },
  standard: { name: "Mid-Range / Modern Quality", mult: 1.85, desc: "Subway/porcelain tile, quartz countertops, frameless glass door, Moen/Kohler fixtures" },
  luxury: { name: "High-End / Spa Luxury", mult: 3.4, desc: "Custom marble/natural stone, radiant heated floors, body jets, designer vanity & hardware" },
};

const SCOPE_OPTIONS = {
  cosmetic: { name: "Cosmetic Refresh", factor: 0.75, desc: "Keep existing layout and plumbing rough-ins, replace finishes & fixtures" },
  standard: { name: "Full Gut & Replace", factor: 1.0, desc: "Tear down to studs, replace drywall, waterproofing, new tile and fixtures" },
  relocation: { name: "Layout Redesign & Plumbing Move", factor: 1.35, desc: "Moving toilet, drain lines, vent stacks, or moving interior partition walls" },
};

const CHART_COLORS = ["#0f2042", "#c5a059", "#2563eb", "#60a5fa", "#34d399", "#8b5cf6"];

const USABathroomRemodelCalculator: React.FC = () => {
  const { hasPaid } = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-bathroom-remodel");

  const [bathType, setBathType] = useState<keyof typeof BATHROOM_TYPES>("full");
  const [area, setArea] = useState("45");
  const [tier, setTier] = useState<keyof typeof FINISH_TIERS>("standard");
  const [scope, setScope] = useState<keyof typeof SCOPE_OPTIONS>("standard");

  const handleTypeChange = (typeKey: keyof typeof BATHROOM_TYPES) => {
    setBathType(typeKey);
    setArea(String(BATHROOM_TYPES[typeKey].defaultSqft));
  };

  const parsedArea = parseFloat(area) || 0;

  const breakdown = useMemo(() => {
    if (parsedArea <= 0) return null;
    const tierMult = FINISH_TIERS[tier].mult;
    const scopeFactor = SCOPE_OPTIONS[scope].factor;

    const plumbingFixtures = Math.max(900, 42 * parsedArea) * tierMult * scopeFactor;
    const tileWaterproofing = (38 * parsedArea) * tierMult;
    const vanityCountertop = Math.max(650, 32 * parsedArea) * tierMult;
    const electricalLighting = Math.max(450, 18 * parsedArea) * tierMult;
    const demolitionDisposal = Math.max(500, 15 * parsedArea) * scopeFactor;
    const generalLabor = (55 * parsedArea) * tierMult * scopeFactor;

    const totalCost = plumbingFixtures + tileWaterproofing + vanityCountertop + electricalLighting + demolitionDisposal + generalLabor;

    return {
      plumbingFixtures,
      tileWaterproofing,
      vanityCountertop,
      electricalLighting,
      demolitionDisposal,
      generalLabor,
      totalCost,
    };
  }, [parsedArea, tier, scope]);

  const handleSave = () => {
    if (breakdown) {
      saveProject({ bathType, area, tier, scope, breakdown }, breakdown.totalCost);
    }
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Plumbing & Fixtures", `${FINISH_TIERS[tier].name} fixtures, shower valve, toilet`, formatCurrency(breakdown.plumbingFixtures)],
      ["Tile & Waterproofing", "Schluter/backer board, floor & wall tile", formatCurrency(breakdown.tileWaterproofing)],
      ["Vanity & Countertop", "Vanity cabinet, quartz/stone top, mirror & sink", formatCurrency(breakdown.vanityCountertop)],
      ["Electrical & Lighting", "GFCI outlets, vanity bar lights, exhaust fan", formatCurrency(breakdown.electricalLighting)],
      ["Demo & Disposal", "Haul away, dumpster, debris disposal", formatCurrency(breakdown.demolitionDisposal)],
      ["Labor & Installation", "Licensed plumbing, tiling & general contractor", formatCurrency(breakdown.generalLabor)],
    ];
    downloadSpreadsheetPDF(
      `Bathroom-Remodel-${parsedArea}sqft-${tier}`,
      ["Component", "Scope Details", "Estimated Cost"],
      rows,
      "TOTAL BATHROOM REMODEL ESTIMATE",
      formatCurrency(breakdown.totalCost)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inputs Column */}
      <div className="space-y-5">
        <Card title="Bathroom Remodel Details (USA)">
          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            {/* Bathroom Type Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Bathroom Type</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(BATHROOM_TYPES).map(([key, val]) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      bathType === key ? "border-[#0f2042] bg-[#0f2042]/5 dark:border-[#c5a059] dark:bg-[#c5a059]/10" : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bathType"
                      value={key}
                      checked={bathType === key}
                      onChange={() => handleTypeChange(key as any)}
                      className="mt-1 text-[#0f2042]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{val.name}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">~{val.defaultSqft} sq ft</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Area */}
            <Input
              label="Bathroom Area (sq. ft.)"
              icon="fas fa-ruler-combined"
              type="number"
              min="15"
              max="600"
              placeholder="e.g., 45"
              value={area}
              onChange={e => setArea(e.target.value)}
            />

            {/* Finish Tier */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Finish & Material Tier</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(FINISH_TIERS).map(([key, val]) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      tier === key ? "border-[#0f2042] bg-[#0f2042]/5 dark:border-[#c5a059] dark:bg-[#c5a059]/10" : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={key}
                      checked={tier === key}
                      onChange={() => setTier(key as any)}
                      className="mt-1 text-[#0f2042]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{val.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Renovation Scope */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Renovation Scope</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(SCOPE_OPTIONS).map(([key, val]) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      scope === key ? "border-[#0f2042] bg-[#0f2042]/5 dark:border-[#c5a059] dark:bg-[#c5a059]/10" : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value={key}
                      checked={scope === key}
                      onChange={() => setScope(key as any)}
                      className="mt-1 text-[#0f2042]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{val.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </Card>
      </div>

      {/* Results Column */}
      <div>
        {breakdown && breakdown.totalCost > 0 ? (
          <Card title="Bathroom Cost Estimate" className="border-[#c5a059]/30 shadow-float">
            <div className="text-center py-4 bg-gradient-to-r from-[#0f2042]/5 via-[#c5a059]/10 to-[#0f2042]/5 rounded-xl mb-5 border border-[#c5a059]/20">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Total Estimated Cost</p>
              <h2 className="text-4xl font-extrabold text-[#0f2042] dark:text-[#c5a059]">{formatCurrency(breakdown.totalCost)}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                for {parsedArea} sq.ft — {FINISH_TIERS[tier].name} ({SCOPE_OPTIONS[scope].name})
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                ~{formatCurrency(Math.round(breakdown.totalCost / parsedArea))}/sq. ft. all-in
              </p>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-800 mb-5">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-800 text-xs text-gray-500 dark:text-gray-300 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">Trade Component</th>
                    <th className="px-4 py-3 text-right">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">Plumbing & Fixtures</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(breakdown.plumbingFixtures)}</td>
                  </tr>
                  <tr className="bg-gray-50/50 dark:bg-zinc-800/30">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">Tile & Waterproofing</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(breakdown.tileWaterproofing)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">Vanity, Mirror & Countertop</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(breakdown.vanityCountertop)}</td>
                  </tr>
                  <tr className="bg-gray-50/50 dark:bg-zinc-800/30">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">Electrical, Vent & Lighting</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(breakdown.electricalLighting)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">Demolition & Haul-away</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(breakdown.demolitionDisposal)}</td>
                  </tr>
                  <tr className="bg-[#0f2042]/5 dark:bg-zinc-800/60 font-semibold">
                    <td className="px-4 py-3 font-medium text-[#0f2042] dark:text-[#c5a059]">General Contractor Labor</td>
                    <td className="px-4 py-3 text-right font-bold text-[#0f2042] dark:text-[#c5a059]">{formatCurrency(breakdown.generalLabor)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Donut Chart */}
            <div className="h-56 mb-5">
              <Chart
                data={{
                  "Plumbing": breakdown.plumbingFixtures,
                  "Tile/Waterproofing": breakdown.tileWaterproofing,
                  "Vanity": breakdown.vanityCountertop,
                  "Electrical": breakdown.electricalLighting,
                  "Demolition": breakdown.demolitionDisposal,
                  "Labor": breakdown.generalLabor,
                }}
                colors={CHART_COLORS}
              />
            </div>

            {hasPaid && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-900 border-2 border-[#0f2042] dark:border-zinc-700 text-[#0f2042] dark:text-zinc-100 font-bold rounded-xl hover:bg-[#0f2042] dark:hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <i className={`fas ${isDownloading ? "fa-spinner fa-spin" : "fa-file-pdf"}`}></i>
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0f2042] text-white dark:text-zinc-950 font-bold rounded-xl hover:bg-[#0f2042]/90 transition-all shadow-float active:scale-95"
                >
                  <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
                  <span>{isSaving ? "Saving..." : "Save Project"}</span>
                </button>
              </div>
            )}
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 p-12 text-center text-gray-400 min-h-[400px]">
            <i className="fas fa-bath text-4xl mb-4 text-gray-300 dark:text-zinc-700"></i>
            <p className="font-medium">Enter bathroom area to view cost estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USABathroomRemodelCalculator;
