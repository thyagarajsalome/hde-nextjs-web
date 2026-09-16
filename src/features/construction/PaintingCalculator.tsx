"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency } from "../../utils/currency";
import WhatsAppShareButton from "../../components/ui/WhatsAppShareButton";

const PAINT_TYPES = {
  distemper: { name: "Distemper (Economy)", rate: 22, desc: "Water-based chalky finish, ideal for rental properties" },
  emulsion: { name: "Tractor Emulsion (Standard)", rate: 38, desc: "Smooth matte washable finish (Asian Paints / Berger)" },
  royal: { name: "Royale / Luxury Emulsion", rate: 58, desc: "High-sheen Teflon surface protection with stain washability" },
  texture: { name: "Designer Texture Paint", rate: 120, desc: "Artistic metallic, stucco, or rustic feature accent wall finish" },
};

const PROCESS_TYPES = {
  repaint: { name: "Repainting (Touchup Putty + 2 Coats)", factor: 1.0, prepRatio: 0.10, laborRatio: 0.40 },
  fresh: { name: "Fresh Painting (2-Coat Putty + Primer + 2 Coats)", factor: 1.6, prepRatio: 0.25, laborRatio: 0.25 },
};

const CHART_COLORS = ["#c5a059", "#0f2042", "#2563eb", "#10b981"];

const PaintingCalculator: React.FC = () => {
  const { hasPaid, planTier, role } = useUser();
  const isUserPaid = Boolean(hasPaid || role === 'admin' || (planTier && planTier !== 'free'));
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("painting");
  const resultsRef = useRef<HTMLDivElement>(null);

  const [carpetArea, setCarpetArea] = useState("1000");
  const [wallArea, setWallArea] = useState("3000");
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [paintType, setPaintType] = useState<keyof typeof PAINT_TYPES>("emulsion");
  const [process, setProcess] = useState<keyof typeof PROCESS_TYPES>("fresh");
  const [totalCost, setTotalCost] = useState(0);

  // Auto-calculate wall area from carpet area
  useEffect(() => {
    const area = parseFloat(carpetArea);
    if (!isNaN(area) && area > 0) {
      const walls = area * 3;
      const ceiling = includeCeiling ? area : 0;
      setWallArea(Math.round(walls + ceiling).toString());
    }
  }, [carpetArea, includeCeiling]);

  // Initial calculation on mount if carpet area exists
  useEffect(() => {
    const parsedArea = parseFloat(wallArea) || 0;
    if (parsedArea > 0 && totalCost === 0) {
      const cost = parsedArea * PAINT_TYPES[paintType].rate * PROCESS_TYPES[process].factor;
      setTotalCost(cost);
    }
  }, [wallArea, paintType, process]);

  const calculateCost = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedArea = parseFloat(wallArea) || 0;
    const cost = parsedArea * PAINT_TYPES[paintType].rate * PROCESS_TYPES[process].factor;
    setTotalCost(cost);

    if (resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const breakdown = useMemo(() => {
    if (totalCost <= 0) return null;
    const proc = PROCESS_TYPES[process];
    const isFresh = process === "fresh";

    const paintCost = Math.round(totalCost * 0.45);
    const prepCost = Math.round(totalCost * proc.prepRatio);
    const laborCost = Math.round(totalCost * proc.laborRatio);
    const consumablesCost = Math.max(0, totalCost - paintCost - prepCost - laborCost);

    const area = parseFloat(wallArea) || 0;
    // 1 Liter emulsion covers approx 65 sq.ft (2 coats)
    const paintLiters = Math.ceil(area / 65);
    // 1 Liter primer covers approx 120 sq.ft
    const primerLiters = Math.ceil(area / 120);
    // 1 Kg wall putty covers approx 14 sq.ft (2 coats)
    const puttyKg = isFresh ? Math.ceil(area / 14) : Math.ceil(area / 35);

    return {
      paintCost,
      prepCost,
      laborCost,
      consumablesCost,
      paintLiters,
      primerLiters,
      puttyKg,
    };
  }, [totalCost, process, wallArea]);

  const chartData: Record<string, number> = useMemo(() => {
    if (!breakdown) return {} as Record<string, number>;
    return {
      "Paint & Finishes": breakdown.paintCost,
      "Putty & Primer": breakdown.prepCost,
      "Painter Labor": breakdown.laborCost,
      "Tools & Consumables": breakdown.consumablesCost,
    };
  }, [breakdown]);

  const handleSave = () => {
    saveProject({
      carpetArea,
      wallArea,
      paintType,
      process,
      includeCeiling
    }, totalCost);
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows = [
      ["Top Coat Paint Material", "45% of total", `${breakdown.paintLiters} Liters`, formatCurrency(breakdown.paintCost)],
      ["Wall Putty & Primer Prep", `${process === "fresh" ? "25%" : "10%"} of total`, `${breakdown.puttyKg} kg putty, ${breakdown.primerLiters} L primer`, formatCurrency(breakdown.prepCost)],
      ["Master Painter & Labor", `${process === "fresh" ? "25%" : "40%"} of total`, "Skilled rollering & masking", formatCurrency(breakdown.laborCost)],
      ["Consumables & Sundries", "Sundry allowance", "Rollers, sandpaper, masking tape", formatCurrency(breakdown.consumablesCost)],
    ];

    downloadSpreadsheetPDF(
      `Painting-Estimate-${carpetArea}sqft`, 
      ['Scope of Work', 'Allocation', 'Material Takeoff', 'Estimated Cost'], 
      rows, 
      'TOTAL PAINTING BUDGET', 
      formatCurrency(totalCost)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* LEFT COLUMN: Inputs & Options */}
      <section>
        <Card title="House Painting Cost Estimator">
          <form onSubmit={calculateCost} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Carpet Area (sq.ft)" 
                icon="fas fa-expand" 
                type="number" 
                value={carpetArea} 
                onChange={(e) => setCarpetArea(e.target.value)} 
              />
              <Input 
                label="Paintable Wall Area (sq.ft)" 
                icon="fas fa-brush" 
                type="number" 
                value={wallArea} 
                onChange={(e) => setWallArea(e.target.value)} 
              />
            </div>
            
            <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeCeiling} 
                  onChange={(e) => setIncludeCeiling(e.target.checked)} 
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer" 
                />
                <span className="ml-3 text-gray-800 dark:text-zinc-200 font-semibold text-xs">
                  Include Ceiling in Surface Area Calculation (+100% carpet area)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Paint Finish &amp; Quality Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(PAINT_TYPES).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPaintType(key as any)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      paintType === key
                        ? "bg-primary/10 border-primary text-secondary dark:text-zinc-100 shadow-xs"
                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-primary/40 text-gray-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="block font-bold text-xs">{val.name}</span>
                    <span className="text-[11px] text-[#c5a059] font-extrabold block mt-0.5">₹{val.rate} / sq.ft</span>
                    <span className="text-[10px] text-gray-400 block mt-1 line-clamp-1">{val.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Surface Preparation Process
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(PROCESS_TYPES).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProcess(key as any)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      process === key
                        ? "bg-primary/10 border-primary text-secondary dark:text-zinc-100 shadow-xs"
                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-primary/40 text-gray-700 dark:text-zinc-300"
                    }`}
                  >
                    <span className="block font-bold text-xs">{val.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      {key === 'fresh' ? 'New plaster or full renovation' : 'Existing painted walls maintenance'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-primary text-white dark:text-zinc-950 font-bold text-sm rounded-xl hover:bg-primary-hover transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fas fa-calculator"></i>
              <span>Recalculate Painting Estimate</span>
            </button>
          </form>
        </Card>
      </section>

      {/* RIGHT COLUMN: Results & Infographic Donut Chart */}
      {totalCost > 0 && breakdown && (
        <section ref={resultsRef} className="space-y-6 animate-fadeIn">
          <Card title="Painting Estimate & Material Takeoff" className="border-[#c5a059]/30 shadow-lg">
            {/* Total Cost Display */}
            <div className="text-center py-6 bg-gradient-to-b from-[#c5a059]/10 to-transparent rounded-2xl border border-[#c5a059]/20 mb-6">
              <p className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
                Total Estimated Painting Budget
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-secondary dark:text-zinc-100 tracking-tight">
                {formatCurrency(totalCost)}
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
                Includes Paint + Wall Putty + Primer + Labor for <strong className="text-gray-800 dark:text-zinc-200">{wallArea} sq.ft</strong>
              </p>
            </div>

            {/* 📊 INFOGRAPHIC DONUT CHART BREAKDOWN */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-gray-700 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                  <span>Cost Distribution Infographic</span>
                </h4>
                <span className="text-[11px] font-bold text-[#c5a059] bg-[#c5a059]/15 px-2.5 py-0.5 rounded-full">
                  Visual Cost Wheel
                </span>
              </div>

              {/* Chart Wheel Container */}
              <div className="h-64 my-2 flex items-center justify-center">
                <Chart data={chartData} colors={CHART_COLORS} />
              </div>

              {/* Stat Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-gray-200/70 dark:border-zinc-800 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Top Coats</span>
                  <span className="text-xs font-black text-gray-800 dark:text-zinc-100 font-mono block mt-0.5">
                    {formatCurrency(breakdown.paintCost)}
                  </span>
                  <span className="text-[9px] text-[#c5a059] font-bold">45%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Putty &amp; Primer</span>
                  <span className="text-xs font-black text-gray-800 dark:text-zinc-100 font-mono block mt-0.5">
                    {formatCurrency(breakdown.prepCost)}
                  </span>
                  <span className="text-[9px] text-[#0f2042] dark:text-zinc-300 font-bold">{process === "fresh" ? "25%" : "10%"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Painter Labor</span>
                  <span className="text-xs font-black text-gray-800 dark:text-zinc-100 font-mono block mt-0.5">
                    {formatCurrency(breakdown.laborCost)}
                  </span>
                  <span className="text-[9px] text-blue-600 font-bold">{process === "fresh" ? "25%" : "40%"}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Consumables</span>
                  <span className="text-xs font-black text-gray-800 dark:text-zinc-100 font-mono block mt-0.5">
                    {formatCurrency(breakdown.consumablesCost)}
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold">5%</span>
                </div>
              </div>
            </div>

            {/* Material Takeoff Quick Badges */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 mb-6">
              <h4 className="text-xs font-black text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i className="fas fa-boxes-stacked text-[#c5a059]"></i>
                <span>Estimated Material Takeoff Quantity</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Paint Volume</span>
                  <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300 mt-0.5 block">
                    {breakdown.paintLiters} Liters
                  </span>
                  <span className="text-[10px] text-gray-400 block">2 Finishing Coats</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Wall Putty</span>
                  <span className="text-base sm:text-lg font-black text-blue-800 dark:text-blue-300 mt-0.5 block">
                    {breakdown.puttyKg} Kg
                  </span>
                  <span className="text-[10px] text-gray-400 block">{process === "fresh" ? "2 Base Coats" : "Touch-ups"}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Wall Primer</span>
                  <span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                    {breakdown.primerLiters} Liters
                  </span>
                  <span className="text-[10px] text-gray-400 block">Undercoat Sealer</span>
                </div>
              </div>
            </div>

            {/* Share & Actions Container (Cleanly Spaced - No Overlap) */}
            <div className="space-y-3.5 pt-2">
              <WhatsAppShareButton
                title="House Painting Estimate"
                total={formatCurrency(totalCost)}
                details={[
                  { label: "Carpet Area", value: `${carpetArea} sq.ft` },
                  { label: "Total Wall Area", value: `${wallArea} sq.ft` },
                  { label: "Paint Quality", value: PAINT_TYPES[paintType].name },
                  { label: "Surface Process", value: PROCESS_TYPES[process].name },
                  { label: "Paint Material Takeoff", value: `${breakdown.paintLiters} Liters (${formatCurrency(breakdown.paintCost)})` },
                  { label: "Putty & Primer", value: `${breakdown.puttyKg} kg (${formatCurrency(breakdown.prepCost)})` },
                  { label: "Painter Labor Charges", value: formatCurrency(breakdown.laborCost) },
                ]}
                className="w-full"
                buttonText="Share Painting Quote via WhatsApp"
              />

              {isUserPaid ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={handleDownloadPDF} 
                    disabled={isDownloading} 
                    className="py-3 px-4 bg-white dark:bg-zinc-900 border-2 border-secondary dark:border-zinc-700 text-secondary dark:text-zinc-100 font-bold text-xs rounded-xl hover:bg-secondary dark:hover:bg-zinc-800 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-file-pdf text-red-500"></i>
                    <span>{isDownloading ? "Generating..." : "Download Quotation PDF"}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="py-3 px-4 bg-primary text-white dark:text-zinc-950 font-bold text-xs rounded-xl hover:bg-primary-hover transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-save"></i>
                    <span>{isSaving ? "Saving..." : "Save Project"}</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#c5a059]/15 to-amber-500/10 border border-[#c5a059]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-xs">
                        🔒 Unlock Contractor PDF Quotation &amp; Cloud Save
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black">
                        PRO
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                      Export branded quotation sheets without watermarks &amp; save to your cloud dashboard.
                    </p>
                  </div>
                  <Link 
                    href="/upgrade?calc=painting" 
                    className="px-4 py-2.5 bg-[#c5a059] hover:bg-[#b38e47] text-white text-xs font-black rounded-xl shadow-xs transition shrink-0 no-underline cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Upgrade to Pro</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};

export default PaintingCalculator;
