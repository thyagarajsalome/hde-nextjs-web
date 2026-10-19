import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import WinterProjectEstimator from "@/components/tools/WinterProjectEstimator";

export const metadata: Metadata = {
  title: "Winter Home Decor & Home Improvements Guide 2026 | HDE US",
  description:
    "The complete USA homeowner guide to winter home decor, cozy styling, weatherproofing draft sealing, attic insulation energy savings, and off-season painting discounts.",
  keywords:
    "winter home decor, winter home improvements, cozy winter living room, weatherproofing windows for winter, attic insulation heating savings, winter interior painting discounts, winter home checklist 2026",
  alternates: {
    canonical: "https://us.homedesignenglish.com/winter-home-guide",
  },
  openGraph: {
    title: "Winter Home Decor & Home Improvements Guide 2026 | HDE",
    description:
      "Transform your home this winter: cozy textile layering, warm 2700K ambient lighting, draft proofing, and smart HVAC savings.",
    url: "https://us.homedesignenglish.com/winter-home-guide",
    siteName: "Home Design English",
    type: "website",
  },
};

const DECOR_PILLARS = [
  {
    title: "Layering Textiles",
    subtitle: "Physical & Visual Warmth",
    icon: "fa-layer-group",
    accent: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    desc: "Swap lightweight summer fabrics for chunky-knit throw blankets, heavy flannel or crushed velvet pillow covers, and high-pile wool or faux shearling area rugs to insulate bare floors."
  },
  {
    title: "Cozy Lighting & Ambience",
    subtitle: "Combating Winter Gloom",
    icon: "fa-lightbulb",
    accent: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20",
    desc: "Replace harsh overhead can lights with soft 2200K–2700K warm-toned ambient lamps, flickering flameless LED candles, and modern electric fireplace inserts."
  },
  {
    title: "Mantel & Entryway Styling",
    subtitle: "Functional Drops & Warm Foyers",
    icon: "fa-fire",
    accent: "text-rose-600 bg-rose-500/10 border-rose-500/20",
    desc: "Decorate fireplace mantels with cascading cedar garlands and rustic birch logs, while outfitting entryways with heavy-duty boot trays, scraped coir mats, and winter coat hooks."
  },
  {
    title: "Seasonal Transitions",
    subtitle: "From Holiday Cheer to Clean Refresh",
    icon: "fa-tree",
    accent: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    desc: "Seamlessly pivot from late-November holiday decor (Christmas, Hanukkah) into a serene, minimalist 'winter refresh' in January and February using natural evergreens and warm neutrals."
  }
];

const IMPROVEMENTS = [
  {
    title: "Weatherproofing & Draft Sealing",
    savings: "Saves $150 – $280 / yr",
    icon: "fa-wind",
    highlight: "15% Draft Reduction",
    desc: "Seal gaps around drafty windows and exterior door thresholds with paintable silicone caulk, door sweeps, and foam insulation gaskets behind switchplates."
  },
  {
    title: "Attic & Crawlspace Insulation",
    savings: "Cuts Heating Bills ~15%",
    icon: "fa-cubes-stacked",
    highlight: "Federal 30% Tax Credit",
    desc: "Upgrading attic insulation to R-49 or R-60 traps rising heat inside living zones, prevents destructive gutter ice dams, and qualifies for federal energy credits."
  },
  {
    title: "Off-Season Interior Painting",
    savings: "15% – 25% Contractor Discount",
    icon: "fa-paint-roller",
    highlight: "Zero-VOC & Fast Drying",
    desc: "Winter is the contractor industry's slowest quarter. Take advantage of low trade rates and faster curing indoor air to repaint living areas with light-maximizing hues."
  },
  {
    title: "Lighting & Fixture Upgrades",
    savings: "Long-term LED Efficiency",
    icon: "fa-wand-magic-sparkles",
    highlight: "Boosts Mood & Circadian Rhythm",
    desc: "Replace dated builder-grade light fixtures with modern chandeliers and high-CRI (90+) warm LED bulbs that combat winter seasonal affective gloom."
  },
  {
    title: "Smart Thermostats & HVAC Care",
    savings: "8% – 12% Heating Bill Drop",
    icon: "fa-temperature-arrow-down",
    highlight: "Automated Setback Schedules",
    desc: "Install an ENERGY STAR smart thermostat, change air filters to clean MERV 8–11 pleats, and reverse ceiling fan blades clockwise to push trapped ceiling heat down."
  },
  {
    title: "Indoor DIY & Space Organization",
    savings: "High Appraisal & Lifestyle ROI",
    icon: "fa-boxes-stacked",
    highlight: "Weekend-Friendly Tasks",
    desc: "While outdoor work stops, tackle high-impact indoor updates: ceramic subway tile kitchen backsplashes, custom closet systems, and refreshed bathroom vanities."
  }
];

const FAQS = [
  {
    q: "What are the most cost-effective winter home improvement projects?",
    a: "Weatherproofing windows with silicone caulk and door sweeps is the #1 highest-ROI improvement, often paying for itself within 1 to 2 heating months. Upgrading attic insulation and installing a programmable smart thermostat follow closely, together reducing annual winter heating bills by 20% or more."
  },
  {
    q: "Why is winter a great time to hire interior home painters?",
    a: "Exterior painting is paused during sub-freezing winter weather across most of the US. Professional painting contractors experience their quietest quarter between December and February, routinely offering 15% to 25% discounts on labor and greater scheduling flexibility."
  },
  {
    q: "How do I transition home decor from Christmas to January winter style?",
    a: "Pack away festive character figurines, tinsel, and holiday reds by early January, but keep natural greenery, pinecone accents, white birch logs, and warm 2700K ambient fairy lights. This creates a peaceful, Scandinavian-inspired 'winter refresh' that feels intentional rather than stripped bare."
  },
  {
    q: "Can I use HDE Studio CAD to plan interior room renovations in the winter?",
    a: "Yes. HDE Studio CAD is a native desktop 2D architectural drafting tool that runs 100% offline. You can design precise floor plans, test furniture arrangements around fireplaces and heating vents, and export 300 DPI vector PDF blueprints for your contractors."
  }
];

export default function WinterHomeGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Winter Home Decor & Home Improvements Guide 2026",
    url: "https://us.homedesignenglish.com/winter-home-guide",
    description:
      "Comprehensive USA homeowner guide covering winter home decor, cozy styling, weatherproofing, insulation energy savings, and off-season painting.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <Script
        id="winter-guide-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="winter-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* HERO SECTION - HDE Brand Cream White */}
      <section className="bg-gradient-to-b from-[#fdfbf7] via-[#faf6ee] to-white border-b border-[#c5a059]/25 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#c5a059]/15 text-[#8c6b2d] border border-[#c5a059]/30 uppercase tracking-wider shadow-2xs">
            <i className="fas fa-snowflake text-[#c5a059]"></i>
            <span>2026 USA Seasonal Homeowner Guide</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0f2042]">
            Winter Home Decor &amp; Energy Improvements
          </h1>

          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            Turn cold, drafty rooms into warm, inviting retreats. Master tactile textile layering, draft weatherproofing, attic insulation savings, and off-season contractor discounts.
          </p>

          {/* Quick Anchor Jumps */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-3 text-xs font-bold">
            <a
              href="#decor"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-primary shadow-xs transition no-underline flex items-center gap-2"
            >
              <i className="fas fa-couch text-amber-500"></i>
              <span>Winter Decor Trends</span>
            </a>
            <a
              href="#calculator"
              className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-xs transition no-underline flex items-center gap-2"
            >
              <i className="fas fa-calculator"></i>
              <span>Cost &amp; Savings Calculator</span>
            </a>
            <a
              href="#improvements"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:border-primary shadow-xs transition no-underline flex items-center gap-2"
            >
              <i className="fas fa-tools text-emerald-600"></i>
              <span>Top 6 Home Improvements</span>
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* SECTION 1: WINTER HOME DECOR & STYLING */}
        <section id="decor" className="space-y-8 scroll-mt-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Interior Design &amp; Styling
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              4 Pillars of Cozy Winter Living
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Winter design is about deliberate sensory warmth. Combine rich fabrics, layered lighting, and functional mudroom transitions to create a peaceful sanctuary.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DECOR_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border text-lg ${pillar.accent}`}
                  >
                    <i className={`fas ${pillar.icon}`}></i>
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-primary">
                  <span>Explore in Deep-Dive Guide →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Deep-Dive Blog Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Featured Editorial Guide
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                Read the Complete Winter Home Decor &amp; Cozy Styling Guide
              </h4>
              <p className="text-xs text-slate-600">
                Detailed fabric comparison charts, Kelvin lighting color formulas, and post-holiday transition tips.
              </p>
            </div>
            <Link
              href="/blog/winter-home-decor-ideas-cozy-styling-guide"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition no-underline shrink-0 flex items-center gap-2"
            >
              <span>Read Decor Guide (2,000+ Words)</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE CALCULATOR WIDGET */}
        <section id="calculator" className="scroll-mt-12">
          <WinterProjectEstimator />
        </section>

        {/* SECTION 3: TOP 6 WINTER HOME IMPROVEMENTS */}
        <section id="improvements" className="space-y-8 scroll-mt-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Energy Savings &amp; Renovation ROI
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Top Winter Home Improvements
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When outdoor work stops, tackle high-impact indoor updates. Cut up to 15% off heating bills while booking contractors during their quietest off-season.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMPROVEMENTS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm shadow-2xs">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      {item.highlight}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-xs font-bold text-primary block mt-0.5">
                      {item.savings}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  Priority: High Winter ROI
                </div>
              </div>
            ))}
          </div>

          {/* Deep-Dive Blog Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Featured Editorial Guide
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                Read the Winter Home Improvements &amp; Energy ROI Checklist
              </h4>
              <p className="text-xs text-slate-600">
                Detailed insulation R-value maps, weatherstripping checklists, and off-season painting rate tables.
              </p>
            </div>
            <Link
              href="/blog/winter-home-improvement-projects-cost-checklist"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition no-underline shrink-0 flex items-center gap-2"
            >
              <span>Read Improvements Guide (2,000+ Words)</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </section>

        {/* SECTION 4: HDE STUDIO CAD INTEGRATION CARD - HDE Brand Cream Light */}
        <section className="bg-gradient-to-br from-[#fdfbf7] via-[#faf6ee] to-[#f4ecdb] border-2 border-[#c5a059]/40 rounded-3xl p-8 sm:p-12 text-[#0f2042] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#c5a059]/20 text-[#8c6b2d] border border-[#c5a059]/40 shadow-2xs">
              <i className="fas fa-cube text-[#8c6b2d]"></i>
              <span>Offline Desktop Software</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0f2042] tracking-tight">
              Model Your Winter Renovation Layouts with HDE Studio CAD
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Planning to finish your basement, remodel a bathroom, or draft a mudroom addition this winter? Avoid costly contractor redesign fees by drafting precise 2D blueprints with automated dimensioning and 60+ architectural vector blocks.
            </p>
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center"><i className="fas fa-circle-check text-emerald-600 mr-1.5 text-sm"></i> 100% Offline Standalone App</span>
              <span className="flex items-center"><i className="fas fa-circle-check text-emerald-600 mr-1.5 text-sm"></i> USA Imperial (Ft/In) Catalogs</span>
              <span className="flex items-center"><i className="fas fa-circle-check text-emerald-600 mr-1.5 text-sm"></i> 300 DPI Vector PDF Blueprints</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/download"
              className="px-8 py-4 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white font-black text-sm shadow-md hover:shadow-lg transition-all text-center no-underline flex items-center justify-center gap-2.5 cursor-pointer border border-[#0f2042]"
            >
              <i className="fas fa-download text-[#c5a059]"></i>
              <span>Download CAD Studio Free</span>
            </Link>
            <Link
              href="/download#pricing"
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all text-center no-underline flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fas fa-crown text-amber-300"></i>
              <span>Get Lifetime License ($299)</span>
            </Link>
          </div>
        </section>

        {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              Homeowner Knowledge Base
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Winter Home Planning FAQ
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Common questions about winter home weatherproofing, off-season renovation scheduling, and energy savings.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CROSS LINKS TO USA REAL ESTATE CALCULATORS */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
          <h4 className="font-extrabold text-lg text-slate-900">
            Explore More USA Construction &amp; Real Estate Estimators
          </h4>
          <p className="text-xs text-slate-600 max-w-xl mx-auto">
            Accurate, city-specific cost calculators for major American metropolitan areas.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs font-bold">
            <Link
              href="/real-estate"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-primary hover:border-primary transition no-underline shadow-2xs"
            >
              All 9 USA Calculators
            </Link>
            <Link
              href="/real-estate/texas"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-primary transition no-underline shadow-2xs"
            >
              Texas Real Estate Hub
            </Link>
            <Link
              href="/real-estate/florida"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-primary transition no-underline shadow-2xs"
            >
              Florida Real Estate Hub
            </Link>
            <Link
              href="/real-estate/california"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-primary transition no-underline shadow-2xs"
            >
              California Real Estate Hub
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
