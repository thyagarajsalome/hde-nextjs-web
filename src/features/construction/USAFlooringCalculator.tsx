"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency } from "../../utils/currency";

// ── Types & Constants ─────────────────────────────────────────────────────────
const FLOORING_TYPES = {
  lvp:       { name: "Luxury Vinyl Plank (LVP)",       rate: 4, wastage: 0.10, labor: 2.5, desc: "100% waterproof, very durable. Great for all rooms including kitchens and baths.", pros: "Waterproof, durable, DIY friendly", cons: "Can dent from heavy furniture", thickness: "5–8mm", brand: "Coretec / Shaw / Mohawk" },
  laminate:  { name: "Laminate (AC4/AC5 Grade)",       rate: 3, wastage: 0.10, labor: 2.0, desc: "Affordable wood look. Scratch resistant but vulnerable to standing water.", pros: "Scratch resistant, affordable", cons: "Not waterproof, can sound hollow", thickness: "8–12mm", brand: "Pergo / Mohawk" },
  hardwood:  { name: "Solid Hardwood (Oak/Hickory)",   rate: 8, wastage: 0.10, labor: 4.0, desc: "Classic American aesthetic. Adds real value to the home. Can be refinished.", pros: "High resale value, lasts decades", cons: "Expensive, susceptible to moisture", thickness: "3/4\"", brand: "Bruce / Bellawood" },
  engineered:{ name: "Engineered Hardwood",            rate: 6, wastage: 0.10, labor: 3.5, desc: "Real wood veneer over plywood core. Better dimensional stability than solid wood.", pros: "Real wood look, works over concrete", cons: "Can only be refinished 1-2 times", thickness: "3/8\" - 5/8\"", brand: "Somerset / Mullican" },
  tile:      { name: "Ceramic / Porcelain Tile",       rate: 3.5, wastage: 0.15, labor: 5.0, desc: "Extremely durable and waterproof. Perfect for bathrooms, laundry, and entryways.", pros: "Waterproof, lasts a lifetime", cons: "Cold, hard, grout requires sealing", thickness: "1/4\" - 3/8\"", brand: "Daltile / Marazzi" },
  carpet:    { name: "Wall-to-Wall Carpet",            rate: 3, wastage: 0.05, labor: 1.0, desc: "Soft, warm, and quiet. Ideal for bedrooms and upper level living spaces.", pros: "Comfortable, noise reducing, affordable", cons: "Stains easily, holds allergens", thickness: "Plush/Frieze", brand: "Mohawk / Shaw" },
};

const TILE_PATTERNS = [
  { name: "Straight Lay",     wastage: "5–8%",  icon: "⬜", desc: "Simplest layout. Tiles aligned with room edges. Lowest wastage." },
  { name: "Diagonal (45°)",   wastage: "10–15%",icon: "◇",  desc: "Elegant, makes room feel larger. Higher wastage at edges." },
  { name: "Herringbone",      wastage: "12–18%",icon: "⬡",  desc: "Classic zigzag. Popular for wood floors and narrow corridors." },
  { name: "Staggered (Brick)",wastage: "8–10%", icon: "🧱", desc: "Each row offset by half a tile. Hides lippage effectively." },
];

const ROOM_SUGGESTIONS = [
  { room: "Living Room",  rec: "hardwood",  reason: "Hardwood or LVP is preferred for main living areas to maximize home value." },
  { room: "Bedroom",      rec: "carpet",    reason: "Carpet remains very popular in US bedrooms for warmth and comfort." },
  { room: "Kitchen",      rec: "lvp",       reason: "LVP or Tile. Needs to be waterproof and easy to clean." },
  { room: "Bathroom",     rec: "tile",      reason: "Porcelain tile is the gold standard for full bathrooms." },
  { room: "Basement",     rec: "lvp",       reason: "LVP is perfect for basements as it withstands moisture and goes directly over concrete." },
];

const CHART_COLORS = ["#c5a059", "#0f2042", "#5c473c", "#dfd0bf"];

// ── Component ──────────────────────────────────────────────────────────────────
const USAFlooringCalculator: React.FC = () => {
  const { hasPaid }  = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-flooring");

  const [area,           setArea]           = useState("");
  const [flooringType,   setFlooringType]   = useState<keyof typeof FLOORING_TYPES>("lvp");
  const [includeBaseboards, setIncludeBaseboards] = useState(true);
  const [activeInfo,     setActiveInfo]     = useState<"specs"|"pattern"|"rooms">("specs");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sharedArea = window.localStorage.getItem("hde_shared_area");
      if (sharedArea && !area) setArea(sharedArea);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && area) {
      window.localStorage.setItem("hde_shared_area", area);
    }
  }, [area]);

  const parsedArea = parseFloat(area) || 0;
  const ft         = FLOORING_TYPES[flooringType];

  const breakdown = useMemo(() => {
    if (parsedArea <= 0) return null;
    const materialArea  = parsedArea * (1 + ft.wastage);
    const materialCost  = materialArea * ft.rate;
    const laborCost     = parsedArea * ft.labor;
    const perimeterLen  = includeBaseboards ? Math.sqrt(parsedArea) * 4 : 0;
    const baseboardCost = includeBaseboards ? perimeterLen * 3.5 : 0; // $3.5/lf for baseboards + install
    const suppliesCost  = parsedArea * 0.5;   // Underlayment, thinset, transition strips
    const total         = materialCost + laborCost + baseboardCost + suppliesCost;
    return { material: materialCost, labor: laborCost, baseboard: baseboardCost, supplies: suppliesCost, perimeterLen: Math.round(perimeterLen), wastageArea: Math.round(materialArea - parsedArea), totalCost: total };
  }, [parsedArea, flooringType, includeBaseboards, ft]);

  const handleSave = () => {
    if (breakdown) saveProject({ area, flooringType, includeBaseboards, breakdown }, breakdown.totalCost);
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string,string,string][] = [
      ["Material",  `${Math.round(parsedArea * (1 + ft.wastage))} sqft (incl. ${breakdown.wastageArea} sqft wastage)`, formatCurrency(breakdown.material)],
      ["Labor",     "Installation charges",       formatCurrency(breakdown.labor)],
      ["Supplies",  "Underlayment, thinset, transitions", formatCurrency(breakdown.supplies)],
    ];
    if (breakdown.baseboard > 0)  rows.push(["Baseboards",  `${breakdown.perimeterLen} L.ft`, formatCurrency(breakdown.baseboard)]);
    downloadSpreadsheetPDF(`Flooring-Estimate-${area}sqft`, ["Component","Details","Cost"], rows, "TOTAL ESTIMATE", formatCurrency(breakdown.totalCost));
  };

  const isLocked = false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ── Left ── */}
      <div className="space-y-5">
        <Card title="Flooring Details (USA)">
          {isLocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold text-center">
              <i className="fas fa-lock mr-2"></i> Upgrade to Pro for detailed flooring estimates.
            </div>
          )}

          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            <Input label="Floor Area (sq. ft.)" icon="fas fa-ruler-combined" type="number" placeholder="e.g., 800" value={area} onChange={e => setArea(e.target.value)} disabled={isLocked} />

            {/* Flooring type grid */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Flooring Material</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(FLOORING_TYPES).map(([key, val]) => (
                  <label key={key}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${flooringType === key ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="flooring" value={key} checked={flooringType === key} onChange={() => setFlooringType(key as any)} disabled={isLocked} className="mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">{val.name}</span>
                        <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">${val.rate}/sqft</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{val.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="flex items-center cursor-pointer select-none">
                <input type="checkbox" checked={includeBaseboards} onChange={e => setIncludeBaseboards(e.target.checked)} disabled={isLocked}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="ml-3 text-gray-700 font-medium text-sm">Include Baseboards (Shoe molding / quarter round)</span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-8">Adds ~$3.50/L.ft for material + install</p>
            </div>
          </form>
        </Card>

        {/* ── Info Tabs ── */}
        <Card title="Material Guide">
          <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3 flex-wrap">
            {(["specs","pattern","rooms"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveInfo(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeInfo === tab ? "bg-secondary text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                {tab === "specs" ? "📋 Material Specs" : tab === "pattern" ? "🔲 Tile Patterns" : "🏠 Room Guide"}
              </button>
            ))}
          </div>

          {activeInfo === "specs" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Thickness",     value: ft.thickness },
                  { label: "Wastage Allow", value: `${(ft.wastage * 100).toFixed(0)}%` },
                  { label: "Labor Rate",    value: `$${ft.labor}/sqft` },
                  { label: "Recommended",   value: ft.brand },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs font-bold text-green-700 mb-1">✅ Pros</p>
                  <p className="text-xs text-green-600">{ft.pros}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs font-bold text-red-700 mb-1">⚠️ Cons</p>
                  <p className="text-xs text-red-600">{ft.cons}</p>
                </div>
              </div>
            </div>
          )}

          {activeInfo === "pattern" && (
            <div className="space-y-2">
              {TILE_PATTERNS.map((pat, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-2xl">{pat.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{pat.name}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{pat.wastage} wastage</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{pat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeInfo === "rooms" && (
            <div className="space-y-2">
              {ROOM_SUGGESTIONS.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <i className="fas fa-door-open text-primary mt-0.5 flex-shrink-0"></i>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{r.room}</span>
                      <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">{FLOORING_TYPES[r.rec as keyof typeof FLOORING_TYPES].name.split("(")[0].trim()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Right ── */}
      <div>
        {breakdown && breakdown.totalCost > 0 ? (
          <Card title="Flooring Cost Estimate" className="border-primary/20 shadow-glow">
            <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Estimate</p>
              <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(breakdown.totalCost)}</h2>
              <p className="text-xs text-gray-400 mt-1">for {parsedArea} sq.ft — {ft.name}</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 mb-5">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">Component</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Details</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium">Material</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right hidden sm:table-cell">+{breakdown.wastageArea} sqft wastage</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(breakdown.material)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Labor</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right hidden sm:table-cell">${ft.labor}/sqft</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.labor)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">Supplies</td>
                    <td className="px-4 py-3 text-gray-400 text-xs text-right hidden sm:table-cell">Underlayment, transition strips</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(breakdown.supplies)}</td>
                  </tr>
                  {breakdown.baseboard > 0 && (
                    <tr>
                      <td className="px-4 py-3 font-medium">Baseboards</td>
                      <td className="px-4 py-3 text-gray-400 text-xs text-right hidden sm:table-cell">{breakdown.perimeterLen} L.ft</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(breakdown.baseboard)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="h-56 mb-5">
              <Chart data={{ Material: breakdown.material, Labor: breakdown.labor, Supplies: breakdown.supplies, Baseboards: breakdown.baseboard || 0 }} colors={CHART_COLORS} />
            </div>

            {/* Maintenance reminder */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 mb-5">
              <i className="fas fa-lightbulb mr-1"></i>
              <strong>Maintenance tip for {ft.name.split("(")[0].trim()}:</strong> {
                flooringType === "hardwood" || flooringType === "engineered" ? "Keep ambient humidity between 30-50%. Clean with approved hardwood cleaner. Avoid steam mops." :
                flooringType === "carpet" ? "Vacuum weekly and professionally deep clean every 12-18 months." :
                "Damp mop with a pH-neutral cleaner. Avoid abrasive scrubbers."
              }
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
            <p className="font-medium">Enter floor area to view estimate</p>
            <p className="text-xs mt-2 text-gray-300">Select a flooring type and area to get a detailed breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USAFlooringCalculator;
