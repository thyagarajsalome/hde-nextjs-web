"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import PaywallLock from "../../components/ui/PaywallLock";
import ProCalculatorGate from "../../components/ui/ProCalculatorGate";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';

const formatCurrency = (val: number) => formatCurrencyOrig(val, 'IN');

// Standard Indian Bathroom Types & Dimensions
const BATHROOM_TYPES = {
  compact: { 
    name: "Compact 3-Fixture (Flat/Apartment)", 
    defaultSqft: 35, 
    mult: 0.95, 
    desc: "Standard 5' × 7' flat bathroom: washbasin, European water closet, and shower in 30-40 sq ft." 
  },
  powder: { 
    name: "Powder Room (Guest Toilet)", 
    defaultSqft: 20, 
    mult: 1.15, 
    desc: "4' × 5' dry area with designer countertop basin, statement wall-hung WC, and boutique pendant lighting." 
  },
  wetdry: { 
    name: "Wet & Dry Partition Bathroom", 
    defaultSqft: 48, 
    mult: 1.25, 
    desc: "6' × 8' layout with 10mm toughened glass partition separating shower wet zone from dry vanity & commode." 
  },
  master: { 
    name: "Master Ensuite Bathroom", 
    defaultSqft: 75, 
    mult: 1.45, 
    desc: "8' × 10' master suite with floating quartz vanity, recessed shower niches, profile LED lighting, and concealed tank." 
  },
  luxury: { 
    name: "Luxury Suite with Bathtub", 
    defaultSqft: 110, 
    mult: 1.9, 
    desc: "Spacious villa ensuite with freestanding acrylic tub, thermostatic shower mixer, and Italian marble / porcelain slabs." 
  },
};

// CP Fittings & Sanitaryware Brands Tier
const FIXTURE_TIERS = {
  standard: { 
    name: "Standard (Jaquar / Cera / Hindware)", 
    mult: 1.0, 
    desc: "Single-lever concealed diverter, wall-hung washbasin, floor-mounted/wall-hung EWC with exposed or regular cistern." 
  },
  premium: { 
    name: "Premium (Kohler / Jaquar Artize)", 
    mult: 1.55, 
    desc: "Concealed 3-in-1 diverter, rimless wall-hung WC with slim pneumatic concealed tank (Geberit/Jaquar), brass rain shower." 
  },
  luxury: { 
    name: "Luxury (Grohe / Hansgrohe)", 
    mult: 2.45, 
    desc: "Thermostatic mixer valve, ceiling rain canopy, sensor basin mixer, premium designer ceramic sanitaryware." 
  },
};

// Shower Enclosure Options
const PARTITION_OPTIONS = {
  none: { name: "Open Shower (No Partition)", cost: 0, desc: "Curtain rod or floor curb drop" },
  glass: { name: "10mm Toughened Frameless Glass", cost: 16500, desc: "Saint-Gobain 10mm clear glass with SS 304 hinges & stabilizer bar" },
  sliding: { name: "Sliding Glass Cubicle / Enclosure", cost: 24000, desc: "Corner frosted/clear sliding glass enclosure with magnetic seals" },
};

// Wall & Floor Tile Concepts
const TILE_CONCEPTS = {
  vitrified: { name: "2×4 ft High-Gloss / Matte Vitrified", ratePerSqft: 75, desc: "Anti-skid floor + 2×4 ft wall tiles up to ceiling with epoxy grout" },
  moroccan: { name: "Moroccan / Textured Feature Highlighter", ratePerSqft: 110, desc: "Feature pattern shower wall with neutral large-format vitrified body" },
  porcelain: { name: "Statuario / Marble Porcelain Slabs", ratePerSqft: 165, desc: "Continuous book-matched porcelain slabs with minimal grout joints" },
};

const CHART_COLORS = ["#0f2042", "#c5a059", "#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

export default function IndiaBathroomCalculator() {
  const { hasPaid, planTier, role } = useUser();
  const isUserPaid = Boolean(hasPaid || role === 'admin' || (planTier && planTier !== 'free'));
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("india-bathroom");

  // Inputs
  const [dimensionMode, setDimensionMode] = useState<"dims" | "sqft">("dims");
  const [lengthFt, setLengthFt] = useState("8");
  const [widthFt, setWidthFt] = useState("6");
  const [areaSqFt, setAreaSqFt] = useState("48");

  if (!isUserPaid) {
    return <ProCalculatorGate calculatorId="india-bathroom" />;
  }

  const [bathType, setBathType] = useState<keyof typeof BATHROOM_TYPES>("wetdry");
  const [tier, setTier] = useState<keyof typeof FIXTURE_TIERS>("premium");
  const [partition, setPartition] = useState<keyof typeof PARTITION_OPTIONS>("glass");
  const [tiles, setTiles] = useState<keyof typeof TILE_CONCEPTS>("vitrified");
  const [includeSmartMirror, setIncludeSmartMirror] = useState(true);

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
    const qType = searchParams.get('type')?.toLowerCase();
    const qTier = searchParams.get('tier')?.toLowerCase();
    const qFittings = searchParams.get('fittings')?.toLowerCase();
    const qPartition = searchParams.get('partition')?.toLowerCase();
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

    if (qType) {
      if (qType.includes('compact')) setBathType('compact');
      else if (qType.includes('powder')) setBathType('powder');
      else if (qType.includes('master')) setBathType('master');
      else if (qType.includes('luxury') || qType.includes('suite')) setBathType('luxury');
      else if (qType.includes('wet') || qType.includes('partition')) setBathType('wetdry');
    }

    if (qTier || qFittings) {
      const combined = `${qTier || ''} ${qFittings || ''}`;
      if (combined.includes('grohe') || combined.includes('luxury') || combined.includes('hansgrohe')) {
        setTier('luxury');
      } else if (combined.includes('standard') || combined.includes('cera') || combined.includes('hindware')) {
        setTier('standard');
      } else {
        setTier('premium');
      }
    }

    if (qPartition) {
      if (qPartition.includes('sliding')) setPartition('sliding');
      else if (qPartition.includes('none') || qPartition.includes('curtain')) setPartition('none');
      else setPartition('glass');
    }

    if (qTitle || qArea) {
      setGalleryReferrer({
        title: qTitle || undefined,
        originalDims: qLength && qWidth ? `${qLength}' × ${qWidth}' (${qArea || Number(qLength) * Number(qWidth)} sq ft)` : `${qArea} sq ft`,
      });
    }
  }, []);

  // Derived effective area with realistic bounds clamping
  const effectiveArea = useMemo(() => {
    let raw = 48;
    if (dimensionMode === "dims") {
      const l = Math.min(50, Math.max(3, parseFloat(lengthFt) || 0));
      const w = Math.min(50, Math.max(3, parseFloat(widthFt) || 0));
      raw = l > 0 && w > 0 ? l * w : 48;
    } else {
      raw = parseFloat(areaSqFt) || 48;
    }
    return Math.min(1000, Math.max(15, raw));
  }, [dimensionMode, lengthFt, widthFt, areaSqFt]);

  // Standard Indian Bathroom Renovation BOQ Calculation
  const breakdown = useMemo(() => {
    if (effectiveArea <= 0) return null;

    const typeCfg = BATHROOM_TYPES[bathType];
    const tierCfg = FIXTURE_TIERS[tier];
    const tileCfg = TILE_CONCEPTS[tiles];
    const partitionCost = PARTITION_OPTIONS[partition].cost;

    // Bathroom perimeter: 2*(L + W) or approximate 4 * sqrt(area)
    const l = dimensionMode === "dims" ? parseFloat(lengthFt) || 0 : Math.sqrt(effectiveArea) * 1.2;
    const w = dimensionMode === "dims" ? parseFloat(widthFt) || 0 : effectiveArea / l;
    const perimeter = l > 0 && w > 0 ? 2 * (l + w) : Math.round(4 * Math.sqrt(effectiveArea));

    // Standard Indian wall dado height: 7 ft (door lintel level) or 8.5 ft (ceiling height)
    const dadoHeight = bathType === 'luxury' || bathType === 'master' ? 8.5 : 7.0;
    const wallTileSqFt = Math.round(perimeter * dadoHeight - 20); // deduct 20 sq ft for door/window opening
    const floorTileSqFt = Math.round(effectiveArea);

    // 1. Sunken Slab 2-Coat Elastomeric Waterproofing (Dr. Fixit Fastflex / Pidifin 2K) + 48-hr Ponding Test
    // Covers sunken floor slab plus 1 ft up the wall perimeter
    const waterproofingSqFt = floorTileSqFt + perimeter * 1.5;
    const waterproofingCost = Math.round(waterproofingSqFt * 95 + 2500);

    // 2. Wall Dado Tiling & Anti-Skid Floor Tiling + Epoxy Grouting & Tile Cutting
    const totalTilingSqFt = wallTileSqFt + floorTileSqFt;
    const tileMaterialCost = Math.round(totalTilingSqFt * tileCfg.ratePerSqft);
    const tileLayingLaborCost = Math.round(totalTilingSqFt * 45 + 3000); // Mason laying labor & sand/cement mortar
    const tilingTotalCost = tileMaterialCost + tileLayingLaborCost;

    // 3. Concealed Plumbing & Drainage Piping (Astral/Ashirvad SDR 11 CPVC & PVC drainage)
    // Core cutting, concealed groove chipping, pressure testing
    const plumbingPipingCost = Math.round((effectiveArea * 180 + 7500) * (bathType === 'powder' ? 0.7 : 1.0));

    // 4. Sanitaryware (Rimless Wall-Hung EWC + Concealed Slim Tank with Pneumatic Plate + Ceramic Basin)
    let sanitarywareCost = 14500; // Standard base
    if (tier === 'premium') sanitarywareCost = 28000;
    if (tier === 'luxury') sanitarywareCost = 54000;
    if (bathType === 'luxury') sanitarywareCost += 42000; // Freestanding acrylic bathtub allowance

    // 5. CP Brass Fittings & Concealed Diverter Setup:
    // Single lever 3-in-1 diverter, 8-12" rain shower arm, basin mixer, spout with button, and health faucet
    let cpFittingsCost = 13500;
    if (tier === 'premium') cpFittingsCost = 27500;
    if (tier === 'luxury') cpFittingsCost = 65000; // Thermostatic valve & multi-flow shower

    // 6. Shower Enclosure / Partition
    const glassPartitionCost = bathType === 'powder' ? 0 : partitionCost;

    // 7. BWP 710 Marine Ply Floating Vanity Cabinet with Quartz / Granite Countertop
    let vanityCost = 8500;
    if (tier === 'premium') vanityCost = 16500;
    if (tier === 'luxury') vanityCost = 28000;
    if (bathType === 'powder') vanityCost = Math.round(vanityCost * 1.25); // Boutique statement vanity

    // 8. Electrical Points, 150mm Exhaust Fan & LED Backlit Smart Mirror
    const mirrorCost = includeSmartMirror ? 7500 : 2000;
    const electricalCost = 4500 + mirrorCost;

    // 9. Skilled Plumbing Contractor & Site Labor
    const plumbingLabor = Math.round((plumbingPipingCost * 0.45) + 4000);

    const totalCost = Math.round(
      waterproofingCost +
      tilingTotalCost +
      plumbingPipingCost +
      sanitarywareCost +
      cpFittingsCost +
      glassPartitionCost +
      vanityCost +
      electricalCost +
      plumbingLabor
    );

    const ratePerSqft = Math.round(totalCost / effectiveArea);

    return {
      waterproofingCost,
      tilingTotalCost,
      wallTileSqFt,
      floorTileSqFt,
      plumbingPipingCost,
      sanitarywareCost,
      cpFittingsCost,
      glassPartitionCost,
      vanityCost,
      electricalCost,
      plumbingLabor,
      totalCost,
      ratePerSqft,
    };
  }, [effectiveArea, lengthFt, widthFt, dimensionMode, bathType, tier, partition, tiles, includeSmartMirror]);

  const chartData = useMemo(() => {
    if (!breakdown) return null;
    const data: Record<string, number> = {
      "Waterproofing": breakdown.waterproofingCost,
      "Tiling & Masonry": breakdown.tilingTotalCost,
      "CPVC Plumbing": breakdown.plumbingPipingCost,
      "Sanitaryware": breakdown.sanitarywareCost,
      "CP Brass Diverters": breakdown.cpFittingsCost,
      "Vanity Counter": breakdown.vanityCost,
      "Plumbing Labor": breakdown.plumbingLabor,
    };
    if (breakdown.glassPartitionCost > 0) {
      data["Glass Partition"] = breakdown.glassPartitionCost;
    }
    return data;
  }, [breakdown]);

  const handleSave = () => {
    if (breakdown) {
      saveProject({
        effectiveArea,
        bathType,
        tier,
        partition,
        tiles,
        includeSmartMirror,
        breakdown,
      }, breakdown.totalCost);
    }
  };

  const handleDownloadPDF = () => {
    if (!breakdown) return;
    const rows: [string, string, string][] = [
      ["Sunken Slab Waterproofing", "2-Coat Elastomeric Polymer + 48-hr Ponding Submergence Test", formatCurrency(breakdown.waterproofingCost)],
      ["Wall & Floor Tiling", `${breakdown.wallTileSqFt} sq ft Wall Dado + ${breakdown.floorTileSqFt} sq ft Anti-Skid Floor with Epoxy Grout`, formatCurrency(breakdown.tilingTotalCost)],
      ["Concealed Plumbing Lines", "Astral/Ashirvad SDR 11 CPVC (Hot/Cold) & PVC Drainage Chipping", formatCurrency(breakdown.plumbingPipingCost)],
      ["Sanitaryware Fixtures", `${FIXTURE_TIERS[tier].name}: Wall-Hung EWC + Concealed Tank & Basin`, formatCurrency(breakdown.sanitarywareCost)],
      ["CP Brass Diverters & Shower", "Concealed 3-in-1 Diverter, Overhead Rain Shower, Spout & Health Faucet", formatCurrency(breakdown.cpFittingsCost)],
      ...(breakdown.glassPartitionCost > 0 ? [
        ["Shower Glass Enclosure", PARTITION_OPTIONS[partition].name, formatCurrency(breakdown.glassPartitionCost)] as [string, string, string]
      ] : []),
      ["Floating Vanity & Counter", "BWP 710 Marine Ply Cabinet with Quartz/Granite Counter", formatCurrency(breakdown.vanityCost)],
      ["Electrical & LED Mirror", "Backlit Smart Defogger Mirror, Exhaust Fan & Geyser Point Wiring", formatCurrency(breakdown.electricalCost)],
      ["Skilled Plumbing & Masonry Labor", "Core cutting, concealed piping alignment & fixture commissioning", formatCurrency(breakdown.plumbingLabor)],
    ];

    downloadSpreadsheetPDF(
      `India-Bathroom-Renovation-Estimate-${effectiveArea}sqft`,
      ["Renovation Component", "Indian Standard Specifications", "Cost (₹)"],
      rows,
      "TOTAL ESTIMATED BATHROOM RENOVATION BUDGET",
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
                {galleryReferrer.title ? `"${galleryReferrer.title}"` : "Gallery Bathroom Design"} &bull; {galleryReferrer.originalDims}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Technical Specifications & Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Indian Standard Bathroom Renovation Estimator">
            <div className="space-y-5">
              
              {/* Dimension Mode Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Bathroom Dimensions
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
                      placeholder="e.g. 8"
                      value={lengthFt}
                      onChange={(e) => setLengthFt(e.target.value)}
                    />
                    <Input
                      label="Room Width (feet)"
                      icon="fas fa-arrows-alt-v"
                      type="number"
                      placeholder="e.g. 6"
                      value={widthFt}
                      onChange={(e) => setWidthFt(e.target.value)}
                    />
                  </div>
                ) : (
                  <Input
                    label="Total Floor Area (sq. ft.)"
                    icon="fas fa-ruler-combined"
                    type="number"
                    placeholder="e.g. 48"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                  />
                )}
                <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5">
                  <i className="fas fa-info-circle text-primary text-[10px]"></i>
                  <span>Calculated Floor: <strong>{effectiveArea} sq. ft.</strong> &bull; Wall Dado Area: <strong>~{breakdown?.wallTileSqFt} sq. ft.</strong></span>
                </div>
              </div>

              {/* Bathroom Layout Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Bathroom Layout &amp; Zoning
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(BATHROOM_TYPES).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        bathType === key
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="bathType"
                        value={key}
                        checked={bathType === key}
                        onChange={() => setBathType(key as any)}
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

              {/* Fixture & Fitting Quality Tier */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  CP Fittings &amp; Sanitaryware Brand Tier
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(FIXTURE_TIERS).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        tier === key
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={key}
                        checked={tier === key}
                        onChange={() => setTier(key as any)}
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

              {/* Shower Enclosure / Partition */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Shower Wet-Area Glass Partition
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(PARTITION_OPTIONS).map(([key, val]) => (
                    <label
                      key={key}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all block ${
                        partition === key
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="partition"
                          value={key}
                          checked={partition === key}
                          onChange={() => setPartition(key as any)}
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

              {/* Wall & Floor Tile Concept */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Tiling Concept &amp; Wall Dado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(TILE_CONCEPTS).map(([key, val]) => (
                    <label
                      key={key}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all block ${
                        tiles === key
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-zinc-800 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tiles"
                          value={key}
                          checked={tiles === key}
                          onChange={() => setTiles(key as any)}
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

              {/* Smart LED Mirror Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSmartMirror}
                  onChange={(e) => setIncludeSmartMirror(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                    Include LED Smart Mirror with Defogger Touch Sensor
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Dual warm/white LED backlight with anti-fog heating element
                  </span>
                </div>
              </label>

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

          {/* Educational Indian Bathroom Standards & Guidelines */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <i className="fas fa-shower text-primary"></i>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-zinc-100">
                Indian Standard Bathroom Renovation Guidelines
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-zinc-400">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">Sunken Slab Ponding Test</strong>
                Never tile over a sunken slab without applying 2 coats of elastomeric polymer (Dr. Fixit Fastflex / Pidifin 2K) followed by a mandatory 48-hour water ponding test to verify zero ceiling leakage to the floor below.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">Wet &amp; Dry Zone Gradient (1:60)</strong>
                Keep the shower wet zone separated by a 10mm glass partition and maintain a 1:60 slope towards a tile-insert linear floor drain to avoid water pooling near the commode.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">Concealed Diverter &amp; Health Faucet</strong>
                Install high-flow single-lever diverters with concealed CPVC piping (Astral/Ashirvad SDR 11) and dedicate a solid brass health faucet point at 18-20" height next to the WC.
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40">
                <strong className="text-gray-900 dark:text-zinc-200 block mb-1">BWP Marine Ply Vanity</strong>
                Use strictly IS:710 Boiling Water Proof marine plywood for bathroom floating vanities with quartz tops to prevent fungal decay and warping in humid conditions.
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
                  Approximate Renovation Budget
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
                title="Unlock Itemized Bathroom Renovation BOQ"
                subtitle="View exact waterproofing costs, CP brass diverters, sanitaryware fixtures, glass enclosure, vanity counter, and plumbing labor."
                previewHeight="max-h-[220px]"
              >
                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Sunken Slab Waterproofing</span>
                      <span className="text-[10px] text-gray-500">2-Coat Elastomeric + 48-hr ponding test</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.waterproofingCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Wall Dado &amp; Floor Tiling</span>
                      <span className="text-[10px] text-gray-500">{breakdown.wallTileSqFt} sq ft dado + anti-skid floor &bull; Epoxy grout</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.tilingTotalCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Concealed CPVC &amp; Drainage</span>
                      <span className="text-[10px] text-gray-500">Astral SDR 11 hot/cold lines &bull; Chipping &amp; core cuts</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.plumbingPipingCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Sanitaryware Fixtures</span>
                      <span className="text-[10px] text-gray-500">Rimless wall-hung EWC &bull; Concealed slim tank &bull; Basin</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.sanitarywareCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">CP Brass Diverters &amp; Shower</span>
                      <span className="text-[10px] text-gray-500">Concealed 3-in-1 diverter, rain shower, spout &amp; health faucet</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.cpFittingsCost)}</span>
                  </div>

                  {breakdown.glassPartitionCost > 0 && (
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-zinc-100 block">Shower Glass Enclosure</span>
                        <span className="text-[10px] text-gray-500">{PARTITION_OPTIONS[partition].name}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.glassPartitionCost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">BWP Marine Ply Vanity Counter</span>
                      <span className="text-[10px] text-gray-500">Floating cabinet with quartz/granite counter</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.vanityCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Electrical, LED Mirror &amp; Exhaust</span>
                      <span className="text-[10px] text-gray-500">Backlit defogger mirror, 150mm exhaust &amp; geyser point</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.electricalCost)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-zinc-100 block">Plumbing &amp; Masonry Labor</span>
                      <span className="text-[10px] text-gray-500">Tile fixing, core cutting &amp; fixture commissioning</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{formatCurrency(breakdown.plumbingLabor)}</span>
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
