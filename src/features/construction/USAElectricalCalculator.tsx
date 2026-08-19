"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import Chart from "../../components/ui/Chart";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { formatCurrency } from "../../utils/currency";

// ── Constants ──────────────────────────────────────────────────────────────────
const POINT_RATES = { light: 150, fan: 200, power: 180, panel: 3000 };

const QUALITY_OPTIONS = {
  basic:   { name: "Basic (Leviton/Eaton)",             factor: 1.0 },
  premium: { name: "Premium (Lutron/Square D)",         factor: 1.5 },
  smart:   { name: "Smart Home (Caseta / WiFi Swiches)",factor: 2.8 },
};

const CHART_COLORS = ["#c5a059", "#0f2042", "#5c473c", "#dfd0bf"];

const WIRING_TYPES = [
  { type: "Romex (NM-B)",   size: "14 AWG / 12 AWG", brand: "Southwire / Cerrowire", use: "Standard interior wiring", note: "Non-metallic sheathed cable. The standard for US homes." },
  { type: "THHN / THWN",    size: "Various",         brand: "Southwire",             use: "Conduit wiring",           note: "Individual insulated wires used inside EMT or PVC conduit." },
  { type: "UF-B",           size: "14 AWG / 12 AWG", brand: "Southwire",             use: "Underground / Outdoor",    note: "Underground Feeder cable. Direct burial rated." },
];

const SAFETY_TIPS = [
  { icon: "fas fa-plug",         color: "text-red-500",    tip: "Use GFCI outlets in kitchens, bathrooms, garages, and outdoors. Required by NEC." },
  { icon: "fas fa-bolt",         color: "text-orange-500", tip: "Use AFCI breakers for living areas and bedrooms to prevent electrical fires from arcing." },
  { icon: "fas fa-shield-alt",   color: "text-blue-500",   tip: "Always use 12 AWG wire for 20-amp circuits (kitchen, bath) and 14 AWG for 15-amp lighting." },
  { icon: "fas fa-fire",         color: "text-red-600",    tip: "Never splice wires outside of a junction box. All boxes must remain accessible." },
  { icon: "fas fa-home",         color: "text-green-500",  tip: "Install interconnected smoke and CO detectors on every level and inside every bedroom." },
];

const LOAD_GUIDE = [
  { appliance: "LED Lighting",          current: "< 1A",  circuit: "15A (120V)", qty: "Multiple per circuit" },
  { appliance: "Standard Outlet",       current: "N/A",   circuit: "15A (120V)", qty: "6–10 per circuit" },
  { appliance: "Kitchen / Bath Recept", current: "N/A",   circuit: "20A (120V)", qty: "Max 2-3 per circuit" },
  { appliance: "Microwave",             current: "12A",   circuit: "20A Dedicated", qty: "1 per circuit" },
  { appliance: "Refrigerator",          current: "3-6A",  circuit: "15A Dedicated", qty: "1 per circuit" },
  { appliance: "Electric Range",        current: "40-50A",circuit: "50A (240V)", qty: "1 per circuit" },
  { appliance: "HVAC (Central AC)",     current: "20-40A",circuit: "30-50A (240V)", qty: "1 per circuit" },
  { appliance: "EV Charger (Level 2)",  current: "32-48A",circuit: "50-60A (240V)", qty: "1 per circuit" },
];

// ── Component ──────────────────────────────────────────────────────────────────
const USAElectricalCalculator: React.FC = () => {
  const { hasPaid }  = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-electrical");

  const [lightPoints, setLightPoints] = useState("20");
  const [fanPoints,   setFanPoints]   = useState("4");
  const [powerPoints, setPowerPoints] = useState("30"); // Outlets
  const [quality,     setQuality]     = useState<keyof typeof QUALITY_OPTIONS>("basic");
  const [dedicated240, setDedicated240] = useState("2"); // Range, Dryer, EV
  const [gfciPoints,  setGfciPoints]  = useState("6");
  const [activeTab,   setActiveTab]   = useState<"result"|"wiring"|"load"|"safety">("result");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sharedArea = window.localStorage.getItem("hde_shared_area");
      if (sharedArea) {
        const areaNum = parseFloat(sharedArea) || 0;
        if (areaNum > 0) {
          setLightPoints(Math.max(10, Math.round(areaNum / 60)).toString());
          setPowerPoints(Math.max(10, Math.round(areaNum / 40)).toString());
          setFanPoints(Math.max(2, Math.round(areaNum / 300)).toString());
          setDedicated240(Math.max(1, Math.round(areaNum / 1000)).toString());
          setGfciPoints(Math.max(2, Math.round(areaNum / 300)).toString());
        }
      }
    }
  }, []);

  const calc = useMemo(() => {
    const lCount = parseInt(lightPoints) || 0;
    const fCount = parseInt(fanPoints)   || 0;
    const pCount = parseInt(powerPoints) || 0;
    const dCount = parseInt(dedicated240)|| 0;
    const gCount = parseInt(gfciPoints)  || 0;
    const option = QUALITY_OPTIONS[quality] || QUALITY_OPTIONS.basic;
    const factor = option.factor;

    const lightCost   = lCount * POINT_RATES.light  * factor;
    const fanCost     = fCount * POINT_RATES.fan    * factor;
    const powerCost   = pCount * POINT_RATES.power  * factor;
    const dedCost     = dCount * 500                * factor;  // 240V dedicated runs
    const gfciCost    = gCount * 220                * factor;
    const panelCost   = POINT_RATES.panel; // 200A panel
    const total       = lightCost + fanCost + powerCost + dedCost + gfciCost + panelCost;

    return { lightCost, fanCost, powerCost, dedCost, gfciCost, panelCost, total, lCount, fCount, pCount, dCount, gCount };
  }, [lightPoints, fanPoints, powerPoints, dedicated240, gfciPoints, quality]);

  const isLocked = !hasPaid;

  const handleSave = () => {
    if (calc.total > 0) saveProject({ lightPoints, fanPoints, powerPoints, dedicated240, gfciPoints, quality, breakdown: calc }, calc.total);
  };

  const handleDownloadPDF = () => {
    const rows: [string,string,string][] = [
      ["Light Fixtures / Switches", `${calc.lCount} pts`, formatCurrency(calc.lightCost)],
      ["Ceiling Fans",              `${calc.fCount} pts`, formatCurrency(calc.fanCost)],
      ["Standard Outlets (15A/20A)",`${calc.pCount} pts`, formatCurrency(calc.powerCost)],
      ["GFCI Outlets (Kitchen/Bath)",`${calc.gCount} pts`, formatCurrency(calc.gfciCost)],
      ["Dedicated 240V Circuits",   `${calc.dCount} pts`, formatCurrency(calc.dedCost)],
      ["200-Amp Panel Upgrade",     "1 set",              formatCurrency(calc.panelCost)],
    ];
    downloadSpreadsheetPDF(`Electrical-Estimate-USA`, ["Component","Quantity","Cost"], rows, "TOTAL ESTIMATE", formatCurrency(calc.total));
  };

  const fields = [
    { label: "Light Fixtures & Switches", icon: "far fa-lightbulb", val: lightPoints, set: setLightPoints, hint: "Recessed, pendants, etc." },
    { label: "Standard Outlets (120V)",   icon: "fas fa-plug",       val: powerPoints, set: setPowerPoints, hint: "Living, beds" },
    { label: "GFCI Outlets",              icon: "fas fa-shield-alt", val: gfciPoints,  set: setGfciPoints,  hint: "Kitchens, baths, exterior" },
    { label: "Ceiling Fans",              icon: "fas fa-fan",        val: fanPoints,   set: setFanPoints,   hint: "Bedrooms, living" },
    { label: "Dedicated 240V Circuits",   icon: "fas fa-bolt",       val: dedicated240,set: setDedicated240, hint: "Range, Dryer, EV" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ── Left ── */}
      <div className="space-y-5">
        <Card title="⚡ Electrical Estimator (USA)">
          {isLocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold text-center">
              <i className="fas fa-lock mr-2"></i> Upgrade to Pro for the full electrical estimator.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${f.icon} text-primary`}></i>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">{f.label} <span className="text-gray-400 font-normal">({f.hint})</span></label>
                  <input type="number" value={f.val} onChange={e => f.set(e.target.value)} min="0" disabled={isLocked}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-primary outline-none bg-white disabled:bg-gray-50" />
                </div>
              </div>
            ))}
          </div>

          {/* Quality */}
          <div className="mt-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">Switch & Device Quality</label>
            <div className="space-y-2">
              {Object.entries(QUALITY_OPTIONS).map(([k, v]) => (
                <label key={k} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${quality === k ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="eq" value={k} checked={quality === k} onChange={() => setQuality(k as any)} disabled={isLocked} className="text-primary" />
                  <span className="text-sm font-semibold text-gray-800">{v.name}</span>
                  <span className="ml-auto text-xs text-gray-400">×{v.factor.toFixed(1)}</span>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Wiring Guide */}
        <Card title="🔌 Wiring Reference">
          <div className="space-y-3">
            {WIRING_TYPES.map((w, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">{w.type}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{w.size}</span>
                </div>
                <p className="text-xs text-primary font-medium mb-1">{w.brand}</p>
                <p className="text-xs text-gray-500">{w.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Right ── */}
      <div className="space-y-5">
        {calc.total > 0 ? (
          <>
            {/* Tab Switcher */}
            <div className="flex gap-2 flex-wrap">
              {(["result","load","safety"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? "bg-secondary text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                  {tab === "result" ? "💰 Cost Estimate" : tab === "load" ? "🔋 Load Guide" : "🛡 Safety Rules"}
                </button>
              ))}
            </div>

            {activeTab === "result" && (
          <Card title="Electrical Estimate" className="border-primary/20">
                <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Electrical Estimate</p>
                  <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(calc.total)}</h2>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-100 mb-5">
                  <table className="w-full text-sm min-w-0">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2 text-left">Component</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { label: "Light Fixtures",      qty: `${calc.lCount} pts`, cost: calc.lightCost },
                        { label: "Ceiling Fans",        qty: `${calc.fCount} pts`, cost: calc.fanCost   },
                        { label: "Standard Outlets",    qty: `${calc.pCount} pts`, cost: calc.powerCost },
                        { label: "GFCI Outlets",        qty: `${calc.gCount} pts`, cost: calc.gfciCost},
                        { label: "240V Dedicated",      qty: `${calc.dCount} pts`, cost: calc.dedCost    },
                        { label: "200A Panel & Breakers",qty: "1 set",             cost: calc.panelCost  },
                      ].map((r, i) => (
                        <tr key={i}><td className="px-4 py-2">{r.label}</td><td className="px-4 py-2 text-center text-gray-500">{r.qty}</td><td className="px-4 py-2 text-right font-semibold">{formatCurrency(r.cost)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="h-52 mb-5">
                  <Chart data={{ "Wiring (Romex)": calc.total * 0.30, "Devices/Trim": calc.total * 0.25, "Labor & Permits": calc.total * 0.35, "Panel/Breakers": calc.total * 0.10 }} colors={CHART_COLORS} />
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                  <i className="fas fa-info-circle mr-1 text-primary"></i> Estimate covers wiring, standard devices, panel upgrade, and labor. Excludes high-end fixtures and smart home automation systems unless Premium/Smart is selected.
                </div>
                {hasPaid && (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-900 border-2 border-secondary dark:border-zinc-700 text-secondary dark:text-zinc-100 font-bold rounded-xl hover:bg-secondary dark:hover:bg-zinc-800 hover:text-white transition-all">
                      <i className={`fas ${isDownloading ? "fa-spinner fa-spin" : "fa-file-pdf"}`}></i> PDF
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-zinc-950 font-bold rounded-xl hover:bg-primary-hover transition-all">
                      <i className={`fas ${isSaving ? "fa-spinner fa-spin" : "fa-save"}`}></i> Save
                    </button>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "load" && (
              <Card title="Appliance Load Reference">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold">
                      <tr>
                        <th className="px-3 py-2 text-left">Appliance</th>
                        <th className="px-3 py-2 text-right">Current</th>
                        <th className="px-3 py-2 text-right">Circuit</th>
                        <th className="px-3 py-2 text-right hidden sm:table-cell">Capacity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {LOAD_GUIDE.map((l, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-800">{l.appliance}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{l.current}</td>
                          <td className="px-3 py-2 text-right"><span className="bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded text-xs">{l.circuit}</span></td>
                          <td className="px-3 py-2 text-right text-gray-400 hidden sm:table-cell">{l.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === "safety" && (
              <Card title="Electrical Safety Rules (NEC)">
                <div className="space-y-3">
                  {SAFETY_TIPS.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <i className={`${s.icon} ${s.color} mt-0.5 flex-shrink-0`}></i>
                      <p className="text-xs text-gray-700 leading-relaxed">{s.tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400 min-h-[400px]">
            <i className="fas fa-bolt text-4xl mb-4 text-gray-300"></i>
            <p className="font-medium">Enter point counts to view estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USAElectricalCalculator;
