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

const TARGET_USERS = [
  {
    role: "Homeowners & Self-Builders",
    icon: "fa-house-user",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200",
    badge: "Cost Savings",
    headline: "Visualize before you spend",
    description: "Avoid costly construction mistakes and redesign fees. Easily test whether your furniture fits, adjust bedroom sizes, and experiment with kitchen layouts before breaking ground."
  },
  {
    role: "Civil Contractors & Site Supervisors",
    icon: "fa-helmet-safety",
    color: "from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200",
    badge: "Field Productivity",
    headline: "Instant site sketches on your laptop",
    description: "Draw and revise 2D floor plans directly at the job site. Give masons clear room dimensions and export 300 DPI vector PDF blueprints to clients without waiting for external draftspersons."
  },
  {
    role: "Interior Designers & Decorators",
    icon: "fa-compass-drafting",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200",
    badge: "Space Planning",
    headline: "Real-world ergonomic clearances",
    description: "Drop in modular kitchens, wardrobes, dining suites, and bathroom fixtures with true architectural clearance. Test room circulation and walkway ergonomics in minutes."
  },
  {
    role: "Architecture & Civil Students",
    icon: "fa-graduation-cap",
    color: "from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200",
    badge: "Fast Learning",
    headline: "Master spatial layout fundamentals",
    description: "Focus on design theory, room zoning, and residential circulation without getting trapped in the maze of complex legacy CAD menus or steep learning curves."
  },
  {
    role: "Real Estate Agents & Property Scouts",
    icon: "fa-building",
    color: "from-sky-500/10 to-cyan-500/10 text-sky-700 border-sky-200",
    badge: "Sales & Marketing",
    headline: "Professional presentation floor plans",
    description: "Create crisp, attractive 2D floor plan schematics for property listings that help prospective buyers immediately understand room sizes and home layout flow."
  }
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
              Professional offline 2D architectural space planning, 60+ pre-scaled vector blocks, real-time dynamic dimensioning, and client-ready vector PDF blueprints.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 pt-2 text-xs font-semibold text-slate-700">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i> India Metric (mm) &amp; USA Imperial (Ft/In)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i> 60+ Pre-Scaled Architectural Blocks
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
              href="#tutorials"
              className="px-6 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 font-bold text-sm border border-red-200 transition-all flex items-center gap-2 no-underline shadow-xs"
            >
              <i className="fab fa-youtube text-red-600"></i>
              <span>Video Tutorials</span>
            </a>
            <a
              href="#why-must-have"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all flex items-center gap-2 no-underline shadow-xs"
            >
              <i className="fas fa-star text-amber-500"></i>
              <span>Why It&apos;s a Must-Have</span>
            </a>
            <a
              href="#comparison"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all flex items-center gap-2 no-underline shadow-xs"
            >
              <i className="fas fa-balance-scale text-primary"></i>
              <span>Compare with Traditional 2D Software</span>
            </a>
            <a
              href="#pricing"
              className="px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-200/80 transition-all flex items-center gap-2 no-underline shadow-xs"
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
                📐 30&apos; &times; 40&apos; Architectural Floor Plan
              </span>
              <span className="bg-slate-100 text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-md hidden md:inline">
                🛋️ Smart CAD Block Set
              </span>
            </div>
          </div>

          {/* Clean Light Architectural Floor Plan Showcase */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-5 shadow-xs">
            <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 sm:p-4">
              <Image
                src="/images/cad/architectural-30x40-floor-plan.webp"
                alt="HDE Studio CAD 30x40 Architectural Floor Plan"
                width={1859}
                height={2477}
                className="w-full max-w-2xl h-auto max-h-[800px] object-contain mx-auto"
                priority
              />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-[11px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">Architectural 30&apos; &times; 40&apos; Floor Plan (1,200 Sq.Ft)</span>
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

        {/* SECTION: VIDEO TUTORIALS & TOOL MASTERCLASS GALLERY */}
        <CadTutorialGallery />

        {/* SECTION: WHY HDE STUDIO CAD IS A MUST-HAVE */}
        <section id="why-must-have" className="space-y-8 scroll-mt-12">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <i className="fas fa-sparkles text-emerald-600"></i>
              <span>Simplicity First • Zero CAD Experience Required</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why HDE Studio CAD is the Simple, Must-Have Software for Everyone
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Architectural planning shouldn&apos;t require an engineering degree or a 40-hour training course. HDE Studio CAD is engineered for intuitive point-and-click drafting — giving homeowners, contractors, and designers instant floor plan mastery.
            </p>
          </div>

          {/* 4 Pillars of Simplicity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SIMPLICITY_PILLARS.map((pillar, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border text-lg ${pillar.accent}`}>
                    <i className={`fas ${pillar.icon}`}></i>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">{pillar.subtitle}</span>
                    <h3 className="text-base font-bold text-slate-900">{pillar.title}</h3>
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

          {/* Who Needs It - Target Personas */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Universal Usability</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Who Needs HDE Studio CAD?
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                From self-builders planning dream layouts to contractors sketching on site, see how HDE Studio saves time and money.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TARGET_USERS.map((userRole, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-slate-300 transition-all bg-gradient-to-b from-slate-50/50 to-white flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${userRole.color}`}>
                        <i className={`fas ${userRole.icon}`}></i>
                        {userRole.badge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role #{idx + 1}</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{userRole.role}</h4>
                      <p className="text-xs font-semibold text-primary mt-0.5">&ldquo;{userRole.headline}&rdquo;</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {userRole.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Zero Training Required</span>
                    <i className="fas fa-arrow-right text-[10px] text-slate-400"></i>
                  </div>
                </div>
              ))}

              {/* Callout Card */}
              <div className="rounded-2xl border border-dashed border-primary/40 p-6 bg-primary/5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h4 className="font-bold text-base text-slate-900">Have Your Own Custom Drafting Need?</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    HDE Studio CAD is built for custom floor plans, commercial shops, electrical layouts, and residential remodels.
                  </p>
                </div>
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition-all no-underline"
                >
                  <span>Start Drafting Now</span>
                  <i className="fas fa-arrow-down text-xs"></i>
                </a>
              </div>
            </div>
          </div>

        </section>

        {/* SECTION: TRADITIONAL 2D SOFTWARE VS HDE STUDIO CAD */}
        <section id="comparison" className="space-y-8 scroll-mt-12">

          {/* Comparison Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <i className="fas fa-balance-scale text-primary"></i>
              <span>Honest Architectural Software Comparison</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Traditional 2D Software vs. HDE Studio CAD
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Why fight with bloated, legacy desktop CAD suites when you can draft clean, professional 2D floor plans with zero friction?
            </p>
          </div>

          {/* Comparison Table for Tablet / Desktop (md and above) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">
                      Core Capability
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50/50 w-[37.5%] border-x border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-times-circle text-rose-500"></i>
                        <span>Traditional 2D Software</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50/60 w-[37.5%]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-emerald-600"></i>
                          <span>HDE Studio CAD</span>
                        </div>
                        <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Modern
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {CAD_COMPARISON.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 text-xs mt-0.5">
                            <i className={`fas ${row.icon}`}></i>
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            {row.feature}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 align-top bg-rose-50/20 border-x border-slate-200/50 text-xs sm:text-sm leading-relaxed">
                        <div className="flex items-start gap-2">
                          <i className="fas fa-circle-minus text-rose-400 mt-1 shrink-0 text-xs"></i>
                          <span>{row.traditional}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-900 align-top bg-emerald-50/20 text-xs sm:text-sm font-medium leading-relaxed">
                        <div className="flex items-start gap-2">
                          <i className="fas fa-circle-check text-emerald-600 mt-1 shrink-0 text-xs"></i>
                          <span>{row.hdeStudio}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison Cards for Mobile (hidden on md and above) */}
          <div className="md:hidden space-y-4">
            {CAD_COMPARISON.map((row, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shrink-0">
                    <i className={`fas ${row.icon}`}></i>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{row.feature}</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold uppercase text-[10px] tracking-wider">
                      <i className="fas fa-times-circle text-rose-500"></i>
                      <span>Traditional 2D Software</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {row.traditional}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase text-[10px] tracking-wider">
                      <i className="fas fa-check-circle text-emerald-600"></i>
                      <span>HDE Studio CAD</span>
                    </div>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {row.hdeStudio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA Banner beneath comparison */}
          <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/70 border-2 border-primary/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full">
                <i className="fas fa-bolt text-emerald-600"></i> Pure Speed • Zero Bloat
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Ready to Experience Drafting Without the Headache?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                Download the free standalone desktop installer and begin floor planning in minutes. No credit card required.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a
                href="#download"
                className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center no-underline flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
              >
                <i className="fas fa-download"></i>
                <span>Download Installer</span>
              </a>
              <a
                href="#pricing"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center no-underline flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
              >
                <i className="fas fa-crown text-amber-300"></i>
                <span>Get Lifetime License</span>
              </a>
            </div>
          </div>

        </section>

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
                    <span><strong>Architectural Vector Blocks</strong> (Furniture, Sanitary, Doors, Windows, Vehicles)</span>
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
