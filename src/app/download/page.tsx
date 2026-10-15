"use client";
// src/app/download/page.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useRegion } from "@/context/RegionContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/config/supabaseClient";
import { 
  AppRelease, 
  DesktopLicense, 
  getLatestReleases, 
  getUserLicense, 
  claimOrCreateLicense 
} from "@/services/licenseService";

export default function DownloadPage() {
  const { user, planTier } = useUser();
  const { region } = useRegion();
  const { showToast } = useToast();

  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [license, setLicense] = useState<DesktopLicense | null>(null);
  const [detectedOS, setDetectedOS] = useState<"windows" | "macos" | "linux">("windows");
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cadBilling, setCadBilling] = useState<'lifetime' | 'monthly'>('lifetime');
  const [buyingCad, setBuyingCad] = useState(false);

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Detect Operating System
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes("win")) {
      setDetectedOS("windows");
    } else if (ua.includes("mac")) {
      setDetectedOS("macos");
    } else if (ua.includes("linux")) {
      setDetectedOS("linux");
    }
  }, []);

  // Fetch Releases & User License
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const rels = await getLatestReleases();
        setReleases(rels);

        if (user) {
          const lic = await getUserLicense(user.id);
          // Only reveal license key if user has an active PAID commercial license
          if (lic && lic.status === 'active' && lic.edition === 'GLOBAL_PRO') {
            setLicense(lic);
          } else {
            setLicense(null);
          }
        }
      } catch (err) {
        console.error("Error loading download page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, region, planTier]);

  const handleCopyKey = () => {
    if (!license?.license_key) return;
    navigator.clipboard.writeText(license.license_key);
    setCopied(true);
    showToast("License key copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCadCheckout = async () => {
    if (!user) {
      window.location.href = `/signin?redirect=/download`;
      return;
    }
    setBuyingCad(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = `/signin?redirect=/download`;
        return;
      }

      const isUS = region === 'US';
      const planId = isUS
        ? (cadBilling === 'lifetime' ? 'usa_lifetime_pro' : 'usa_monthly_pro')
        : (cadBilling === 'lifetime' ? 'india_lifetime_pro' : 'india_monthly_pro');
      const currency = isUS ? 'USD' : 'INR';

      const { data: order, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { planId, currency },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (orderError || !order || order.error) {
        throw new Error(order?.error || "Order creation failed.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HDE Studio CAD Pro",
        description: `HDE Studio CAD Commercial License (${cadBilling})`,
        order_id: order.id,
        handler: async (response: any) => {
          const { data: result } = await supabase.functions.invoke('verify-payment', {
            body: { ...response, planId, currency },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          if (result?.status === 'success') {
            const claimed = await claimOrCreateLicense(user.id, user.email || '', region || 'IN', 'pro');
            if (claimed) setLicense(claimed);
            showToast("HDE Studio CAD Pro Activated Successfully!", "success");
          } else {
            showToast("Payment verification failed. Please contact support.", "error");
          }
        },
        prefill: { email: user?.email },
        theme: { color: "#d9a443" }
      };

      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      showToast(err.message || "Payment initiation failed", "error");
    } finally {
      setBuyingCad(false);
    }
  };

  // Find installer URLs
  const winExe = releases.find(r => r.platform === 'windows' && r.installer_type === 'exe') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio-Setup-v2.1.exe',
    file_size_mb: 38.9
  };
  const winZip = releases.find(r => r.platform === 'windows' && r.installer_type === 'zip') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio-v2.1-Windows-Portable.zip',
    file_size_mb: 61.2
  };
  const linuxZip = releases.find(r => r.platform === 'linux') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio-v2.1-Linux-Portable.zip',
    file_size_mb: 5.38
  };
  const macDmg = releases.find(r => r.platform === 'macos') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio.dmg',
    file_size_mb: 65.0
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#091122] via-[#070d18] to-[#040811] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500/30 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HERO HEADER WITH BRAND ICON */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Brand Icon & Version Pill */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-primary to-cyan-500 opacity-40 blur-xl group-hover:opacity-75 transition duration-500"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-slate-900 border-2 border-cyan-500/40 shadow-2xl overflow-hidden flex items-center justify-center p-2">
                <Image
                  src="/images/cad/hde-studio-icon.webp"
                  alt="HDE Studio Architectural CAD Icon"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain rounded-xl"
                  priority
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <i className="fas fa-cube"></i>
              <span>Desktop CAD Software • Version 2.1 Release</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Design Faster with <span className="text-cyan-400">HDE Studio</span> CAD
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300">
              Professional offline 2D architectural space planning, AutoCAD vector blocks, real-time dimensioning, and client-ready vector PDF blueprints.
            </p>
          </div>

          {/* FEATURE CHIPS */}
          <div className="flex flex-wrap justify-center gap-2.5 pt-1 text-xs font-semibold text-slate-200">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-400"></i> India Metric (mm) &amp; USA Imperial (Ft/In)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-400"></i> 60+ AutoCAD Vector CAD Blocks
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-400"></i> 300 DPI Vector PDF Blueprints
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-400"></i> 100% Offline Standalone Desktop App
            </span>
          </div>
        </div>

        {/* HERO ARCHITECTURAL SHOWCASE (RESPONSIVE BLUEPRINT VIEWS) */}
        <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-5 relative overflow-hidden">
          {/* Subtle Background Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Application Window Frame Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-slate-400 font-mono text-[11px] ml-2 hidden sm:inline">
                HDE Studio CAD 2.1 — Architectural Canvas Viewport
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-slate-800 text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                📐 Dynamic Dimension Chains
              </span>
              <span className="bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md hidden md:inline">
                🛋️ Vector Block Library
              </span>
            </div>
          </div>

          {/* Responsive Blueprint Images Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Primary Panoramic Blueprint (02.webp) */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-inner relative group overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-[#0d1527] border border-slate-700/60 shadow-lg">
                <Image
                  src="/images/cad/cad-hero-plan.webp"
                  alt="HDE Studio CAD Panoramic Architectural Blueprint"
                  width={2019}
                  height={782}
                  className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-slate-200 text-[11px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-2 shadow">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>56&apos;-10&quot; Open-Concept Living &amp; Island Kitchen Layout</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
                <span>✓ Continuous wall hatching &amp; real-time dimensioning</span>
                <span className="text-cyan-400 font-medium">Auto-snapping Grid (1&apos;-0&quot; / 100mm)</span>
              </div>
            </div>

            {/* Detail Plan Blueprint (01.webp) */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-inner relative group overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-[#0d1527] border border-slate-700/60 shadow-lg flex-1 flex items-center justify-center">
                <Image
                  src="/images/cad/cad-detail-plan.webp"
                  alt="HDE Studio CAD Studio Flat & Sanitary Blueprint"
                  width={616}
                  height={832}
                  className="w-full max-h-[380px] object-contain group-hover:scale-[1.01] transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shadow">
                  400 SQ.FT STUDIO
                </div>
              </div>

              <div className="mt-3 text-center sm:text-left text-[11px] text-slate-400 px-1">
                <span className="text-emerald-400 font-medium">Ready for High-Res Vector PDF Export</span> (300 DPI)
              </div>
            </div>
          </div>
        </div>

        {/* LICENSE KEY ACTIVATION WIDGET */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-key text-cyan-400 text-xl"></i>
                <h2 className="text-xl font-bold text-white">Your Desktop License Key</h2>
              </div>
              <p className="text-sm text-slate-400">
                Enter this key along with your registered email upon opening HDE Studio to activate your full edition.
              </p>
            </div>

            {user ? (
              license ? (
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-[#0a1122] border border-cyan-500/40 px-4 py-3 rounded-xl font-mono text-sm sm:text-base font-bold text-cyan-300 tracking-wider flex items-center justify-between gap-4 shadow-inner">
                    <span className="font-mono">{license.license_key}</span>
                    <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {license.edition}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <i className={copied ? "fas fa-check" : "fas fa-copy"}></i>
                    <span>{copied ? "Copied!" : "Copy Key"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2">
                    <i className="fas fa-lock text-amber-400"></i>
                    <span>Commercial License Required to Activate</span>
                  </div>
                  <a
                    href="#pricing"
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 no-underline cursor-pointer whitespace-nowrap"
                  >
                    <span>Unlock License Key</span>
                    <i className="fas fa-arrow-down text-xs"></i>
                  </a>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin?redirect=/download"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all no-underline"
                >
                  Sign In / Purchase License
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* PRIMARY DOWNLOAD CARD (DETECTED OS) */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0a1224] border-2 border-primary/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="inline-block p-3.5 bg-slate-800 border border-slate-700 rounded-2xl shadow-sm text-cyan-400 text-3xl">
            <i className={detectedOS === "windows" ? "fab fa-windows" : detectedOS === "macos" ? "fab fa-apple" : "fab fa-linux"}></i>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Download for {detectedOS === "windows" ? "Windows (64-bit)" : detectedOS === "macos" ? "macOS (Apple & Intel)" : "Linux (64-bit)"}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Recommended package automatically detected for your system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {detectedOS === "windows" && (
              <>
                <a
                  href={winExe.download_url}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-xl hover:scale-105 transition-all no-underline flex items-center justify-center gap-3"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Windows Installer (.exe)</span>
                  <span className="text-xs font-normal opacity-80">({winExe.file_size_mb} MB)</span>
                </a>
                <a
                  href={winZip.download_url}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-cyan-400 text-slate-200 font-bold text-sm shadow-sm transition-all no-underline flex items-center justify-center gap-2"
                >
                  <i className="fas fa-file-zipper"></i>
                  <span>Portable Zip ({winZip.file_size_mb} MB)</span>
                </a>
              </>
            )}

            {detectedOS === "macos" && (
              <a
                href={macDmg.download_url}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-xl hover:scale-105 transition-all no-underline flex items-center justify-center gap-3"
              >
                <i className="fas fa-download"></i>
                <span>Download macOS DMG (.dmg)</span>
                <span className="text-xs font-normal opacity-80">({macDmg.file_size_mb} MB)</span>
              </a>
            )}

            {detectedOS === "linux" && (
              <a
                href={linuxZip.download_url}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-xl hover:scale-105 transition-all no-underline flex items-center justify-center gap-3"
              >
                <i className="fas fa-download"></i>
                <span>Download Linux Portable (.zip)</span>
                <span className="text-xs font-normal opacity-80">({linuxZip.file_size_mb} MB)</span>
              </a>
            )}
          </div>
        </div>

        {/* ALL PLATFORMS GRID */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            All Operating System Packages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* WINDOWS */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl">
                  <i className="fab fa-windows"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Windows</h4>
                  <p className="text-xs text-slate-400">Windows 10, 11 (64-bit)</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Includes automated setup wizard, Start Menu shortcuts, and embedded runtime.
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href={winExe.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors no-underline shadow-sm"
                >
                  Installer Setup (.exe) • {winExe.file_size_mb} MB
                </a>
                <a
                  href={winZip.download_url}
                  className="block text-center py-2 px-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:border-cyan-400 text-slate-300 font-semibold text-xs transition-colors no-underline"
                >
                  Portable Zip • {winZip.file_size_mb} MB
                </a>
              </div>
            </div>

            {/* MACOS */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center text-xl">
                  <i className="fab fa-apple"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">macOS</h4>
                  <p className="text-xs text-slate-400">Apple Silicon (M1/M2/M3) &amp; Intel</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Native macOS disk image. Drag to Applications folder and launch.
              </p>
              <div className="pt-2">
                <a
                  href={macDmg.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors no-underline shadow-sm"
                >
                  macOS Disk Image (.dmg) • {macDmg.file_size_mb} MB
                </a>
              </div>
            </div>

            {/* LINUX */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xl">
                  <i className="fab fa-linux"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Linux</h4>
                  <p className="text-xs text-slate-400">Ubuntu, Debian, Fedora, Arch</p>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Self-contained bundle with bash launcher script and desktop entry.
              </p>
              <div className="pt-2">
                <a
                  href={linuxZip.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors no-underline shadow-sm"
                >
                  Portable Bundle (.zip) • {linuxZip.file_size_mb} MB
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* HDE STUDIO CAD COMMERCIAL LICENSE PRICING */}
        <div id="pricing" className="bg-gradient-to-b from-slate-900 via-[#0a1326] to-[#060b14] border-2 border-[#c5a059]/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden scroll-mt-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 text-[#d4af37] border border-[#c5a059]/30 text-xs font-black uppercase tracking-wider">
                <i className="fas fa-crown"></i>
                <span>Commercial &amp; Professional CAD License</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Unlock Full HDE Studio Pro
              </h3>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
                Offline 2D architectural CAD software with drafting tools, structural layers, CAD block libraries, and high-res vector PDF printing.
              </p>
            </div>

            {/* BILLING TOGGLE */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="bg-slate-950/80 p-1.5 rounded-2xl flex items-center border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setCadBilling('lifetime')}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                    cadBilling === 'lifetime'
                      ? 'bg-primary text-white shadow-md scale-102'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-infinity text-sm"></i>
                  <span>Lifetime Commercial License</span>
                  <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full tracking-wider">
                    25% OFF
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCadBilling('monthly')}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    cadBilling === 'monthly'
                      ? 'bg-primary text-white shadow-md scale-102'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-calendar-alt text-sm"></i>
                  <span>Monthly Pro Plan</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {cadBilling === 'lifetime'
                  ? "⭐ Limited Launch Offer: One-time payment, perpetual software license & all future updates included."
                  : "Flexible monthly billing. Cancel or reactivate whenever you need."}
              </p>
            </div>

            {/* PRICING CARD & DETAILS */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {cadBilling === 'lifetime' ? (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-white">
                        {region === 'US' ? '$299' : '₹18,749'}
                      </span>
                      <span className="text-lg text-slate-500 line-through">
                        {region === 'US' ? '$399' : '₹24,999'}
                      </span>
                      <span className="text-xs font-black uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                        Save 25%
                      </span>
                      <span className="text-xs text-slate-400 font-semibold block sm:inline">
                        / one-time
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-white">
                        {region === 'US' ? '$49' : '₹1,999'}
                      </span>
                      <span className="text-sm text-slate-400 font-semibold">
                        / month
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                    <span><strong>100% Offline 2D CAD Software</strong> — no internet connection required to draft</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                    <span><strong>AutoCAD Vector Blocks</strong> (Furniture, Sanitary, Doors, Windows)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                    <span><strong>Dual Standard Catalogs</strong> (India Metric mm &amp; USA Imperial Feet/Inches)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                    <span><strong>High-Resolution Vector PDF Export</strong> ready for printing &amp; client handoffs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                    <span><strong>Commercial License</strong> for Architects, Civil Engineers, Contractors &amp; Firms</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400"></i>
                    <span>Instant desktop license key generation with lifetime profile tie-in</span>
                  </li>
                </ul>
              </div>

              <div className="w-full md:w-auto text-center space-y-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCadCheckout}
                  disabled={buyingCad}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 hover:scale-102"
                >
                  {buyingCad ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shopping-cart"></i>
                      <span>
                        {cadBilling === 'lifetime'
                          ? `Buy Lifetime License • ${region === 'US' ? '$299' : '₹18,749'}`
                          : `Subscribe Monthly • ${region === 'US' ? '$49/mo' : '₹1,999/mo'}`}
                      </span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <i className="fas fa-shield-alt text-emerald-400"></i>
                  <span>Secure 256-bit checkout via Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-STEP QUICK START GUIDE */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-8 sm:p-10 space-y-8">
          <h3 className="text-2xl font-bold text-white text-center">
            How to Install and Activate HDE Studio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 border border-cyan-500/30 text-cyan-400 font-black text-lg flex items-center justify-center shadow-inner">
                1
              </div>
              <h4 className="font-bold text-base text-white">Download Setup</h4>
              <p className="text-xs text-slate-400">
                Download the setup package above for your operating system.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 border border-cyan-500/30 text-cyan-400 font-black text-lg flex items-center justify-center shadow-inner">
                2
              </div>
              <h4 className="font-bold text-base text-white">Run Installer</h4>
              <p className="text-xs text-slate-400">
                Double click the setup file and follow the on-screen instructions to install.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 border border-cyan-500/30 text-cyan-400 font-black text-lg flex items-center justify-center shadow-inner">
                3
              </div>
              <h4 className="font-bold text-base text-white">Enter License Key</h4>
              <p className="text-xs text-slate-400">
                Launch HDE Studio and paste your License Key shown above to unlock all CAD tools.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
