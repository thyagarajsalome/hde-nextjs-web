// src/app/bangalore/post-referral/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BANGALORE_LOCALITIES } from "@/data/bangaloreLocalities";
import { RealEstateService } from "@/services/realEstateService";
import { useUser } from "@/context/UserContext";
import { openRazorpayCheckout } from "@/lib/razorpayClient";

export default function PostReferralPage() {
  const router = useRouter();
  const { user, planTier, hasPaid } = useUser();

  const [localityId, setLocalityId] = useState(BANGALORE_LOCALITIES[0].id);
  const [propertyCategory, setPropertyCategory] = useState<"flat" | "plot" | "villa" | "shop" | "independent_house">("flat");
  const [intent, setIntent] = useState<"rent" | "sale">("rent");
  const [approxPrice, setApproxPrice] = useState<number | "">("");
  const [expectedFee, setExpectedFee] = useState<number>(2000);
  const [addressHint, setAddressHint] = useState("");

  // Owner contact
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  // Scout Ramu contact
  const [scoutName, setScoutName] = useState("");
  const [scoutPhone, setScoutPhone] = useState("");
  const [scoutUpi, setScoutUpi] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [hasPaidSlot, setHasPaidSlot] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedLocality =
    BANGALORE_LOCALITIES.find((l) => l.id === localityId) || BANGALORE_LOCALITIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!addressHint.trim()) {
      newErrors.addressHint = "Please provide an approximate location or landmark";
    }
    const cleanOwnerPhone = ownerPhone.replace(/[^0-9]/g, "");
    if (!cleanOwnerPhone || cleanOwnerPhone.length < 10) {
      newErrors.ownerPhone = "Enter a valid 10-digit owner phone number";
    }
    if (!scoutName.trim()) {
      newErrors.scoutName = "Please enter your name";
    }
    const cleanScoutPhone = scoutPhone.replace(/[^0-9]/g, "");
    if (!cleanScoutPhone || cleanScoutPhone.length < 10) {
      newErrors.scoutPhone = "Enter your valid 10-digit contact number";
    }
    if (expectedFee <= 0) {
      newErrors.expectedFee = "Please specify a valid finder's fee amount";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Quota Check: 1 Free active scout lead per user. 2nd lead requires Standard Tier (₹349)
    if (!hasPaidSlot && user) {
      const isStandardOrPro = planTier === "standard" || planTier === "pro" || hasPaid;
      if (!isStandardOrPro) {
        try {
          const userLeads = await RealEstateService.getUserScoutLeads(user.id);
          const activeCount = userLeads.filter((l) => l.status === "active").length;
          if (activeCount >= 1) {
            setIsSubmitting(false);
            setLimitModalOpen(true);
            return;
          }
        } catch (err) {
          console.warn("Scout quota check warning:", err);
        }
      }
    }

    try {
      const created = await RealEstateService.createScoutLead({
        user_id: user?.id,
        locality_name: selectedLocality.name,
        property_category: propertyCategory,
        intent,
        approx_price_or_rent: approxPrice ? Number(approxPrice) : undefined,
        expected_finders_fee: Number(expectedFee),
        finders_fee_type: "fixed_amount",
        property_address_hint: addressHint,
        owner_name: ownerName || undefined,
        owner_phone: cleanOwnerPhone,
        scout_name: scoutName,
        scout_phone: cleanScoutPhone,
        scout_upi_id: scoutUpi || undefined,
        status: "active",
      });

      if (typeof window !== "undefined" && created?.id) {
        try {
          const existingIds = JSON.parse(localStorage.getItem("hde_my_scout_ids") || "[]");
          if (!existingIds.includes(created.id)) {
            existingIds.push(created.id);
            localStorage.setItem("hde_my_scout_ids", JSON.stringify(existingIds));
          }
          localStorage.setItem("hde_last_scout_phone", cleanScoutPhone);
        } catch (storageErr) {}
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(`Submission failed: ${err.message || "Please check your network and try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200/80 pt-10 pb-12 shadow-2xs">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-100">
            <i className="fas fa-handshake"></i>
            <span>Community Property Referral Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Refer a House &amp; Earn a Referral Reward
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
            Saw a &ldquo;To-Let&rdquo; board, a vacant flat, plot, or commercial space in your neighborhood? Post the reference here for free. When an independent broker, tenant, or buyer connects with you and closes the deal, earn your referral reward directly via UPI.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-600"></i>
              <span>100% Free 1st Post</span>
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-shield-alt text-[#4165af]"></i>
              <span>Owner Number Kept Protected</span>
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-wallet text-amber-600"></i>
              <span>Direct Settlement to Your UPI</span>
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl mt-8">
        {success ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-emerald-200 text-center shadow-xs space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-200">
              <i className="fas fa-check"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Property Referral Published Successfully!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              Your property referral in <strong>{selectedLocality.name}</strong> is now live on the Bangalore Referral Board. Independent agents, tenants, and buyers searching in your area can now contact you directly to inspect the property and settle your referral reward.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/bangalore/my-properties"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl no-underline transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <i className="fas fa-handshake text-[11px]"></i>
                <span>Manage / Close Deal (My Properties)</span>
              </Link>
              <Link
                href="/bangalore/referrals"
                className="w-full sm:w-auto px-6 py-3 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs rounded-xl no-underline transition flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-list text-[11px]"></i>
                <span>View Bangalore Referral Board</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setAddressHint("");
                  setOwnerPhone("");
                  setOwnerName("");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Post Another Scout Tip
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card 1: Property Location & Details */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4165af] uppercase tracking-wider">
                <i className="fas fa-map-pin"></i>
                <span>1. Property Details You Spotted</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Locality */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bangalore Locality *
                  </label>
                  <select
                    value={localityId}
                    onChange={(e) => setLocalityId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
                  >
                    {BANGALORE_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Property Type *
                  </label>
                  <select
                    value={propertyCategory}
                    onChange={(e) => setPropertyCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
                  >
                    <option value="flat">Flat / Apartment</option>
                    <option value="independent_house">Independent House</option>
                    <option value="villa">Villa / Row House</option>
                    <option value="plot">Plot / Land Site</option>
                    <option value="shop">Commercial Shop / Office</option>
                  </select>
                </div>

                {/* Intent */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Transaction Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIntent("rent")}
                      className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        intent === "rent"
                          ? "bg-[#4165af] text-white border-[#4165af]"
                          : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100"
                      }`}
                    >
                      For Rent
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntent("sale")}
                      className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        intent === "sale"
                          ? "bg-[#4165af] text-white border-[#4165af]"
                          : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100"
                      }`}
                    >
                      For Sale
                    </button>
                  </div>
                </div>

                {/* Approx Rent / Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Approx {intent === "rent" ? "Monthly Rent (₹)" : "Price (₹)"}
                  </label>
                  <input
                    type="number"
                    placeholder={intent === "rent" ? "e.g. 35000" : "e.g. 7500000"}
                    value={approxPrice}
                    onChange={(e) => setApproxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
                  />
                </div>
              </div>

              {/* Address / Landmark Hint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Approx Location / Society / Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Wipro Gate, Kaikondrahalli, Sarjapur Road"
                  value={addressHint}
                  onChange={(e) => setAddressHint(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af] ${
                    errors.addressHint ? "border-red-500 bg-red-50/50" : "border-gray-300"
                  }`}
                />
                {errors.addressHint && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.addressHint}</p>
                )}
              </div>
            </div>

            {/* Card 2: Expected Finder's Fee */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <i className="fas fa-coins"></i>
                  <span>2. Your Expected Finder&apos;s Fee</span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Payable on deal closing</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Expected Referral Reward / Finder&apos;s Tip (₹) *
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-[#4165af] focus-within:border-[#4165af] overflow-hidden bg-white shadow-2xs">
                  <span className="inline-flex items-center px-4 bg-slate-100 text-slate-700 font-extrabold text-sm border-r border-gray-200 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={expectedFee}
                    onChange={(e) => setExpectedFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="mt-2.5 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                    <i className="fas fa-info-circle text-amber-600"></i>
                    <span>Direct Settlement Notice (Not from HDE):</span>
                  </p>
                  <p className="text-[11px] text-amber-900">
                    This variable reward is <strong>not paid by HDE</strong>. You are supposed to receive this directly from the property owner or tenant/buyer upon a successful deal or finalized rental agreement. Kindly discuss and coordinate this mutually with the individual.
                  </p>
                  <p className="text-[10px] text-amber-800 font-semibold pt-0.5">
                    💡 Typical community benchmarks: ₹1,500 – ₹3,000 for rent; ₹5,000 – ₹25,000 for property sale.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Owner's Contact (Protected) */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <i className="fas fa-lock"></i>
                  <span>3. Property Owner Contact (Protected)</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                  Zero Spam Protection
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The owner&apos;s contact is never posted on Google or public web pages. It is only shared directly when an authenticated broker or tenant connects with you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Owner Name (If Known)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Owner Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af] ${
                      errors.ownerPhone ? "border-red-500 bg-red-50/50" : "border-gray-300"
                    }`}
                  />
                  {errors.ownerPhone && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.ownerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 4: Referrer (Your) Contact & UPI Details */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4165af] uppercase tracking-wider">
                  <i className="fas fa-user-check"></i>
                  <span>4. Your Contact &amp; Settlement Info</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                  <i className="fas fa-shield-halved"></i>
                  100% Confidential
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your name and mobile number are kept private and confidential. They are never published openly on search engines or public listing cards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramu Kumar"
                    value={scoutName}
                    onChange={(e) => setScoutName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af] ${
                      errors.scoutName ? "border-red-500 bg-red-50/50" : "border-gray-300"
                    }`}
                  />
                  {errors.scoutName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.scoutName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={scoutPhone}
                    onChange={(e) => setScoutPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af] ${
                      errors.scoutPhone ? "border-red-500 bg-red-50/50" : "border-gray-300"
                    }`}
                  />
                  {errors.scoutPhone && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.scoutPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your UPI ID (For Direct Payout)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210@paytm"
                    value={scoutUpi}
                    onChange={(e) => setScoutUpi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4165af]"
                  />
                </div>
              </div>
            </div>

            {/* Platform Safe Harbor Disclaimer Notice */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <i className="fas fa-scale-balanced text-amber-700"></i>
                <span>HDE Platform Disclaimer &amp; Facilitator Terms</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Home Design English (HDE) operates strictly as an intermediary technology platform under Section 79 of the Information Technology Act, 2000. HDE does not employ brokers, collect escrow, or guarantee finder fee payments. All referral bonuses and brokerage commissions are strictly private mutual agreements between the referrer, registered agent, and transacting parties.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 bg-[#4165af] hover:bg-[#325291] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin text-xs"></i>
                    <span>Submitting Referral...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane text-xs"></i>
                    <span>Submit Referral Free</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quota Limit Modal: 1 Free Tip Limit -> Standard Tier (₹349) */}
      {limitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center space-y-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-amber-200">
              <i className="fas fa-coins"></i>
            </div>
            <div>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                1 Free Scout Tip Limit
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">
                You Have an Active Scout Tip Live
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Individual referrers get 1 free active tip. To keep multiple scout tips active simultaneously across Bangalore, add an extra slot using our Standard Tier.
              </p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4165af]">Standard Tier Extra Slot</span>
                <span className="text-sm font-black text-gray-900">₹349</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Keep up to 3 active scout tips live simultaneously for 30 days.
              </p>
              <button
                type="button"
                onClick={async () => {
                  setIsPaying(true);
                  try {
                    await openRazorpayCheckout({
                      amountInRupees: 349,
                      itemName: "Scout Lead Extra Slot (Standard Tier)",
                      description: "Add extra active scout referral tip slot for 30 days (₹349)",
                      prefill: {
                        name: scoutName || undefined,
                        contact: scoutPhone.replace(/[^0-9]/g, "") || undefined,
                      },
                      onSuccess: () => {
                        setIsPaying(false);
                        setHasPaidSlot(true);
                        setLimitModalOpen(false);
                        alert("Payment verified! Now click 'Submit Referral Free' to submit.");
                      },
                      onFailure: () => setIsPaying(false),
                    });
                  } catch (e) {
                    setIsPaying(false);
                  }
                }}
                disabled={isPaying}
                className="w-full py-2.5 px-4 bg-[#4165af] hover:bg-[#345290] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <i className="fas fa-bolt text-amber-300 text-xs"></i>
                <span>{isPaying ? "Opening Razorpay..." : "Pay ₹349 for Extra Slot"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLimitModalOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer pt-2"
            >
              Cancel &amp; Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
