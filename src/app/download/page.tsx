"use client";
// src/app/download/page.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
          if (lic) {
            setLicense(lic);
          } else {
            // Auto-claim license for registered user
            const claimed = await claimOrCreateLicense(user.id, user.email || '', region || 'IN', planTier);
            if (claimed) setLicense(claimed);
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

  const handleManualClaim = async () => {
    if (!user) return;
    setClaiming(true);
    try {
      const claimed = await claimOrCreateLicense(user.id, user.email || '', region || 'IN', planTier);
      if (claimed) {
        setLicense(claimed);
        showToast("License activated successfully!", "success");
      }
    } catch {
      showToast("Could not generate license. Please try again.", "error");
    } finally {
      setClaiming(false);
    }
  };

  const handleCadCheckout = async () => {
    if (!user) {
      window.location.href = `/signin?redirect=/download`;
      return;
    }
    setBuyingCad(true);
    try {
      const isUS = region === 'US';
      const planId = isUS
        ? (cadBilling === 'lifetime' ? 'usa_lifetime_pro' : 'usa_monthly_pro')
        : (cadBilling === 'lifetime' ? 'india_lifetime_pro' : 'india_monthly_pro');
      const currency = isUS ? 'USD' : 'INR';

      const { data: order, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { planId, currency }
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
            body: { ...response, planId, currency }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-gray-800 dark:text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HERO HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <i className="fas fa-cube"></i>
            <span>Desktop CAD Software • Version 2.1</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Download <span className="text-primary">HDE Studio</span> CAD
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-zinc-400">
            Professional 2D architectural space planning, AutoCAD vector blocks, and high-resolution PDF blueprints. Designed for architects, civil engineers, and homeowners.
          </p>

          {/* FEATURE CHIPS */}
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs font-semibold text-gray-600 dark:text-zinc-300">
            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-500"></i> India &amp; USA Catalogs
            </span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-500"></i> AutoCAD 2D Blocks
            </span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-500"></i> High-Res PDF Exporter
            </span>
            <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center gap-1.5">
              <i className="fas fa-check text-emerald-500"></i> 100% Offline Capability
            </span>
          </div>
        </div>

        {/* LICENSE KEY ACTIVATION WIDGET */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-key text-primary text-xl"></i>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Desktop License Key</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Enter this key along with your registered email upon opening HDE Studio to activate your full edition.
              </p>
            </div>

            {user ? (
              license ? (
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-4 py-3 rounded-xl font-mono text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-wider flex items-center justify-between gap-4">
                    <span>{license.license_key}</span>
                    <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
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
                <button
                  onClick={handleManualClaim}
                  disabled={claiming}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <i className="fas fa-sparkles"></i>
                  <span>{claiming ? "Generating Key..." : "Claim Desktop License"}</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin?redirect=/download"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary/90 transition-all no-underline"
                >
                  Sign In to Get License Key
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* PRIMARY DOWNLOAD CARD (DETECTED OS) */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="inline-block p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm text-primary text-3xl">
            <i className={detectedOS === "windows" ? "fab fa-windows" : detectedOS === "macos" ? "fab fa-apple" : "fab fa-linux"}></i>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Download for {detectedOS === "windows" ? "Windows (64-bit)" : detectedOS === "macos" ? "macOS (Apple & Intel)" : "Linux (64-bit)"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
              Recommended package automatically detected for your system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {detectedOS === "windows" && (
              <>
                <a
                  href={winExe.download_url}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all no-underline flex items-center justify-center gap-3"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Windows Installer (.exe)</span>
                  <span className="text-xs font-normal opacity-80">({winExe.file_size_mb} MB)</span>
                </a>
                <a
                  href={winZip.download_url}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-primary text-gray-700 dark:text-zinc-200 font-bold text-sm shadow-sm transition-all no-underline flex items-center justify-center gap-2"
                >
                  <i className="fas fa-file-zipper"></i>
                  <span>Portable Zip ({winZip.file_size_mb} MB)</span>
                </a>
              </>
            )}

            {detectedOS === "macos" && (
              <a
                href={macDmg.download_url}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all no-underline flex items-center justify-center gap-3"
              >
                <i className="fas fa-download"></i>
                <span>Download macOS DMG (.dmg)</span>
                <span className="text-xs font-normal opacity-80">({macDmg.file_size_mb} MB)</span>
              </a>
            )}

            {detectedOS === "linux" && (
              <a
                href={linuxZip.download_url}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all no-underline flex items-center justify-center gap-3"
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
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            All Operating System Packages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* WINDOWS */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-xl">
                  <i className="fab fa-windows"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">Windows</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Windows 10, 11 (64-bit)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Includes automated setup wizard, Start Menu shortcuts, and embedded runtime.
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href={winExe.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-colors no-underline"
                >
                  Installer Setup (.exe) • {winExe.file_size_mb} MB
                </a>
                <a
                  href={winZip.download_url}
                  className="block text-center py-2 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-primary text-gray-600 dark:text-zinc-300 font-semibold text-xs transition-colors no-underline"
                >
                  Portable Zip • {winZip.file_size_mb} MB
                </a>
              </div>
            </div>

            {/* MACOS */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-500/10 text-zinc-700 dark:text-zinc-200 flex items-center justify-center text-xl">
                  <i className="fab fa-apple"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">macOS</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Apple Silicon (M1/M2/M3) &amp; Intel</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Native macOS disk image. Drag to Applications folder and launch.
              </p>
              <div className="pt-2">
                <a
                  href={macDmg.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-colors no-underline"
                >
                  macOS Disk Image (.dmg) • {macDmg.file_size_mb} MB
                </a>
              </div>
            </div>

            {/* LINUX */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-xl">
                  <i className="fab fa-linux"></i>
                </div>
                <div>
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">Linux</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Ubuntu, Debian, Fedora, Arch</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Self-contained bundle with bash launcher script and desktop entry.
              </p>
              <div className="pt-2">
                <a
                  href={linuxZip.download_url}
                  className="block text-center py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-colors no-underline"
                >
                  Portable Bundle (.zip) • {linuxZip.file_size_mb} MB
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* HDE STUDIO CAD COMMERCIAL LICENSE PRICING */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider">
                <i className="fas fa-crown"></i>
                <span>Commercial &amp; Professional CAD License</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                Unlock Full HDE Studio Pro
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
                Offline 2D architectural CAD software with drafting tools, structural layers, CAD block libraries, and high-res vector PDF printing.
              </p>
            </div>

            {/* BILLING TOGGLE */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl flex items-center border border-gray-200 dark:border-zinc-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => setCadBilling('lifetime')}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                    cadBilling === 'lifetime'
                      ? 'bg-primary text-white shadow-md scale-102'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
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
                      : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <i className="fas fa-calendar-alt text-sm"></i>
                  <span>Monthly Pro Plan</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                {cadBilling === 'lifetime'
                  ? "⭐ Limited Launch Offer: One-time payment, perpetual software license & all future updates included."
                  : "Flexible monthly billing. Cancel or reactivate whenever you need."}
              </p>
            </div>

            {/* PRICING CARD & DETAILS */}
            <div className="bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-lg">
                <div className="flex items-baseline gap-3">
                  {cadBilling === 'lifetime' ? (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                        {region === 'US' ? '$299' : '₹18,749'}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {region === 'US' ? '$399' : '₹24,999'}
                      </span>
                      <span className="text-xs font-black uppercase bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                        Save 25%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 font-semibold block sm:inline">
                        / one-time
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                        {region === 'US' ? '$49' : '₹1,999'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-zinc-400 font-semibold">
                        / month
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700 dark:text-zinc-300">
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                    <span><strong>100% Offline 2D CAD Software</strong> — no internet connection required to draft</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                    <span><strong>AutoCAD Vector Blocks</strong> (Furniture, Sanitary, Doors, Windows)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                    <span><strong>Dual Standard Catalogs</strong> (India Metric mm &amp; USA Imperial Feet/Inches)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                    <span><strong>High-Resolution Vector PDF Export</strong> ready for printing &amp; client handoffs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
                    <span><strong>Commercial License</strong> for Architects, Civil Engineers, Contractors &amp; Firms</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <i className="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
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
                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
                  <i className="fas fa-shield-alt text-emerald-600 dark:text-emerald-400"></i>
                  <span>Secure 256-bit checkout via Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-STEP QUICK START GUIDE */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 space-y-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            How to Install and Activate HDE Studio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">Download Setup</h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Download the setup package above for your operating system.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">Run Installer</h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Double click the setup file and follow the on-screen instructions to install.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">Enter License Key</h4>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Launch HDE Studio and paste your License Key shown above to unlock all CAD tools.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
