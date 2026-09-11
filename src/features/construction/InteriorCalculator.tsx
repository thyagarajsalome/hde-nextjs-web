"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Chart from "../../components/ui/Chart";
import { formatCurrency } from "../../utils/currency";
import WhatsAppShareButton from "../../components/ui/WhatsAppShareButton";

interface InteriorCalculatorProps {
  hasPaid: boolean;
}

const QUALITY_RATES = {
  basic: {
    name: "Basic",
    rate: 800,
    description: "Essential furniture, basic finishes, and standard lighting.",
  },
  standard: {
    name: "Standard",
    rate: 1500,
    description: "Good quality materials, modular kitchen, wardrobes, and improved finishes.",
  },
  premium: {
    name: "Premium",
    rate: 2500,
    description: "High-end materials, custom furniture, advanced lighting, and luxury finishes.",
  },
};

const INTERIOR_BREAKDOWN = {
  "Modular Kitchen": 30,
  Wardrobes: 25,
  Furniture: 20,
  "False Ceiling & Lighting": 15,
  "Painting & Finishes": 10,
};

const CHART_COLORS = ["#c5a059", "#5c473c", "#8c776c", "#dfd0bf", "#ebdcd0"];

const InteriorCalculator: React.FC<InteriorCalculatorProps> = ({ hasPaid }) => {
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("interior");
  const location = { state: null }; // TODO: Replace with useSearchParams if needed
  const resultsRef = useRef<HTMLDivElement>(null);

  const [area, setArea] = useState("1200");
  const [quality, setQuality] = useState<keyof typeof QUALITY_RATES>("standard");

  useEffect(() => {
    if (location.state && (location.state as any).projectData) {
      const data = (location.state as any).projectData;
      if (data.area && data.quality && !data.doorCount) {
        setArea(data.area);
        if (data.quality in QUALITY_RATES) {
          setQuality(data.quality);
        } else {
          setQuality("standard");
        }
      }
    } else {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlArea = urlParams.get("area");
        const sharedArea = window.localStorage.getItem("hde_shared_area");
        const sharedQuality = window.localStorage.getItem("hde_shared_quality");
        if (urlArea && !isNaN(Number(urlArea)) && Number(urlArea) > 0) {
          setArea(urlArea);
        } else if (sharedArea) {
          setArea(sharedArea);
        }
        if (sharedQuality) {
          if (sharedQuality in QUALITY_RATES) {
            setQuality(sharedQuality as any);
          } else if (sharedQuality === "economy") {
            setQuality("basic");
          } else {
            setQuality("standard");
          }
        }
      }
    }
  }, []); // Run only on mount since location is a dummy object

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (area) window.localStorage.setItem("hde_shared_area", area);
      if (quality) window.localStorage.setItem("hde_shared_quality", quality);
    }
  }, [area, quality]);

  const parsedArea = parseFloat(area) || 0;
  const ratePreset = QUALITY_RATES[quality] || QUALITY_RATES.standard;
  const totalCost = parsedArea * ratePreset.rate;

  const handleSave = () => {
    saveProject({
      area,
      quality,
      breakdown: INTERIOR_BREAKDOWN 
    }, totalCost);
  };

  const handleDownloadPDF = () => {
    const rows = Object.entries(INTERIOR_BREAKDOWN).map(([component, percentage]) => {
      return [component, `${percentage}%`, formatCurrency((totalCost * percentage) / 100)];
    });

    downloadSpreadsheetPDF(
      `Interior-Estimate-${area}sqft`, 
      ['Component', 'Allocation', 'Approx Cost'], 
      rows, 
      'TOTAL ESTIMATE', 
      formatCurrency(totalCost)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <Card title="Interior Requirements">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <Input
              label="Total Built-up Area (sq. ft.)"
              icon="fas fa-ruler-combined"
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Quality of Finish</label>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(QUALITY_RATES).map(([key, { name, description }]) => (
                  <label 
                    key={key} 
                    className={`
                      relative flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${quality === key ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="quality"
                      value={key}
                      checked={quality === key}
                      onChange={() => setQuality(key as keyof typeof QUALITY_RATES)}
                      className="mt-1 w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="ml-3">
                      <span className={`block text-sm font-bold ${quality === key ? 'text-primary' : 'text-gray-900'}`}>
                        {name}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">{description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </Card>
      </section>

      <section ref={resultsRef}>
        {totalCost > 0 ? (
          <Card title="Interior Budget Estimate" className="border-primary/20 shadow-glow relative">
            <div className="text-center py-6">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Estimated Budget</p>
                <h2 className="text-4xl font-extrabold text-secondary tracking-tight">{formatCurrency(totalCost)}</h2>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Component</th>
                      <th className="px-4 py-3">Allocation</th>
                      <th className="px-4 py-3 text-right">Approx Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(INTERIOR_BREAKDOWN).map(([component, percentage]) => {
                      const cost = (totalCost * percentage) / 100;
                      return (
                        <tr key={component}>
                          <td className="px-4 py-3 font-medium">{component}</td>
                          <td className="px-4 py-3 text-gray-500">{percentage}%</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(cost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="h-64">
                <Chart data={INTERIOR_BREAKDOWN} colors={CHART_COLORS} />
              </div>

              <div className="space-y-3 mt-6">
                <WhatsAppShareButton
                  title="Interior Design Cost Estimate"
                  total={formatCurrency(totalCost)}
                  details={[
                    { label: "Built-up Area", value: `${area} sq.ft` },
                    { label: "Quality Package", value: `${ratePreset.name} (₹${ratePreset.rate}/sq.ft)` },
                    { label: "Modular Kitchen", value: formatCurrency((totalCost * 30) / 100) },
                    { label: "Wardrobes", value: formatCurrency((totalCost * 25) / 100) },
                    { label: "False Ceiling & Lighting", value: formatCurrency((totalCost * 15) / 100) },
                  ]}
                  className="w-full"
                  buttonText="Share Interior Estimate on WhatsApp"
                />

                {hasPaid ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-900 border-2 border-secondary dark:border-zinc-700 text-secondary dark:text-zinc-100 font-bold rounded-xl hover:bg-secondary dark:hover:bg-zinc-800 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      <i className={`fas ${isDownloading ? "fa-spinner fa-spin" : "fa-file-pdf"}`}></i>
                      <span>{isDownloading ? "Processing..." : "Download PDF"}</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white dark:text-zinc-950 font-bold rounded-xl hover:bg-primary-hover transition-all duration-300 shadow-float transform active:scale-95 cursor-pointer"
                    >
                      <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-save"}`}></i>
                      <span>{isSaving ? "Save" : "Save Project"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block">
                        🔒 Unlock Technical Specs &amp; PDF Report
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-zinc-400">Save projects to your dashboard and download professional client quotes.</span>
                    </div>
                    <a href="/upgrade" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap no-underline cursor-pointer">
                      Upgrade — ₹199
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
            <i className="fas fa-couch text-4xl mb-4 text-gray-300"></i>
            <p>Enter details to view estimate</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default InteriorCalculator;