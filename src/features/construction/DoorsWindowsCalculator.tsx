"use client";
// src/features/construction/DoorsWindowsCalculator.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useProjectActions } from "../../hooks/useProjectActions";
import { formatCurrency } from "../../utils/currency";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import WhatsAppShareButton from "../../components/ui/WhatsAppShareButton";

interface DoorsWindowsCalculatorProps {
  hasPaid?: boolean;
}

const doorTypes = {
  flush: { name: "Flush Door (Laminate)", rate: 7000, desc: "Standard waterproof flush door with 1mm laminate" },
  panel: { name: "Panel Door (Moulded)", rate: 10000, desc: "Decorative moulded panel door for bedrooms" },
  teak: { name: "Teak Wood (Main Door)", rate: 40000, desc: "Solid teak wood door with heavy carved frame" },
};

const windowTypes = {
  aluminum: { name: "Aluminum Frame (Powder Coated)", rate: 450, desc: "Budget sliding window with 5mm clear glass" },
  upvc: { name: "UPVC Frame (Soundproof)", rate: 600, desc: "Multi-chamber UPVC profile with 6mm toughened glass" },
  wood: { name: "Wooden Frame (Hardwood)", rate: 1200, desc: "Traditional solid wood frame with brass fittings" },
};

const CHART_COLORS = ["#d97706", "#2563eb", "#10b981"];

const DoorsWindowsCalculator: React.FC<DoorsWindowsCalculatorProps> = ({ hasPaid }) => {
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("doors-windows");

  const [doorCount, setDoorCount] = useState("6");
  const [doorType, setDoorType] = useState<keyof typeof doorTypes>("flush");
  const [windowCount, setWindowCount] = useState("5");
  const [windowWidth, setWindowWidth] = useState("5");
  const [windowHeight, setWindowHeight] = useState("4");
  const [windowType, setWindowType] = useState<keyof typeof windowTypes>("upvc");
  const [includeHardware, setIncludeHardware] = useState(true);

  // Sync to/from localStorage for builder funnel connection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sharedArea = window.localStorage.getItem("hde_shared_area");
      if (sharedArea) {
        const areaNum = parseFloat(sharedArea) || 0;
        if (areaNum > 0) {
          setDoorCount(Math.max(3, Math.round(areaNum / 200)).toString());
          setWindowCount(Math.max(3, Math.round(areaNum / 250)).toString());
        }
      }
    }
  }, []);

  const { doorCost, windowCost, hardwareCost, totalCost, totalWindowArea } = useMemo(() => {
    const numDoors = parseInt(doorCount) || 0;
    const dCost = numDoors * doorTypes[doorType].rate;

    const numWindows = parseInt(windowCount) || 0;
    const width = parseFloat(windowWidth) || 0;
    const height = parseFloat(windowHeight) || 0;
    const wArea = numWindows * width * height;
    const wCost = Math.round(wArea * windowTypes[windowType].rate);

    // Standard high-quality locks, brass/SS hinges, tower bolts, door stoppers allowance
    const hwCost = includeHardware ? (numDoors * 2500 + numWindows * 600) : 0;
    const tot = dCost + wCost + hwCost;

    return {
      doorCost: dCost,
      windowCost: wCost,
      hardwareCost: hwCost,
      totalCost: tot,
      totalWindowArea: wArea,
    };
  }, [doorCount, doorType, windowCount, windowWidth, windowHeight, windowType, includeHardware]);

  const chartData: Record<string, number> = useMemo(() => {
    if (totalCost <= 0) return {} as Record<string, number>;
    const data: Record<string, number> = {
      [`Doors (${doorCount} units)`]: doorCost,
      [`Windows (${windowCount} units)`]: windowCost,
    };
    if (hardwareCost > 0) {
      data["Hardware & Mortise Locks"] = hardwareCost;
    }
    return data;
  }, [totalCost, doorCount, doorCost, windowCount, windowCost, hardwareCost]);

  const handleDownloadPDF = () => {
    const rows: [string, string, string, string][] = [
      ["Doors Package", `${doorCount} units (${doorTypes[doorType].name})`, `₹${doorTypes[doorType].rate}/unit`, formatCurrency(doorCost)],
      ["Windows Package", `${windowCount} units (${totalWindowArea} sq.ft total)`, `₹${windowTypes[windowType].rate}/sq.ft`, formatCurrency(windowCost)],
    ];

    if (hardwareCost > 0) {
      rows.push(["Hardware & Ironmongery", `${doorCount} mortise locks + SS hinges`, "Godrej / Europa spec", formatCurrency(hardwareCost)]);
    }

    downloadSpreadsheetPDF(
      `Doors-Windows-Estimate`,
      ["Component", "Takeoff Details", "Rate Spec", "Estimated Cost"],
      rows,
      "TOTAL ESTIMATED BUDGET",
      formatCurrency(totalCost)
    );
  };

  const handleSave = () => {
    if (totalCost > 0) {
      saveProject(
        {
          doorCount,
          doorType,
          windowCount,
          windowWidth,
          windowHeight,
          windowType,
          includeHardware,
          doorCost,
          windowCost,
          hardwareCost,
        },
        totalCost
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* LEFT COLUMN: Inputs & Selection */}
      <section className="space-y-6">
        <Card title="🚪 Doors & Windows Estimator">
          <div className="space-y-6">
            {/* Doors Section */}
            <div className="p-4 bg-gray-50/80 dark:bg-zinc-800/40 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-700 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-door-closed text-[#c5a059]"></i>
                  <span>Doors Specification</span>
                </h4>
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                  ₹{doorTypes[doorType].rate.toLocaleString()}/door
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Number of Doors"
                  icon="fas fa-hashtag"
                  type="number"
                  min="1"
                  value={doorCount}
                  onChange={(e) => setDoorCount(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Door Material &amp; Type
                  </label>
                  <select
                    value={doorType}
                    onChange={(e) => setDoorType(e.target.value as keyof typeof doorTypes)}
                    className="w-full p-3 border-2 border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 text-sm focus:border-primary outline-none"
                  >
                    {Object.entries(doorTypes).map(([key, { name }]) => (
                      <option key={key} value={key} className="dark:bg-zinc-950">
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500">{doorTypes[doorType].desc}</p>
            </div>

            {/* Windows Section */}
            <div className="p-4 bg-gray-50/80 dark:bg-zinc-800/40 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-700 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-table-cells-large text-blue-500"></i>
                  <span>Windows Specification</span>
                </h4>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                  ₹{windowTypes[windowType].rate}/sq.ft
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Total Windows"
                  icon="fas fa-hashtag"
                  type="number"
                  min="1"
                  value={windowCount}
                  onChange={(e) => setWindowCount(e.target.value)}
                />
                <Input
                  label="Avg Width (ft)"
                  icon="fas fa-arrows-left-right"
                  type="number"
                  step="0.5"
                  value={windowWidth}
                  onChange={(e) => setWindowWidth(e.target.value)}
                />
                <Input
                  label="Avg Height (ft)"
                  icon="fas fa-arrows-up-down"
                  type="number"
                  step="0.5"
                  value={windowHeight}
                  onChange={(e) => setWindowHeight(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Window Profile &amp; Frame
                </label>
                <select
                  value={windowType}
                  onChange={(e) => setWindowType(e.target.value as keyof typeof windowTypes)}
                  className="w-full p-3 border-2 border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 text-sm focus:border-primary outline-none"
                >
                  {Object.entries(windowTypes).map(([key, { name }]) => (
                    <option key={key} value={key} className="dark:bg-zinc-950">
                      {name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5">{windowTypes[windowType].desc}</p>
              </div>
            </div>

            {/* Hardware Toggle */}
            <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-800">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHardware}
                  onChange={(e) => setIncludeHardware(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                />
                <div className="ml-3">
                  <span className="text-gray-800 dark:text-zinc-200 font-semibold text-xs block">
                    Include Mortise Locks, Heavy SS Hinges &amp; Tower Bolts
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 block">
                    Godrej/Europa cylindrical mortise locks (₹2,500/door) + window fasteners (₹600/window)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </Card>
      </section>

      {/* RIGHT COLUMN: Results & Infographic Donut Chart Wheel */}
      <section className="space-y-6">
        <Card title="📊 Cost Breakdown & Infographic">
          <div>
            {/* Total Banner */}
            <div className="text-center py-6 bg-gradient-to-b from-[#c5a059]/10 to-transparent rounded-2xl border border-[#c5a059]/20 mb-6">
              <p className="text-gray-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
                Total Estimated Doors &amp; Windows Cost
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-secondary dark:text-zinc-100 tracking-tight">
                {formatCurrency(totalCost)}
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
                Includes <strong className="text-gray-800 dark:text-zinc-200">{doorCount} Doors</strong> +{" "}
                <strong className="text-gray-800 dark:text-zinc-200">{windowCount} Windows ({totalWindowArea} sq.ft)</strong>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-gray-200/70 dark:border-zinc-800 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Doors Cost</span>
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono block mt-0.5">
                    {formatCurrency(doorCost)}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold">
                    {totalCost > 0 ? `${Math.round((doorCost / totalCost) * 100)}%` : "0%"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] text-gray-400 block font-semibold">Windows Cost</span>
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 font-mono block mt-0.5">
                    {formatCurrency(windowCost)}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold">
                    {totalCost > 0 ? `${Math.round((windowCost / totalCost) * 100)}%` : "0%"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-gray-400 block font-semibold">Hardware &amp; Locks</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono block mt-0.5">
                    {formatCurrency(hardwareCost)}
                  </span>
                  <span className="text-[9px] text-gray-500 font-bold">
                    {totalCost > 0 ? `${Math.round((hardwareCost / totalCost) * 100)}%` : "0%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Material Takeoff Badges */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 mb-6">
              <h4 className="text-xs font-black text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i className="fas fa-boxes-stacked text-[#c5a059]"></i>
                <span>Specification Takeoff Summary</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Doors</span>
                  <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300 mt-0.5 block">
                    {doorCount} Sets
                  </span>
                  <span className="text-[10px] text-gray-400 block truncate">{doorTypes[doorType].name}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Glazing Area</span>
                  <span className="text-base sm:text-lg font-black text-blue-800 dark:text-blue-300 mt-0.5 block">
                    {totalWindowArea} sq.ft
                  </span>
                  <span className="text-[10px] text-gray-400 block">{windowCount} Window Units</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Ironmongery</span>
                  <span className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                    {doorCount} Locks
                  </span>
                  <span className="text-[10px] text-gray-400 block">{includeHardware ? "Included" : "Excluded"}</span>
                </div>
              </div>
            </div>

            {/* Actions: WhatsApp Share, PDF Download, Save */}
            <div className="space-y-3.5 pt-2">
              <WhatsAppShareButton
                title="Doors & Windows Estimate"
                total={formatCurrency(totalCost)}
                details={[
                  { label: "Total Doors", value: `${doorCount} units (${doorTypes[doorType].name})` },
                  { label: "Total Windows", value: `${windowCount} units (${windowTypes[windowType].name})` },
                  { label: "Total Window Area", value: `${totalWindowArea} sq.ft` },
                  { label: "Hardware & Locks", value: includeHardware ? "Included" : "Excluded" },
                ]}
                variant="primary"
                buttonText="Share on WhatsApp"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading || totalCost <= 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-100 transition cursor-pointer disabled:opacity-50"
                >
                  <i className={`fas ${isDownloading ? "fa-spinner fa-spin" : "fa-file-pdf"} text-red-500`}></i>
                  <span>Download BOQ PDF</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving || totalCost <= 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-secondary hover:bg-secondary/90 text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-floppy-disk"} text-primary`}></i>
                  <span>Save Estimate</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DoorsWindowsCalculator;