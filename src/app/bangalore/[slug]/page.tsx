// src/app/bangalore/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  BANGALORE_LOCALITIES,
  LOCALITY_TRANSIT_PROFILES,
} from "@/data/bangaloreLocalities";
import {
  BANGALORE_LOCALITY_MARKET_DATA,
  TARGET_CATEGORY_TEMPLATES,
} from "@/data/bangaloreMarketData";
import { RealEstateService } from "@/services/realEstateService";
import PropertyCard from "@/components/real-estate/PropertyCard";
import { PropertyCategory, ListingIntent } from "@/types/realEstate";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 1. Helper function to parse any Bangalore pSEO slug
function parseBangaloreSlug(slug: string) {
  // Check exact category template matches first
  for (const template of TARGET_CATEGORY_TEMPLATES) {
    if (slug.startsWith(template.prefix)) {
      const locSlug = slug.replace(template.prefix, "");
      const locality = BANGALORE_LOCALITIES.find((l) => l.slug === locSlug);
      if (locality) {
        const marketData = BANGALORE_LOCALITY_MARKET_DATA[locality.slug];
        const transit = LOCALITY_TRANSIT_PROFILES[locality.id];
        return { template, locality, marketData, transit, slug };
      }
    }
  }

  // Also support bare locality slug (e.g., /bangalore/whitefield) -> default to properties-in- template
  const bareLocality = BANGALORE_LOCALITIES.find((l) => l.slug === slug);
  if (bareLocality) {
    const defaultTemplate = TARGET_CATEGORY_TEMPLATES.find((t) => t.prefix === "properties-in-")!;
    const marketData = BANGALORE_LOCALITY_MARKET_DATA[bareLocality.slug];
    const transit = LOCALITY_TRANSIT_PROFILES[bareLocality.id];
    return { template: defaultTemplate, locality: bareLocality, marketData, transit, slug };
  }

  return null;
}

// 2. Generate Static Params for all 144 locality + category combinations
export async function generateStaticParams() {
  const params: { slug: string }[] = [];

  for (const locality of BANGALORE_LOCALITIES) {
    // 6 programmatic permutations per locality
    for (const template of TARGET_CATEGORY_TEMPLATES) {
      params.push({
        slug: `${template.prefix}${locality.slug}`,
      });
    }
    // Also include the bare locality slug
    params.push({
      slug: locality.slug,
    });
  }

  return params;
}

// 3. Dynamic Metadata for Google SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseBangaloreSlug(slug);

  if (!parsed) {
    return {
      title: "Bangalore Properties | HDE",
      description: "Find verified plots, flats, and villas in Bangalore with zero broker spam.",
    };
  }

  const { template, locality, marketData } = parsed;
  const isRent = (template.intent as string) === "rent";
  const currentPrice =
    template.category === "plot"
      ? marketData?.plotPricePerSqft || "₹5,500/sq.ft"
      : template.category === "flat"
      ? marketData?.flatPricePerSqft || "₹8,000/sq.ft"
      : template.category === "villa"
      ? marketData?.villaPriceRange || "₹2.5 Cr+"
      : isRent
      ? marketData?.rent2BhkRange || "₹28,000/mo"
      : marketData?.plotPricePerSqft || "Market Rates";

  const title = template.metaTitleSuffix.replace("{locality}", locality.name);
  const description = template.metaDescTemplate
    .replace("{locality}", locality.name)
    .replace("{price}", currentPrice);

  const canonicalUrl = `https://www.homedesignenglish.com/bangalore/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${template.shortType.toLowerCase()} in ${locality.name.toLowerCase()}`,
      `${template.shortType.toLowerCase()} for sale in ${locality.slug}`,
      `real estate ${locality.name.toLowerCase()}`,
      `a khata ${template.shortType.toLowerCase()} ${locality.slug}`,
      `property prices ${locality.name.toLowerCase()} 2026`,
      `bangalore real estate direct owners`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Home Design English",
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: "https://www.homedesignenglish.com/bg-logo.png",
          width: 800,
          height: 600,
          alt: `${template.heroTitle.replace("{locality}", locality.name)} - HDE`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// 4. Main Page Component
export default async function BangaloreProgrammaticPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseBangaloreSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { template, locality, marketData, transit } = parsed;

  // Filter properties from Supabase / Dataset
  const filterCategory = template.category === "all" ? undefined : (template.category as PropertyCategory);
  const filterIntent = template.intent as ListingIntent;

  const properties = await RealEstateService.getProperties({
    locality: locality.name,
    category: filterCategory,
    intent: filterIntent,
  });

  // Calculate sibling categories for this locality
  const otherCategories = TARGET_CATEGORY_TEMPLATES.filter((t) => t.prefix !== template.prefix);

  // Nearby localities in the same zone
  const nearbyInZone = BANGALORE_LOCALITIES.filter(
    (l) => l.zone === locality.zone && l.id !== locality.id
  ).slice(0, 5);

  // Dynamic FAQs for Schema and On-Page Content
  const faqs = [
    {
      q: `What is the average price of ${template.typeLabel.toLowerCase()} in ${locality.name} in 2026?`,
      a: `In ${locality.name} (${locality.zone}), current market benchmarks show ${
        template.category === "plot"
          ? `residential plot prices range between ${marketData?.plotPricePerSqft || "₹5,500 – ₹9,000/sq.ft"}`
          : template.category === "flat"
          ? `apartment prices range between ${marketData?.flatPricePerSqft || "₹7,500 – ₹12,500/sq.ft"}`
          : template.category === "villa"
          ? `luxury villas range between ${marketData?.villaPriceRange || "₹2.5 Cr – ₹6.0 Cr"}`
          : (template.intent as string) === "rent"
          ? `2BHK rental homes range between ${marketData?.rent2BhkRange || "₹25,000 – ₹45,000/mo"}`
          : `plots at ${marketData?.plotPricePerSqft || "market rates"} and flats at ${marketData?.flatPricePerSqft || "market rates"}`
      }. Rates depend on layout approval, road width, and proximity to tech hubs.`,
    },
    {
      q: `How do I verify Khata and legal documentation in ${locality.name}?`,
      a: `${marketData?.khataGuidance || "Ensure the property has BBMP A-Khata or approved layout sanction."} Always verify the Encumbrance Certificate (EC) for the last 30 years and ensure the layout holds BDA, BMRDA, or K-RERA approvals.`,
    },
    {
      q: `How is connectivity and transit from ${locality.name}?`,
      a: `${locality.name} is situated approximately ${transit?.airportKm || 35} km from Kempegowda International Airport. The nearest metro transit is ${transit?.metroName || "the upcoming corridor"} (${transit?.metroKm || 1.5} km away), with direct access to ${transit?.techParkName || "major IT tech parks"}.`,
    },
    {
      q: `Can individual owners list properties in ${locality.name} for free on HDE?`,
      a: `Yes! Individual property owners and K-RERA registered agents can list properties in ${locality.name} completely free with zero broker telemarketing spam. Inquiries are routed directly to your verified contact with full privacy controls.`,
    },
  ];

  // Structured Data Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.homedesignenglish.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Bangalore Properties",
            item: "https://www.homedesignenglish.com/bangalore/properties",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: locality.name,
            item: `https://www.homedesignenglish.com/bangalore/properties-in-${locality.slug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: template.shortType,
            item: `https://www.homedesignenglish.com/bangalore/${slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      },
    ],
  };

  const whatsappMessage = encodeURIComponent(
    `Hi HDE Team, I would like to list my property in ${locality.name} (${template.shortType}). Please help me post it.`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#f8fafc] pb-20">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-100 py-3">
          <div className="container mx-auto px-4 max-w-7xl text-xs font-semibold text-slate-500 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-[#4165af] transition-colors no-underline">
              Home
            </Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
            <Link href="/bangalore/properties" className="hover:text-[#4165af] transition-colors no-underline">
              Bangalore Real Estate
            </Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
            <span className="text-slate-700">{locality.name}</span>
            <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
            <span className="text-[#4165af] font-bold">{template.shortType}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200/80 pt-10 pb-12 shadow-2xs">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-3xl">
                {/* Badges */}
                <div className="flex items-center gap-2.5 flex-wrap mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#4165af] text-xs font-bold uppercase tracking-wider border border-blue-100">
                    <i className="fas fa-location-dot"></i>
                    <span>{locality.zone} • {locality.pincode}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    <i className="fas fa-shield-check"></i>
                    <span>Zero Broker Spam Guarantee</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  {template.heroTitle.replace("{locality}", locality.name)}
                </h1>

                <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                  {template.heroSubtitle.replace("{locality}", locality.name)}
                </p>

                {marketData?.description && (
                  <p className="text-slate-500 text-xs sm:text-sm mt-2">
                    {marketData.description}
                  </p>
                )}

                {/* Growth Driver Highlight */}
                {marketData?.growthDriver && (
                  <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2 max-w-2xl">
                    <i className="fas fa-chart-line text-amber-600 mt-0.5"></i>
                    <div>
                      <strong className="font-bold">2026 Growth Driver: </strong>
                      <span>{marketData.growthDriver}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Box */}
              <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  href={`/bangalore/post-property?locality=${locality.id}&category=${template.category}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-sm rounded-xl transition-all shadow-md hover:shadow-lg no-underline text-center"
                >
                  <i className="fas fa-plus-circle"></i>
                  <span>Post {template.shortType} Free</span>
                </Link>

                <a
                  href={`https://wa.me/919632832817?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm no-underline text-center"
                >
                  <i className="fab fa-whatsapp text-sm"></i>
                  <span>List via WhatsApp</span>
                </a>

                <Link
                  href="/bangalore/properties"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all no-underline text-center"
                >
                  <i className="fas fa-sliders text-slate-500"></i>
                  <span>Explore All Bangalore</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl mt-8">
          {/* Locality Market Snapshot & Transit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* 1. Price Benchmark Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4165af] uppercase tracking-wider mb-3">
                <i className="fas fa-tag"></i>
                <span>Price Benchmarks (2026)</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 block">Plots / Land</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {marketData?.plotPricePerSqft || "₹5,500 – ₹9,000/sq.ft"}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 block">Apartments (Flats)</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {marketData?.flatPricePerSqft || "₹7,500 – ₹12,500/sq.ft"}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 block">Villas / Row Houses</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {marketData?.villaPriceRange || "₹2.5 Cr – ₹6.0 Cr"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Transit & Commute Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4165af] uppercase tracking-wider mb-3">
                <i className="fas fa-train-subway"></i>
                <span>Transit & Connectivity</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <i className="fas fa-plane text-slate-400"></i> Airport (BLR):
                  </span>
                  <span className="font-bold text-slate-900">{transit?.airportKm || 35} km</span>
                </li>
                <li className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <i className="fas fa-subway text-slate-400"></i> Nearest Metro:
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {transit?.metroName || "Upcoming Metro"} ({transit?.metroKm || 1.5} km)
                  </span>
                </li>
                <li className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <i className="fas fa-building text-slate-400"></i> Key Tech Park:
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {transit?.techParkName || "IT Corridor"} ({transit?.techParkKm || 2.0} km)
                  </span>
                </li>
                <li className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <i className="fas fa-train text-slate-400"></i> Railway Station:
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {transit?.railwayName || "City Station"} ({transit?.railwayKm || 5.0} km)
                  </span>
                </li>
              </ul>
            </div>

            {/* 3. Legal & Khata Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                  <i className="fas fa-file-contract"></i>
                  <span>Legal & Khata Checklist</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {marketData?.khataGuidance ||
                    "Ensure clear BBMP A-Khata, verify 30-year Encumbrance Certificate (EC), and confirm layout sanction before booking."}
                </p>
                {marketData?.keyHubs && marketData.keyHubs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {marketData.keyHubs.map((hub, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]"
                      >
                        {hub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Link
                  href="/bangalore/faq"
                  className="text-xs font-bold text-[#4165af] hover:underline inline-flex items-center gap-1"
                >
                  <span>Read Bangalore Buying & Khata Guide</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Properties Listing Section */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Available {template.shortType} in {locality.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Direct contacts &bull; Verified photos &bull; Zero broker call-center spam
                </p>
              </div>

              <Link
                href={`/bangalore/post-property?locality=${locality.id}&category=${template.category}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#4165af] text-white font-bold text-xs rounded-xl hover:bg-[#325291] transition-all no-underline shadow-xs"
              >
                <i className="fas fa-plus"></i>
                <span>Add Your Property</span>
              </Link>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              /* High Converting UGC Seed Box */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-blue-200 text-center max-w-2xl mx-auto my-6 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4165af] flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">
                  <i className="fas fa-house-chimney-medical"></i>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Be the First Owner to List in {locality.name}
                </h3>
                <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                  Have a plot, apartment, or villa in {locality.name}? Post it here to reach thousands of monthly verified home seekers and builders in Bangalore without getting spammed by brokers.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/bangalore/post-property?locality=${locality.id}&category=${template.category}`}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-sm rounded-xl transition-all shadow-md no-underline"
                  >
                    <i className="fas fa-bolt mr-2"></i>
                    <span>Post Free in 2 Mins</span>
                  </Link>
                  <a
                    href={`https://wa.me/919632832817?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all no-underline"
                  >
                    <i className="fab fa-whatsapp mr-1.5"></i>
                    <span>Send Details on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Construction & Loan EMI Cross-Sell Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {/* Construction Cost Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0f2042] text-white p-7 rounded-2xl shadow-md flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 font-bold text-[11px] uppercase tracking-wider rounded-md mb-3 border border-amber-400/30">
                  Building in {locality.name}?
                </span>
                <h3 className="text-xl font-black mb-2">
                  Bengaluru House Construction Estimator
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Planning to build on a plot in {locality.name}? Calculate exact material quantities (cement, steel, sand, labor) at standard Bangalore rates (₹1,920 – ₹2,400/sq.ft).
                </p>
              </div>
              <Link
                href="/cost/construction-in-bengaluru"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl transition-all no-underline w-fit"
              >
                <span>Calculate Bengaluru Construction Cost</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* Home Loan EMI Banner */}
            <div className="bg-gradient-to-br from-[#4165af] to-[#2b4478] text-white p-7 rounded-2xl shadow-md flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white font-bold text-[11px] uppercase tracking-wider rounded-md mb-3">
                  Budget &amp; Financing
                </span>
                <h3 className="text-xl font-black mb-2">
                  SBI &amp; HDFC Home Loan EMI Calculator
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-4">
                  Check your monthly EMI for properties in {locality.name}. Compare interest rates from SBI (8.40%), HDFC (8.70%), and ICICI with an instant 5-year amortization schedule.
                </p>
              </div>
              <Link
                href="/#india-emi"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-blue-50 text-[#4165af] font-extrabold text-xs rounded-xl transition-all no-underline w-fit"
              >
                <span>Open Home Loan EMI Calculator</span>
                <i className="fas fa-calculator text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Local Bangalore Real Estate FAQ Section */}
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs mb-14">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
                Locality FAQ &amp; Guidance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Frequently Asked Questions about {locality.name} Real Estate
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-start gap-2.5">
                    <span className="text-[#4165af] font-black">Q:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Linking: Other Types in this Locality */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs mb-8">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Explore More Property Options in {locality.name}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {otherCategories.map((tmpl, idx) => (
                <Link
                  key={idx}
                  href={`/bangalore/${tmpl.prefix}${locality.slug}`}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#4165af] rounded-xl text-xs font-semibold border border-slate-200/80 transition-all no-underline"
                >
                  {tmpl.shortType} in {locality.name}
                </Link>
              ))}
              <Link
                href={`/bangalore/properties-in-${locality.slug}`}
                className="px-3.5 py-2 bg-blue-50 text-[#4165af] rounded-xl text-xs font-bold border border-blue-100 no-underline"
              >
                All {locality.name} Listings &rarr;
              </Link>
            </div>
          </div>

          {/* Internal Linking: Nearby Localities in same Zone */}
          {nearbyInZone.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">
                Explore Neighboring Localities in {locality.zone}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {nearbyInZone.map((nearLoc) => (
                  <Link
                    key={nearLoc.id}
                    href={`/bangalore/${template.prefix}${nearLoc.slug}`}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 transition-all text-center no-underline group"
                  >
                    <span className="block text-xs font-bold text-slate-800 group-hover:text-[#4165af]">
                      {nearLoc.name}
                    </span>
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      {template.shortType}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
