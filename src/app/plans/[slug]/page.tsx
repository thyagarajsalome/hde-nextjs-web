import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HOUSE_PLAN_SEO_DATA } from "@/data/housePlanSeoData";
import { supabase } from "@/config/supabaseClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(HOUSE_PLAN_SEO_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = HOUSE_PLAN_SEO_DATA[slug];

  if (!data) {
    return { title: "House Plan Not Found - HDE" };
  }

  const canonicalUrl = `https://www.homedesignenglish.com/plans/${data.slug}`;

  return {
    title: data.metaTitle,
    description: data.metaDesc,
    keywords: `${data.shortTitle}, house design india, modern architectural floor plans, ${data.dimensions} house plans, duplex house plan, small house design, ${data.bhkConfig}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDesc,
      url: canonicalUrl,
      siteName: "Home Design English (HDE)",
      locale: "en_IN",
      type: "article",
    },
  };
}

const FALLBACK_BLUEPRINTS = [
  {
    id: "fb-1",
    title: "1200 Sqft Modern Residential Blueprint",
    dimensions: "30x40",
    area_sqft: 1200,
    facing: "East",
    file_url: "full-plans/1775572207976-plan.webp",
  },
  {
    id: "fb-2",
    title: "1500 Sqft 3 BHK Architectural Floor Layout",
    dimensions: "30x50",
    area_sqft: 1500,
    facing: "South",
    file_url: "full-plans/1775658424321-plan.webp",
  },
  {
    id: "fb-3",
    title: "1000 Sqft Compact Townhouse Floor Plan",
    dimensions: "25x40",
    area_sqft: 1000,
    facing: "East",
    file_url: "full-plans/1775625468250-plan.webp",
  },
  {
    id: "fb-4",
    title: "800 Sqft 2 BHK Linear Plot Design",
    dimensions: "20x40",
    area_sqft: 800,
    facing: "East",
    file_url: "full-plans/1775623303178-plan.webp",
  },
];

function getPlanImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.replace(/^\/+/, '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ncontvjtfhsabphxfuhb.supabase.co';
  return `${supabaseUrl}/storage/v1/object/public/house-plans/${cleanPath}`;
}

export default async function HousePlanSeoPage({ params }: Props) {
  const { slug } = await params;
  const data = HOUSE_PLAN_SEO_DATA[slug];

  if (!data) {
    notFound();
  }

  // Fetch sample blueprints from Supabase, matching plot dimensions if possible
  let samplePlans: any[] = [];
  try {
    const dimSearch = data.dimensions.replace(/[^0-9xX]/g, '');
    const { data: matchedPlans } = await supabase
      .from("house_plans")
      .select("*")
      .ilike("dimensions", `%${dimSearch}%`)
      .limit(4);

    if (matchedPlans && matchedPlans.length > 0) {
      samplePlans = matchedPlans;
    }

    if (samplePlans.length < 4) {
      const existingIds = samplePlans.map((p) => p.id);
      const { data: fallbackDbPlans } = await supabase
        .from("house_plans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      if (fallbackDbPlans) {
        const extra = fallbackDbPlans.filter((p) => !existingIds.includes(p.id));
        samplePlans = [...samplePlans, ...extra].slice(0, 4);
      }
    }
  } catch (err) {
    console.warn("Could not fetch sample house plans from DB:", err);
  }

  // Ensure there are always 4 real blueprints
  if (samplePlans.length < 4) {
    const existingIds = samplePlans.map((p) => p.id);
    const needed = 4 - samplePlans.length;
    const fillers = FALLBACK_BLUEPRINTS.filter((fb) => !existingIds.includes(fb.id)).slice(0, needed);
    samplePlans = [...samplePlans, ...fillers];
  }

  // Other categories for cross-linking
  const otherPlans = Object.values(HOUSE_PLAN_SEO_DATA).filter((p) => p.slug !== data.slug);

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.homedesignenglish.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "House Plans",
            "item": "https://www.homedesignenglish.com/plans"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": data.shortTitle,
            "item": `https://www.homedesignenglish.com/plans/${data.slug}`
          }
        ]
      },
      {
        "@type": "Article",
        "headline": data.title,
        "description": data.metaDesc,
        "author": {
          "@type": "Organization",
          "name": "Home Design English Editorial Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Home Design English (HDE)",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.homedesignenglish.com/bg-logo.png"
          }
        },
        "mainEntityOfPage": `https://www.homedesignenglish.com/plans/${data.slug}`
      },
      {
        "@type": "FAQPage",
        "mainEntity": data.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 py-8 text-slate-900 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 font-medium">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <span>/</span>
          <Link href="/plans" className="hover:text-primary transition">House Plans</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-zinc-200 font-bold">{data.shortTitle}</span>
        </nav>

        {/* Hero Section */}
        <header className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200/60">
              🇮🇳 Modern Architectural Design
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/60">
              Plot: {data.dimensions}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              {data.bhkConfig}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-tight">
            {data.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
            {data.overview}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                Plot Area
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                {data.plotAreaSqft} sq ft
              </p>
              <span className="text-[11px] text-gray-500 font-medium">
                ({data.plotAreaSqYds.toFixed(1)} sq yards)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                Recommended Built-up
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                {data.builtUpAreaSqft} sq ft
              </p>
              <span className="text-[11px] text-gray-500 font-medium">
                {data.floorsRecommendation.split(' or ')[0]}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                Ideal Facing
              </span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {data.idealFacing.split(' ')[0]} Facing
              </p>
              <span className="text-[11px] text-gray-500 font-medium">
                Optimal Solar & Airflow Design
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                Estimated Budget
              </span>
              <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                ₹{data.estimatedCostMinLakhs} - ₹{data.estimatedCostMaxLakhs} L
              </p>
              <span className="text-[11px] text-gray-500 font-medium">
                Complete Construction
              </span>
            </div>
          </div>
        </header>

        {/* Interactive Cost Estimator Strip */}
        <section className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full">
                Live Calculator Integration
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2">
                Estimate Exact Building Cost for {data.dimensions} ({data.plotAreaSqft} sq ft)
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
                Calculate total cement, steel (TMT), bricks, sand, and labor costs for this exact floor area using our free India Construction Estimator.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={`/?calc=construction&area=${data.builtUpAreaSqft}#tools`}
                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition no-underline flex items-center gap-2"
              >
                <i className="fas fa-calculator text-amber-600"></i>
                <span>Open Construction Calculator</span>
              </Link>
              <Link
                href="/?calc=india-emi#tools"
                className="px-5 py-3 rounded-xl bg-black/30 hover:bg-black/40 text-white font-extrabold text-xs transition no-underline flex items-center gap-2 border border-white/20"
              >
                <i className="fas fa-university text-amber-300"></i>
                <span>Calculate Home Loan EMI</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/20 text-xs">
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl">
              <span className="font-semibold text-amber-100 block">Basic Construction (~₹1,750/sqft)</span>
              <p className="text-base font-black mt-0.5">
                ₹{((data.builtUpAreaSqft * 1750) / 100000).toFixed(1)} Lakhs
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-xl border border-white/30">
              <span className="font-semibold text-white block">Standard Construction (~₹2,200/sqft)</span>
              <p className="text-base font-black mt-0.5">
                ₹{((data.builtUpAreaSqft * 2200) / 100000).toFixed(1)} Lakhs
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl">
              <span className="font-semibold text-amber-100 block">Premium Luxury (~₹3,000/sqft)</span>
              <p className="text-base font-black mt-0.5">
                ₹{((data.builtUpAreaSqft * 3000) / 100000).toFixed(1)} Lakhs
              </p>
            </div>
          </div>
        </section>

        {/* Room by Room Architectural Dimensions */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Floor Plan Blueprint Specs
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 mt-2">
              Recommended Room Dimensions &amp; Space Orientation
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Standard room proportions designed for comfort, furniture clearance, and maximum natural airflow.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-400 uppercase text-[11px]">
                  <th className="pb-3 font-bold">Room / Zone</th>
                  <th className="pb-3 font-bold">Recommended Size</th>
                  <th className="pb-3 font-bold">Recommended Orientation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
                {data.roomDimensions.map((room, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-500 text-xs"></i>
                      {room.room}
                    </td>
                    <td className="py-3.5 text-gray-700 dark:text-zinc-300 font-mono text-xs">
                      {room.size}
                    </td>
                    <td className="py-3.5 text-primary font-semibold">
                      {room.orientation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Architectural Rules & Setback Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Architectural & Ventilation Guidelines */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <i className="fas fa-compass text-amber-500"></i>
              <span>Architectural &amp; Ventilation Rules for {data.shortTitle}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Optimal directional alignments for sunlight exposure, cross-ventilation, and privacy.
            </p>

            <ul className="space-y-3 pt-2">
              {data.designGuidelines.map((item, idx) => (
                <li key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-zinc-200">{item.rule}</p>
                  <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{item.explanation}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Municipal Sanction & Setback Rules */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <i className="fas fa-drafting-compass text-blue-500"></i>
              <span>Municipal Setbacks &amp; Bylaws</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Typical building setback clearances required for plan sanction (BDA, DTCP, GHMC, BBMP, CMDA).
            </p>

            <ul className="space-y-3 pt-2">
              {data.setbackRules.map((item, idx) => (
                <li key={idx} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-zinc-200">{item.side}</p>
                  <p className="text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">{item.requirement}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <i className="fas fa-info-circle text-blue-500 mt-0.5 shrink-0"></i>
              <div>
                <strong>FAR &amp; FSI Advice:</strong> For a {data.dimensions} plot, typical allowable FSI ranges from 1.5 to 2.2 depending on road width (minimum 30 ft road recommended for G+2). Always verify with local municipal authorities before foundation excavation.
              </div>
            </div>
          </div>
        </div>

        {/* Real Floor Plans Gallery Showcase */}
        {samplePlans.length > 0 && (
          <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Floor Plan Designs
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 mt-2">
                  Sample Blueprints for {data.shortTitle}
                </h2>
              </div>
              <Link
                href="/plans"
                className="text-xs font-bold text-primary hover:text-primary-hover underline flex items-center gap-1.5"
              >
                <span>Browse All 100+ Plans</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {samplePlans.map((p) => {
                const imgUrl = getPlanImageUrl(p.file_url);
                return (
                  <Link
                    key={p.id}
                    href="/plans"
                    className="bg-gray-50 dark:bg-zinc-800/40 rounded-2xl p-3 border border-gray-100 dark:border-zinc-800 group hover:shadow-lg hover:border-primary/50 transition block no-underline"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 relative mb-3">
                      <img
                        src={imgUrl}
                        alt={p.title || `${data.shortTitle} Floor Plan Blueprint`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover:opacity-100 transition bg-black/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                          <i className="fas fa-eye text-primary"></i> View Blueprint
                        </span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-primary transition">
                      {p.title || `${p.dimensions || data.dimensions} Floor Plan`}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                      <span>{p.area_sqft || data.plotAreaSqft} sqft</span>
                      <span className="font-semibold text-emerald-600">{p.facing || data.idealFacing.split(' ')[0]} Facing</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/plans"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-extrabold text-xs shadow-md hover:bg-primary-hover transition no-underline"
              >
                <i className="fas fa-download"></i>
                <span>Download High-Resolution Blueprints in App</span>
              </Link>
            </div>
          </section>
        )}

        {/* Frequently Asked Questions */}
        <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              People Also Ask
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 mt-2">
              Frequently Asked Questions About {data.shortTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {data.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 flex items-start gap-2">
                  <i className="fas fa-question-circle text-primary mt-0.5"></i>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed pl-5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Link Spider Web Grid */}
        <footer className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Explore More Designs
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 mt-1">
              Popular House Plans Across India
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherPlans.map((item) => (
              <Link
                key={item.slug}
                href={`/plans/${item.slug}`}
                className="p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20 hover:border-primary/50 hover:bg-primary/5 transition text-left no-underline group block"
              >
                <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-primary transition line-clamp-1">
                  {item.shortTitle}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 block">
                  {item.plotAreaSqft > 0 ? `${item.plotAreaSqft} sqft • ` : ''}{item.bhkConfig.split(' / ')[0]}
                </span>
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
