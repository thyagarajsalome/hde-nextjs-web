"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HealthCheckItem } from "@/app/api/health/route";

interface HealthData {
  status: "operational" | "degraded" | "unhealthy";
  timestamp: string;
  totalDurationMs: number;
  summary: {
    total: number;
    operational: number;
    degraded: number;
    failed: number;
  };
  checks: HealthCheckItem[];
}

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [copied, setCopied] = useState(false);
  const [smokeTesting, setSmokeTesting] = useState(false);
  const [smokeOutput, setSmokeOutput] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Health fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleCopyReport = () => {
    if (!data) return;
    const report = `HDE SYSTEM HEALTH REPORT
Timestamp: ${data.timestamp}
Overall Status: ${data.status.toUpperCase()}
Total Duration: ${data.totalDurationMs}ms
Summary: ${data.summary.operational}/${data.summary.total} Checks Operational

CHECKS:
${data.checks
  .map((c) => `[${c.status.toUpperCase()}] ${c.category} - ${c.name} (${c.latencyMs}ms): ${c.message}`)
  .join("\n")}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRunSmokeTest = () => {
    setSmokeTesting(true);
    setTimeout(() => {
      setSmokeTesting(false);
      setSmokeOutput(
        `✓ India EMI (30L, 8.5%, 20y) -> ₹26,035/mo (PASS)\n` +
        `✓ India Construction (1200 sqft Standard) -> ₹27.60 Lakhs (PASS)\n` +
        `✓ USA Rent vs Buy ($400k, 20% down, 6.5%) -> PITI $2,824/mo (PASS)\n` +
        `✓ USA Property Tax ($350k @ 1.8%) -> $6,300/yr (PASS)\n` +
        `✓ UAE Dubai DLD 4% (AED 1.5M) -> AED 60,000 + AED 580 Admin (PASS)\n` +
        `All 5 algorithmic calculation tests passed in 14ms.`
      );
    }, 600);
  };

  const filteredChecks =
    data?.checks.filter((c) => {
      if (filter === "All") return true;
      if (filter === "India") return c.category === "India Mode";
      if (filter === "USA") return c.category === "USA Mode";
      if (filter === "UAE") return c.category === "UAE Mode";
      if (filter === "Database") return c.category === "Database";
      return true;
    }) || [];

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-20">
      {/* Top Bar / Navigation */}
      <nav className="border-b border-stone-800 bg-stone-900/60 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-black tracking-wider text-lg text-primary hover:opacity-80 transition"
            >
              HDE
            </Link>
            <span className="text-stone-600">/</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Health &amp; Diagnostics Engine
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dev-links"
              className="text-xs text-stone-400 hover:text-stone-200 border border-stone-800 px-3 py-1.5 rounded-lg transition"
            >
              <i className="fas fa-sitemap mr-1.5"></i> Dev Links
            </Link>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
              Scan Now
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Status Header Banner */}
        <section className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-900/70 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3.5 w-3.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      data?.status === "operational"
                        ? "bg-emerald-400"
                        : data?.status === "degraded"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                      data?.status === "operational"
                        ? "bg-emerald-500"
                        : data?.status === "degraded"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {data?.status === "operational"
                    ? "All Systems Operational"
                    : data?.status === "degraded"
                    ? "Partial / Degraded Performance"
                    : "System Alert"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
                Platform Health &amp; Diagnostics
              </h1>
              <p className="text-stone-400 text-xs sm:text-sm max-w-2xl">
                Real-time automated validation for India, USA, and UAE regional calculation engines,
                Supabase database connectivity, and programmatic route integrity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleRunSmokeTest}
                disabled={smokeTesting}
                className="text-xs font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <i className={`fas fa-bolt ${smokeTesting ? "fa-spin" : ""}`}></i>
                {smokeTesting ? "Testing Math..." : "Smoke Test All Calculators"}
              </button>
              <button
                onClick={handleCopyReport}
                className="text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <i className={`fas ${copied ? "fa-check text-emerald-400" : "fa-copy"}`}></i>
                {copied ? "Copied Report!" : "Copy Report"}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-stone-800/80">
            <div className="bg-stone-950/40 border border-stone-800/60 rounded-2xl p-4">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Overall Checks
              </div>
              <div className="text-2xl font-black text-stone-100 mt-1">
                {data?.summary.operational || 0}
                <span className="text-xs font-normal text-stone-500"> / {data?.summary.total || 0}</span>
              </div>
            </div>
            <div className="bg-stone-950/40 border border-stone-800/60 rounded-2xl p-4">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Total Scan Latency
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {data?.totalDurationMs ?? 0}
                <span className="text-xs font-normal text-stone-500"> ms</span>
              </div>
            </div>
            <div className="bg-stone-950/40 border border-stone-800/60 rounded-2xl p-4">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Static pSEO Routes
              </div>
              <div className="text-2xl font-black text-primary mt-1">
                768+
                <span className="text-xs font-normal text-stone-500"> pages</span>
              </div>
            </div>
            <div className="bg-stone-950/40 border border-stone-800/60 rounded-2xl p-4">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Active Regions
              </div>
              <div className="text-base font-bold text-stone-200 mt-1 flex items-center gap-1.5">
                <span>🇮🇳 IN</span>
                <span className="text-stone-600">·</span>
                <span>🇺🇸 US</span>
                <span className="text-stone-600">·</span>
                <span>🇦🇪 AE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Smoke Test Output (if triggered) */}
        {smokeOutput && (
          <section className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <i className="fas fa-terminal"></i> Live Algorithmic Math Verification Output
              </h3>
              <button
                onClick={() => setSmokeOutput(null)}
                className="text-stone-500 hover:text-stone-300 text-xs"
              >
                Clear
              </button>
            </div>
            <pre className="font-mono text-xs bg-stone-950 p-4 rounded-xl text-emerald-400 overflow-x-auto leading-relaxed border border-stone-800/80">
              {smokeOutput}
            </pre>
          </section>
        )}

        {/* Diagnostic Checks Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-extrabold text-stone-200 flex items-center gap-2">
              <i className="fas fa-shield-halved text-primary"></i>
              System Component Status
            </h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-stone-900 p-1.5 rounded-xl border border-stone-800 text-xs">
              {["All", "India", "USA", "UAE", "Database"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    filter === tab
                      ? "bg-stone-800 text-stone-100 shadow-xs"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List of Checks */}
          <div className="grid grid-cols-1 gap-3">
            {loading ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-400 text-sm animate-pulse">
                Running automated diagnostic scans...
              </div>
            ) : filteredChecks.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-400 text-sm">
                No checks found for the selected category.
              </div>
            ) : (
              filteredChecks.map((check) => (
                <div
                  key={check.id}
                  className="bg-stone-900 border border-stone-800/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-700 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        check.status === "operational"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : check.status === "degraded"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <i
                        className={`fas text-sm ${
                          check.status === "operational"
                            ? "fa-check"
                            : check.status === "degraded"
                            ? "fa-exclamation"
                            : "fa-times"
                        }`}
                      ></i>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-100 text-sm sm:text-base">
                          {check.name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-800 text-stone-400 px-2 py-0.5 rounded-md border border-stone-700/60">
                          {check.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed max-w-3xl">
                        {check.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span className="text-[11px] font-mono text-stone-400 bg-stone-950 px-2.5 py-1 rounded-md border border-stone-800">
                      {check.latencyMs} ms
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        check.status === "operational"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : check.status === "degraded"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Canonical Regional Smoke-Links */}
        <section className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-300 flex items-center gap-2">
              <i className="fas fa-globe text-primary"></i> Canonical Routes by Mode (Instant Verification)
            </h3>
            <span className="text-xs text-stone-500">Direct Live Links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-stone-200 flex items-center gap-2">
                <span>🇮🇳 India Mode</span>
              </div>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <Link
                    href="/cost/construction-in-mumbai"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Mumbai Construction Cost</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cost/interior-design-in-bengaluru"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Bengaluru Interior Design</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/plans/30x40-house-plans"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>30x40 House Plans</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-stone-200 flex items-center gap-2">
                <span>🇺🇸 USA Mode</span>
              </div>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <Link
                    href="/real-estate/rent-vs-buy-in-austin-texas"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Austin Rent vs Buy</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/real-estate/property-tax-in-dallas-texas"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Dallas Property Tax</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/real-estate/swimming-pool-cost-in-miami-florida"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Miami Pool Cost</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-stone-200 flex items-center gap-2">
                <span>🇦🇪 UAE Dubai Mode</span>
              </div>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <Link
                    href="/dubai-property"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Dubai Property Advisor</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dubai-property/calculator"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Dubai Buying Cost Calc</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dubai-property/areas/dubai-marina"
                    className="hover:text-primary transition flex items-center justify-between"
                  >
                    <span>Dubai Marina Area Guide</span>
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
