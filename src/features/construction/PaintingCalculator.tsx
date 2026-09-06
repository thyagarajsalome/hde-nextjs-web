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


const PAINT_TYPES = {
  distemper: { name: "Distemper (Economy)", rate: 22 },
  emulsion: { name: "Tractor Emulsion (Std)", rate: 38 },
  royal: { name: "Royal/Premium Emulsion", rate: 55 },
  texture: { name: "Texture Paint (Highlight)", rate: 120 },
};

const PROCESS_TYPES = {
  repaint: { name: "Repainting (Touchup + 2 Coats)", factor: 1.0 },
  fresh: { name: "Fresh Painting (Putty + Primer + 2 Coats)", factor: 1.6 },
};

const CHART_COLORS = ["#c5a059", "#5c473c", "#dfd0bf"];

const PaintingCalculator: React.FC = () => {
  const { hasPaid } = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("painting");
  const location = { state: null }; // TODO: Replace with useSearchParams if needed
  const resultsRef = useRef<HTMLDivElement>(null);

  const [carpetArea, setCarpetArea] = useState("");
  const [wallArea, setWallArea] = useState("");
  const [includeCeiling, setIncludeCeiling] = useState(true);
  const [paintType, setPaintType] = useState<keyof typeof PAINT_TYPES>("emulsion");
  const [process, setProcess] = useState<keyof typeof PROCESS_TYPES>("repaint");
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const area = parseFloat(carpetArea);
    if (!isNaN(area)) {
      const walls = area * 3;
      const ceiling = includeCeiling ? area : 0;
      setWallArea(Math.round(walls + ceiling).toString());
    }
  }, [carpetArea, includeCeiling]);

  useEffect(() => {
    if (location.state && (location.state as any).projectData) {
      const data = (location.state as any).projectData;
      if (data.paintType) {
        setCarpetArea(data.carpetArea);
        setPaintType(data.paintType);
      }
    } else {
      if (typeof window !== "undefined") {
        const sharedArea = window.localStorage.getItem("hde_shared_area");
        if (sharedArea && !carpetArea) setCarpetArea(sharedArea);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && carpetArea) {
      window.localStorage.setItem("hde_shared_area", carpetArea);
    }
  }, [carpetArea]);

  const calculateCost = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedArea = parseFloat(wallArea) || 0;
    const cost = parsedArea * PAINT_TYPES[paintType].rate * PROCESS_TYPES[process].factor;
    setTotalCost(cost);
  };

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
    const rows = [
      ["Paint Material", "45% of total", formatCurrency(totalCost * 0.45)],
      ["Putty & Primer", `${process === "fresh" ? "25%" : "10%"} of total`, formatCurrency(totalCost * (process === "fresh" ? 0.25 : 0.10))],
      ["Labor", `${process === "fresh" ? "30%" : "45%"} of total`, formatCurrency(totalCost * (process === "fresh" ? 0.30 : 0.45))],
    ];

    downloadSpreadsheetPDF(
      `Painting-Estimate-${carpetArea}sqft`, 
      ['Component', 'Allocation', 'Approx Cost'], 
      rows, 
      'TOTAL ESTIMATE', 
      formatCurrency(totalCost)
    );
  };

  const isLocked = !hasPaid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section>
        <Card title="Painting Estimator">
          <form onSubmit={calculateCost} className="space-y-6">
            <Input label="Carpet Area (sq.ft)" icon="fas fa-expand" type="number" value={carpetArea} onChange={(e) => setCarpetArea(e.target.value)} />
            <Input label="Total Paintable Area (Auto)" icon="fas fa-brush" type="number" value={wallArea} onChange={(e) => setWallArea(e.target.value)} />
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={includeCeiling} onChange={(e) => setIncludeCeiling(e.target.checked)} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer" />
                <span className="ml-3 text-gray-700 font-medium text-sm">Include Ceiling</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Paint Type</label>
              <select value={paintType} onChange={(e) => setPaintType(e.target.value as any)} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-semibold">
                {Object.entries(PAINT_TYPES).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Process</label>
              <select value={process} onChange={(e) => setProcess(e.target.value as any)} className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-semibold">
                {Object.entries(PROCESS_TYPES).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full py-3 bg-primary text-white dark:text-zinc-950 font-bold rounded-xl hover:bg-primary-hover transition-all shadow-md cursor-pointer">Calculate Painting Cost</button>
          </form>
        </Card>
      </section>

      {totalCost > 0 && (
        <section ref={resultsRef}>
          <Card title="Painting Estimate" className="border-primary/20">
            <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl mb-6">
              <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Estimated Cost</p>
              <h2 className="text-4xl font-extrabold text-secondary dark:text-zinc-100">{formatCurrency(totalCost)}</h2>
            </div>
            
            <div className="h-64 mb-6">
              <Chart data={{ "Paint Material": 45, "Putty & Primer": process === "fresh" ? 25 : 10, Labor: process === "fresh" ? 30 : 45 }} colors={CHART_COLORS} />
            </div>

            <div className="space-y-3">
              <WhatsAppShareButton
                title="House Painting Estimate"
                total={formatCurrency(totalCost)}
                details={[
                  { label: "Carpet Area", value: `${carpetArea} sq.ft` },
                  { label: "Paintable Area", value: `${wallArea} sq.ft` },
                  { label: "Paint Quality", value: PAINT_TYPES[paintType].name },
                  { label: "Process", value: PROCESS_TYPES[process].name },
                  { label: "Paint & Supplies", value: formatCurrency(totalCost * (process === "fresh" ? 0.70 : 0.55)) },
                  { label: "Labor Charges", value: formatCurrency(totalCost * (process === "fresh" ? 0.30 : 0.45)) },
                ]}
                className="w-full"
                buttonText="Share Painting Quote via WhatsApp"
              />

              {hasPaid ? (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleDownloadPDF} disabled={isDownloading} className="py-3 bg-white dark:bg-zinc-900 border-2 border-secondary dark:border-zinc-700 text-secondary dark:text-zinc-100 font-bold rounded-xl hover:bg-secondary dark:hover:bg-zinc-800 hover:text-white transition-all cursor-pointer">Download PDF</button>
                  <button onClick={handleSave} disabled={isSaving} className="py-3 bg-primary text-white dark:text-zinc-950 font-bold rounded-xl hover:bg-primary-hover transition-all cursor-pointer">Save Project</button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block">
                      🔒 Unlock Detailed Specs &amp; PDF Report
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-zinc-400">Save painting estimates to your dashboard and export PDF quotes.</span>
                  </div>
                  <a href="/upgrade" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap no-underline cursor-pointer">
                    Upgrade — ₹199
                  </a>
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
