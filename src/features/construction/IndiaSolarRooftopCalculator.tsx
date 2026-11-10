"use client";
// src/features/construction/IndiaSolarRooftopCalculator.tsx
import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import Chart from "@/components/ui/Chart";
import { formatCurrency } from "@/utils/currency";
import { useProjectActions } from "@/hooks/useProjectActions";
import WhatsAppShareButton from "@/components/ui/WhatsAppShareButton";

interface StateTariff {
  state: string;
  discom: string;
  ratePerUnit: number;
  stateSubsidyPerKw: number;
  maxStateSubsidy: number;
}

const STATE_DISCOMS: Record<string, StateTariff> = {
  karnataka: {
    state: "Karnataka",
    discom: "BESCOM / MESCOM / HESCOM",
    ratePerUnit: 7.2,
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  maharashtra: {
    state: "Maharashtra",
    discom: "MSEDCL / Adani / Tata Power",
    ratePerUnit: 8.5,
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  delhi: {
    state: "Delhi NCR",
    discom: "BSES Yamuna / Rajdhani / TPDDL",
    ratePerUnit: 6.8,
    stateSubsidyPerKw: 2000,
    maxStateSubsidy: 10000,
  },
  telangana: {
    state: "Telangana",
    discom: "TSSPDCL / TSNPDCL",
    ratePerUnit: 7.4,
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  tamilnadu: {
    state: "Tamil Nadu",
    discom: "TANGEDCO",
    ratePerUnit: 6.9,
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  uttarpradesh: {
    state: "Uttar Pradesh",
    discom: "UPPCL / PVVNL / DVVNL",
    ratePerUnit: 7.1,
    stateSubsidyPerKw: 15000,
    maxStateSubsidy: 30000,
  },
  gujarat: {
    state: "Gujarat",
    discom: "UGVCL / DGVCL / Torrent Power",
    ratePerUnit: 6.6,
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
  national: {
    state: "Other States / National Average",
    discom: "State Electricity Board",
    ratePerUnit: 7.0,
    stateSubsidyPerKw: 0,
    maxStateSubsidy: 0,
  },
};

export default function IndiaSolarRooftopCalculator() {
  const { isSaving, saveProject } = useProjectActions("india-solar");

  const [monthlyBill, setMonthlyBill] = useState<number>(3500);
  const [selectedState, setSelectedState] = useState<string>("karnataka");
  const [rooftopAreaSqft, setRooftopAreaSqft] = useState<number>(500);
  const [panelType, setPanelType] = useState<"mono_perc" | "topcon">("mono_perc");

  const discom = STATE_DISCOMS[selectedState] || STATE_DISCOMS.national;

  // Calculation Engine
  const analysis = useMemo(() => {
    const tariff = discom.ratePerUnit;

    // 1. Estimated monthly units consumed
    const monthlyUnits = Math.round(monthlyBill / tariff);

    // 2. Solar generation rule: 1 kW produces ~120 units/month in India
    // Size needed to cover ~90% of electricity bill
    const rawKw = (monthlyUnits * 0.9) / 120;
    // Standard residential plant sizing (1, 2, 3, 4, 5, 6, 8, 10 kW)
    let recommendedKw = 3;
    if (rawKw <= 1.4) recommendedKw = 1;
    else if (rawKw <= 2.4) recommendedKw = 2;
    else if (rawKw <= 3.4) recommendedKw = 3;
    else if (rawKw <= 4.4) recommendedKw = 4;
    else if (rawKw <= 6.5) recommendedKw = 5;
    else if (rawKw <= 8.5) recommendedKw = 8;
    else recommendedKw = 10;

    // 3. Shadow-free roof area check (approx 100 sq.ft per kW)
    const requiredAreaSqft = recommendedKw * 95;
    const isAreaSufficient = rooftopAreaSqft >= requiredAreaSqft;

    // 4. Gross System Cost (Turnkey benchmark including bi-directional net meter)
    // DCR Mono PERC @ ₹58,000/kW | N-Type TopCon @ ₹64,000/kW
    const costPerKw = panelType === "topcon" ? 64000 : 58000;
    const grossCost = recommendedKw * costPerKw;

    // 5. Central Government PM Surya Ghar Direct Bank Subsidy (DBT):
    // 1 kW: ₹30,000
    // 2 kW: ₹60,000
    // 3 kW & higher: ₹78,000 max residential ceiling
    let centralSubsidy = 0;
    if (recommendedKw === 1) centralSubsidy = 30000;
    else if (recommendedKw === 2) centralSubsidy = 60000;
    else centralSubsidy = 78000;

    // 6. State Specific Add-On Subsidy (e.g. UP, Delhi)
    const rawStateSubsidy = recommendedKw * discom.stateSubsidyPerKw;
    const stateSubsidy = Math.min(discom.maxStateSubsidy, rawStateSubsidy);

    const totalSubsidy = centralSubsidy + stateSubsidy;
    const netOwnerCost = Math.max(10000, grossCost - totalSubsidy);

    // 7. Energy Generation & Bill Savings
    const annualUnitsGenerated = recommendedKw * 1440; // ~4 units per day per kW * 360 days
    const annualSavings = Math.round(annualUnitsGenerated * tariff);
    const monthlySavings = Math.round(annualSavings / 12);

    // 8. Payback Period & 25-Year Lifetime Wealth Creation
    const paybackYears = parseFloat((netOwnerCost / annualSavings).toFixed(1));
    const twentyFiveYearSavings = Math.round(annualSavings * 25 * 0.92); // Accounting for 0.6% annual degradation

    // Environmental Offset
    const co2OffsetTonnes = Math.round((annualUnitsGenerated * 0.82 * 25) / 1000); // 0.82kg CO2 per kWh grid avg in India
    const treesEquivalent = Math.round(co2OffsetTonnes * 1.5);

    return {
      monthlyUnits,
      recommendedKw,
      requiredAreaSqft,
      isAreaSufficient,
      grossCost,
      centralSubsidy,
      stateSubsidy,
      totalSubsidy,
      netOwnerCost,
      annualUnitsGenerated,
      monthlySavings,
      annualSavings,
      paybackYears,
      twentyFiveYearSavings,
      co2OffsetTonnes,
      treesEquivalent,
    };
  }, [monthlyBill, discom, rooftopAreaSqft, panelType]);

  const chartData = {
    "Govt Central Subsidy": analysis.centralSubsidy,
    ...(analysis.stateSubsidy > 0 ? { "State Subsidy": analysis.stateSubsidy } : {}),
    "Net Owner Investment": analysis.netOwnerCost,
  };

  const handleSave = () => {
    saveProject(
      {
        monthlyBill,
        state: discom.state,
        systemKw: analysis.recommendedKw,
        netCost: analysis.netOwnerCost,
        annualSavings: analysis.annualSavings,
      },
      analysis.netOwnerCost
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0f2042] via-[#1e3a6c] to-[#0f2042] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-400/30 inline-block">
              ☀️ Official PM Surya Ghar: Muft Bijli Yojana (2024–2026)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Rooftop Solar Subsidy &amp; ROI Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Calculate central DBT government subsidies (up to ₹78,000), net-metered zero-electricity bill sizing, and 25-year lifetime wealth savings for Indian independent homes.
            </p>
          </div>
          <div className="text-left md:text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Govt Subsidy (DBT)</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              +{formatCurrency(analysis.totalSubsidy)}
            </span>
            <span className="text-[11px] text-slate-300 block mt-0.5">
              Net Cost: {formatCurrency(analysis.netOwnerCost)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <i className="fas fa-bolt text-amber-500"></i>
              <span>1. Electricity Consumption &amp; DISCOM</span>
            </h2>

            {/* State DISCOM Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                State &amp; Electricity Utility (DISCOM)
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {Object.entries(STATE_DISCOMS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.state} ({item.discom}) — ₹{item.ratePerUnit}/unit avg
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Electricity Bill Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Average Monthly Electricity Bill
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    min={500}
                    max={30000}
                    step={250}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Math.max(500, Number(e.target.value)))}
                    className="w-24 px-2 py-1 text-right text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>
              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹1,000 (~140 units)</span>
                <span>₹5,000 (~700 units)</span>
                <span>₹20,000 (~2,800 units)</span>
              </div>
            </div>

            {/* Available Rooftop Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Shadow-Free Rooftop Area (Sq.ft)
                </label>
                <input
                  type="number"
                  min={100}
                  max={5000}
                  step={50}
                  value={rooftopAreaSqft}
                  onChange={(e) => setRooftopAreaSqft(Math.max(50, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100"
                />
                <span className={`text-[10px] block font-bold ${analysis.isAreaSufficient ? "text-emerald-600" : "text-rose-500"}`}>
                  {analysis.isAreaSufficient
                    ? `✓ Adequate area (Requires ~${analysis.requiredAreaSqft} sq.ft)`
                    : `⚠️ Need at least ${analysis.requiredAreaSqft} sq.ft for a ${analysis.recommendedKw} kW plant`}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  PV Module Technology
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPanelType("mono_perc")}
                    className={`py-2 px-2.5 text-xs font-bold rounded-xl border transition text-center ${
                      panelType === "mono_perc"
                        ? "bg-[#0f2042] text-[#c5a059] border-[#c5a059]"
                        : "bg-slate-50 dark:bg-zinc-800 text-slate-600 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    Mono PERC DCR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanelType("topcon")}
                    className={`py-2 px-2.5 text-xs font-bold rounded-xl border transition text-center ${
                      panelType === "topcon"
                        ? "bg-[#0f2042] text-[#c5a059] border-[#c5a059]"
                        : "bg-slate-50 dark:bg-zinc-800 text-slate-600 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    N-Type TOPCon
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Payback & ROI Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">
                Payback Period
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {analysis.paybackYears} Years
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                Free power after payback
              </span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-400 block">
                Annual Bill Savings
              </span>
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                {formatCurrency(analysis.annualSavings)}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 block">
                ~{formatCurrency(analysis.monthlySavings)} / month
              </span>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-800 dark:text-purple-400 block">
                25-Yr Wealth Creation
              </span>
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300">
                {formatCurrency(analysis.twentyFiveYearSavings)}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 block">
                25-Year performance warranty
              </span>
            </div>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-white dark:bg-zinc-900 border-2 border-emerald-500/40 shadow-lg rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-sun text-amber-500"></i>
                Recommended Solar PV Setup
              </h3>
              <span className="text-[10px] font-black uppercase text-white bg-emerald-600 px-2.5 py-0.5 rounded-full">
                {analysis.recommendedKw} kW On-Grid
              </span>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  Gross System Cost ({analysis.recommendedKw} kW Turnkey)
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {formatCurrency(analysis.grossCost)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60 text-emerald-600 dark:text-emerald-400">
                <span className="font-semibold flex items-center gap-1">
                  <i className="fas fa-check-circle text-[10px]"></i>
                  PM Surya Ghar Central DBT Subsidy
                </span>
                <span className="font-black font-mono">
                  -{formatCurrency(analysis.centralSubsidy)}
                </span>
              </div>

              {analysis.stateSubsidy > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60 text-emerald-600 dark:text-emerald-400">
                  <span className="font-semibold flex items-center gap-1">
                    <i className="fas fa-check-circle text-[10px]"></i>
                    State Government Subsidy ({discom.state})
                  </span>
                  <span className="font-black font-mono">
                    -{formatCurrency(analysis.stateSubsidy)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                <span className="text-slate-600 dark:text-zinc-400">
                  Annual Solar Units Generated
                </span>
                <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {analysis.annualUnitsGenerated.toLocaleString("en-IN")} kWh / yr
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-black text-slate-900 dark:text-zinc-100">
                <span>Net Owner Investment:</span>
                <span className="text-xl text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(analysis.netOwnerCost)}
                </span>
              </div>
            </div>

            {/* Donut Subsidy & Net Cost Chart */}
            <div className="pt-2">
              <Chart data={chartData} colors={["#10b981", "#3b82f6", "#0f2042"]} />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-bookmark text-white"></i>
                <span>{isSaving ? "Saving..." : "Save Solar Plan to Profile"}</span>
              </button>

              <WhatsAppShareButton
                title={`PM Surya Ghar Solar Subsidy for ${analysis.recommendedKw} kW Plant: Gross ${formatCurrency(analysis.grossCost)} - Govt Subsidy ${formatCurrency(analysis.totalSubsidy)} = Net ${formatCurrency(analysis.netOwnerCost)}. Saves ${formatCurrency(analysis.annualSavings)}/yr!`}
                url={typeof window !== "undefined" ? window.location.href : "https://www.homedesignenglish.com"}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-2"
              />
            </div>
          </Card>

          {/* Environmental Badge */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 p-4 rounded-xl text-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg shrink-0">
              🌱
            </div>
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                Green Energy Impact
              </span>
              <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                Reduces ~{analysis.co2OffsetTonnes} tonnes of carbon emissions over 25 years — equivalent to planting {analysis.treesEquivalent} full-grown trees!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
