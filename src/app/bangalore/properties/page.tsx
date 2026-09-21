// src/app/bangalore/properties/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { RealEstateProperty, ListingIntent, PropertyCategory, BhkType } from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import PropertyCard from "@/components/real-estate/PropertyCard";
import RealEstateFilterBar from "@/components/real-estate/RealEstateFilterBar";
import CrossSellBanner from "@/components/real-estate/CrossSellBanner";
import { BANGALORE_LOCALITIES } from "@/data/bangaloreLocalities";
import { useUser } from "@/context/UserContext";

export default function BangalorePropertiesPage() {
  const { user } = useUser();
  const isAdmin = Boolean(user && user.email?.toLowerCase() === "thyagaraja1983@gmail.com");
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [intent, setIntent] = useState<ListingIntent>("sale");
  const [category, setCategory] = useState<PropertyCategory | "all">("all");
  const [bhk, setBhk] = useState<BhkType | "all">("all");
  const [locality, setLocality] = useState<string>("");

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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* Hero Header - Clean White Background */}
      <div className="bg-white text-gray-900 pt-10 pb-12 border-b border-gray-200/80 shadow-2xs">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4165af] text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100">
                <i className="fas fa-city text-[#4165af]"></i>
                <span>Bangalore Real Estate Pilot</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900">
                Bangalore Properties
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Connect directly with individual owners and K-RERA registered agents. Search plots, flats, and villas with zero telemarketing spam.
              </p>
            </div>

            {/* Header Action CTAs */}
            <div className="flex-shrink-0 flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <Link
                  href="/admin/real-estate"
                  className="inline-flex items-center gap-1.5 px-4 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md no-underline"
                >
                  <i className="fas fa-shield-halved"></i>
                  <span>Admin Moderation</span>
                </Link>
              )}

              {user && (
                <Link
                  href="/bangalore/my-properties"
                  className="inline-flex items-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all no-underline"
                >
                  <i className="fas fa-list-check text-[#4165af]"></i>
                  <span>My Listings</span>
                </Link>
              )}

              <Link
                href="/bangalore/referrals"
                className="inline-flex items-center gap-1.5 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all no-underline"
              >
                <i className="fas fa-handshake text-emerald-600"></i>
                <span>Referral Board (Earn ₹)</span>
              </Link>

              <Link
                href="/bangalore/post-property"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#4165af] hover:bg-[#355393] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-102 no-underline"
              >
                <i className="fas fa-plus"></i>
                <span>Post Property Free</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-7xl pt-6">
        {/* Faceted Filter Bar */}
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

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-semibold text-gray-500">
            Showing <strong className="text-gray-900">{properties.length}</strong> properties in{" "}
            <span className="text-primary font-bold">{locality || "All Bangalore"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <i className="fas fa-shield-halved text-emerald-600"></i>
            <span className="hidden sm:inline">Phone numbers protected against scraping bots</span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <i className="fas fa-circle-notch fa-spin text-3xl text-primary mb-3"></i>
            <p className="text-sm font-semibold text-gray-500">Loading verified Bangalore properties...</p>
          </div>
        ) : properties.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center border border-gray-200/80 shadow-xs max-w-lg mx-auto my-12">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
              <i className="fas fa-house-chimney"></i>
            </div>
            <h3 className="text-lg font-bold text-secondary mb-1.5">
              {locality ? `No properties found in ${locality}` : "No properties listed yet"}
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-sm mx-auto">
              {locality 
                ? "Try resetting your filters or search in another Bangalore locality." 
                : "Be the first to list a plot, flat, or villa in Bangalore directly from an individual owner or K-RERA agent."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {locality && (
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-secondary text-xs font-medium rounded-xl transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <Link
                href="/bangalore/post-property"
                className="px-5 py-2.5 bg-[#4165af] hover:bg-[#355393] text-white text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 no-underline"
              >
                <i className="fas fa-plus text-[10px]"></i>
                <span>Post Property Free</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Properties Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}

        {/* Cross-Sell Banners to House Plans & Construction Calculator */}
        <CrossSellBanner
          category={category === "all" ? "plot" : category}
          localityName={locality || "Bangalore"}
        />

        {/* Popular Bangalore Real Estate Corridors (pSEO Hub Grid) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs mt-12">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
              Local Market &amp; Transit Guides
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Explore Top Bangalore Localities
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Direct access to price per sq.ft benchmarks, A-Khata checklists, airport/metro transit, and zero-spam listings.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BANGALORE_LOCALITIES.map((loc) => (
              <div
                key={loc.id}
                className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200/70 hover:border-blue-200 transition-all text-center flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">
                    {loc.zone.replace(" Bangalore", "")}
                  </span>
                  <Link
                    href={`/bangalore/properties-in-${loc.slug}`}
                    className="text-xs font-extrabold text-slate-900 hover:text-[#4165af] transition-colors block mt-0.5 no-underline"
                  >
                    {loc.name}
                  </Link>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-center gap-2 text-[11px]">
                  <Link
                    href={`/bangalore/flats-for-sale-in-${loc.slug}`}
                    className="text-slate-500 hover:text-[#4165af] font-medium"
                    title={`Flats in ${loc.name}`}
                  >
                    Flats
                  </Link>
                  <span className="text-gray-300">&bull;</span>
                  <Link
                    href={`/bangalore/plots-for-sale-in-${loc.slug}`}
                    className="text-slate-500 hover:text-[#4165af] font-medium"
                    title={`Plots in ${loc.name}`}
                  >
                    Plots
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bangalore Real Estate FAQ */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-xs mt-12">
          <h2 className="text-2xl font-black text-secondary mb-6 text-center">
            Frequently Asked Questions — Bangalore Real Estate
          </h2>

          <div className="max-w-3xl mx-auto space-y-4 text-sm">
            <details className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <summary className="font-bold text-gray-800 cursor-pointer">
                How does HDE protect me from broker telemarketing spam?
              </summary>
              <p className="text-gray-600 mt-2 leading-relaxed text-xs sm:text-sm">
                Unlike traditional public classifieds, HDE never sells or shares user phone numbers with third-party call centers or telemarketing broker syndicates. Seller contact numbers are protected and unlocked only when genuine buyers submit an inquiry with verified purchase timelines.
              </p>
            </details>

            <details className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <summary className="font-bold text-gray-800 cursor-pointer">
                What is the difference between A Khata and B Khata in Bangalore?
              </summary>
              <p className="text-gray-600 mt-2 leading-relaxed text-xs sm:text-sm">
                <strong>A Khata</strong> confirms that the property adheres to all BBMP/BDA building bylaws and municipal tax obligations; nationalized banks easily sanction home loans on A Khata properties. <strong>B Khata</strong> is an acknowledgment of property tax payment for unregularized or revenue sites, making bank loans restricted.
              </p>
            </details>

            <details className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <summary className="font-bold text-gray-800 cursor-pointer">
                Can I post my property for free on HDE?
              </summary>
              <p className="text-gray-600 mt-2 leading-relaxed text-xs sm:text-sm">
                Yes! Individual property owners and K-RERA agents can list their first property completely free of charge.
              </p>
            </details>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 max-w-3xl mx-auto leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> Home Design English (HDE) operates as a technology discovery intermediary under Section 79 of the Information Technology Act, 2000. HDE does not act as a real estate broker or escrow agent. All property information is submitted directly by respective owners and agents. Buyers must verify land records, K-RERA registrations, and encumbrance certificates (EC) independently before transacting.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-primary font-semibold">
            <Link href="/bangalore/terms" className="hover:underline">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/bangalore/disclaimer" className="hover:underline">RERA Disclaimer</Link>
            <span>&bull;</span>
            <Link href="/bangalore/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
