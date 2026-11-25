// src/app/bangalore/properties/page.tsx
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RealEstateProperty,
  ListingIntent,
  PropertyCategory,
  BhkType,
} from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import PropertyCard from "@/components/real-estate/PropertyCard";
import RealEstateFilterBar from "@/components/real-estate/RealEstateFilterBar";
import CrossSellBanner from "@/components/real-estate/CrossSellBanner";
import {
  BANGALORE_ZONE_FILTERS,
  BangaloreZoneFilterId,
  filterBangaloreLocalitiesByTab,
} from "@/data/bangaloreLocalities";
import { useUser } from "@/context/UserContext";

const VALID_CATEGORIES: (PropertyCategory | "all")[] = [
  "flat",
  "villa",
  "plot",
  "independent_house",
  "penthouse",
  "all",
];

const RENT_BENCHMARKS = [
  {
    corridor: "Whitefield & ITPL",
    zoneHint: "East Bangalore • Purple Line Metro",
    bhk1: "₹14,000 – ₹20,000",
    bhk2: "₹26,000 – ₹42,000",
    bhk3: "₹40,000 – ₹65,000",
    deposit: "3 – 6 Months",
    demographics: "IT Professionals, Tech Corridor Families",
  },
  {
    corridor: "HSR Layout & Koramangala",
    zoneHint: "South Bangalore • Startup Capital",
    bhk1: "₹18,000 – ₹26,000",
    bhk2: "₹32,000 – ₹54,000",
    bhk3: "₹52,000 – ₹85,000",
    deposit: "4 – 6 Months",
    demographics: "Founders, Product Leaders, Expat Executives",
  },
  {
    corridor: "Electronic City (Phase 1 & 2)",
    zoneHint: "South Bangalore • Yellow Line Metro",
    bhk1: "₹10,000 – ₹15,000",
    bhk2: "₹18,000 – ₹28,000",
    bhk3: "₹28,000 – ₹42,000",
    deposit: "3 – 5 Months",
    demographics: "Infosys/Wipro Campuses, Value Renters",
  },
  {
    corridor: "Hebbal & Yelahanka",
    zoneHint: "North Bangalore • Airport Corridor / Blue Line",
    bhk1: "₹12,000 – ₹18,000",
    bhk2: "₹22,000 – ₹36,000",
    bhk3: "₹36,000 – ₹58,000",
    deposit: "3 – 6 Months",
    demographics: "Aviation, Manyata Tech Park, North Hubs",
  },
  {
    corridor: "Sarjapur Road & Bellandur",
    zoneHint: "ORR Tech Belt • EcoWorld / EcoSpace",
    bhk1: "₹16,000 – ₹24,000",
    bhk2: "₹30,000 – ₹48,000",
    bhk3: "₹46,000 – ₹72,000",
    deposit: "4 – 6 Months",
    demographics: "Global Capability Centers (GCCs), MNCs",
  },
];

const OWNER_BENEFITS = [
  {
    icon: "fa-money-bill-wave",
    iconClass: "bg-emerald-50 text-emerald-700",
    title: "0% Brokerage Commission",
    desc: "Save an entire month’s rent (₹30,000 to ₹1,00,000) usually lost to broker fees.",
  },
  {
    icon: "fa-sliders",
    iconClass: "bg-blue-50 text-[#4165af]",
    title: "Full Listing Control",
    desc: 'Edit rent, deposit terms, or photos anytime, and mark "Deal Done" once finalized.',
  },
  {
    icon: "fa-shield-virus",
    iconClass: "bg-amber-50 text-amber-700",
    title: "Anti-Spam Phone Protection",
    desc: "We never sell owner numbers to telemarketers; contacts stay behind click protection.",
  },
  {
    icon: "fa-user-check",
    iconClass: "bg-purple-50 text-purple-700",
    title: "Direct Tenant & Buyer Leads",
    desc: "Receive direct WhatsApp and phone inquiries from verified Bangalore families & techies.",
  },
];

const REAL_ESTATE_FAQS = [
  {
    q: "How can home owners post their house for rent in Bangalore for free on HDE?",
    a: 'Click Post Property Free, select your locality, expected rent or price, deposit, and upload photos. You can edit details or mark "Deal Done" anytime from My Listings.',
  },
  {
    q: "How does HDE eliminate broker commission for tenants?",
    a: "HDE connects you directly with property owners rather than selling your number to broker syndicates, so you pay ₹0 brokerage and deal directly with the landlord.",
  },
  {
    q: "What are the standard rental security deposit rules in Bangalore?",
    a: "Across Whitefield, Electronic City, and North Bangalore, realistic 2026 market deposits sit around 3 to 6 months of rent depending on furnishing and lease length.",
  },
  {
    q: "Can I edit, delete, or update my listing after publishing?",
    a: 'Yes. Open your listing card or visit My Listings to edit prices, swap photos, delete the post, or click "Deal Done" to close public contact inquiries.',
  },
  {
    q: "What is the difference between A Khata and B Khata in Bangalore?",
    a: "A Khata confirms compliance with BBMP/BDA building bylaws and municipal taxes, making home loans straightforward. B Khata tracks tax payment on unregularized sites with stricter loan rules.",
  },
];

function BangalorePropertiesContent() {
  const { user } = useUser();
  const isAdmin = Boolean(
    user && user.email?.toLowerCase() === "thyagaraja1983@gmail.com"
  );
  const searchParams = useSearchParams();

  const paramCategory = searchParams.get("category");
  const paramIntent = searchParams.get("intent");
  const paramLocality = searchParams.get("locality") || "";

  const parsedCategory: PropertyCategory | "all" = VALID_CATEGORIES.includes(
    paramCategory as PropertyCategory | "all"
  )
    ? (paramCategory as PropertyCategory | "all")
    : "all";

  const normalizedIntent: ListingIntent | null =
    paramIntent === "buy" || paramIntent === "sale"
      ? "sale"
      : paramIntent === "rent"
      ? "rent"
      : null;

  const parsedIntent: ListingIntent =
    normalizedIntent ?? (parsedCategory === "plot" ? "sale" : "rent");

  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const [intent, setIntent] = useState<ListingIntent>(parsedIntent);
  const [category, setCategory] = useState<PropertyCategory | "all">(parsedCategory);
  const [bhk, setBhk] = useState<BhkType | "all">("all");
  const [locality, setLocality] = useState<string>(paramLocality);
  const [selectedZone, setSelectedZone] = useState<BangaloreZoneFilterId>("all");

  useEffect(() => {
    const cat = searchParams.get("category");
    const int = searchParams.get("intent");
    const loc = searchParams.get("locality");

    if (cat && VALID_CATEGORIES.includes(cat as PropertyCategory | "all")) {
      setCategory(cat as PropertyCategory | "all");
      if (!int && cat === "plot") {
        setIntent("sale");
      }
    }
    if (int === "buy" || int === "sale") {
      setIntent("sale");
    } else if (int === "rent") {
      setIntent("rent");
    }
    if (loc !== null) {
      setLocality(loc);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      try {
        const data = await RealEstateService.getProperties({
          intent,
          category,
          bhk,
          locality,
        });
        setProperties(data);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, [intent, category, bhk, locality]);

  const resetFilters = () => {
    setCategory("all");
    setBhk("all");
    setLocality("");
  };

  const hasActiveFilters = category !== "all" || bhk !== "all" || Boolean(locality);

  const filteredLocalities = useMemo(
    () => filterBangaloreLocalitiesByTab(selectedZone),
    [selectedZone]
  );

  return (
    <div className="min-h-screen bg-slate-50/40 pb-16">
      {/* Compact Marketplace Header */}
      <header className="bg-white border-b border-slate-200 py-5 sm:py-6">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#4165af] text-[11px] font-semibold tracking-wide mb-2 border border-blue-100">
              <i className="fas fa-certificate text-[10px]"></i>
              <span>Direct Owner &bull; 0% Brokerage Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Bangalore Properties for Rent &amp; Sale
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Direct owner flats, independent houses, and plots across 24+ Bangalore corridors — zero broker spam.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isAdmin && (
              <Link
                href="/admin/real-estate"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-colors no-underline"
              >
                <i className="fas fa-shield-halved"></i>
                <span>Moderation</span>
              </Link>
            )}
            <Link
              href="/bangalore/my-properties"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors no-underline"
            >
              <i className="fas fa-list-check text-[#4165af]"></i>
              <span>My Listings</span>
            </Link>
            <Link
              href="/bangalore/referrals"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors no-underline"
            >
              <i className="fas fa-coins text-amber-500"></i>
              <span>Refer &amp; Earn ₹</span>
            </Link>
            <Link
              href="/bangalore/post-property"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4165af] hover:bg-[#335391] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs no-underline"
            >
              <i className="fas fa-plus text-[11px]"></i>
              <span>Post Property Free</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Search & Property Listings Immediately Above the Fold */}
      <main id="filter-section" className="container mx-auto px-4 max-w-7xl pt-6 space-y-10">
        <section aria-label="Search and property listings">
          <RealEstateFilterBar
            intent={intent}
            onIntentChange={setIntent}
            category={category}
            onCategoryChange={setCategory}
            bhk={bhk}
            onBhkChange={setBhk}
            locality={locality}
            onLocalityChange={setLocality}
            onReset={resetFilters}
          />

          {/* Results Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-slate-600">
                Showing <strong className="text-slate-900">{properties.length}</strong>{" "}
                {intent === "rent" ? "rental" : "sale"} properties in{" "}
                <span className="text-[#4165af] font-semibold">{locality || "All Bangalore"}</span>
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-medium text-[#4165af] hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <i className="fas fa-shield-halved text-emerald-600"></i>
              <span className="hidden sm:inline">Phone numbers protected against scrapers</span>
            </div>
          </div>

          {/* Loading Skeleton Grid (Prevents Layout Shift) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
                >
                  <div className="aspect-video w-full bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-9 bg-slate-100 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
              <div className="w-14 h-14 bg-blue-50 text-[#4165af] rounded-full flex items-center justify-center mx-auto text-xl mb-3 border border-blue-100">
                <i className="fas fa-house-chimney"></i>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">
                {locality ? `No properties found in ${locality}` : "No matching properties listed yet"}
              </h2>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try clearing your filters or searching across all Bangalore corridors."
                  : "Be the first home owner to list your property here with 0% brokerage."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
                <Link
                  href="/bangalore/post-property"
                  className="px-4 py-2 bg-[#4165af] hover:bg-[#335391] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5 no-underline"
                >
                  <i className="fas fa-plus text-[10px]"></i>
                  <span>Post Property Free</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onDeleted={(deletedId) =>
                    setProperties((prev) => prev.filter((p) => p.id !== deletedId))
                  }
                  onUpdated={(updated) =>
                    setProperties((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p))
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* Compact Owner + Referral Bounty Strip (Consolidated, No Repetition) */}
        <section
          aria-label="List property or earn referral bounty"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-blue-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4165af] flex items-center justify-center text-base shrink-0 border border-blue-100">
                <i className="fas fa-key"></i>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Own a House or Flat? List Free (0% Brokerage)
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Publish in 2 minutes, get direct WhatsApp leads, and edit or mark &ldquo;Deal Done&rdquo; anytime from{" "}
                  <Link href="/bangalore/my-properties" className="text-[#4165af] font-semibold hover:underline">
                    My Listings
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/bangalore/post-property"
                className="px-4 py-2 bg-[#4165af] hover:bg-[#335391] text-white text-xs font-bold rounded-xl transition-colors no-underline"
              >
                Post Property Free
              </Link>
              <Link
                href="/bangalore/my-properties"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors no-underline"
              >
                Manage My Listings
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base shrink-0 border border-emerald-100">
                <i className="fas fa-coins text-amber-500"></i>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Spot a &ldquo;To-Let&rdquo; or &ldquo;For Sale&rdquo; Board? Earn ₹2,000–₹5,000
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Snap a photo of a neighborhood owner board and submit it on HDE. Receive a direct UPI referral bounty when a tenant or buyer connects.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/bangalore/post-referral"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors no-underline"
              >
                Post Referral Board
              </Link>
              <Link
                href="/bangalore/referrals"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors no-underline"
              >
                Explore Referrals →
              </Link>
            </div>
          </div>
        </section>

        {/* Cross-Sell Banners to House Plans & Construction Calculator */}
        <CrossSellBanner
          category={category === "all" ? "flat" : category}
          localityName={locality || "Bangalore"}
        />

        {/* Bangalore Corridors Directory */}
        <section
          id="localities"
          className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <span className="text-[11px] font-semibold text-[#4165af] uppercase tracking-wider">
                Bangalore Corridors
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Browse Properties by Locality
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Jump directly to rentals, flats, and homes for sale with metro &amp; airport transit scores.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {BANGALORE_ZONE_FILTERS.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedZone === zone.id
                      ? "bg-[#4165af] text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredLocalities.map((loc) => (
              <div
                key={loc.id}
                className="p-3.5 bg-white hover:bg-blue-50/40 rounded-xl border border-slate-200 hover:border-[#4165af]/40 transition-all text-center flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-normal text-slate-400 block uppercase tracking-wider">
                    {loc.zone.replace(" Bangalore", "")}
                  </span>
                  <Link
                    href={`/bangalore/house-for-rent-in-${loc.slug}`}
                    className="text-xs font-medium text-slate-800 hover:text-[#4165af] transition-colors block mt-0.5 no-underline leading-snug"
                  >
                    {loc.name}
                  </Link>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-normal">
                  <Link
                    href={`/bangalore/house-for-rent-in-${loc.slug}`}
                    className="text-[#4165af] hover:underline"
                    title={`House for Rent in ${loc.name}`}
                  >
                    Rent
                  </Link>
                  <span className="text-slate-300">&bull;</span>
                  <Link
                    href={`/bangalore/flats-for-rent-in-${loc.slug}`}
                    className="text-emerald-700 hover:underline"
                    title={`Flats in ${loc.name}`}
                  >
                    Flats
                  </Link>
                  <span className="text-slate-300">&bull;</span>
                  <Link
                    href={`/bangalore/properties-in-${loc.slug}`}
                    className="text-slate-600 hover:text-[#4165af]"
                    title={`Properties in ${loc.name}`}
                  >
                    Sale
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary Market Data, Owner Benefits & FAQs Behind Native Disclosures */}
        <section aria-label="Market benchmarks and help" className="space-y-3">
          {/* 1. 2026 Rental Benchmark Matrix */}
          <details className="group bg-white rounded-2xl border border-slate-200 shadow-xs">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center gap-3 text-sm font-bold text-slate-900 select-none">
              <i className="fas fa-chevron-right text-xs text-slate-400 transition-transform duration-200 group-open:rotate-90"></i>
              <span>2026 Bangalore House Rent &amp; Security Deposit Benchmark Matrix</span>
            </summary>
            <div className="px-5 pb-5 pt-2 border-t border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-800">
                      <th className="py-2.5 px-3 font-semibold">Bangalore Corridor</th>
                      <th className="py-2.5 px-3 font-semibold">1 BHK Rent</th>
                      <th className="py-2.5 px-3 font-semibold">2 BHK Rent</th>
                      <th className="py-2.5 px-3 font-semibold">3 BHK Rent</th>
                      <th className="py-2.5 px-3 font-semibold">Deposit</th>
                      <th className="py-2.5 px-3 font-semibold">Demographics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {RENT_BENCHMARKS.map((row) => (
                      <tr key={row.corridor} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {row.corridor}
                          <span className="block text-[11px] font-normal text-slate-500">
                            {row.zoneHint}
                          </span>
                        </td>
                        <td className="py-3 px-3">{row.bhk1}</td>
                        <td className="py-3 px-3 font-semibold text-[#4165af]">{row.bhk2}</td>
                        <td className="py-3 px-3">{row.bhk3}</td>
                        <td className="py-3 px-3 text-slate-600">{row.deposit}</td>
                        <td className="py-3 px-3 text-slate-600">{row.demographics}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                * Figures show unfurnished/semi-furnished medians. Fully furnished homes carry a 20–35% premium.
              </p>
            </div>
          </details>

          {/* 2. Owner Benefits */}
          <details className="group bg-white rounded-2xl border border-slate-200 shadow-xs">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center gap-3 text-sm font-bold text-slate-900 select-none">
              <i className="fas fa-chevron-right text-xs text-slate-400 transition-transform duration-200 group-open:rotate-90"></i>
              <span>Why Bangalore Home Owners Choose HDE</span>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {OWNER_BENEFITS.map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm mb-2.5 ${item.iconClass}`}
                  >
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </details>

          {/* 3. Bangalore Real Estate FAQs */}
          <details className="group bg-white rounded-2xl border border-slate-200 shadow-xs">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center gap-3 text-sm font-bold text-slate-900 select-none">
              <i className="fas fa-chevron-right text-xs text-slate-400 transition-transform duration-200 group-open:rotate-90"></i>
              <span>Frequently Asked Questions &bull; Rent, Zero Brokerage &amp; Khata</span>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              {REAL_ESTATE_FAQS.map((faq) => (
                <div key={faq.q} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
                  <p className="text-xs font-bold text-slate-900">{faq.q}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </details>
        </section>

        {/* Legal Disclaimer Footer */}
        <footer className="pt-6 text-center text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed border-t border-slate-200/80">
          <p>
            <strong>Disclaimer:</strong> Home Design English (HDE) operates as a technology discovery intermediary under Section 79 of the Information Technology Act, 2000. HDE does not act as a real estate broker or escrow agent. All property information is submitted directly by respective owners and agents. Buyers and tenants must verify physical premises, rental agreements, land records, K-RERA registrations, and encumbrance certificates (EC) independently before transacting.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[#4165af] font-medium">
            <Link href="/bangalore/terms" className="hover:underline">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/bangalore/disclaimer" className="hover:underline">RERA Disclaimer</Link>
            <span>&bull;</span>
            <Link href="/bangalore/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function BangalorePropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4165af]"></div>
        </div>
      }
    >
      <BangalorePropertiesContent />
    </Suspense>
  );
}
