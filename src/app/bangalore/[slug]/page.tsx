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
  LocalityMarketInfo,
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

// 2. Generate Static Params for all locality + category combinations
export async function generateStaticParams() {
  const params: { slug: string }[] = [];

  for (const locality of BANGALORE_LOCALITIES) {
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
      title: "Bangalore Properties & House Rent | HDE",
      description: "Find verified plots, flats, and houses for rent in Bangalore with zero broker commission.",
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
      ? marketData?.rent2BhkRange || "₹22,000 – ₹38,000/mo"
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
      `house for rent in ${locality.name.toLowerCase()} bangalore`,
      `flats for rent in ${locality.name.toLowerCase()}`,
      `2bhk for rent in ${locality.name.toLowerCase()}`,
      `1bhk house for rent in ${locality.name.toLowerCase()}`,
      `direct owner house rent ${locality.name.toLowerCase()}`,
      `zero brokerage house rent bangalore`,
      `post property for rent in ${locality.name.toLowerCase()}`,
      `${template.shortType.toLowerCase()} in ${locality.name.toLowerCase()}`,
      `${template.shortType.toLowerCase()} for sale in ${locality.slug}`,
      `real estate ${locality.name.toLowerCase()}`,
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

// Helper to provide detailed rental benchmarks for tabular SEO rich snippet
function getDetailedRentalBenchmarks(marketData: LocalityMarketInfo | undefined) {
  const rent2bhk = marketData?.rent2BhkRange || "₹22,000 – ₹38,000/mo";

  return [
    {
      unit: "1 RK / Studio Flat",
      rent: "₹8,500 – ₹14,000 / mo",
      deposit: "₹40,000 – ₹70,000",
      maintenance: "₹600 – ₹1,200 / mo",
      bestFor: "Single professionals, interns & students",
      badge: "Budget Friendly",
    },
    {
      unit: "1 BHK Independent / Apartment",
      rent: "₹14,000 – ₹22,000 / mo",
      deposit: "₹70,000 – ₹1,20,000",
      maintenance: "₹1,200 – ₹2,000 / mo",
      bestFor: "Young couples & tech executives",
      badge: "High Demand",
    },
    {
      unit: "2 BHK Gated Community / House",
      rent: rent2bhk,
      deposit: "₹1,20,000 – ₹2,50,000",
      maintenance: "₹2,500 – ₹4,500 / mo",
      bestFor: "Small families & corporate employees",
      badge: "Most Popular",
    },
    {
      unit: "3 BHK Luxury Flat / Villa",
      rent: "₹38,000 – ₹75,000+ / mo",
      deposit: "₹2,00,000 – ₹4,50,000",
      maintenance: "₹4,000 – ₹8,000 / mo",
      bestFor: "Large families & senior professionals",
      badge: "Spacious Living",
    },
  ];
}

// 4. Main Page Component
export default async function BangaloreProgrammaticPage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseBangaloreSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { template, locality, marketData, transit } = parsed;
  const isRent = (template.intent as string) === "rent";

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
  ).slice(0, 6);

  const rentalBenchmarks = getDetailedRentalBenchmarks(marketData);

  // Dynamic FAQs for Schema and On-Page Content
  const faqs = [
    {
      q: `What is the average house rent in ${locality.name}, Bangalore for 1BHK, 2BHK and 3BHK homes?`,
      a: `In ${locality.name} (${locality.zone}), average rents in 2026 range from ₹14,000 to ₹22,000/month for a 1BHK, ₹22,000 to ₹38,000/month for a 2BHK family apartment, and ₹38,000 to ₹75,000+/month for a 3BHK flat or villa. Gated societies with clubhouses and swimming pools command higher monthly maintenance of ₹2,500 to ₹5,000.`,
    },
    {
      q: `How can home owners in ${locality.name} list their house for rent with 0% brokerage?`,
      a: `Home owners can list their house, flat, or villa for rent in ${locality.name} completely free on Home Design English (HDE). Simply click 'Post Property Free', upload 2–5 clear photos of your house, and specify your rent and deposit terms. Your listing is verified and connected directly to genuine tenants without middleman broker commission or telemarketing spam.`,
    },
    {
      q: `What is the standard security deposit for renting a house in ${locality.name}?`,
      a: `In Bangalore, the typical security deposit expectation is between 5 to 10 months' rent. For a 2BHK with ₹25,000 monthly rent, landlords typically request ₹1,20,000 to ₹2,00,000 as a refundable deposit. Ensure your 11-month rental agreement clearly states the refund process and standard 1-month painting deduction clause upon vacating.`,
    },
    {
      q: `How is connectivity and transit from ${locality.name} to KIA Airport and tech parks?`,
      a: `${locality.name} is located approximately ${transit?.airportKm || 30} km from Kempegowda International Airport (BLR). The nearest metro transit is ${transit?.metroName || "the upcoming Namma Metro line"} (${transit?.metroKm || 1.5} km away), with fast road transit to ${transit?.techParkName || "primary Bangalore tech hubs"} (${transit?.techParkKm || 3.0} km away) and railway transit via ${transit?.railwayName || "the nearest railway station"}.`,
    },
    {
      q: `How do I verify Khata and legal property ownership before buying or renting in ${locality.name}?`,
      a: `${marketData?.khataGuidance || "Verify clean BBMP A-Khata or approved layout sanction."} For purchases, inspect the 30-year Encumbrance Certificate (EC), parent deed documents, tax paid receipts, and verify that the layout is approved by BDA, BMRDA, or Karnataka RERA.`,
    },
    {
      q: `How does the HDE 'Spot a House & Earn' Referral Board work in ${locality.name}?`,
      a: `If you are walking or commuting in ${locality.name} and spot a 'To-Let' or 'House for Rent' sign board outside an independent house or apartment, take a photo and upload the details on the HDE Bangalore Referral Board. When a tenant connects and closes a rental deal through your lead, you can earn up to ₹2,000–₹5,000 referral fee directly.`,
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
      {
        "@type": "Place",
        name: `${locality.name}, Bangalore`,
        address: {
          "@type": "PostalAddress",
          addressLocality: locality.name,
          addressRegion: "Karnataka",
          addressCountry: "India",
          postalCode: locality.pincode,
        },
      },
    ],
  };

  const whatsappMessage = encodeURIComponent(
    `Hi HDE Team, I would like to list my house in ${locality.name} (${template.shortType}) for ${template.intent}. Please help me publish it.`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Page Container - Pure Clean White Background */}
      <div className="min-h-screen bg-white text-slate-900 pb-20">
        {/* Breadcrumb Navigation - Clean White */}
        <div className="bg-white border-b border-gray-200/80 py-3.5">
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

        {/* Hero Section - Clean White with HDE Brand Accents */}
        <div className="bg-white border-b border-gray-200/80 pt-8 pb-12 shadow-xs">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Top Badges */}
            <div className="flex items-center gap-2.5 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#4165af] text-xs font-bold uppercase tracking-wider border border-blue-200/80">
                <i className="fas fa-location-dot"></i>
                <span>{locality.zone} • {locality.pincode}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
                <i className="fas fa-shield-check text-emerald-600"></i>
                <span>100% Zero Broker Commission</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200/80">
                <i className="fas fa-house-user text-amber-600"></i>
                <span>Direct Owner Listings</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {template.heroTitle.replace("{locality}", locality.name)}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">
              {template.heroSubtitle.replace("{locality}", locality.name)}
            </p>

            {marketData?.description && (
              <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-3xl">
                {marketData.description}
              </p>
            )}

            {/* Growth Driver & Infrastructure Highlight */}
            {marketData?.growthDriver && (
              <div className="mt-4 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-slate-700 flex items-start gap-2.5 max-w-3xl">
                <i className="fas fa-chart-line text-[#4165af] mt-0.5 text-sm"></i>
                <div>
                  <strong className="font-bold text-slate-900">2026 Locality Infrastructure Driver: </strong>
                  <span>{marketData.growthDriver}</span>
                </div>
              </div>
            )}

            {/* Dual Conversion Funnel: Home Owners vs House Seekers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              {/* Card 1: For Home Owners / Landlords */}
              <div className="bg-white rounded-2xl p-6 border-2 border-[#4165af]/30 shadow-xs hover:border-[#4165af] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#4165af] text-[11px] font-extrabold uppercase tracking-wide border border-blue-200/70">
                      <i className="fas fa-key"></i>
                      <span>For Home Owners &amp; Landlords</span>
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save ₹30,000–₹1,00,000
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Have a House or Flat in {locality.name}?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Display your house available for rent or sale. Connect directly with verified families and IT professionals with <strong>zero broker commission</strong> and zero spam calls.
                  </p>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                      <span>Free listing in 2 minutes (upload photos &amp; rent terms)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                      <span>Verified direct tenant inquiries on Phone &amp; WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                      <span>Remove or hide listing with 1-click once deal is done</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/bangalore/post-property?locality=${locality.id}&intent=${template.intent}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs no-underline cursor-pointer"
                  >
                    <i className="fas fa-plus-circle"></i>
                    <span>Post House for {isRent ? "Rent" : "Sale"} Free</span>
                  </Link>

                  <a
                    href={`https://wa.me/919632832817?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all no-underline text-center"
                  >
                    <i className="fab fa-whatsapp text-xs"></i>
                    <span>List via WhatsApp</span>
                  </a>

                  <Link
                    href="/signup"
                    className="text-xs font-bold text-slate-600 hover:text-[#4165af] ml-auto py-1"
                  >
                    Owner Sign Up &rarr;
                  </Link>
                </div>
              </div>

              {/* Card 2: For Tenants & Buyers */}
              <div className="bg-white rounded-2xl p-6 border-2 border-emerald-300/80 shadow-xs hover:border-emerald-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wide border border-emerald-200">
                      <i className="fas fa-house-chimney-user"></i>
                      <span>For House Seekers &amp; Tenants</span>
                    </span>
                    <span className="text-xs font-black text-[#4165af] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Direct Landlords
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Looking for House Rent in {locality.name}?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Browse genuine owner listings with verified photos, honest rental deposit terms, and exact transit distances to Namma Metro and tech parks.
                  </p>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                      <span>Zero brokerage fees — deal directly with the property owner</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                      <span>Verified rent benchmarks &amp; deposit guidelines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-600 text-xs"></i>
                      <span>Spot a 'To-Let' sign in {locality.name}? Earn ₹2,000 on our Referral Board</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2.5">
                  <a
                    href="#available-listings"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs no-underline cursor-pointer"
                  >
                    <i className="fas fa-arrow-down"></i>
                    <span>Browse {locality.name} Listings</span>
                  </a>

                  <Link
                    href="/bangalore/referrals"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all no-underline"
                  >
                    <i className="fas fa-handshake text-emerald-600"></i>
                    <span>Referral Board (Earn ₹)</span>
                  </Link>

                  <Link
                    href="/bangalore/properties"
                    className="text-xs font-bold text-slate-600 hover:text-[#4165af] ml-auto py-1"
                  >
                    All Bangalore &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section Container */}
        <div className="container mx-auto px-4 max-w-7xl mt-10 space-y-12">
          {/* Section 1: Locality Key Distances & Transit Metrics (Clean White Card) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
            <div className="max-w-3xl mb-6">
              <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-train-subway"></i>
                <span>Commute &amp; Connectivity Scorecard</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Transit Distances from {locality.name}, Bangalore
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Verified road and metro transit metrics for tenants and home owners in {locality.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Airport */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-[#4165af] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#4165af] flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-plane-departure"></i>
                </div>
                <span className="text-xs text-slate-500 block">Kempegowda Airport (BLR)</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">
                  {transit?.airportKm || 30} km
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">Direct highway connectivity</span>
              </div>

              {/* Metro */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-[#4165af] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-train-subway"></i>
                </div>
                <span className="text-xs text-slate-500 block">Nearest Metro Station</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5 truncate">
                  {transit?.metroName || "Upcoming Metro"}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">{transit?.metroKm || 1.5} km from locality</span>
              </div>

              {/* Primary Tech Park */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-[#4165af] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-briefcase"></i>
                </div>
                <span className="text-xs text-slate-500 block">Major Tech Park</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5 truncate">
                  {transit?.techParkName || "IT Hub"}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">{transit?.techParkKm || 2.5} km drive</span>
              </div>

              {/* Railway Station */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs hover:border-[#4165af] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-train"></i>
                </div>
                <span className="text-xs text-slate-500 block">Railway Station</span>
                <span className="text-xl font-black text-slate-900 block mt-0.5 truncate">
                  {transit?.railwayName || "City Station"}
                </span>
                <span className="text-[11px] text-gray-400 mt-1 block">{transit?.railwayKm || 4.5} km</span>
              </div>
            </div>
          </div>

          {/* Section 2: Available Property & Rental Listings (id for anchor) */}
          <div id="available-listings" className="scroll-mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Available {template.shortType} in {locality.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Direct owner contacts &bull; Verified photos &bull; Zero broker call-center spam
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/bangalore/post-property?locality=${locality.id}&intent=${template.intent}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4165af] text-white font-bold text-xs rounded-xl hover:bg-[#325291] transition-all no-underline shadow-xs"
                >
                  <i className="fas fa-plus"></i>
                  <span>Post Your House Free</span>
                </Link>
              </div>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            ) : (
              /* High Converting Seed Box for Landlords / Tenants */
              <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-blue-200 text-center max-w-3xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4165af] flex items-center justify-center text-2xl mx-auto mb-4 border border-blue-100">
                  <i className="fas fa-house-chimney-medical"></i>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Be the First Home Owner to Display a House in {locality.name}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                  Have an independent house, apartment, or plot in {locality.name}? Post it here for free to connect with thousands of active tenants and buyers in Bangalore without broker calls.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={`/bangalore/post-property?locality=${locality.id}&intent=${template.intent}`}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md no-underline"
                  >
                    <i className="fas fa-bolt mr-2"></i>
                    <span>Post House for Free</span>
                  </Link>
                  <a
                    href={`https://wa.me/919632832817?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all no-underline"
                  >
                    <i className="fab fa-whatsapp mr-1.5"></i>
                    <span>Send Photos via WhatsApp</span>
                  </a>
                  <Link
                    href="/bangalore/referrals"
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all no-underline"
                  >
                    <span>Spot To-Let &amp; Earn ₹</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Deep 2026 Rental Price & Deposit Benchmark Matrix (Tabular SEO Anchor) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
            <div className="max-w-3xl mb-6">
              <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-coins"></i>
                <span>2026 Market Analysis</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {locality.name} House Rent &amp; Security Deposit Guide (2026)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Typical rental rates, advance security deposits, and maintenance charges in {locality.name}, Bangalore.
              </p>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-slate-50/70 text-slate-700 font-bold">
                    <th className="py-3 px-4">House Configuration</th>
                    <th className="py-3 px-4">Avg Monthly Rent</th>
                    <th className="py-3 px-4">Typical Security Deposit</th>
                    <th className="py-3 px-4">Society Maintenance</th>
                    <th className="py-3 px-4">Best Suited For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rentalBenchmarks.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{item.unit}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-[#4165af] border border-blue-100">
                            {item.badge}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#4165af]">{item.rent}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{item.deposit}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.maintenance}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bangalore Landlord & Tenant Guidelines */}
            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <strong className="block text-slate-900 font-bold mb-1">
                  <i className="fas fa-file-signature text-[#4165af] mr-1.5"></i>
                  11-Month Rental Agreements
                </strong>
                Standard in Karnataka with 5% to 8% annual rent escalation upon renewal. Registering on e-stamp paper is standard practice.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <strong className="block text-slate-900 font-bold mb-1">
                  <i className="fas fa-faucet-drip text-blue-500 mr-1.5"></i>
                  Cauvery vs Borewell Water
                </strong>
                In {locality.name}, verify whether the property has direct Cauvery municipal supply or relies on borewell and private water tankers.
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <strong className="block text-slate-900 font-bold mb-1">
                  <i className="fas fa-bolt text-amber-500 mr-1.5"></i>
                  Bescom Electricity &amp; Power
                </strong>
                Ensure the apartment has dedicated Bescom power meter readings and generator power backup for uninterrupted work-from-home.
              </div>
            </div>
          </div>

          {/* Section 4: Why Landlords & Home Owners Choose HDE (Clean White 4-Card Grid) */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fas fa-award"></i>
                <span>Direct Landlord Benefits</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Why Home Owners in {locality.name} Rent Through HDE
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Save money, eliminate middleman broker friction, and connect directly with verified occupants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Feature 1 */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#4165af] transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4165af] flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-hand-holding-dollar"></i>
                </div>
                <h4 className="text-sm font-black text-slate-900">0% Brokerage Commission</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Keep 100% of your rent and security deposit. Never forfeit 1 to 2 months rent to real estate agents again.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#4165af] transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-shield-halved"></i>
                </div>
                <h4 className="text-sm font-black text-slate-900">Verified Tenant Inquiries</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Direct connections from IT professionals, corporate employees, and family home seekers. Zero call-center spam.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#4165af] transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-map-location-dot"></i>
                </div>
                <h4 className="text-sm font-black text-slate-900">Automatic Transit Profiling</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  We automatically display verified distances from your house to KIA Airport, Namma Metro stations, and tech parks.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#4165af] transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-check-double"></i>
                </div>
                <h4 className="text-sm font-black text-slate-900">1-Click Deal Done Removal</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  As soon as your property is rented out or sold, mark 'Deal Done' directly on your listing card to stop inquiries.
                </p>
              </div>
            </div>

            {/* Landlord Call to Action Bar */}
            <div className="mt-8 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ready to find a tenant for your {locality.name} home?</h4>
                <p className="text-xs text-slate-500 mt-0.5">Post free in 2 minutes or register your landlord profile.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors no-underline"
                >
                  Register Account
                </Link>
                <Link
                  href={`/bangalore/post-property?locality=${locality.id}&intent=rent`}
                  className="px-5 py-2 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs no-underline"
                >
                  Post Property Free &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Section 5: Spot a House & Earn Referral Hook */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200 mb-2">
                <i className="fas fa-camera text-emerald-600"></i>
                <span>Community Referral Bounty</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Walking in {locality.name} and spotted a 'To-Let' or 'House for Sale' board?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Take a quick photo of the owner's board, upload it to the HDE Bangalore Referral Board, and earn up to <strong>₹2,000 to ₹5,000</strong> when a tenant or buyer connects!
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/bangalore/post-referral"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs no-underline text-center"
              >
                <i className="fas fa-plus mr-1.5"></i>
                <span>Upload To-Let Lead</span>
              </Link>
              <Link
                href="/bangalore/referrals"
                className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors no-underline text-center"
              >
                <span>View Referral Board</span>
              </Link>
            </div>
          </div>

          {/* Section 6: Cross-Sell Calculators (Clean White Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Construction Cost Calculator */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 font-bold text-[11px] uppercase tracking-wider rounded-full mb-3 border border-amber-200/80">
                  <i className="fas fa-hammer text-amber-600"></i>
                  <span>Building in {locality.name}?</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  Bengaluru House Construction Estimator
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Planning to build on a plot in {locality.name}? Calculate exact material quantities (cement, steel, sand, labor) at standard Bangalore rates (₹1,920 – ₹2,400/sq.ft).
                </p>
              </div>
              <Link
                href="/cost/construction-in-bengaluru"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs no-underline w-fit"
              >
                <span>Calculate Bengaluru Construction Cost</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* Home Loan EMI Calculator */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#4165af] font-bold text-[11px] uppercase tracking-wider rounded-full mb-3 border border-blue-100">
                  <i className="fas fa-calculator text-[#4165af]"></i>
                  <span>Budget &amp; Financing</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                  SBI &amp; HDFC Home Loan EMI Calculator
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Check your monthly EMI for properties in {locality.name}. Compare interest rates from SBI (8.40%), HDFC (8.70%), and ICICI with an instant 5-year amortization schedule.
                </p>
              </div>
              <Link
                href="/#india-emi"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs no-underline w-fit"
              >
                <span>Open Home Loan EMI Calculator</span>
                <i className="fas fa-calculator text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Section 7: Local FAQ Section with Semantic HTML for Search Snippets */}
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
                Locality FAQ &amp; Guidance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Frequently Asked Questions about {locality.name} Real Estate &amp; Rentals
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

          {/* Section 8: Internal Linking Mesh - Other Types in this Locality */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4">
              Explore More Property Options in {locality.name}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {otherCategories.map((tmpl, idx) => (
                <Link
                  key={idx}
                  href={`/bangalore/${tmpl.prefix}${locality.slug}`}
                  className="px-3.5 py-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#4165af] rounded-xl text-xs font-semibold border border-slate-200/80 transition-all no-underline"
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

          {/* Section 9: Internal Linking Mesh - Neighboring Localities in same Zone */}
          {nearbyInZone.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">
                Explore Neighboring Localities in {locality.zone}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {nearbyInZone.map((nearLoc) => (
                  <Link
                    key={nearLoc.id}
                    href={`/bangalore/${template.prefix}${nearLoc.slug}`}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/70 hover:border-[#4165af] transition-all text-center no-underline group"
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
