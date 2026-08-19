"use client";
import React, { useState, useEffect, useMemo } from "react";
import Chart from "../../components/ui/Chart";
import { useUser } from "../../context/UserContext";
import { useProjectActions } from "../../hooks/useProjectActions";
import { Card } from "../../components/ui/Card";
import { formatCurrency as formatCurrencyOrig } from '../../utils/currency';
const formatCurrency = (val: number) => formatCurrencyOrig(val, 'US');

// ── Constants ──────────────────────────────────────────────────────────────────
const UNIT_RATES = {
  kitchen:    { name: "Kitchen (Sink + Faucet + Disposer)", rate: 1200 },
  commonBath: { name: "Full Bathroom (Standard)",           rate: 3500 },
  masterBath: { name: "Master Bathroom (Premium)",          rate: 6500 },
  waterHeater:{ name: "Water Heater (Tank/Tankless)",       rate: 1500 },
};

const QUALITY_OPTIONS = {
  builder:  { name: "Builder Grade (Delta/Moen Basic)", factor: 0.8 },
  standard: { name: "Standard (Kohler/Moen)",           factor: 1.0 },
  premium:  { name: "Premium (Hansgrohe/Brizo)",        factor: 1.8 },
};

const CHART_COLORS = ["#c5a059", "#0f2042", "#5c473c"];

const PIPE_TYPES = [
  { type: "PEX Tubing",   brand: "Uponor / SharkBite / Zurn", size: "1/2\" to 1\"", use: "Hot & cold water supply lines", note: "Flexible, freeze-resistant, fast installation. Industry standard for residential." },
  { type: "Copper Pipe",  brand: "Cerro / Mueller",           size: "1/2\" to 1\"", use: "Hot & cold water supply (Type L/M)", note: "Durable, biostatic (resists bacteria). Expensive and labor-intensive." },
  { type: "PVC / ABS",    brand: "Charlotte Pipe / JM Eagle", size: "1-1/2\" to 4\"", use: "Drain, Waste, and Vent (DWV)", note: "White PVC or black ABS. Standard for all interior drainage and venting." },
  { type: "CPVC",         brand: "FlowGuard Gold",            size: "1/2\" to 1\"", use: "Hot & cold water supply", note: "Rigid plastic, handles high temperatures. Less common now than PEX." },
  { type: "Cast Iron",    brand: "Charlotte Pipe",            size: "2\" to 4\"", use: "Vertical stacks, main drains", note: "Extremely quiet drainage. Often used in high-end homes for noise reduction." },
];

const FIXTURE_BRANDS = [
  { category: "Economy",  brands: ["Glacier Bay", "Project Source", "Peerless"],      range: "$200–$500 per bathroom set"  },
  { category: "Mid-Range",brands: ["Moen", "Delta", "Kohler", "American Standard"],    range: "$600–$1,500 per bathroom set" },
  { category: "Premium",  brands: ["Hansgrohe", "Brizo", "Kallista", "Waterstone"],    range: "$2,000–$5,000+ per bathroom" },
];

const WATER_TIPS = [
  { icon: "fas fa-tint-slash",   title: "WaterSense Toilets",     body: "Use 1.28 gallons per flush (GPF) or less, saving about 13,000 gallons of water per year." },
  { icon: "fas fa-shower",       title: "Low-flow Showerheads",   body: "WaterSense labeled showerheads use no more than 2.0 GPM, providing a satisfying shower while saving water and energy." },
  { icon: "fas fa-faucet",       title: "Faucet Aerators",        body: "Install 1.5 GPM aerators on bathroom sinks. Simple upgrade that significantly reduces water waste." },
  { icon: "fas fa-thermometer",  title: "Tankless Water Heaters", body: "Heat water on demand. More energy efficient than traditional tank heaters and provide endless hot water." },
  { icon: "fas fa-wrench",       title: "PRV (Pressure Valve)",   body: "Maintain home water pressure at 50-60 PSI to prevent stress on pipes, fixtures, and appliances." },
];

// ── Component ──────────────────────────────────────────────────────────────────
const USAPlumbingCalculator: React.FC = () => {
  const { hasPaid }  = useUser();
  const { saveProject, downloadSpreadsheetPDF, isSaving, isDownloading } = useProjectActions("usa-plumbing");

  const [kitchens,      setKitchens]      = useState("1");
  const [commonBaths,   setCommonBaths]   = useState("1");
  const [masterBaths,   setMasterBaths]   = useState("1");
  const [includeHeater, setIncludeHeater] = useState(true);
  const [quality,       setQuality]       = useState<keyof typeof QUALITY_OPTIONS>("standard");
  const [activeTab,     setActiveTab]     = useState<"result"|"pipes"|"water">("result");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sharedArea = window.localStorage.getItem("hde_shared_area");
      if (sharedArea) {
        const areaNum = parseFloat(sharedArea) || 0;
        if (areaNum > 0) {
          if (areaNum < 1500) {
            setKitchens("1");
            setCommonBaths("1");
            setMasterBaths("1");
          } else if (areaNum < 2500) {
            setKitchens("1");
            setCommonBaths("1");
            setMasterBaths("1");
          } else {
            setKitchens("1");
            setCommonBaths("2");
            setMasterBaths("1");
          }
        }
      }
    }
  }, []);

  const calc = useMemo(() => {
    const kCount = parseInt(kitchens)    || 0;
    const cCount = parseInt(commonBaths) || 0;
    const mCount = parseInt(masterBaths) || 0;
    const f      = QUALITY_OPTIONS[quality].factor;

    const kitchenCost    = kCount * UNIT_RATES.kitchen.rate    * f;
    const commonBathCost = cCount * UNIT_RATES.commonBath.rate * f;
    const masterBathCost = mCount * UNIT_RATES.masterBath.rate * f;
    const heaterCost     = includeHeater ? UNIT_RATES.waterHeater.rate : 0;
    const total          = kitchenCost + commonBathCost + masterBathCost + heaterCost;

    return { kitchenCost, commonBathCost, masterBathCost, heaterCost, total, kCount, cCount, mCount };
  }, [kitchens, commonBaths, masterBaths, includeHeater, quality]);

  const isLocked = false;

  const handleSave = () => {
    if (calc.total > 0) saveProject({ kitchens, commonBaths, masterBaths, includeHeater, quality, breakdown: calc }, calc.total);
  };

  const handleDownloadPDF = () => {
    const rows: [string,string,string][] = [
      ["Kitchen / Utility",         `${calc.kCount} unit(s)`, formatCurrency(calc.kitchenCost)],
      ["Full Bathrooms (Standard)", `${calc.cCount} unit(s)`, formatCurrency(calc.commonBathCost)],
      ["Master Bathrooms (Premium)", `${calc.mCount} unit(s)`, formatCurrency(calc.masterBathCost)],
    ];
    if (calc.heaterCost > 0) rows.push(["Water Heater", "1 unit", formatCurrency(calc.heaterCost)]);
    downloadSpreadsheetPDF(`Plumbing-Estimate-USA`, ["Item","Quantity","Cost"], rows, "TOTAL ESTIMATE", formatCurrency(calc.total));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ── Left ── */}
      <div className="space-y-5">
        <Card title="🚿 Plumbing Cost Calculator (USA)">
          {isLocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-semibold text-center">
              <i className="fas fa-lock mr-2"></i> Upgrade to Pro to use the room-wise plumbing estimator.
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: "Kitchens / Utility", icon: "fas fa-utensils", val: kitchens,    set: setKitchens,    info: `~$${UNIT_RATES.kitchen.rate}/unit — Sink, faucet, disposal` },
              { label: "Master Bathrooms",   icon: "fas fa-bath",     val: masterBaths, set: setMasterBaths, info: `~$${UNIT_RATES.masterBath.rate}/unit — Double vanity, custom shower, tub` },
              { label: "Full Bathrooms",     icon: "fas fa-toilet",   val: commonBaths, set: setCommonBaths, info: `~$${UNIT_RATES.commonBath.rate}/unit — Standard tub/shower combo, vanity` },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${f.icon} text-cyan-600`}></i>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-0.5">{f.label}</label>
                  <p className="text-xs text-gray-400 mb-1">{f.info}</p>
                  <input type="number" min="0" value={f.val} onChange={e => f.set(e.target.value)} disabled={isLocked}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-primary outline-none bg-white disabled:bg-gray-50" />
                </div>
              </div>
            ))}

            {/* Water Heater */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <label className="flex items-center cursor-pointer gap-3 select-none">
                <input type="checkbox" checked={includeHeater} onChange={e => setIncludeHeater(e.target.checked)} disabled={isLocked}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary accent-primary" />
                <div>
                  <span className="text-sm font-bold text-gray-700">Include Water Heater</span>
                  <p className="text-xs text-gray-400">50-gal tank or standard tankless + installation</p>
                </div>
                <span className="ml-auto text-sm font-bold text-primary">${UNIT_RATES.waterHeater.rate}</span>
              </label>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Fixture Quality</label>
              <div className="space-y-2">
                {Object.entries(QUALITY_OPTIONS).map(([k, v]) => (
                  <label key={k} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${quality === k ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="pq" value={k} checked={quality === k} onChange={() => setQuality(k as any)} disabled={isLocked} className="text-primary" />
                    <span className="text-sm font-semibold text-gray-800">{v.name}</span>
                    <span className="ml-auto text-xs text-gray-400">×{v.factor.toFixed(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Fixture Brand Guide */}
        <Card title="🏷 Fixture Brand Guide">
          <div className="space-y-3">
            {FIXTURE_BRANDS.map((g, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-800 text-sm">{g.category}</span>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{g.range}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.brands.map((b, bi) => (
                    <span key={bi} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Right ── */}
      <div className="space-y-5">
        {calc.total > 0 ? (
          <>
            <div className="flex gap-2 flex-wrap">
              {(["result","pipes","water"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? "bg-secondary text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                  {tab === "result" ? "💰 Cost Estimate" : tab === "pipes" ? "🔧 Pipe Types" : "💧 Water-saving Tips"}
                </button>
              ))}
            </div>

            {activeTab === "result" && (
              <Card title="Plumbing Estimate" className="border-primary/20">
                <div className="text-center py-4 bg-gray-50 rounded-xl mb-5">
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Plumbing Estimate</p>
                  <h2 className="text-4xl font-extrabold text-secondary">{formatCurrency(calc.total)}</h2>
                </div>
                <div className="overflow-x-auto rounded-xl border border-gray-100 mb-5">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { label: "Master Bathrooms",  qty: `${calc.mCount}`, cost: calc.masterBathCost },
                        { label: "Full Bathrooms",    qty: `${calc.cCount}`, cost: calc.commonBathCost },
                        { label: "Kitchens / Utility",qty: `${calc.kCount}`, cost: calc.kitchenCost    },
                        ...(calc.heaterCost > 0 ? [{ label: "Water Heater", qty: "1 unit", cost: calc.heaterCost }] : []),
                      ].map((r, i) => (
                        <tr key={i}><td className="px-4 py-2 font-medium">{r.label}</td><td className="px-4 py-2 text-center text-gray-500">{r.qty}</td><td className="px-4 py-2 text-right font-semibold">{formatCurrency(r.cost)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="h-52 mb-5">
                  <Chart data={{ "Fixtures & Trim": calc.total * 0.45, "Rough-in Plumbing (PEX/PVC)": calc.total * 0.25, "Labor & Permits": calc.total * 0.30 }} colors={CHART_COLORS} />
                </div>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/50 rounded-xl text-xs text-cyan-700 dark:text-cyan-400 mb-4">
                  <i className="fas fa-info-circle mr-1 text-primary"></i> Estimate includes fixtures, rough-in plumbing (PEX/PVC), venting, and labor. Excludes main water/sewer line trenching and water softeners.
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

            {activeTab === "pipes" && (
              <Card title="Pipe Type Reference (USA)">
                <div className="space-y-3">
                  {PIPE_TYPES.map((p, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-sm">{p.type}</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p.size}</span>
                      </div>
                      <p className="text-xs text-primary font-medium mb-1">{p.brand}</p>
                      <p className="text-xs text-gray-500 mb-1"><strong>Use:</strong> {p.use}</p>
                      <p className="text-xs text-gray-400">{p.note}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "water" && (
              <Card title="💧 Water-saving Features">
                <div className="space-y-3">
                  {WATER_TIPS.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                      <i className={`${t.icon} text-cyan-600 mt-0.5 flex-shrink-0`}></i>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{t.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{t.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400 min-h-[400px]">
            <i className="fas fa-bath text-4xl mb-4 text-gray-300"></i>
            <p className="font-medium">Enter room counts to view estimate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default USAPlumbingCalculator;
