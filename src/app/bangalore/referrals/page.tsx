// src/app/bangalore/referrals/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BANGALORE_LOCALITIES } from "@/data/bangaloreLocalities";
import { RealEstateService } from "@/services/realEstateService";
import { PropertyScoutLead } from "@/types/realEstate";
import { useUser } from "@/context/UserContext";
import { openRazorpayCheckout } from "@/lib/razorpayClient";

export default function BangaloreReferralBoardPage() {
  const { user, planTier, hasPaid } = useUser();
  const [leads, setLeads] = useState<PropertyScoutLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLocality, setSelectedLocality] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState("all");

  // User's own leads identification
  const [myStoredIds, setMyStoredIds] = useState<string[]>([]);
  const [myStoredPhone, setMyStoredPhone] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const ids = JSON.parse(localStorage.getItem("hde_my_scout_ids") || "[]");
        setMyStoredIds(ids);
        const phone = localStorage.getItem("hde_last_scout_phone") || "";
        setMyStoredPhone(phone);
      } catch (e) {}
    }
  }, []);

  const isMyLead = (lead: PropertyScoutLead) => {
    if (user && lead.user_id && user.id === lead.user_id) return true;
    if (myStoredIds.includes(lead.id)) return true;
    if (myStoredPhone && lead.scout_phone === myStoredPhone) return true;
    return false;
  };

  // CRUD State
  const [editingLead, setEditingLead] = useState<PropertyScoutLead | null>(null);
  const [editAddress, setEditAddress] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editFee, setEditFee] = useState<number>(2000);
  const [editPhone, setEditPhone] = useState("");
  const [editUpi, setEditUpi] = useState("");
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [dealClosedLead, setDealClosedLead] = useState<PropertyScoutLead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosingDeal, setIsClosingDeal] = useState(false);
  const [dealSuccessMsg, setDealSuccessMsg] = useState<string | null>(null);

  const handleOpenEdit = (lead: PropertyScoutLead) => {
    setEditingLead(lead);
    setEditAddress(lead.property_address_hint);
    setEditPrice(lead.approx_price_or_rent || "");
    setEditFee(lead.expected_finders_fee);
    setEditPhone(lead.scout_phone);
    setEditUpi(lead.scout_upi_id || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setIsSaving(true);
    try {
      const updated = await RealEstateService.updateScoutLead(editingLead.id, {
        property_address_hint: editAddress,
        approx_price_or_rent: editPrice ? Number(editPrice) : undefined,
        expected_finders_fee: Number(editFee),
        scout_phone: editPhone,
        scout_upi_id: editUpi,
      });
      if (updated) {
        setLeads((prev) =>
          prev.map((l) => (l.id === editingLead.id ? { ...l, ...updated } : l))
        );
      }
      setEditingLead(null);
    } catch (err: any) {
      alert("Failed to save changes: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLeadId) return;
    setIsDeleting(true);
    try {
      await RealEstateService.deleteScoutLead(deletingLeadId);
      setLeads((prev) => prev.filter((l) => l.id !== deletingLeadId));
      setMyStoredIds((prev) => prev.filter((id) => id !== deletingLeadId));
      setDeletingLeadId(null);
    } catch (err: any) {
      alert("Failed to delete referral: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDealClosed = async () => {
    if (!dealClosedLead) return;
    setIsClosingDeal(true);
    try {
      await RealEstateService.deleteScoutLead(dealClosedLead.id);
      setLeads((prev) => prev.filter((l) => l.id !== dealClosedLead.id));
      setMyStoredIds((prev) => prev.filter((id) => id !== dealClosedLead.id));
      setDealSuccessMsg(
        `Deal Closed! Your referral for ${dealClosedLead.property_category} in ${dealClosedLead.locality_name} has been removed from the board so you stop receiving calls.`
      );
      setDealClosedLead(null);
    } catch (err: any) {
      alert("Failed to close deal: " + (err.message || "Unknown error"));
    } finally {
      setIsClosingDeal(false);
    }
  };

  // Unlock Modal
  const [activeLead, setActiveLead] = useState<PropertyScoutLead | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [hasUnlockedCurrent, setHasUnlockedCurrent] = useState(false);

  const isPaidUser = Boolean(user && (planTier === "basic" || planTier === "standard" || planTier === "pro" || hasPaid));

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const data = await RealEstateService.getScoutLeads(
          selectedLocality === "all" ? undefined : selectedLocality,
          selectedCategory === "all" ? undefined : selectedCategory,
          selectedIntent === "all" ? undefined : selectedIntent
        );
        setLeads(data);
      } catch (err) {
        console.error("Failed to load scout leads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [selectedLocality, selectedCategory, selectedIntent]);

  const handleOpenContact = (lead: PropertyScoutLead) => {
    setActiveLead(lead);
    setHasUnlockedCurrent(isPaidUser);
  };

  const handleBuyPass = async (amount: number, tierName: string) => {
    setIsUnlocking(true);
    try {
      await openRazorpayCheckout({
        amountInRupees: amount,
        itemName: `${tierName} Contact Unlock Pass`,
        description: `Unlock direct owner & scout contact details (${tierName} Tier)`,
        prefill: {
          name: user?.user_metadata?.full_name || undefined,
          email: user?.email || undefined,
        },
        onSuccess: () => {
          setIsUnlocking(false);
          setHasUnlockedCurrent(true);
        },
        onFailure: () => setIsUnlocking(false),
      });
    } catch (err) {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200/80 pt-10 pb-12 shadow-2xs">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-100">
                <i className="fas fa-handshake"></i>
                <span>Bangalore Community Property Referrals</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Property Referrals &amp; Finder Board
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Direct property leads and vacant homes spotted by local Bangalore neighbors and referrers. Connect directly with the person who found the property, inspect it, and pay them their referral tip when your deal is finalized.
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3 flex-wrap">
              <Link
                href="/bangalore/post-referral"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg no-underline"
              >
                <i className="fas fa-plus"></i>
                <span>Refer a House &amp; Earn Reward</span>
              </Link>
              <Link
                href="/bangalore/my-properties"
                className="inline-flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm rounded-xl transition-all no-underline border border-emerald-200 shadow-2xs"
              >
                <i className="fas fa-user-check text-emerald-600"></i>
                <span>Manage My Referrals</span>
              </Link>
              <Link
                href="/bangalore/properties"
                className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all no-underline border border-slate-200"
              >
                <i className="fas fa-building text-[#4165af]"></i>
                <span>Marketplace</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl mt-8">
        {/* Deal Closed Success Banner */}
        {dealSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xs mb-6 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xs shrink-0">
                <i className="fas fa-check"></i>
              </span>
              <span className="font-semibold">{dealSuccessMsg}</span>
            </div>
            <button
              onClick={() => setDealSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Commission & Safe-Harbor Information Notice */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <i className="fas fa-scale-balanced text-[#4165af]"></i>
                <span>Transparent Bangalore Commission &amp; Referral Tip Benchmarks</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                <strong>Rental Homes:</strong> Standard 1 month brokerage; referrer tip typically ₹1,500 – ₹3,000 upon lease signing. &bull; <strong>Property Sales:</strong> 1% – 2% broker commission; referrer tip typically ₹5,000 – ₹25,000. All payments are strictly private settlements between parties. HDE facilitates connections and holds no escrow.
              </p>
            </div>
            <div className="flex-shrink-0 bg-blue-50 text-[#4165af] text-[11px] font-bold px-3 py-1.5 rounded-lg border border-blue-100">
              IT Act Sec 79 Safe Harbor Protected
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs mb-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mr-2">
            <i className="fas fa-filter text-[#4165af]"></i>
            <span>Filter Referrals:</span>
          </div>

          {/* Locality */}
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
          >
            <option value="all">All Bangalore Localities</option>
            {BANGALORE_LOCALITIES.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
          >
            <option value="all">All Property Types</option>
            <option value="flat">Flat / Apartment</option>
            <option value="independent_house">Independent House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot / Site</option>
            <option value="shop">Commercial Shop</option>
          </select>

          {/* Intent */}
          <select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
          >
            <option value="all">Rent &amp; Sale</option>
            <option value="rent">For Rent</option>
            <option value="sale">For Sale</option>
          </select>

          {(selectedLocality !== "all" || selectedCategory !== "all" || selectedIntent !== "all") && (
            <button
              onClick={() => {
                setSelectedLocality("all");
                setSelectedCategory("all");
                setSelectedIntent("all");
              }}
              className="text-xs text-rose-600 font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Referral Leads Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <i className="fas fa-circle-notch fa-spin text-3xl text-[#4165af]"></i>
            <p className="text-xs font-semibold text-gray-500">Loading referral tips...</p>
          </div>
        ) : leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Category & Intent Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#4165af]/10 text-[#4165af] tracking-wider">
                      For {lead.intent}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {lead.property_category.replace("_", " ")}
                    </span>
                  </div>

                  {/* Locality */}
                  <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-1.5">
                    <i className="fas fa-location-dot text-rose-500 text-sm"></i>
                    <span>{lead.locality_name}</span>
                  </h3>

                  {/* Address Hint */}
                  <p className="text-xs text-slate-600 mb-4 font-medium line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {lead.property_address_hint}
                  </p>

                  {/* Pricing Details */}
                  {lead.approx_price_or_rent && (
                    <div className="p-2.5 bg-slate-50 rounded-xl mb-3 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Approx {lead.intent === "rent" ? "Rent" : "Price"}:</span>
                      <span className="font-extrabold text-slate-900">
                        {lead.intent === "rent"
                          ? `₹${lead.approx_price_or_rent.toLocaleString("en-IN")}/mo`
                          : `₹${(lead.approx_price_or_rent / 100000).toFixed(1)} Lakhs`}
                      </span>
                    </div>
                  )}

                  {/* Referral Reward Badge */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                        <i className="fas fa-hand-holding-dollar text-amber-700"></i>
                        <span>Referral Reward for Referrer:</span>
                      </span>
                      <span className="text-sm font-black text-amber-950">
                        ₹{lead.expected_finders_fee.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-900/90 block mt-1 font-medium">
                      Pay directly to the person who referred this house only after you finalize the deal or rental agreement.
                    </span>
                  </div>

                  {/* Referrer Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                      <i className="fas fa-shield-halved text-emerald-600 text-[11px]"></i>
                      <span>Verified Community Referrer</span>
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Connect / Manage Action Buttons */}
                <div className="mt-5 pt-3 border-t border-gray-100">
                  {isMyLead(lead) ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <span className="flex items-center gap-1.5">
                          <i className="fas fa-user-check text-emerald-600"></i>
                          <span>Your Posted Referral</span>
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-extrabold">Active</span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-[#4165af] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border border-blue-200"
                          title="Edit referral details"
                        >
                          <i className="fas fa-pen text-[10px]"></i>
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDealClosedLead(lead)}
                          className="flex-[1.6] py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          title="Deal completed — remove this listing"
                        >
                          <i className="fas fa-handshake text-[10px]"></i>
                          <span>Deal Closed (Remove)</span>
                        </button>

                        <button
                          onClick={() => setDeletingLeadId(lead.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center justify-center text-xs cursor-pointer border border-rose-200"
                          title="Delete this referral"
                        >
                          <i className="fas fa-trash text-[11px]"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenContact(lead)}
                      className="w-full py-3 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <i className="fas fa-phone text-[10px]"></i>
                      <span>Connect with Referrer</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-lg mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4165af] flex items-center justify-center text-2xl mx-auto border border-blue-100">
              <i className="fas fa-binoculars"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Scout Tips Found in this Filter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Be the first community scout to spot a house, flat, or plot in this locality and earn a direct finder&apos;s fee.
            </p>
            <Link
              href="/bangalore/post-referral"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4165af] hover:bg-[#325291] text-white font-bold text-xs rounded-xl no-underline transition"
            >
              <i className="fas fa-plus"></i>
              <span>Post Scout Lead Free</span>
            </Link>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4165af] uppercase tracking-wider">
                <i className="fas fa-handshake"></i>
                <span>Referrer Contact Details</span>
              </div>
              <button
                onClick={() => setActiveLead(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {hasUnlockedCurrent ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Referrer (Found this house):</span>
                    <span className="text-xs font-extrabold text-slate-900">{activeLead.scout_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Phone / WhatsApp:</span>
                    <span className="text-sm font-black text-slate-900">{activeLead.scout_phone}</span>
                  </div>
                  {activeLead.scout_upi_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Referrer UPI ID:</span>
                      <span className="text-xs font-mono font-bold text-slate-900">{activeLead.scout_upi_id}</span>
                    </div>
                  )}
                </div>

                {/* Direct WhatsApp Call CTA */}
                <a
                  href={`https://wa.me/91${activeLead.scout_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hi, I saw the property you referred on HDE (${activeLead.property_category} in ${activeLead.locality_name}). I would like to coordinate, inspect it, and discuss the referral reward.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 no-underline shadow-xs transition"
                >
                  <i className="fab fa-whatsapp text-sm"></i>
                  <span>Message Referrer on WhatsApp</span>
                </a>

                <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 leading-relaxed">
                  <strong>Direct Settlement Reminder:</strong> HDE only connects you. Settle the agreed referral reward (₹{activeLead.expected_finders_fee.toLocaleString("en-IN")}) directly with the referrer (via UPI or cash) only after your rental agreement or property deal is finalized.
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#4165af] flex items-center justify-center text-xl mx-auto border border-blue-100">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Unlock Direct Referrer &amp; Property Contact
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Referrer identity and owner contact numbers are protected. Choose an access pass to unlock direct coordination details.
                  </p>
                </div>

                {/* Option 1: Basic 199 */}
                <div className="bg-slate-50 border border-gray-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Basic Contact Pass</span>
                    <span className="text-[11px] text-gray-500">30-day contact access &bull; 5 unlocks</span>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">₹199</span>
                  </div>
                  <button
                    onClick={() => handleBuyPass(199, "Basic")}
                    disabled={isUnlocking}
                    className="px-3.5 py-2 bg-[#4165af] hover:bg-[#325291] text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-60"
                  >
                    {isUnlocking ? "Opening..." : "Pay ₹199"}
                  </button>
                </div>

                {/* Option 2: Pro 999 (Commercial Broker Pack) */}
                <div className="bg-blue-50/70 border-2 border-[#4165af] rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">Pro Commercial Pack</span>
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">Pro Tier</span>
                    </div>
                    <span className="text-[11px] text-gray-600">5 listings + Unlimited scout leads</span>
                    <span className="text-xs font-black text-slate-900 block mt-0.5">₹999</span>
                  </div>
                  <button
                    onClick={() => handleBuyPass(999, "Pro")}
                    disabled={isUnlocking}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-60"
                  >
                    {isUnlocking ? "Opening..." : "Pay ₹999"}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <Link
                    href="/upgrade"
                    className="text-[11px] text-[#4165af] hover:underline font-semibold"
                  >
                    Or view all plans on Upgrade Page &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Referral Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <i className="fas fa-pen text-[#4165af]"></i>
                <span>Edit Your Referral Details</span>
              </h3>
              <button
                onClick={() => setEditingLead(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Locality Name:
                </label>
                <input
                  type="text"
                  value={editingLead.locality_name}
                  disabled
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Approx Location / Society / Landmark Hint:
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Approx {editingLead.intent === "rent" ? "Rent" : "Price"} (₹):
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder={editingLead.intent === "rent" ? "e.g. 25000" : "e.g. 7500000"}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Your Referral Reward (₹):
                  </label>
                  <input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Your Contact Mobile:
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Your UPI ID (For Direct Payout):
                  </label>
                  <input
                    type="text"
                    value={editUpi}
                    onChange={(e) => setEditUpi(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#4165af] hover:bg-[#345290] disabled:opacity-50 text-white font-semibold rounded-xl transition cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete This Referral?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure? This referral post will be permanently deleted and removed from the public board.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLeadId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal Closed Confirmation Modal */}
      {dealClosedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/40 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xs">
              <i className="fas fa-handshake"></i>
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">
                Deal Closed &amp; Reward Finalized?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Referral: <strong className="text-gray-800">{dealClosedLead.property_category} in {dealClosedLead.locality_name}</strong>
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <i className="fas fa-triangle-exclamation text-amber-600 text-sm"></i>
                <span>DATA REMOVAL AFTER DEAL CLOSURE:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900 font-medium">
                Congratulations on facilitating this connection! As agreed: <strong>Once the deal is closed, this old listing has NO USE and must be removed</strong>.
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-amber-800 font-medium">
                <li>Permanently stops brokers and buyers from calling your phone.</li>
                <li>Protects your privacy and removes your address hint and UPI ID.</li>
                <li>Ensures the community referral board only contains fresh, active leads.</li>
              </ul>
            </div>

            <p className="text-xs font-semibold text-gray-700">
              Confirm deal closure to permanently remove this lead from the board?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDealClosedLead(null)}
                disabled={isClosingDeal}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                No, Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmDealClosed}
                disabled={isClosingDeal}
                className="w-full sm:w-auto px-5 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-check"></i>
                <span>{isClosingDeal ? "Closing Deal..." : "YES, Deal Closed — Remove Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
