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
import CadTutorialGallery from "@/components/cad/CadTutorialGallery";

const CAD_COMPARISON = [
  {
    feature: "Learning Curve & Complexity",
    traditional: "Steep learning curve. Requires weeks of specialized training, memorizing command-line prompts, and navigating dense 1,000-icon engineering toolbars.",
    hdeStudio: "Zero learning curve. Intuitive point-and-click architectural drafting designed so anyone can create a complete floor plan within 5 minutes.",
    icon: "fa-graduation-cap",
  },
  {
    feature: "Wall Drafting & Corner Healing",
    traditional: "Manual multi-step process: drawing single lines, offsetting double lines, manually trimming intersections, and fixing corner joints.",
    hdeStudio: "Smart Wall Snapping & Corner Mitering. Corners weld automatically, and doors/windows cut through walls with zero manual trimming.",
    icon: "fa-border-all",
  },
  {
    feature: "Pre-Scaled Architectural Blocks",
    traditional: "Users must hunt online for third-party block libraries, unscale them, purge messy layers, and convert unit systems.",
    hdeStudio: "60+ Built-in Architectural Vector Blocks (Beds, Sofas, Kitchens, Bathrooms, Vehicles) calibrated to standard room clearances.",
    icon: "fa-couch",
  },
  {
    feature: "Dimensioning & Annotation",
    traditional: "Tedious manual dimension setup, configuring dimension styles, scale factors, and manually moving tick marks after wall edits.",
    hdeStudio: "Live Dynamic Dimension Chains that automatically calculate and display wall and room lengths in real-time as you draft.",
    icon: "fa-ruler-combined",
  },
  {
    feature: "Software Size & Boot Speed",
    traditional: "Heavy 4 GB to 10 GB disk footprint, sluggish startup (30–60s), and heavy background licensing daemons.",
    hdeStudio: "Ultra-Lightweight (~38 MB installer), instant 2-second launch, and smooth performance on any everyday laptop or workstation.",
    icon: "fa-bolt",
  },
  {
    feature: "Pricing & License Ownership",
    traditional: "Expensive recurring subscriptions ($300 to $2,000+/year) with forced cloud lock-in that revokes file access if unpaid.",
    hdeStudio: "Affordable Lifetime Commercial License (perpetual ownership) with free future updates, or low-cost monthly flexibility.",
    icon: "fa-tag",
  },
  {
    feature: "Offline Reliability",
    traditional: "Frequently demands internet connectivity for cloud license checks, user sign-in verification, and update nag screens.",
    hdeStudio: "100% Offline Standalone Desktop Software. Full drafting, editing, and vector export capability anywhere with zero internet.",
    icon: "fa-shield-halved",
  },
];

const SIMPLICITY_PILLARS = [
  {
    title: "Zero Learning Curve",
    subtitle: "Draft in 5 Minutes",
    desc: "No command line, no obscure shortcuts. Visual point-and-click drafting makes floor planning as intuitive as sketching on graph paper.",
    icon: "fa-wand-magic-sparkles",
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Smart Wall Auto-Healing",
    subtitle: "Automatic Miters & Cutouts",
    desc: "Corners miter and weld automatically. Drop a door or window onto any wall and HDE Studio cleanly cuts the opening with frame reveals instantly.",
    icon: "fa-layer-group",
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Live Dimension Chains",
    subtitle: "Precision Real-Time Feedback",
    desc: "Dimension strings calculate dynamically as you adjust walls and rooms. Say goodbye to manual measurement re-annotations.",
    icon: "fa-ruler-combined",
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Dual Standard Catalogs",
    subtitle: "Metric (mm) & Imperial (Ft/In)",
    desc: "Switch between India Metric (mm, cm, m, sqft) and USA Imperial (feet, inches) in one click with pre-calibrated snap grids.",
    icon: "fa-globe",
    accent: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  }
];

const CAD_FAQS = [
  {
    q: "Is there a free trial for HDE Studio CAD?",
    a: "Yes! HDE Studio CAD includes a 14-day full-featured free trial for everyone. When you install the app on Windows, macOS, or Linux, you get immediate access to all architectural drafting tools, 60+ vector blocks, automatic wall mitering, dynamic dimensions, and 300 DPI vector PDF blueprints with zero credit card required. After 14 days, you can choose to activate a perpetual Lifetime license or Monthly plan directly inside the app."
  },
  {
    q: "Do I need prior 2D CAD drafting experience to use HDE Studio?",
    a: "No CAD experience is required. Traditional 2D CAD software was designed for specialized engineers and requires memorizing hundreds of text commands. HDE Studio was engineered specifically to be visual, intuitive, and accessible to everyone. You can start drawing walls, placing doors, adding furniture, and dimensioning rooms within 5 minutes of opening the app."
  },
  {
    q: "Why is HDE Studio CAD a must-have for homeowners, contractors, and designers?",
    a: "Because it bridges the gap between rough hand sketches and overly complicated legacy CAD programs. Homeowners can test furniture fits and plan room layouts before spending thousands on construction. Contractors can sketch site revisions on their laptop and hand masons accurate vector drawings. Designers can verify clearances and room flow in minutes."
  },
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
    a: "No. Each commercial license is strictly valid for 1 single PC / workstation. If you need to run HDE Studio CAD on multiple computers in your office or across your drafting team, each PC requires its own separate commercial license key. For multi-PC firm licenses, please contact us at hdeadmin@gmail.com."
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
  const { region, setRegion } = useRegion();
  const { showToast } = useToast();

  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [license, setLicense] = useState<DesktopLicense | null>(null);
  const [detectedOS, setDetectedOS] = useState<"windows" | "macos" | "linux">("windows");
  const [loading, setLoading] = useState(true);
  const [cadBilling, setCadBilling] = useState<'lifetime' | 'monthly'>('lifetime');
  const [buyingCad, setBuyingCad] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isAdmin = Boolean(user && user.email?.toLowerCase() === "thyagaraja1983@gmail.com");

  // Load Razorpay Checkout Script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Razorpay) return;
    const existing = document.getElementById("razorpay-checkout-js");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Detect OS
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
      const isAE = region === 'AE';
      const planId = (isUS || isAE)
        ? (cadBilling === 'lifetime' ? 'usa_lifetime_pro' : 'usa_monthly_pro')
        : (cadBilling === 'lifetime' ? 'india_lifetime_pro' : 'india_monthly_pro');
      const currency = (isUS || isAE) ? 'USD' : 'INR';

      const { data: order, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { planId, currency },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (orderError || !order || order.error) {
        throw new Error(order?.error || "Order creation failed.");
      }

      // Ensure Razorpay SDK is available
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        // Attempt quick on-demand load
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () => resolve();
          document.body.appendChild(s);
        });
      }

      if (!(window as any).Razorpay) {
        throw new Error("Payment gateway could not be loaded. Please check your internet connection.");
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_RVimcPWU7yAgZr';

      const options = {
        key: keyId,
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

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showToast(err.message || "Payment initiation failed", "error");
    } finally {
      setBuyingCad(false);
    }
  };

  // Find installer URLs
  const winExe = releases.find(r => r.platform === 'windows' && r.installer_type === 'exe') || {
    download_url: 'https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/releases/v2.2.6/HDE-Studio-Setup-v2.2.6.exe',
    file_size_mb: 37.2
  };
  const winZip = releases.find(r => r.platform === 'windows' && r.installer_type === 'zip') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.2.6/HDE-Studio-v2.2.6-Windows-Portable.zip',
    file_size_mb: 8.5
  };
  const linuxZip = releases.find(r => r.platform === 'linux') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.2.6/HDE-Studio-v2.2.6-Linux-Portable.zip',
    file_size_mb: 8.4
  };
  const macDmg = releases.find(r => r.platform === 'macos') || {
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.2.6/HDE-Studio.dmg',
    file_size_mb: 61.7
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-primary/20 selection:text-primary">
      
      {/* ADMIN QUICK-ACTION BAR (THYAGARAJA1983@GMAIL.COM) */}
      {isAdmin && (
        <div className="bg-amber-400 text-slate-950 font-bold px-4 py-2.5 border-b border-amber-500 shadow-xs sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-[10px]">
                <i className="fas fa-crown"></i>
              </span>
              <span>Admin Mode Active: <strong>{user?.email}</strong></span>
              <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full uppercase font-black">
                CAD Studio Admin
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/tutorials"
                className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs transition flex items-center gap-1.5 no-underline shadow-xs cursor-pointer"
              >
                <i className="fab fa-youtube text-red-500"></i>
                <span>Open Video Tutorials Manager (Add / Edit Videos) &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200 text-xs text-slate-500 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors no-underline text-slate-600">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">HDE Studio CAD</span>
        </div>
      </nav>

      {/* STREAMLINED HERO: DOWNLOAD IMMEDIATELY ABOVE THE FOLD */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          {/* Brand Icon & Version Pill */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center p-2 transition-transform hover:scale-105 duration-300">
              <Image
                src="/images/cad/HDE_256px.webp"
                alt="HDE Studio House Planning Tool Icon"
                width={256}
                height={256}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <i className="fas fa-gift text-emerald-600"></i>
              <span>14-Day Full-Featured Free Trial Included • Version 2.2.6</span>
            </div>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
              Design Faster with <span className="text-primary">HDE Studio</span> CAD
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Intuitive offline 2D architectural space planning, 60+ pre-scaled vector blocks, real-time dynamic dimensioning, and client-ready 300 DPI vector PDF blueprints. <strong>Try 100% free for 14 days — zero credit card required.</strong>
            </p>
          </div>

          {/* PRIMARY DOWNLOAD ACTION BUTTONS (DIRECT & INSTANT) */}
          <div id="download" className="pt-2 max-w-xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {detectedOS === "windows" && (
                <>
                  <a
                    href={winExe.download_url}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-102 transition-all no-underline flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <i className="fab fa-windows text-xl"></i>
                    <div className="text-left">
                      <div className="text-sm font-black leading-tight">Download 14-Day Free Trial</div>
                      <div className="text-[11px] font-normal opacity-90">Windows 64-bit Installer (.exe) • {winExe.file_size_mb} MB</div>
                    </div>
                  </a>
                  <a
                    href={winZip.download_url}
                    className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition-all no-underline flex items-center justify-center gap-2"
                    title="Portable version with zero installation"
                  >
                    <i className="fas fa-file-zipper text-sm"></i>
                    <span>Portable Zip ({winZip.file_size_mb} MB)</span>
                  </a>
                </>
              )}

              {detectedOS === "macos" && (
                <a
                  href={macDmg.download_url}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-102 transition-all no-underline flex items-center justify-center gap-3 cursor-pointer"
                >
                  <i className="fab fa-apple text-xl"></i>
                  <div className="text-left">
                    <div className="text-sm font-black leading-tight">Download 14-Day Free Trial</div>
                    <div className="text-[11px] font-normal opacity-90">macOS Apple Silicon &amp; Intel (.dmg) • {macDmg.file_size_mb} MB</div>
                  </div>
                </a>
              )}

              {detectedOS === "linux" && (
                <a
                  href={linuxZip.download_url}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-102 transition-all no-underline flex items-center justify-center gap-3 cursor-pointer"
                >
                  <i className="fab fa-linux text-xl"></i>
                  <div className="text-left">
                    <div className="text-sm font-black leading-tight">Download 14-Day Free Trial</div>
                    <div className="text-[11px] font-normal opacity-90">Linux Portable Bundle (.zip) • {linuxZip.file_size_mb} MB</div>
                  </div>
                </a>
              )}
            </div>

            {/* Other OS Switcher Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
              <span className="font-semibold text-slate-400">Other Platforms:</span>
              <a href={winExe.download_url} className="hover:text-primary transition font-medium no-underline flex items-center gap-1">
                <i className="fab fa-windows text-[11px]"></i> Windows .exe
              </a>
              <span>•</span>
              <a href={macDmg.download_url} className="hover:text-primary transition font-medium no-underline flex items-center gap-1">
                <i className="fab fa-apple text-[11px]"></i> macOS .dmg
              </a>
              <span>•</span>
              <a href={linuxZip.download_url} className="hover:text-primary transition font-medium no-underline flex items-center gap-1">
                <i className="fab fa-linux text-[11px]"></i> Linux .zip
              </a>
            </div>

            {/* In-Page Jump Anchors */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-600 pt-2">
              <a href="#features" className="hover:text-primary transition no-underline flex items-center gap-1.5">
                <i className="fas fa-sparkles text-amber-500 text-[11px]"></i>
                <span>Features</span>
              </a>
              <span>•</span>
              <a href="#comparison" className="hover:text-primary transition no-underline flex items-center gap-1.5">
                <i className="fas fa-balance-scale text-primary text-[11px]"></i>
                <span>Compare CAD</span>
              </a>
              <span>•</span>
              <a href="#tutorials" className="hover:text-primary transition no-underline flex items-center gap-1.5">
                <i className="fab fa-youtube text-red-600 text-[11px]"></i>
                <span>Video Tutorials</span>
              </a>
              <span>•</span>
              <a href="#pricing" className="hover:text-primary transition no-underline flex items-center gap-1.5 text-[#a07c33] font-bold">
                <i className="fas fa-crown text-[11px]"></i>
                <span>Pro License</span>
              </a>
              <span>•</span>
              <a href="#faqs" className="hover:text-primary transition no-underline flex items-center gap-1.5">
                <i className="fas fa-circle-question text-[11px]"></i>
                <span>FAQs</span>
              </a>
            </div>

            {isAdmin && (
              <div className="pt-1">
                <Link
                  href="/admin/tutorials"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs transition no-underline shadow-2xs"
                >
                  <i className="fab fa-youtube text-red-600"></i>
                  <span>Admin: Add / Manage Video Tutorials &rarr;</span>
                </Link>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <i className="fas fa-gift text-emerald-600"></i> 14-Day Full-Featured Free Trial
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-shield-halved text-emerald-600"></i> 100% Offline Standalone App
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-bolt text-amber-500"></i> Zero Learning Curve
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-file-pdf text-red-500"></i> 300 DPI Vector PDF Export
            </span>
          </div>

        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">

        {/* LICENSE KEY ACTIVATION WIDGET */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900">
                <i className="fas fa-key text-primary text-lg"></i>
                <h2 className="text-lg font-bold">Your Desktop License Key</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Enter your key and registered account email in HDE Studio (Help &gt; Activate License) to unlock commercial features.
              </p>
            </div>

            {user ? (
              license ? (
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-slate-50 border border-slate-300 px-4 py-2.5 rounded-xl font-mono text-sm font-bold text-slate-900 tracking-wider flex items-center justify-between gap-4 shadow-inner">
                    <span>{license.license_key}</span>
                    <span className="text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {license.edition}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <i className={copied ? "fas fa-check" : "fas fa-copy"}></i>
                    <span>{copied ? "Copied!" : "Copy Key"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <i className="fas fa-gift text-emerald-600"></i>
                    <span>14-Day Free Trial Active on Install</span>
                  </div>
                  <a
                    href="#pricing"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 no-underline cursor-pointer whitespace-nowrap"
                  >
                    <span>Upgrade to Lifetime Pro</span>
                    <i className="fas fa-arrow-down text-[10px]"></i>
                  </a>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin?redirect=/download"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition-all no-underline"
                >
                  Sign In to View License
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 1: CORE PILLARS OF SIMPLICITY */}
        <section id="features" className="space-y-6 scroll-mt-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Intuitive Drafting</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why HDE Studio CAD is Built for Everyone
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Zero engineering curve. Point-and-click drafting gives homeowners, contractors, and designers instant floor plan mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SIMPLICITY_PILLARS.map((pillar, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-base ${pillar.accent}`}>
                    <i className={`fas ${pillar.icon}`}></i>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{pillar.subtitle}</span>
                    <h3 className="text-sm font-bold text-slate-900">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <i className="fas fa-check text-xs"></i> Built-in Standard
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: SOFTWARE COMPARISON TABLE */}
        <section id="comparison" className="space-y-6 scroll-mt-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Honest Software Comparison</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Traditional 2D CAD vs. HDE Studio CAD
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Why struggle with bloated, expensive legacy CAD suites when you can draft clean, professional 2D floor plans with zero friction?
            </p>
          </div>

          {/* Desktop Comparison Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="py-3 px-5 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">
                    Capability
                  </th>
                  <th className="py-3 px-5 text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50/40 w-[37.5%] border-x border-slate-200/60">
                    Traditional 2D Software
                  </th>
                  <th className="py-3 px-5 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50/50 w-[37.5%]">
                    HDE Studio CAD
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {CAD_COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 align-top">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${row.icon} text-slate-400 text-xs`}></i>
                        <span>{row.feature}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 align-top bg-rose-50/20 border-x border-slate-200/50 leading-relaxed text-xs">
                      {row.traditional}
                    </td>
                    <td className="py-3.5 px-5 text-slate-900 align-top bg-emerald-50/20 font-medium leading-relaxed text-xs">
                      <div className="flex items-start gap-1.5">
                        <i className="fas fa-check-circle text-emerald-600 text-xs mt-0.5 shrink-0"></i>
                        <span>{row.hdeStudio}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Comparison Cards */}
          <div className="md:hidden space-y-3">
            {CAD_COMPARISON.map((row, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <i className={`fas ${row.icon} text-primary`}></i>
                  <span>{row.feature}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/70 text-slate-600 space-y-1">
                  <span className="font-bold text-rose-800 text-[10px] uppercase">Traditional CAD</span>
                  <p>{row.traditional}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-slate-900 font-medium space-y-1">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase">HDE Studio</span>
                  <p>{row.hdeStudio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: 16:9 CAD VIDEO TUTORIALS MASTERCLASS */}
        <CadTutorialGallery />

        {/* SECTION 3: COMMERCIAL PRO LICENSE PRICING */}
        <section id="pricing" className="bg-white border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden scroll-mt-12 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059]/10 text-[#a07c33] border border-[#c5a059]/30 text-xs font-black uppercase tracking-wider">
              <i className="fas fa-crown"></i>
              <span>14-Day Free Trial • Upgrade to Perpetual Pro Anytime</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Try Free for 14 Days, Then Choose Your Pro Plan
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Draft unrestricted on your PC for 14 days with zero credit card required. When ready, upgrade to perpetual Lifetime ownership or flexible monthly billing with instant hardware seat binding.
            </p>
          </div>

          {/* Region Currency Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Select Region:</span>
            <button
              type="button"
              onClick={() => setRegion('IN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                region === 'IN' || !region
                  ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 shadow-2xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🇮🇳</span>
              <span>India (Rs.)</span>
            </button>
            <button
              type="button"
              onClick={() => setRegion('US')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                region === 'US'
                  ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 shadow-2xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🇺🇸</span>
              <span>USA ($)</span>
            </button>
            <button
              type="button"
              onClick={() => setRegion('AE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                region === 'AE'
                  ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 shadow-2xs font-black'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🇦🇪</span>
              <span>Dubai (Dhs)</span>
            </button>
          </div>

          {/* Billing Selector */}
          <div className="flex flex-col items-center justify-center gap-2 pt-1">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => setCadBilling('lifetime')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  cadBilling === 'lifetime'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-infinity text-xs"></i>
                <span>Lifetime License</span>
                <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                  SAVE 25%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCadBilling('monthly')}
                className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  cadBilling === 'monthly'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-calendar-alt text-xs"></i>
                <span>Monthly Plan</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {cadBilling === 'lifetime'
                ? "⭐ One-time payment • Perpetual software license & all future updates included."
                : "Cancel or reactivate whenever you need."}
            </span>
          </div>

          {/* Checkout Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-md">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {cadBilling === 'lifetime'
                    ? (region === 'US' ? '$299' : region === 'AE' ? '1,099 Dhs' : 'Rs. 9,999')
                    : (region === 'US' ? '$59' : region === 'AE' ? '199 Dhs' : 'Rs. 1,999')}
                </span>
                {cadBilling === 'lifetime' && (
                  <span className="text-base text-slate-400 line-through">
                    {region === 'US' ? '$599' : region === 'AE' ? '2,199 Dhs' : 'Rs. 19,999'}
                  </span>
                )}
                <span className="text-xs text-slate-500 font-semibold">
                  {cadBilling === 'lifetime' ? '/ one-time' : '/ month'}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600"></i>
                  <span><strong>100% Offline Software</strong> — draft anywhere with zero internet</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600"></i>
                  <span><strong>60+ Architectural Vector Blocks</strong> (Furniture, Kitchens, Baths)</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600"></i>
                  <span><strong>Dual Standard Catalogs</strong> (Metric mm &amp; Imperial Ft/In)</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600"></i>
                  <span><strong>300 DPI Vector PDF Blueprints</strong> for client handoffs</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600"></i>
                  <span>Instant desktop license key linked to your account</span>
                </li>
              </ul>
            </div>

            <div className="w-full md:w-auto text-center space-y-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCadCheckout}
                disabled={buyingCad}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 hover:scale-102"
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
                        ? `Buy Lifetime License • ${region === 'US' ? '$299' : region === 'AE' ? '1,099 Dhs' : 'Rs. 9,999'}`
                        : `Subscribe Monthly • ${region === 'US' ? '$59/mo' : region === 'AE' ? '199 Dhs/mo' : 'Rs. 1,999/mo'}`}
                    </span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <i className="fas fa-shield-alt text-emerald-600"></i>
                <span>Secure 256-bit payment via Razorpay</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: 3-STEP INSTALL GUIDE */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900 text-center">
            How to Install and Activate HDE Studio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Download Installer</h4>
              <p className="text-xs text-slate-600">
                Click download above for Windows, macOS, or Linux.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Run Setup</h4>
              <p className="text-xs text-slate-600">
                Double-click the installer and launch the application in 2 seconds.
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Enter License Key</h4>
              <p className="text-xs text-slate-600">
                Open Help &gt; Activate License and paste your key to unlock Pro drafting.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section id="faqs" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs scroll-mt-12">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-500">
              Everything you need to know about downloading, installing, and licensing HDE Studio CAD.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {CAD_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-4 font-bold text-slate-900 text-xs sm:text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <i
                      className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    ></i>
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: UNIFIED SUPPORT & ARCHITECTURAL DISCLAIMER */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-6 space-y-4 text-xs text-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-sm shrink-0">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Need Help or Feature Assistance?</h4>
                <p className="text-[11px] text-slate-500">Our engineering team responds to all drafting and licensing inquiries within 24 hours.</p>
              </div>
            </div>
            <a
              href="mailto:hdeadmin@gmail.com?subject=HDE%20Studio%20CAD%20Inquiry"
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-primary text-slate-800 hover:text-primary font-bold text-xs transition no-underline flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <i className="fas fa-envelope text-primary"></i>
              <span>hdeadmin@gmail.com</span>
            </a>
          </div>

          <p className="leading-relaxed text-[11px] text-slate-500">
            <strong>Professional Disclaimer:</strong> HDE Studio CAD is an architectural floor plan drafting and spatial layout tool. Standard room sets, wall thickness presets, and dimensioning tools adhere to common building conventions. All final structural engineering, beam/column load sizing, foundation depth, and local municipal building code compliances must be reviewed, stamped, and approved by a locally licensed architect or structural engineer before construction commences.
          </p>
        </div>

      </div>
    </div>
  );
}
