"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import PaywallLock from "../../components/ui/PaywallLock";
import ProCalculatorGate from "../../components/ui/ProCalculatorGate";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';

const formatCurrency = (val: number) => formatCurrencyOrig(val, 'IN');

// Standard Indian Modular Kitchen Layouts with Running Feet (Rft) Multipliers
const KITCHEN_LAYOUTS = {
  lshape: { 
    name: "L-Shape", 
    mult: 1.15, 
    runningFeetFactor: 1.3,
    desc: "Counters on two adjacent walls. Most popular layout for Indian 2BHK & 3BHK flats with efficient work triangle." 
  },
  parallel: { 
    name: "Parallel / Galley", 
    mult: 1.0, 
    runningFeetFactor: 1.25,
    desc: "Counters on two facing walls with central aisle. Gold standard for Indian cooking ergonomics (separate wet & cooking zones)." 
  },
  ushape: { 
    name: "U-Shape", 
    mult: 1.35, 
    runningFeetFactor: 1.7,
    desc: "Counters along three walls. Maximum storage, continuous counter space for large families & heavy meal preparation." 
  },
  straight: { 
    name: "Straight / Single Wall", 
    mult: 0.85, 
    runningFeetFactor: 0.9,
    desc: "Single counter run along one wall. Best suited for studio apartments, 1BHKs, and open kitchen living plans." 
  },
  island: { 
    name: "Island Kitchen", 
    mult: 1.55, 
    runningFeetFactor: 1.9,
    desc: "L-shape or parallel counter with a standalone central island for breakfast counter, prep sink, or buffet serving." 
  },
};

// Core Carcass Substrate (Indian Bureau of Standards IS Grades)
const CARCASS_MATERIALS = {
  bwp: {
    name: "BWP 710 Marine Plywood (IS:710)",
    desc: "Boiling Water Proof calibrated hardwood ply. Essential for sink & wet base units to prevent water damage.",
    mult: 1.15,
  },
  hdhmr: {
    name: "HDHMR (Action TESA / Century)",
    desc: "High Density High Moisture Resistance green board. Extremely flat surface, termite-resistant, ideal for shutters.",
    mult: 1.0,
  },
  mr: {
    name: "Commercial MR Plywood (IS:303)",
    desc: "Moisture Resistant ply for dry overhead lofts and budget installations.",
    mult: 0.88,
  },
};

// Shutter Finishes
const SHUTTER_FINISHES = {
  laminate: {
    name: "1mm High-Pressure Laminate",
    desc: "Merino / Century 1mm matte or suede laminate with 2mm PVC edge banding. Scratch & heat resistant.",
    mult: 1.0,
  },
  acrylic: {
    name: "High-Gloss Seamless Acrylic",
    desc: "2mm anti-scratch acrylic with seamless edge-banding. Mirror-like reflection, easy to wipe oil & turmeric.",
    mult: 1.35,
  },
  pu: {
    name: "PU Satin Lacquer / Spray Polish",
    desc: "Multi-coat polyurethane satin lacquer on HDHMR. Seamless joints, luxurious contemporary European finish.",
    mult: 1.85,
  },
  glass: {
    name: "Ceramic / Back-Painted Profile Glass",
    desc: "4mm toughened back-painted glass set in slim matte black anodized aluminum profile frames.",
    mult: 2.3,
  },
};

// Countertop Materials
const COUNTERTOP_MATERIALS = {
  granite: {
    name: "Jet Black Granite (Telephone Black)",
    desc: "Heavy-duty 18-20mm natural granite with full bullnose or chamfer edge. Resistant to hot Indian tawa & citrus acid.",
    ratePerSqft: 220,
  },
  quartz: {
    name: "Engineered Quartz (KalingaStone / Caesarstone)",
    desc: "Non-porous quartz with uniform pattern, zero staining from turmeric/curry, modern square edge profile.",
    ratePerSqft: 450,
  },
  nano_white: {
    name: "Nano White / Crystallized Glass",
    desc: "Ultra-white pristine appearance, stain-proof and heat resistant composite stone.",
    ratePerSqft: 650,
  },
};

const CHART_COLORS = ["#c5a059", "#0f2042", "#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"];

export default function IndiaKitchenCalculator() {
  const { hasPaid, planTier, role } = useUser();
  const isUserPaid = Boolean(hasPaid || role === 'admin' || (planTier && planTier !== 'free'));
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("india-kitchen");

  // Inputs
  const [dimensionMode, setDimensionMode] = useState<"dims" | "sqft">("dims");
  const [lengthFt, setLengthFt] = useState("12");
  const [widthFt, setWidthFt] = useState("10");
  const [areaSqFt, setAreaSqFt] = useState("120");

  if (!isUserPaid) {
    return <ProCalculatorGate calculatorId="india-kitchen" />;
  }

  const [layout, setLayout] = useState<keyof typeof KITCHEN_LAYOUTS>("lshape");
  const [carcass, setCarcass] = useState<keyof typeof CARCASS_MATERIALS>("bwp");
  const [finish, setFinish] = useState<keyof typeof SHUTTER_FINISHES>("acrylic");
  const [countertop, setCountertop] = useState<keyof typeof COUNTERTOP_MATERIALS>("granite");
  const [includeLofts, setIncludeLofts] = useState(true);
  const [includeAppliances, setIncludeAppliances] = useState(true);

  // Gallery Deep Link metadata
  const [galleryReferrer, setGalleryReferrer] = useState<{
    title?: string;
    originalDims?: string;
  } | null>(null);

  // Auto-fill from Gallery query params
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const qArea = searchParams.get('area') || searchParams.get('sqft');
    const qLength = searchParams.get('length');
    const qWidth = searchParams.get('width');
    const qShape = searchParams.get('shape')?.toLowerCase();
    const qFinish = searchParams.get('finish')?.toLowerCase();
    const qCounter = searchParams.get('countertop')?.toLowerCase();
    const qTitle = searchParams.get('title');

    if (qLength && qWidth) {
      setDimensionMode("dims");
      setLengthFt(qLength);
      setWidthFt(qWidth);
      setAreaSqFt(String(Math.round(Number(qLength) * Number(qWidth))));
    } else if (qArea && !isNaN(Number(qArea))) {
      setDimensionMode("sqft");
      setAreaSqFt(qArea);
    }

    if (qShape) {
      if (qShape.includes('parallel') || qShape.includes('galley')) setLayout('parallel');
      else if (qShape.includes('u-shape') || qShape.includes('ushape')) setLayout('ushape');
      else if (qShape.includes('straight')) setLayout('straight');
      else if (qShape.includes('island')) setLayout('island');
      else if (qShape.includes('l-shape') || qShape.includes('lshape')) setLayout('lshape');
    }

    if (qFinish) {
      if (qFinish.includes('acrylic')) setFinish('acrylic');
      else if (qFinish.includes('pu') || qFinish.includes('lacquer')) setFinish('pu');
      else if (qFinish.includes('glass') || qFinish.includes('ceramic')) setFinish('glass');
      else if (qFinish.includes('laminate')) setFinish('laminate');
    }

    if (qCounter) {
      if (qCounter.includes('quartz')) setCountertop('quartz');
      else if (qCounter.includes('nano')) setCountertop('nano_white');
      else if (qCounter.includes('granite')) setCountertop('granite');
    }

    if (qTitle || qArea) {
      setGalleryReferrer({
        title: qTitle || undefined,
        originalDims: qLength && qWidth ? `${qLength}' × ${qWidth}' (${qArea || Number(qLength) * Number(qWidth)} sq ft)` : `${qArea} sq ft`,
      });
    }
  }, []);

  // Derived dimensions with realistic bounds clamping
  const effectiveArea = useMemo(() => {
    let raw = 120;
    if (dimensionMode === "dims") {
      const l = Math.min(100, Math.max(3, parseFloat(lengthFt) || 0));
      const w = Math.min(100, Math.max(3, parseFloat(widthFt) || 0));
      raw = l > 0 && w > 0 ? l * w : 120;
    } else {
      raw = parseFloat(areaSqFt) || 120;
    }
    return Math.min(2500, Math.max(25, raw));
  }, [dimensionMode, lengthFt, widthFt, areaSqFt]);

  // Standard Indian Modular Kitchen BOQ Calculation
  const breakdown = useMemo(() => {
    if (effectiveArea <= 0) return null;

    const layoutCfg = KITCHEN_LAYOUTS[layout];
    const carcassCfg = CARCASS_MATERIALS[carcass];
    const finishCfg = SHUTTER_FINISHES[finish];
    const counterCfg = COUNTERTOP_MATERIALS[countertop];

    // Running Feet (Rft) of base counter calculated ergonomically for Indian kitchens
    // Approximate base running length: sqrt(area) * layoutFactor
    const estimatedBaseRft = Math.max(8, Math.round(Math.sqrt(effectiveArea) * 3.2 * layoutCfg.runningFeetFactor));
    const estimatedWallRft = Math.round(estimatedBaseRft * 0.85);
    const estimatedLoftRft = includeLofts ? Math.round(estimatedBaseRft * 0.9) : 0;

    // 1. Base Cabinets: 34" high, 24" deep, BWP 710 Carcass, 4" waterproof skirting
    // Average rate in India: ₹1,550 - ₹2,400 per Rft depending on substrate and finish
    const baseCabinetRate = Math.round(1650 * carcassCfg.mult * finishCfg.mult);
    const baseCabinetsCost = estimatedBaseRft * baseCabinetRate;

    // 2. Wall Overhead Cabinets: 24" - 30" high, 13" deep with hydraulic soft-close stays
    const wallCabinetRate = Math.round(1300 * carcassCfg.mult * finishCfg.mult);
    const wallCabinetsCost = estimatedWallRft * wallCabinetRate;

    // 3. Loft Cabinets (Ceiling height storage for suitcases/large vessels)
    const loftCabinetRate = Math.round(950 * carcassCfg.mult * (finish === 'laminate' ? 1.0 : 1.15));
    const loftCabinetsCost = estimatedLoftRft * loftCabinetRate;

    // 4. Countertop Stone + Full Bullnose Fabrication + Sink Cutout
    // Standard depth is 2.25 ft (27 inches)
    const counterSqFt = Math.round(estimatedBaseRft * 2.25);
    const countertopCost = Math.round((counterSqFt * counterCfg.ratePerSqft) + (estimatedBaseRft * 160) + 2500);

    // 5. Indian Hardware & Dedicated Modular SS 304 Baskets Package:
    // Thali basket (11-13" plates), Cutlery organizer, Plain cup & saucer basket,
    // 2-tier spice/oil bottle pullout, under-sink drip tray, soft-close Blum/Hettich tandem runners
    const hardwareBase = 22000;
    const hardwareCost = Math.round((hardwareBase + (estimatedBaseRft * 850)) * (finish === 'glass' || finish === 'pu' ? 1.4 : 1.1));

    // 6. Backsplash Dado Tiling (2 ft height, 2x4 ft vitrified tiles & epoxy grout)
    const dadoSqFt = Math.round(estimatedBaseRft * 2.0);
    const dadoCost = Math.round(dadoSqFt * 140);

    // 7. Kitchen Appliances (High-suction 1200-1500 m3/hr Baffle Chimney + 3/4 Burner Brass Hob)
    const appliancesCost = includeAppliances ? (finish === 'pu' || finish === 'glass' ? 42000 : 28000) : 0;

    // 8. Carpentry Installation, Site Alignment & Delivery Labor
    const laborCost = Math.round(estimatedBaseRft * 320 + estimatedWallRft * 220 + estimatedLoftRft * 150);

    const totalCost = baseCabinetsCost + wallCabinetsCost + loftCabinetsCost + countertopCost + hardwareCost + dadoCost + appliancesCost + laborCost;
    const ratePerSqft = Math.round(totalCost / effectiveArea);

    return {
      estimatedBaseRft,
      estimatedWallRft,
      estimatedLoftRft,
      baseCabinetsCost,
      wallCabinetsCost,
      loftCabinetsCost,
      countertopCost,
      counterSqFt,
      hardwareCost,
      dadoCost,
      appliancesCost,
      laborCost,
      totalCost,
      ratePerSqft,
    };
  }, [effectiveArea, layout, carcass, finish, countertop, includeLofts, includeAppliances]);

  const chartData = useMemo(() => {
    if (!breakdown) return null;
    const data: Record<string, number> = {
      "Base Units": breakdown.baseCabinetsCost,
      "Wall Units": breakdown.wallCabinetsCost,
      "Countertop": breakdown.countertopCost,
      "Hardware & Baskets": breakdown.hardwareCost,
      "Dado Tiling": breakdown.dadoCost,
      "Installation Labor": breakdown.laborCost,
    };
    if (breakdown.loftCabinetsCost > 0) {
      data["Loft Storage"] = breakdown.loftCabinetsCost;
    }
    if (breakdown.appliancesCost > 0) {
      data["Chimney & Hob"] = breakdown.appliancesCost;
    }
    return data;
  }, [breakdown]);

  const handleSave = () => {
    if (breakdown) {
      saveProject({
        effectiveArea,
        layout,
        carcass,
        finish,
        countertop,
        includeLofts,
        includeAppliances,
        breakdown,
      }, breakdown.totalCost);
    }
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Base Cabinets", `${breakdown.estimatedBaseRft} Rft • 34" Ht BWP 710 Marine Ply + ${SHUTTER_FINISHES[finish].name}`, formatCurrency(breakdown.baseCabinetsCost)],
      ["Wall Overhead Cabinets", `${breakdown.estimatedWallRft} Rft • Hydraulic Lift-ups + ${SHUTTER_FINISHES[finish].name}`, formatCurrency(breakdown.wallCabinetsCost)],
      ...(breakdown.loftCabinetsCost > 0 ? [
        ["Ceiling Loft Cabinets", `${breakdown.estimatedLoftRft} Rft • Overhead Storage for Suitcases/Vessels`, formatCurrency(breakdown.loftCabinetsCost)] as [string, string, string]
      ] : []),
      ["Countertop & Fabrication", `${breakdown.counterSqFt} sq ft • ${COUNTERTOP_MATERIALS[countertop].name} with Full Bullnose`, formatCurrency(breakdown.countertopCost)],
      ["Hardware & Indian Baskets", "SS 304 Thali Basket, Cutlery, Plain, Bottle Pullout, Soft-Close Tandem", formatCurrency(breakdown.hardwareCost)],
      ["Backsplash Dado Tiling", "2 ft Height Vitrified / Subway Tiles with Epoxy Grouting", formatCurrency(breakdown.dadoCost)],
      ...(breakdown.appliancesCost > 0 ? [
        ["Chimney & Hob Appliance", "1200-1500 m³/hr Baffle-Filter Chimney + 3/4 Burner Brass Gas Hob", formatCurrency(breakdown.appliancesCost)] as [string, string, string]
      ] : []),
      ["Carpentry Installation & Labor", "Factory-finished alignment, edge sealing & site fitting", formatCurrency(breakdown.laborCost)],
    ];

    downloadSpreadsheetPDF(
      `India-Modular-Kitchen-Estimate-${effectiveArea}sqft`,
      ["Kitchen Component", "Indian Technical Specifications", "Cost (₹)"],
      rows,
      "TOTAL ESTIMATED MODULAR KITCHEN BUDGET",
      formatCurrency(breakdown.totalCost)
    );
  };

  return (
    <div className="space-y-6">
      {/* Gallery Pre-fill Banner */}
      {galleryReferrer && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Auto-Synced from Gallery
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {galleryReferrer.title ? `"${galleryReferrer.title}"` : "Gallery Kitchen Design"} &bull; {galleryReferrer.originalDims}
              </p>
            </div>
          </div>
          <button
            onClick={() => setGalleryReferrer(null)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer"
          >
            Clear Pre-fill
          </button>
        </div>
      )}
      {/* Design Gallery Inspiration Banner */}
      <div className="bg-gradient-to-r from-[#c5a059]/15 via-[#0f2042]/5 to-transparent border border-[#c5a059]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#b38e47] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            <i className="fas fa-kitchen-set"></i>
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#c5a059] block">
              Design Inspiration &amp; Layouts
            </span>
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100 mt-0.5">
              Explore 30+ Trending L-Shape, U-Shape &amp; Parallel Kitchen Designs with Real Photos
            </p>
          </div>
        </div>
        <Link
          href="/gallery/kitchen-designs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2042] dark:bg-[#c5a059] text-white dark:text-zinc-950 text-xs font-bold shadow-sm hover:scale-105 transition-all no-underline shrink-0 cursor-pointer"
        >
          <span>Browse Gallery</span>
          <i className="fas fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Technical Controls & Specifications (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Indian Standard Modular Kitchen Estimator">
            <div className="space-y-5">
              
              {/* Dimension Mode Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Kitchen Dimensions
                  </label>
                  <div className="inline-flex rounded-lg border border-gray-200 dark:border-zinc-800 p-0.5 bg-gray-50 dark:bg-zinc-900 text-xs">
                    <button
                      type="button"
                      onClick={() => setDimensionMode("dims")}
                      className={`px-3 py-1 rounded-md font-semibold transition-all ${
                        dimensionMode === "dims"
                          ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      Length × Width (ft)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDimensionMode("sqft")}
                      className={`px-3 py-1 rounded-md font-semibold transition-all ${
                        dimensionMode === "sqft"
                          ? "bg-white dark:bg-zinc-800 shadow-sm text-primary"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      Total Sq. Ft.
                    </button>
                  </div>
                </div>

                {dimensionMode === "dims" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Room Length (feet)"
                      icon="fas fa-arrows-alt-h"
                      type="number"
                      placeholder="e.g. 12"
                      value={lengthFt}
                      onChange={(e) => setLengthFt(e.target.value)}
                    />
                    <Input
                      label="Room Width (feet)"
                      icon="fas fa-arrows-alt-v"
                      type="number"
                      placeholder="e.g. 10"
                      value={widthFt}
                      onChange={(e) => setWidthFt(e.target.value)}
                    />
                  </div>
                ) : (
                  <Input
                    label="Total Kitchen Area (sq. ft.)"
                    icon="fas fa-ruler-combined"
                    type="number"
                    placeholder="e.g. 120"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                  />
                )}
                <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5">
                  <i className="fas fa-info-circle text-primary text-[10px]"></i>
                  <span>Estimated Floor Area: <strong>{effectiveArea} sq. ft.</strong> &bull; Calculated Base Counter: <strong>~{breakdown?.estimatedBaseRft} Running Feet (Rft)</strong></span>
                </div>
              </div>

              {/* Layout Shape Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Kitchen Layout (Indian Work Triangle)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(KITCHEN_LAYOUTS).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        layout === key
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="layout"
                        value={key}
                        checked={layout === key}
                        onChange={() => setLayout(key as any)}
                        className="mt-0.5 text-primary"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                          {val.name}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400 block leading-tight mt-0.5">
                          {val.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Carcass Substrate (IS Code) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Core Carcass Material (Indian IS Grades)
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(CARCASS_MATERIALS).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        carcass === key
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="carcass"
                        value={key}
                        checked={carcass === key}
                        onChange={() => setCarcass(key as any)}
                        className="mt-0.5 text-primary"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                          {val.name}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                          {val.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shutter Finish */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Shutter Finish &amp; Aesthetics
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(SHUTTER_FINISHES).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        finish === key
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="finish"
                        value={key}
                        checked={finish === key}
                        onChange={() => setFinish(key as any)}
                        className="mt-0.5 text-primary"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                          {val.name}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                          {val.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Countertop Material */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Countertop Stone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(COUNTERTOP_MATERIALS).map(([key, val]) => (
                    <label
                      key={key}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all block ${
                        countertop === key
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="countertop"
                          value={key}
                          checked={countertop === key}
                          onChange={() => setCountertop(key as any)}
                          className="text-primary"
                        />
                        <span className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                          {val.name.split(' (')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400 block mt-1 leading-tight">
                        {val.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles: Lofts and Appliances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLofts}
                    onChange={(e) => setIncludeLofts(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                      Include Ceiling Lofts
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Overhead storage for large vessels &amp; suitcases
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAppliances}
                    onChange={(e) => setIncludeAppliances(e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                      Chimney &amp; Hob Allowance
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Baffle-filter chimney + 3/4 burner brass hob
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !breakdown}
                  className="flex-1 py-3 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-bookmark"></i>
                  <span>{isSaving ? "Saving..." : "Save Project"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading || !breakdown}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-file-pdf"></i>
                  <span>{isDownloading ? "Exporting..." : "Export Detailed BOQ PDF"}</span>
                </button>
              </div>

            </div>
          </Card>

          {/* Educational Indian Standards & Guidelines Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <i className="fas fa-book-open text-primary"></i>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                Indian Standard Modular Kitchen Guidelines
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-zinc-400">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">Ergonomic Base Counter (34")</strong>
                Standard base height is 860mm (34 inches) incorporating a 4" waterproof PVC skirting, 28" carcass, and 18-20mm granite/quartz to minimize back strain during roti making.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">IS:710 Grade Plywood</strong>
                Indian cooking involves high moisture and sink splash. Using IS:710 Marine ply prevents carcass swelling, delamination, and termite attacks.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">Dedicated SS 304 Baskets</strong>
                Always allocate dedicated racks for Indian 11"-13" steel thalis, a partitioned cutlery organizer, and a 150/200mm bottle pullout for cooking oils and masalas.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">Baffle Chimney (1200+ m³/hr)</strong>
                Curry tadka and deep frying generate heavy oil vapor. Baffle filters separate grease effectively and prevent motor choke compared to mesh filters.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: BOQ Breakdown & Cost Distribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {breakdown && (
            <Card title="Detailed Bill of Quantities (BOQ)">
              <div className="text-center py-4 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Approximate Total Project Cost
                </span>
                <span className="text-3xl sm:text-4xl font-black text-primary font-mono block mt-1">
                  {formatCurrency(breakdown.totalCost)}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold mt-1 inline-block">
                  Approx. ₹{breakdown.ratePerSqft.toLocaleString('en-IN')} / sq ft &bull; {effectiveArea} sq ft floor
                </span>
              </div>

              {chartData && (
                <div className="my-6 max-w-[260px] mx-auto">
                  <Chart data={chartData} colors={CHART_COLORS} />
                </div>
              )}

              {/* Itemized BOQ Lines with PaywallLock */}
              <PaywallLock
                minTier="basic"
                title="Unlock Itemized Modular Kitchen BOQ"
                subtitle="View exact woodwork carcass costs, hardware runners, tandem boxes, countertop bullnose, and carpentry installation labor."
                previewHeight="max-h-[220px]"
              >
                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Base Cabinets &amp; Skirting</span>
                      <span className="text-[10px] text-gray-500">{breakdown.estimatedBaseRft} Rft &bull; 34" Ht BWP 710 Carcass</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.baseCabinetsCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Wall Overhead Cabinets</span>
                      <span className="text-[10px] text-gray-500">{breakdown.estimatedWallRft} Rft &bull; Hydraulic soft-close stays</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.wallCabinetsCost)}</span>
                  </div>

                  {breakdown.loftCabinetsCost > 0 && (
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-zinc-100 block">Ceiling Loft Storage</span>
                        <span className="text-[10px] text-gray-500">{breakdown.estimatedLoftRft} Rft &bull; Seasonal luggage storage</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.loftCabinetsCost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Countertop Stone &amp; Bullnose</span>
                      <span className="text-[10px] text-gray-500">{breakdown.counterSqFt} sq ft {COUNTERTOP_MATERIALS[countertop].name.split(' (')[0]}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.countertopCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">SS 304 Baskets &amp; Tandem Box</span>
                      <span className="text-[10px] text-gray-500">Thali, Cutlery, Bottle pull-out &amp; Soft-close runners</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.hardwareCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Backsplash Dado Tiling</span>
                      <span className="text-[10px] text-gray-500">2 ft Height Vitrified tiles + Epoxy grout</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.dadoCost)}</span>
                  </div>

                  {breakdown.appliancesCost > 0 && (
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-zinc-100 block">Chimney &amp; Hob Allowance</span>
                        <span className="text-[10px] text-gray-500">Heavy-suction baffle filter &amp; brass burner</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.appliancesCost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Carpentry &amp; Fitting Labor</span>
                      <span className="text-[10px] text-gray-500">Factory finishing, alignment &amp; site fitting</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.laborCost)}</span>
                  </div>
                </div>
              </PaywallLock>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
