"use client";
// src/features/construction/IndiaBorewellCalculator.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import Chart from "@/components/ui/Chart";
import { formatCurrency } from "@/utils/currency";
import { useProjectActions } from "@/hooks/useProjectActions";
import WhatsAppShareButton from "@/components/ui/WhatsAppShareButton";

interface CityPreset {
  name: string;
  defaultDepth: number;
  rockType: string;
  avgWaterTable: string;
  drillingRate: number;
  casingDepth: number;
}

const CITY_PRESETS: Record<string, CityPreset> = {
  bengaluru: {
    name: "Bengaluru (Karnataka)",
    defaultDepth: 950,
    rockType: "Granite & Gneiss (Hard Rock)",
    avgWaterTable: "750 - 1,100 ft",
    drillingRate: 95,
    casingDepth: 80,
  },
  hyderabad: {
    name: "Hyderabad (Telangana)",
    defaultDepth: 850,
    rockType: "Pink & Grey Granite (Very Hard)",
    avgWaterTable: "650 - 1,000 ft",
    drillingRate: 90,
    casingDepth: 70,
  },
  chennai: {
    name: "Chennai (Tamil Nadu)",
    defaultDepth: 450,
    rockType: "Coastal Clay / Weathered Charnockite",
    avgWaterTable: "300 - 600 ft",
    drillingRate: 85,
    casingDepth: 100,
  },
  coimbatore: {
    name: "Coimbatore / TN",
    defaultDepth: 800,
    rockType: "Hard Charnockite & Hornblende",
    avgWaterTable: "600 - 950 ft",
    drillingRate: 90,
    casingDepth: 60,
  },
  pune: {
    name: "Pune (Maharashtra)",
    defaultDepth: 550,
    rockType: "Basalt (Deccan Trap)",
    avgWaterTable: "400 - 750 ft",
    drillingRate: 85,
    casingDepth: 60,
  },
  delhi: {
    name: "Delhi NCR / Haryana",
    defaultDepth: 350,
    rockType: "Alluvial Sand & Quartzite Ridge",
    avgWaterTable: "200 - 450 ft",
    drillingRate: 80,
    casingDepth: 120,
  },
  custom: {
    name: "Other Indian Cities / Custom",
    defaultDepth: 700,
    rockType: "Mixed Geological Strata",
    avgWaterTable: "500 - 850 ft",
    drillingRate: 90,
    casingDepth: 70,
  },
};

const PUMP_BRANDS = [
  { name: "Texmo (Aquatex)", tagline: "Proven agricultural & residential durability" },
  { name: "CRI Pumps", tagline: "High-efficiency stainless steel impeller stages" },
  { name: "Kirloskar", tagline: "Heavy-duty copper winding & wide voltage range" },
  { name: "Crompton Greaves", tagline: "Energy efficient, ISI certified residential series" },
];

export default function IndiaBorewellCalculator() {
  const { isSaving, saveProject } = useProjectActions("india-borewell");

  const [selectedCity, setSelectedCity] = useState<string>("bengaluru");
  const [depth, setDepth] = useState<number>(950);
  const [casingDepth, setCasingDepth] = useState<number>(80);
  const [casingType, setCasingType] = useState<"ms" | "pvc">("ms");
  const [pumpHp, setPumpHp] = useState<number>(5);
  const [includePanel, setIncludePanel] = useState<boolean>(true);
  const [includeChamber, setIncludeChamber] = useState<boolean>(true);
  const [geologistFee, setGeologistFee] = useState<number>(3000);

  // Update depth & casing when city preset changes
  useEffect(() => {
    const preset = CITY_PRESETS[selectedCity];
    if (preset) {
      setDepth(preset.defaultDepth);
      setCasingDepth(preset.casingDepth);
      // Auto-size pump based on depth
      if (preset.defaultDepth > 900) setPumpHp(7.5);
      else if (preset.defaultDepth > 600) setPumpHp(5);
      else setPumpHp(3);
    }
  }, [selectedCity]);

  // Pricing Model
  const calculation = useMemo(() => {
    const preset = CITY_PRESETS[selectedCity] || CITY_PRESETS.custom;
    const drillingRate = preset.drillingRate;

    // 1. Drilling Charges (Slotted DTH rig)
    const drillingCost = depth * drillingRate;

    // 2. Casing Pipe (overburden loose soil protection)
    // MS 7" Heavy Duty @ ₹580/ft | PVC Class 4 @ ₹440/ft
    const casingRate = casingType === "ms" ? 580 : 440;
    const casingCost = casingDepth * casingRate;

    // 3. Submersible Pump Set
    let pumpCost = 28000;
    if (pumpHp === 5) pumpCost = 38000;
    if (pumpHp === 7.5) pumpCost = 49000;
    if (pumpHp >= 10) pumpCost = 62000;

    // 4. HDPE Column Delivery Pipe & Submersible Copper Cable
    // Pipe depth usually ~40 ft above borewell bottom to avoid silt intake
    const installationDepth = Math.max(100, depth - 40);
    // 1.25" / 1.5" 16kg/cm2 HDPE delivery pipe @ ₹75/ft
    const pipeCost = Math.round(installationDepth * 75);
    // 3-Core Finolex/Havells submersible flat cable @ ₹85/ft
    const cableCost = Math.round(installationDepth * 85);
    // SS Safety Wire Rope (prevents pump loss) @ ₹25/ft
    const safetyRopeCost = Math.round(installationDepth * 25);
    const pipingAndCablingCost = pipeCost + cableCost + safetyRopeCost;

    // 5. Control Panel & Protection
    // Digital cyclic timer, single-phase preventer, dry-run cut-off
    const controlPanelCost = includePanel ? (pumpHp >= 5 ? 7500 : 5500) : 0;

    // 6. Surface Cap, Earth Pit & Civil Chamber
    const chamberCost = includeChamber ? 7500 : 1500; // 1500 for heavy bore cap only

    // 7. Site Logistics, Geologist Survey & Transport
    const logisticsCost = geologistFee + 4000; // 4000 rig transportation/diesel base

    const totalCost =
      drillingCost +
      casingCost +
      pumpCost +
      pipingAndCablingCost +
      controlPanelCost +
      chamberCost +
      logisticsCost;

    const costPerFoot = Math.round(totalCost / depth);

    return {
      drillingCost,
      casingCost,
      pumpCost,
      pipingAndCablingCost,
      controlPanelCost,
      chamberCost,
      logisticsCost,
      totalCost,
      costPerFoot,
      installationDepth,
    };
  }, [selectedCity, depth, casingDepth, casingType, pumpHp, includePanel, includeChamber, geologistFee]);

  const chartData = {
    "Rig Drilling": calculation.drillingCost,
    "Casing Pipe": calculation.casingCost,
    "Submersible Pump": calculation.pumpCost,
    "Piping & Cable": calculation.pipingAndCablingCost,
    "Panel & Chamber": calculation.controlPanelCost + calculation.chamberCost,
    "Logistics/Survey": calculation.logisticsCost,
  };

  const handleSave = () => {
    saveProject(
      {
        city: CITY_PRESETS[selectedCity]?.name,
        depthFeet: depth,
        casingDepthFeet: casingDepth,
        casingType,
        pumpHp,
        breakdown: calculation,
      },
      calculation.totalCost
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f2042] via-[#1a3668] to-[#0f2042] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/20 px-2.5 py-1 rounded-md border border-[#c5a059]/40 inline-block">
              🏗️ Day-1 Site Preparation &amp; Groundwater Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Borewell Drilling &amp; Submersible Pump Cost Estimator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Calculate accurate turnkey costs for 6.5&quot; DTH rig drilling, MS/PVC casing pipes, CRI/Texmo submersible pumps, HDPE delivery column, and digital control panels across Indian cities.
            </p>
          </div>
          <div className="text-left md:text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Estimated Cost</span>
            <span className="text-2xl sm:text-3xl font-black text-[#c5a059]">
              {formatCurrency(calculation.totalCost)}
            </span>
            <span className="text-[11px] text-slate-300 block mt-0.5">
              ₹{calculation.costPerFoot} per foot all-inclusive
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <i className="fas fa-sliders text-[#c5a059]"></i>
              <span>1. Geological Location &amp; Depth Target</span>
            </h2>

            {/* City Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                City / Geological Region
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {Object.entries(CITY_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name} — Typical: {item.avgWaterTable}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Strata: {CITY_PRESETS[selectedCity]?.rockType}
              </p>
            </div>

            {/* Borewell Depth Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Target Drilling Depth (Feet)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={200}
                    max={1500}
                    step={25}
                    value={depth}
                    onChange={(e) => setDepth(Math.max(100, Number(e.target.value)))}
                    className="w-20 px-2 py-1 text-right text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                  <span className="font-bold text-slate-500 text-xs">ft</span>
                </div>
              </div>
              <input
                type="range"
                min={200}
                max={1500}
                step={25}
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full accent-[#0f2042] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>200 ft (Shallow)</span>
                <span>800 ft (Metro Avg)</span>
                <span>1,500 ft (Deep Rocky)</span>
              </div>
            </div>

            {/* Casing Pipe Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Topsoil Casing Depth (Feet)
                </label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={casingDepth}
                  onChange={(e) => setCasingDepth(Math.max(10, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                />
                <span className="text-[10px] text-slate-500 block">
                  Depth before hitting solid bedrock (prevents silt collapse)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Casing Material
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCasingType("ms")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      casingType === "ms"
                        ? "bg-[#0f2042] text-[#c5a059] border-[#c5a059]"
                        : "bg-slate-50 dark:bg-zinc-800 text-slate-600 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    MS Heavy (₹580/ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCasingType("pvc")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      casingType === "pvc"
                        ? "bg-[#0f2042] text-[#c5a059] border-[#c5a059]"
                        : "bg-slate-50 dark:bg-zinc-800 text-slate-600 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    PVC Heavy (₹440/ft)
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Submersible Pump & Electrical Specification */}
          <Card className="p-6 space-y-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <i className="fas fa-faucet-drip text-[#c5a059]"></i>
              <span>2. Submersible Motor &amp; Piping Set</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { hp: 3, label: "3 HP Multi-Stage", bestFor: "Up to 600 ft depth" },
                { hp: 5, label: "5 HP Multi-Stage", bestFor: "600 - 1,000 ft (Popular)" },
                { hp: 7.5, label: "7.5 HP Heavy", bestFor: "1,000 ft+ deep wells" },
              ].map((item) => (
                <button
                  key={item.hp}
                  type="button"
                  onClick={() => setPumpHp(item.hp)}
                  className={`p-3 rounded-xl border text-left transition ${
                    pumpHp === item.hp
                      ? "bg-[#0f2042] text-white border-amber-500 shadow-sm"
                      : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300"
                  }`}
                >
                  <span className="block text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.bestFor}</span>
                </button>
              ))}
            </div>

            {/* Recommended Brands Pill Strip */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Recommended ISI Certified Indian Pump Brands:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PUMP_BRANDS.map((b) => (
                  <span
                    key={b.name}
                    className="text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700"
                  >
                    ★ {b.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includePanel}
                  onChange={(e) => setIncludePanel(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                    Digital Starter Panel with Dry-Run &amp; Cyclic Timer (+₹{pumpHp >= 5 ? "7,500" : "5,500"})
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    Prevents motor burnout if water table drops during continuous pumping.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeChamber}
                  onChange={(e) => setIncludeChamber(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                    Borewell Civil Chamber &amp; Sanitary Locking Cover (+₹7,500)
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    Concrete brick masonry pit with lockable cast iron cover to stop surface runoff from entering well.
                  </span>
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white dark:bg-zinc-900 border-2 border-[#c5a059]/40 shadow-lg rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-file-invoice-dollar text-[#c5a059]"></i>
                Turnkey Borewell BOQ
              </h3>
              <span className="text-[10px] font-black uppercase text-[#0f2042] bg-[#c5a059] px-2 py-0.5 rounded">
                6.5&quot; Bore
              </span>
            </div>

            {/* Line Item Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  DTH Rig Drilling ({depth} ft @ ₹{CITY_PRESETS[selectedCity]?.drillingRate}/ft)
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(calculation.drillingCost)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  {casingType.toUpperCase()} Casing Pipe ({casingDepth} ft)
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(calculation.casingCost)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  Submersible Pump ({pumpHp} HP ISI Motor)
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(calculation.pumpCost)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  HDPE Column ({calculation.installationDepth} ft) + 3-Core Cable
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(calculation.pipingAndCablingCost)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  Digital Panel &amp; Masonry Chamber
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(calculation.controlPanelCost + calculation.chamberCost)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  Geologist Survey &amp; Rig Transportation
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(calculation.logisticsCost)}
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-black text-slate-900 dark:text-zinc-100">
                <span>Grand Total:</span>
                <span className="text-lg text-[#0f2042] dark:text-[#c5a059] font-mono">
                  {formatCurrency(calculation.totalCost)}
                </span>
              </div>
            </div>

            {/* Donut Cost Chart */}
            <div className="pt-2">
              <Chart data={chartData} colors={["#0f2042", "#c5a059", "#2563eb", "#10b981", "#8b5cf6", "#f59e0b"]} />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#0f2042] hover:bg-[#1a3668] text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-bookmark text-[#c5a059]"></i>
                <span>{isSaving ? "Saving..." : "Save Borewell Estimate to Profile"}</span>
              </button>

              <div className="flex gap-2">
                <WhatsAppShareButton
                  title={`Borewell Drilling Estimate for ${CITY_PRESETS[selectedCity]?.name} (${depth} ft): ${formatCurrency(calculation.totalCost)}`}
                  url={typeof window !== "undefined" ? window.location.href : "https://www.homedesignenglish.com"}
                  className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-2"
                />
              </div>
            </div>
          </Card>

          {/* Expert Field Advice Box */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
            <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <i className="fas fa-lightbulb"></i>
              Borewell Drilling Field Tips:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-200/90">
              <li>
                <strong>Rainwater Recharge:</strong> Direct your rooftop terrace water through a 3-stage sand filter into a recharge pit to recharge your borewell aquifer.
              </li>
              <li>
                <strong>Casing Seating:</strong> Ensure the driller embeds the casing at least 5–10 feet firmly inside solid granite/basalt rock to prevent sand collapsing into the pump.
              </li>
              <li>
                <strong>Flushing:</strong> Blow air with the compressor for at least 60–90 minutes after drilling until completely clear water emerges before installing the pump.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
