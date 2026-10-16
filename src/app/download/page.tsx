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

const CAD_FAQS = [
  {
    q: "Can I use HDE Studio CAD without an active internet connection?",
    a: "Yes, 100%. HDE Studio is a native, offline desktop CAD application built for independent drafting. Once downloaded and activated, you never need an active internet connection or constant cloud check-in to draft, edit, or export your floor plans."
  },
  {
    q: "What file formats does HDE Studio support for export and printing?",
    a: "HDE Studio allows you to export your 2D plans directly to crisp, lossless vector PDF files up to 300 DPI, optimized for large-format architectural plotters (A0, A1, A2, A3, A4) as well as PNG and SVG graphics ready for municipal approval packages and client presentations."
  },
  {
    q: "How does the desktop license key activation work?",
    a: "When you purchase an HDE Studio Pro license (Monthly or Lifetime), an official license key in the format HDE-PRO-YYYY-XXXX-XXXX is instantly generated and tied to your account email. Simply open HDE Studio, navigate to Help > Activate License, and enter your key and registered email to unlock all commercial features."
  },
  {
    q: "Can I install HDE Studio CAD on multiple computers?",
    a: "Yes. Each single commercial user license permits activation on up to two personal workstations (such as an office desktop and a travel laptop) for the same licensed user. For corporate design firms or multi-seat drafting teams, please email us for bulk licenses."
  },
  {
    q: "Does HDE Studio support both Metric and Imperial architectural units?",
    a: "Yes. HDE Studio includes built-in dual unit catalogs: India Metric (millimeters, centimeters, meters, and square feet) and USA Imperial (feet, fractional inches, and architectural dimension strings) with automatic snap-grid calibration."
  },
  {
    q: "How do software updates work for HDE Studio CAD?",
    a: "We actively develop and regularly update HDE Studio on a continuous basis to provide the best architectural drafting experience. New versions, improved tools, and expanded CAD block libraries are published on this page. All lifetime license holders receive future version updates at no additional charge."
  }
];

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
        theme: { color: "#0f2042" }
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200 text-xs text-slate-500 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors no-underline text-slate-600">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">HDE Studio CAD</span>
        </div>
      </nav>

      {/* HERO HEADER */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* Brand Icon & Version Pill */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center p-2 transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/cad/HDE_256px.webp"
                alt="HDE Studio House Planning Tool Icon"
                width={256}
                height={256}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
              <i className="fas fa-cube text-primary"></i>
              <span>Desktop Architectural CAD • Version 2.1 Release</span>
            </div>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
              Design Faster with <span className="text-primary">HDE Studio</span> CAD
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
              Professional offline 2D architectural space planning, AutoCAD vector blocks, real-time dimensioning chains, and client-ready vector PDF blueprints.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 pt-2 text-xs font-semibold text-slate-700">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i> India Metric (mm) &amp; USA Imperial (Ft/In)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i> 60+ AutoCAD Vector CAD Blocks
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i> 300 DPI Vector PDF Blueprints
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i> 100% Offline Standalone Desktop App
            </span>
          </div>

          {/* Jump to Actions */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
            <a
              href="#download"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 no-underline"
            >
              <i className="fas fa-download"></i>
              <span>Download Free Package</span>
            </a>
            <a
              href="#pricing"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200/80 transition-all flex items-center gap-2 no-underline"
            >
              <i className="fas fa-crown text-[#c5a059]"></i>
              <span>Commercial Pro License</span>
            </a>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">

        {/* HERO ARCHITECTURAL SHOWCASE (LIGHT MONOCHROME FLOOR PLAN) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Window Title Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-slate-600 font-mono text-[11px] ml-2 hidden sm:inline font-semibold">
                HDE Studio CAD 2.1 — High-Precision Canvas Viewport
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
              <span className="bg-slate-100 text-primary border border-slate-200 px-2.5 py-1 rounded-md">
                📐 50&apos; &times; 40&apos; Monochrome Residential Plan
              </span>
              <span className="bg-slate-100 text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-md hidden md:inline">
                🛋️ Smart CAD Block Set
              </span>
            </div>
          </div>

          {/* Clean Light Architectural Floor Plan Showcase */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-xs">
            <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <Image
                src="/images/cad/monochrome-40x50-floor-plan.webp"
                alt="HDE Studio CAD 40x50 Monochrome Architectural Floor Plan"
                width={2019}
                height={1245}
                className="w-full h-auto object-contain"
                priority
              />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-[11px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">Monochrome 40&apos; &times; 50&apos; Residential Floor Plan</span>
              </div>
            </div>

            {/* Feature Highlights beneath canvas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-200/80 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700">
                <i className="fas fa-ruler-combined text-primary mt-0.5 text-sm"></i>
                <div>
                  <span className="font-bold text-slate-900 block">Real-Time Dimension Chains</span>
                  <span className="text-slate-500 text-[11px]">Precision wall, door &amp; window lengths with auto-aligned tick marks.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-700">
                <i className="fas fa-couch text-emerald-600 mt-0.5 text-sm"></i>
                <div>
                  <span className="font-bold text-slate-900 block">60+ Architectural Vector Blocks</span>
                  <span className="text-slate-500 text-[11px]">Pre-drawn beds, dining sets, sanitary ware, kitchen islands &amp; vehicles.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-700">
                <i className="fas fa-file-pdf text-red-600 mt-0.5 text-sm"></i>
                <div>
                  <span className="font-bold text-slate-900 block">300 DPI Vector PDF Export</span>
                  <span className="text-slate-500 text-[11px]">Lossless blueprint resolution ready for client handoffs &amp; municipal review.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LICENSE KEY ACTIVATION WIDGET */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-900">
                <i className="fas fa-key text-primary text-xl"></i>
                <h2 className="text-xl font-bold">Your Desktop License Key</h2>
              </div>
              <p className="text-sm text-slate-600">
                Enter this key along with your registered account email upon opening HDE Studio to activate your full edition.
              </p>
            </div>

            {user ? (
              license ? (
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-slate-50 border border-slate-300 px-4 py-3 rounded-xl font-mono text-sm sm:text-base font-bold text-slate-900 tracking-wider flex items-center justify-between gap-4 shadow-inner">
                    <span className="font-mono">{license.license_key}</span>
                    <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {license.edition}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <i className={copied ? "fas fa-check" : "fas fa-copy"}></i>
                    <span>{copied ? "Copied!" : "Copy Key"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                    <i className="fas fa-lock text-amber-600"></i>
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
        <div id="download" className="bg-white border-2 border-primary/20 rounded-3xl p-6 sm:p-10 shadow-md text-center space-y-6 scroll-mt-12">
          
          <div className="inline-block p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-3xl shadow-xs">
            <i className={detectedOS === "windows" ? "fab fa-windows" : detectedOS === "macos" ? "fab fa-apple" : "fab fa-linux"}></i>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Download for {detectedOS === "windows" ? "Windows (64-bit)" : detectedOS === "macos" ? "macOS (Apple & Intel)" : "Linux (64-bit)"}
            </h2>
            <p className="text-sm text-slate-600">
              Recommended package automatically detected for your computer system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {detectedOS === "windows" && (
              <>
                <a
                  href={winExe.download_url}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-md hover:scale-102 transition-all no-underline flex items-center justify-center gap-3"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Windows Installer (.exe)</span>
                  <span className="text-xs font-normal opacity-90">({winExe.file_size_mb} MB)</span>
                </a>
                <a
                  href={winZip.download_url}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm transition-all no-underline flex items-center justify-center gap-2"
                >
                  <i className="fas fa-file-zipper"></i>
                  <span>Portable Zip ({winZip.file_size_mb} MB)</span>
                </a>
              </>
            )}

            {detectedOS === "macos" && (
              <a
                href={macDmg.download_url}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-md hover:scale-102 transition-all no-underline flex items-center justify-center gap-3"
              >
                <i className="fas fa-download"></i>
                <span>Download macOS DMG (.dmg)</span>
                <span className="text-xs font-normal opacity-90">({macDmg.file_size_mb} MB)</span>
              </a>
            )}

            {detectedOS === "linux" && (
              <a
                href={linuxZip.download_url}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-md hover:scale-102 transition-all no-underline flex items-center justify-center gap-3"
              >
                <i className="fas fa-download"></i>
                <span>Download Linux Portable (.zip)</span>
                <span className="text-xs font-normal opacity-90">({linuxZip.file_size_mb} MB)</span>
              </a>
            )}
          </div>
        </div>

        {/* ALL PLATFORMS GRID */}
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">
            All Operating System Packages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* WINDOWS */}
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-xl">
                  <i className="fab fa-windows"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Windows</h4>
                  <p className="text-xs text-slate-500">Windows 10, 11 (64-bit)</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Includes automated setup wizard, Start Menu shortcuts, and embedded runtime.
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href={winExe.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors no-underline shadow-xs"
                >
                  Installer Setup (.exe) • {winExe.file_size_mb} MB
                </a>
                <a
                  href={winZip.download_url}
                  className="block text-center py-2 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors no-underline"
                >
                  Portable Zip • {winZip.file_size_mb} MB
                </a>
              </div>
            </div>

            {/* MACOS */}
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center text-xl">
                  <i className="fab fa-apple"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">macOS</h4>
                  <p className="text-xs text-slate-500">Apple Silicon (M1/M2/M3) &amp; Intel</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Native macOS disk image. Drag to Applications folder and launch immediately.
              </p>
              <div className="pt-2">
                <a
                  href={macDmg.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors no-underline shadow-xs"
                >
                  macOS Disk Image (.dmg) • {macDmg.file_size_mb} MB
                </a>
              </div>
            </div>

            {/* LINUX */}
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-xl">
                  <i className="fab fa-linux"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Linux</h4>
                  <p className="text-xs text-slate-500">Ubuntu, Debian, Fedora, Arch</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Self-contained bundle with bash launcher script and desktop entry shortcut.
              </p>
              <div className="pt-2">
                <a
                  href={linuxZip.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors no-underline shadow-xs"
                >
                  Portable Bundle (.zip) • {linuxZip.file_size_mb} MB
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* HDE STUDIO CAD COMMERCIAL LICENSE PRICING */}
        <div id="pricing" className="bg-white border-2 border-[#c5a059]/40 rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden scroll-mt-12">
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/10 text-[#a07c33] border border-[#c5a059]/30 text-xs font-black uppercase tracking-wider">
                <i className="fas fa-crown"></i>
                <span>Commercial &amp; Professional CAD License</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                Unlock Full HDE Studio Pro
              </h3>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Offline 2D architectural CAD software with drafting tools, structural layers, CAD block libraries, and high-res vector PDF printing.
              </p>
            </div>

            {/* BILLING TOGGLE */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setCadBilling('lifetime')}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                    cadBilling === 'lifetime'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className="fas fa-infinity text-sm"></i>
                  <span>Lifetime Commercial License</span>
                  <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full tracking-wider">
                    25% OFF
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setCadBilling('monthly')}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    cadBilling === 'monthly'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className="fas fa-calendar-alt text-sm"></i>
                  <span>Monthly Pro Plan</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {cadBilling === 'lifetime'
                  ? "⭐ Limited Launch Offer: One-time payment, perpetual software license & all future updates included."
                  : "Flexible monthly billing. Cancel or reactivate whenever you need."}
              </p>
            </div>

            {/* PRICING CARD & DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {cadBilling === 'lifetime' ? (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-slate-900">
                        {region === 'US' ? '$299' : '₹18,749'}
                      </span>
                      <span className="text-lg text-slate-400 line-through">
                        {region === 'US' ? '$399' : '₹24,999'}
                      </span>
                      <span className="text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
                        Save 25%
                      </span>
                      <span className="text-xs text-slate-500 font-semibold block sm:inline">
                        / one-time
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-slate-900">
                        {region === 'US' ? '$49' : '₹1,999'}
                      </span>
                      <span className="text-sm text-slate-500 font-semibold">
                        / month
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span><strong>100% Offline 2D CAD Software</strong> — no internet connection required to draft</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span><strong>AutoCAD Vector Blocks</strong> (Furniture, Sanitary, Doors, Windows)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span><strong>Dual Standard Catalogs</strong> (India Metric mm &amp; USA Imperial Feet/Inches)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span><strong>High-Resolution Vector PDF Export</strong> ready for printing &amp; client handoffs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span><strong>Commercial License</strong> for Architects, Civil Engineers, Contractors &amp; Firms</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span>Instant desktop license key generation with lifetime profile tie-in</span>
                  </li>
                </ul>
              </div>

              <div className="w-full md:w-auto text-center space-y-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCadCheckout}
                  disabled={buyingCad}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 hover:scale-102"
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
                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
                  <i className="fas fa-shield-alt text-emerald-600"></i>
                  <span>Secure 256-bit checkout via Razorpay</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3-STEP QUICK START GUIDE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-xs">
          <h3 className="text-2xl font-bold text-slate-900 text-center">
            How to Install and Activate HDE Studio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-lg flex items-center justify-center shadow-xs">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900">Download Setup</h4>
              <p className="text-xs text-slate-600">
                Download the setup package above for your operating system.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-lg flex items-center justify-center shadow-xs">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900">Run Installer</h4>
              <p className="text-xs text-slate-600">
                Double click the setup file and follow the on-screen instructions to install.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-lg flex items-center justify-center shadow-xs">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900">Enter License Key</h4>
              <p className="text-xs text-slate-600">
                Launch HDE Studio and paste your License Key shown above to unlock all CAD tools.
              </p>
            </div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xs">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider">
              <i className="fas fa-circle-question text-primary"></i>
              <span>Help &amp; Documentation</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Everything you need to know about downloading, installing, and licensing HDE Studio CAD.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {CAD_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <i
                      className={`fas fa-chevron-down text-xs text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    ></i>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTINUOUS DEVELOPMENT NOTICE & DISCLAIMER */}
        <div className="bg-amber-50/60 border border-amber-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base">
            <i className="fas fa-triangle-exclamation text-amber-600 text-lg"></i>
            <span>Continuous Development Notice &amp; Official Disclaimer</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2.5">
            <p>
              <strong>We are continually updating this application:</strong> At Home Design English (HDE), we are committed to providing architects, civil engineers, building contractors, and homeowners with the best offline CAD drafting and space-planning experience. We are actively and regularly updating this Desktop application with improved drafting tools, performance optimizations, bug fixes, and expanded vector block catalogs.
            </p>
            <p>
              <strong>Professional Architectural Disclaimer:</strong> HDE Studio is an architectural floor plan drafting and spatial layout tool. While the standard room sets, wall thickness presets, and dimensioning tools adhere to common building conventions, all final structural calculations, load-bearing beam/column sizing, soil foundation engineering, and local municipal building code compliances must be reviewed, stamped, and approved by a locally licensed architect or structural engineer before construction begins.
            </p>
            <p className="pt-1 text-slate-800">
              For any software support, bug reports, feature suggestions, or desktop license assistance, please contact our team directly at:{" "}
              <a 
                href="mailto:hdeadmin@gmail.com?subject=HDE%20Studio%20CAD%20Support%20Inquiry" 
                className="font-bold text-primary hover:text-primary-900 underline underline-offset-2 transition-colors"
              >
                hdeadmin@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* CONTACT / SUPPORT DESK CALLOUT */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-headset"></i>
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900">Need Help or Want to Request a CAD Feature?</h4>
              <p className="text-xs text-slate-600">
                Our engineering team is here to assist with license activation, workstation setup, or custom CAD block sets.
              </p>
            </div>
          </div>
          <a
            href="mailto:hdeadmin@gmail.com?subject=HDE%20Studio%20CAD%20Support%20Inquiry"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 shrink-0 no-underline"
          >
            <i className="fas fa-envelope"></i>
            <span>Contact: hdeadmin@gmail.com</span>
          </a>
        </div>

      </div>
    </div>
  );
}
