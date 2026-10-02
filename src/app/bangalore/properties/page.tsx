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
  const [intent, setIntent] = useState<ListingIntent>("rent");
  const [category, setCategory] = useState<PropertyCategory | "all">("all");
  const [bhk, setBhk] = useState<BhkType | "all">("all");
  const [locality, setLocality] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("All");

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

  const zones = ["All", "Bangalore North", "Bangalore South", "Bangalore East", "Bangalore West & Central"];

  const filteredLocalities = useMemo(() => {
    if (selectedZone === "All") return BANGALORE_LOCALITIES;
    if (selectedZone === "Bangalore West & Central") {
      return BANGALORE_LOCALITIES.filter(
        (loc) => loc.zone.includes("West") || loc.zone.includes("Central")
      );
    }
    return BANGALORE_LOCALITIES.filter((loc) => loc.zone === selectedZone);
  }, [selectedZone]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Header - Pure White Theme with HDE Brand Blue Accents */}
      <div className="bg-white text-gray-900 pt-8 pb-10 border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4165af] text-xs font-bold uppercase tracking-wider mb-3 border border-blue-100">
                <i className="fas fa-certificate text-[#4165af]"></i>
                <span>Direct Owner &amp; 0% Brokerage Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                Bangalore House Rent &amp; Properties
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Direct connections between home owners, tenants, and buyers across Bangalore. 
                Search verified flats, independent houses, and plots with zero telemarketing spam.
              </p>
            </div>

            {/* Header Action CTAs */}
            <div className="flex-shrink-0 flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <Link
                  href="/admin/real-estate"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs no-underline"
                >
                  <i className="fas fa-shield-halved"></i>
                  <span>Admin Moderation</span>
                </Link>
              )}

              <Link
                href="/bangalore/my-properties"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all no-underline"
              >
                <i className="fas fa-list-check text-[#4165af]"></i>
                <span>My Listings</span>
              </Link>

              <Link
                href="/bangalore/referrals"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all no-underline"
              >
                <i className="fas fa-handshake text-emerald-600"></i>
                <span>Referral Board (Earn ₹)</span>
              </Link>

              <Link
                href="/bangalore/post-property"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4165af] hover:bg-[#335391] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:shadow no-underline"
              >
                <i className="fas fa-plus"></i>
                <span>Post Property Free</span>
              </Link>
            </div>
          </div>

          {/* DUAL-AUDIENCE CONVERSION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
            {/* Card 1: For Home Owners / Landlords */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-blue-100 shadow-sm hover:border-[#4165af]/40 transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#4165af] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Home Owners
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#4165af] flex items-center justify-center text-xl mb-4 border border-blue-100">
                  <i className="fas fa-key"></i>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Have a House or Flat for Rent in Bangalore?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  List your 1RK, 1BHK, 2BHK, 3BHK or independent villa in 2 minutes. Save <strong className="text-emerald-700 font-extrabold">₹30,000 to ₹1,00,000</strong> in agent commission. Connect directly with verified IT professionals and families.
                </p>
                
                <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span>100% Free Listing &bull; 0% Commission &bull; Instant WhatsApp leads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span>Full CRUD Control: Edit details, delete listing, or mark deal closed anytime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-emerald-600"></i>
                    <span>Zero spam: Your contact number is protected against scraping telemarketers</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <Link
                  href="/bangalore/post-property"
                  className="px-5 py-2.5 bg-[#4165af] hover:bg-[#335391] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 no-underline"
                >
                  <i className="fas fa-house-chimney-medical"></i>
                  <span>Post Rental Home Free</span>
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-all border border-slate-200 inline-flex items-center gap-1.5 no-underline"
                >
                  <i className="fas fa-user-plus text-[#4165af]"></i>
                  <span>Owner Sign-Up</span>
                </Link>
              </div>
            </div>

            {/* Card 2: For House Hunters / Tenants */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-emerald-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Tenants &amp; Buyers
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl mb-4 border border-emerald-100">
                  <i className="fas fa-magnifying-glass-location"></i>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Looking for House Rent in Bangalore?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Browse authentic direct-owner rentals across Whitefield, HSR Layout, Electronic City, Hebbal, and Indiranagar. Zero broker harassment, clear rental terms, and verified commute distances.
                </p>

                <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-shield-halved text-emerald-600"></i>
                    <span>Zero Brokerage: Pay ₹0 broker fees, deal directly with the landlord</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-train-subway text-[#4165af]"></i>
                    <span>Transit Scorecards: Metro &amp; Airport distances computed for every locality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-coins text-amber-600"></i>
                    <span>Bounty Program: Spot a To-Let board in your street and earn ₹2,000–₹5,000</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setIntent("rent");
                    const filterEl = document.getElementById("filter-section");
                    filterEl?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-house"></i>
                  <span>Browse House Rentals</span>
                </button>
                <a
                  href="#localities"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition-all border border-slate-200 inline-flex items-center gap-1.5 no-underline"
                >
                  <i className="fas fa-map-pin text-[#4165af]"></i>
                  <span>Explore Localities</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="filter-section" className="container mx-auto px-4 max-w-7xl pt-8">
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
          <div className="text-sm font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{properties.length}</strong> {intent === "rent" ? "rental" : "sale"} properties in{" "}
            <span className="text-[#4165af] font-bold">{locality || "All Bangalore"}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <i className="fas fa-shield-halved text-emerald-600"></i>
            <span className="hidden sm:inline">Phone numbers protected against scraping bots</span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <i className="fas fa-circle-notch fa-spin text-3xl text-[#4165af] mb-3"></i>
            <p className="text-sm font-semibold text-slate-500">Loading verified Bangalore properties...</p>
          </div>
        ) : properties.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center border border-slate-200 shadow-xs max-w-lg mx-auto my-10">
            <div className="w-16 h-16 bg-blue-50 text-[#4165af] rounded-full flex items-center justify-center mx-auto text-2xl mb-4 border border-blue-100">
              <i className="fas fa-house-chimney"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              {locality ? `No properties found in ${locality}` : "No properties listed yet"}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
              {locality 
                ? "Try resetting your filters or search in another Bangalore locality." 
                : "Be the first home owner to list your house for rent or sale in Bangalore with 0% brokerage."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {locality && (
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <Link
                href="/bangalore/post-property"
                className="px-5 py-2.5 bg-[#4165af] hover:bg-[#335391] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 no-underline"
              >
                <i className="fas fa-plus text-[10px]"></i>
                <span>Post Property Free</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Owner Helper Prompt Banner */}
            <div className="mb-6 bg-white border border-blue-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 text-slate-800">
                <i className="fas fa-house-user text-[#4165af] text-sm shrink-0"></i>
                <span>
                  <strong>Have you listed a rental or sale home?</strong> You can <strong>Edit details</strong>, <strong>Delete</strong>, or mark <strong>Deal Done</strong> directly on your listing card below, or manage all from{" "}
                  <Link href="/bangalore/my-properties" className="underline font-bold text-[#4165af]">My Listings</Link>.
                </span>
              </div>
              <Link
                href="/bangalore/my-properties"
                className="shrink-0 font-bold px-3 py-1.5 bg-[#4165af] hover:bg-[#335391] text-white rounded-lg transition-colors no-underline text-center"
              >
                Manage My Listings &rarr;
              </Link>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onDeleted={(deletedId) => setProperties((prev) => prev.filter((p) => p.id !== deletedId))}
                  onUpdated={(updated) => setProperties((prev) => prev.map((p) => p.id === updated.id ? updated : p))}
                />
              ))}
            </div>
          </>
        )}

        {/* Cross-Sell Banners to House Plans & Construction Calculator */}
        <CrossSellBanner
          category={category === "all" ? "flat" : category}
          localityName={locality || "Bangalore"}
        />

        {/* 2026 BANGALORE RENTAL & DEPOSIT BENCHMARK MATRIX (HIGH-RANKING SEO CONTENT) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mt-12">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
              Bangalore Rental Intelligence &bull; 2026 Data
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Bangalore House Rent &amp; Security Deposit Benchmark Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Standard monthly rental rates, security deposit expectations, and society maintenance benchmarks across Bangalore’s major tech and residential corridors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-800">
                  <th className="py-3 px-3 font-bold">Bangalore Corridor</th>
                  <th className="py-3 px-3 font-bold">1 BHK Rent</th>
                  <th className="py-3 px-3 font-bold">2 BHK Rent</th>
                  <th className="py-3 px-3 font-bold">3 BHK Rent</th>
                  <th className="py-3 px-3 font-bold">Security Deposit</th>
                  <th className="py-3 px-3 font-bold">Prime Demographics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    Whitefield &amp; ITPL
                    <span className="block text-[11px] font-normal text-slate-500">East Bangalore &bull; Purple Line Metro</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹14,000 – ₹20,000</td>
                  <td className="py-3 px-3 font-bold text-[#4165af]">₹26,000 – ₹42,000</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹40,000 – ₹65,000</td>
                  <td className="py-3 px-3 text-slate-600">3 – 6 Months</td>
                  <td className="py-3 px-3 text-slate-600">IT Professionals, Tech Corridor Families</td>
                </tr>
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    HSR Layout &amp; Koramangala
                    <span className="block text-[11px] font-normal text-slate-500">South Bangalore &bull; Startup Capital</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹18,000 – ₹26,000</td>
                  <td className="py-3 px-3 font-bold text-[#4165af]">₹32,000 – ₹54,000</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹52,000 – ₹85,000</td>
                  <td className="py-3 px-3 text-slate-600">4 – 6 Months</td>
                  <td className="py-3 px-3 text-slate-600">Founders, Product Leaders, Expat Executives</td>
                </tr>
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    Electronic City (Phase 1 &amp; 2)
                    <span className="block text-[11px] font-normal text-slate-500">South Bangalore &bull; Yellow Line Metro</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹10,000 – ₹15,000</td>
                  <td className="py-3 px-3 font-bold text-[#4165af]">₹18,000 – ₹28,000</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹28,000 – ₹42,000</td>
                  <td className="py-3 px-3 text-slate-600">3 – 5 Months</td>
                  <td className="py-3 px-3 text-slate-600">Infosys/Wipro Campuses, Value Renters</td>
                </tr>
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    Hebbal &amp; Yelahanka
                    <span className="block text-[11px] font-normal text-slate-500">North Bangalore &bull; Airport Corridor / Blue Line</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹12,000 – ₹18,000</td>
                  <td className="py-3 px-3 font-bold text-[#4165af]">₹22,000 – ₹36,000</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹36,000 – ₹58,000</td>
                  <td className="py-3 px-3 text-slate-600">3 – 6 Months</td>
                  <td className="py-3 px-3 text-slate-600">Aviation, Manyata Tech Park, North Hubs</td>
                </tr>
                <tr className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">
                    Sarjapur Road &amp; Bellandur
                    <span className="block text-[11px] font-normal text-slate-500">ORR Tech Belt &bull; EcoWorld / EcoSpace</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹16,000 – ₹24,000</td>
                  <td className="py-3 px-3 font-bold text-[#4165af]">₹30,000 – ₹48,000</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">₹46,000 – ₹72,000</td>
                  <td className="py-3 px-3 text-slate-600">4 – 6 Months</td>
                  <td className="py-3 px-3 text-slate-600">Global Capability Centers (GCCs), MNCs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>* Figures indicate monthly unfurnished/semi-furnished market median. Fully furnished homes command 20–35% premium.</span>
            <Link
              href="/bangalore/post-property"
              className="font-bold text-[#4165af] hover:underline"
            >
              List your rental home at these rates &rarr;
            </Link>
          </div>
        </div>

        {/* 4-PILLAR VALUE PROP: WHY HOME OWNERS CHOOSE HDE */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mt-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
              Landlord &amp; Owner Benefits
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Why Bangalore Home Owners Rent Out via HDE
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Designed specifically to cut out predatory broker fees, spam syndicates, and opaque leasing processes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">0% Brokerage Commission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Save an entire month’s rent (₹30,000 to ₹1,00,000) typically deducted by middleman broker cartels. Keep 100% of your rental income.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#4165af] flex items-center justify-center text-lg mb-3">
                <i className="fas fa-sliders"></i>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Full CRUD Control</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Edit rent rates, deposit terms, photos, or description anytime. When a tenant is finalized, mark &ldquo;Deal Done&rdquo; to instantly hide contact info.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center text-lg mb-3">
                <i className="fas fa-shield-virus"></i>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">No Bot or Call Spam</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We never sell owner contact data to third-party telemarketing call centers. Phone numbers are behind verified human click protection.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
                <i className="fas fa-user-check"></i>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Verified Tenant Connect</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct WhatsApp and phone leads from verified software professionals, healthcare specialists, and corporate families seeking long-term leases.
              </p>
            </div>
          </div>
        </div>

        {/* POPULAR BANGALORE LOCALITIES EXPLORER (pSEO HUB WITH ZONES) */}
        <div id="localities" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
                Locality Explorer &bull; Programmatic Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Explore Top Bangalore Corridors
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Jump directly to verified direct-owner house rent, flat rentals, and sale properties with local transit scorecards.
              </p>
            </div>

            {/* Zone Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedZone === zone
                      ? "bg-[#4165af] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {zone.replace("Bangalore ", "")}
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
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    {loc.zone.replace(" Bangalore", "")}
                  </span>
                  <Link
                    href={`/bangalore/house-for-rent-in-${loc.slug}`}
                    className="text-xs font-black text-slate-900 hover:text-[#4165af] transition-colors block mt-0.5 no-underline leading-snug"
                  >
                    {loc.name}
                  </Link>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-bold">
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
        </div>

        {/* SPOT A HOUSE & EARN BOUNTY BANNER */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-200 shadow-xs mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-200">
              <i className="fas fa-coins text-amber-500"></i>
              <span>Crowdsourced Community Bounty</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              See a &ldquo;To-Let&rdquo; or &ldquo;For Sale&rdquo; Board in Your Neighborhood?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Snap a quick photo of the owner board and post the referral on HDE. When a tenant or buyer connects, you earn a <strong className="text-emerald-700 font-extrabold">₹2,000 to ₹5,000 referral bounty</strong> transferred directly to your UPI.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-wrap items-center gap-3">
            <Link
              href="/bangalore/post-referral"
              className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-xs inline-flex items-center gap-2 no-underline"
            >
              <i className="fas fa-camera"></i>
              <span>Post a Referral Board</span>
            </Link>
            <Link
              href="/bangalore/referrals"
              className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all border border-slate-200 inline-flex items-center gap-1.5 no-underline"
            >
              <span>Explore Referrals</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </div>

        {/* BANGALORE REAL ESTATE & RENTAL FAQ */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mt-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span className="text-xs font-bold text-[#4165af] uppercase tracking-wider">
              Knowledge Base
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Frequently Asked Questions &bull; Bangalore House Rent &amp; Real Estate
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-sm">
            <details className="p-4 rounded-xl border border-slate-200 bg-white" open>
              <summary className="font-extrabold text-slate-900 cursor-pointer">
                How can home owners post their house for rent in Bangalore for free on HDE?
              </summary>
              <p className="text-slate-600 mt-2.5 leading-relaxed text-xs sm:text-sm">
                Simply click <Link href="/bangalore/post-property" className="font-bold text-[#4165af] underline">Post Property Free</Link>, enter your locality, expected monthly rent, security deposit amount, and upload photos. Your listing goes live immediately with zero commission charges. Once rented, you can edit details or mark &ldquo;Deal Done&rdquo; anytime from your dashboard.
              </p>
            </details>

            <details className="p-4 rounded-xl border border-slate-200 bg-white">
              <summary className="font-extrabold text-slate-900 cursor-pointer">
                How does HDE eliminate broker commission for tenants?
              </summary>
              <p className="text-slate-600 mt-2.5 leading-relaxed text-xs sm:text-sm">
                Unlike traditional classified portals that sell your contact number to 20 different broker syndicates, HDE connects you directly with the property owner. You pay ₹0 in brokerage fees (saving an entire month&apos;s rent) and your mobile number is guarded against automated spam scrapers.
              </p>
            </details>

            <details className="p-4 rounded-xl border border-slate-200 bg-white">
              <summary className="font-extrabold text-slate-900 cursor-pointer">
                What are the standard rental security deposit rules in Bangalore?
              </summary>
              <p className="text-slate-600 mt-2.5 leading-relaxed text-xs sm:text-sm">
                Historically, Bangalore landlords requested 10 months of rent as security deposit. However, in 2026 the realistic market average across Whitefield, Electronic City, and North Bangalore has settled at 3 to 6 months of rent. Tenants can negotiate lower deposits for long leases with corporate employment verification.
              </p>
            </details>

            <details className="p-4 rounded-xl border border-slate-200 bg-white">
              <summary className="font-extrabold text-slate-900 cursor-pointer">
                Can I edit, delete, or update my listing after publishing?
              </summary>
              <p className="text-slate-600 mt-2.5 leading-relaxed text-xs sm:text-sm">
                Yes. Every verified poster has complete CRUD control. On your listing card or via <Link href="/bangalore/my-properties" className="font-bold text-[#4165af] underline">My Listings</Link>, you can click &ldquo;Edit&rdquo; to adjust rent or photos, &ldquo;Delete&rdquo; to remove it permanently, or click &ldquo;Deal Done&rdquo; which retains your property history while closing public inquiries.
              </p>
            </details>

            <details className="p-4 rounded-xl border border-slate-200 bg-white">
              <summary className="font-extrabold text-slate-900 cursor-pointer">
                What is the difference between A Khata and B Khata in Bangalore?
              </summary>
              <p className="text-slate-600 mt-2.5 leading-relaxed text-xs sm:text-sm">
                <strong>A Khata</strong> confirms that the property adheres to all BBMP/BDA building bylaws and municipal tax obligations; nationalized banks easily sanction home loans on A Khata properties. <strong>B Khata</strong> is an acknowledgment of property tax payment for unregularized or revenue sites, making bank loans restricted.
              </p>
            </details>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="mt-12 text-center text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed border-t border-slate-100 pt-6">
          <p>
            <strong>Disclaimer:</strong> Home Design English (HDE) operates as a technology discovery intermediary under Section 79 of the Information Technology Act, 2000. HDE does not act as a real estate broker or escrow agent. All property information is submitted directly by respective owners and agents. Buyers and tenants must verify physical premises, rental agreements, land records, K-RERA registrations, and encumbrance certificates (EC) independently before transacting.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[#4165af] font-semibold">
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
