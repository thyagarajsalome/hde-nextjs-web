"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../config/supabaseClient";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { useRegion } from "../../context/RegionContext";
import { PRO_CALCULATOR_DETAILS } from "../../config/calculatorTiers";

type RegionCode = "IN" | "US" | "AE";
type PlanColor = "blue" | "amber" | "slate";

interface PlanType {
  id: string;
  name: string;
  tier: "basic" | "standard" | "pro";
  price: number;
  originalPrice: number;
  tagline: string;
  credits: string;
  badge?: string;
  features: string[];
  color: PlanColor;
  icon: string;
}

const ICON_BADGE_CLASSES: Record<PlanColor, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  slate: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const PLANS_BY_REGION: Record<RegionCode, PlanType[]> = {
  IN: [
    {
      id: "5_credits",
      name: "Basic",
      tier: "basic",
      price: 199,
      originalPrice: 249,
      tagline: "Best for homeowners planning a personal remodel or room budget.",
      credits: "5 Project Saves",
      features: [
        "5 permanent cloud project saves (never expire)",
        "Material & room cost breakdown PDFs",
        "Full House Plan & CAD Gallery access",
        "30-day Real Estate Direct Buyer Pass",
      ],
      color: "blue",
      icon: "fa-paint-roller",
    },
    {
      id: "10_credits",
      name: "Standard",
      tier: "standard",
      price: 349,
      originalPrice: 499,
      tagline: "Best for self-builders & homeowners needing bank loan reports.",
      credits: "10 Project Saves",
      badge: "Most Popular",
      features: [
        "10 permanent cloud project saves (never expire)",
        "Official Bank Loan & Contractor BOQ PDFs",
        "All Pro calculators (Kitchen, Interior, Flooring)",
        "Extra Real Estate owner listing slot included",
      ],
      color: "amber",
      icon: "fa-drafting-compass",
    },
    {
      id: "pro",
      name: "Pro",
      tier: "pro",
      price: 999,
      originalPrice: 1427,
      tagline: "Built for civil contractors, architects, and multi-site builders.",
      credits: "100 Project Saves",
      features: [
        "100 permanent cloud project saves",
        "Complete 7-phase cement, steel & masonry BOQs",
        "Client-ready PDF & Excel contractor exports",
        "5 Commercial Real Estate broker listing slots",
      ],
      color: "slate",
      icon: "fa-hard-hat",
    },
  ],
  US: [
    {
      id: "usa_basic",
      name: "Basic",
      tier: "basic",
      price: 9.99,
      originalPrice: 14.99,
      tagline: "Ideal for homeowners saving personal renovation budgets.",
      credits: "5 Project Saves",
      features: [
        "5 permanent cloud project saves (never expire)",
        "Client-ready PDF cost estimates",
        "Cost-per-sqft & material comparisons",
        "Side-by-side scenario tracking",
      ],
      color: "blue",
      icon: "fa-home",
    },
    {
      id: "usa_standard",
      name: "Standard",
      tier: "standard",
      price: 24.99,
      originalPrice: 39.99,
      tagline: "For remodelers & flippers needing trade takeoffs and loan bids.",
      credits: "15 Project Saves",
      badge: "Best Value",
      features: [
        "15 permanent cloud project saves (never expire)",
        "All Pro calculators (Kitchen, Bath, Roofing, Pool)",
        "FHA 203(k) & GC-ready PDF cost sheets",
        "Priority email support",
      ],
      color: "amber",
      icon: "fa-building",
    },
    {
      id: "usa_pro",
      name: "Pro",
      tier: "pro",
      price: 59.99,
      originalPrice: 89.99,
      tagline: "For contractors and builders managing multiple client properties.",
      credits: "100 Project Saves",
      features: [
        "100 permanent cloud project saves",
        "Complete trade-by-trade cost schedules",
        "Unlimited client-ready PDF exports",
        "Priority technical support",
      ],
      color: "slate",
      icon: "fa-hard-hat",
    },
  ],
  AE: [
    {
      id: "usa_basic",
      name: "Starter",
      tier: "basic",
      price: 39,
      originalPrice: 55,
      tagline: "For individual buyers evaluating a single Dubai property.",
      credits: "5 Project Saves",
      features: [
        "5 permanent cloud project saves (never expire)",
        "Itemized DLD & trustee fee PDF sheets",
        "Mortgage & acquisition cost comparisons",
        "Side-by-side scenario tracking",
      ],
      color: "blue",
      icon: "fa-building",
    },
    {
      id: "usa_standard",
      name: "Investor",
      tier: "standard",
      price: 99,
      originalPrice: 149,
      tagline: "For multi-unit investors comparing yield across Dubai districts.",
      credits: "15 Project Saves",
      badge: "Most Popular",
      features: [
        "15 permanent cloud project saves (never expire)",
        "Complete DLD, trustee & service-charge takeoffs",
        "Gross vs net rental yield ROI spreadsheets",
        "Priority support",
      ],
      color: "amber",
      icon: "fa-city",
    },
    {
      id: "usa_pro",
      name: "Broker & Developer",
      tier: "pro",
      price: 220,
      originalPrice: 330,
      tagline: "For agencies and wealth advisors managing client portfolios.",
      credits: "100 Project Saves",
      features: [
        "100 permanent cloud project saves",
        "Client-ready investor presentation PDFs",
        "All freehold community fee schedules",
        "Priority VIP support",
      ],
      color: "slate",
      icon: "fa-briefcase",
    },
  ],
};

const COMPARISON_ROWS: Record<
  RegionCode,
  { feature: string; free: string; paid: string }[]
> = {
  IN: [
    { feature: "Live construction & EMI calculators", free: "Unlimited Free", paid: "Unlimited Free" },
    { feature: "Cloud dashboard project saves", free: "1 starter save", paid: "5 to 100 permanent saves" },
    { feature: "Pro calculators (Kitchen, Bath, Interior, BOQ)", free: "Preview only", paid: "Full unlock included" },
    { feature: "Bank & Contractor PDF reports", free: "₹299 standalone PDF", paid: "Included in Standard & Pro" },
    { feature: "Real Estate: Free owner listing", free: "1 active listing (30d)", paid: "Multi-listing slots (Standard/Pro)" },
    { feature: "Real Estate: Direct owner contacts", free: "3 free reveals", paid: "Unlimited (30-day Buyer Pass)" },
    { feature: "Billing model", free: "₹0 forever", paid: "One-time payment (never expires)" },
  ],
  US: [
    { feature: "Live construction & framing calculators", free: "Unlimited Free", paid: "Unlimited Free" },
    { feature: "Cloud dashboard project saves", free: "1 starter save", paid: "5 to 100 permanent saves" },
    { feature: "Pro trade calculators (Roofing, Kitchen, Pool)", free: "Preview only", paid: "Full unlock included" },
    { feature: "FHA 203(k) & GC PDF bid sheets", free: "Not included", paid: "Included" },
    { feature: "Billing model", free: "$0 forever", paid: "One-time payment (never expires)" },
  ],
  AE: [
    { feature: "Live DLD & buying cost calculators", free: "Unlimited Free", paid: "Unlimited Free" },
    { feature: "Cloud investment portfolio saves", free: "1 starter save", paid: "5 to 100 permanent saves" },
    { feature: "Trustee & ROI PDF breakdown sheets", free: "Not included", paid: "Included" },
    { feature: "Billing model", free: "AED 0 forever", paid: "One-time payment (never expires)" },
  ],
};

const FAQS: Record<RegionCode, { q: string; a: string }[]> = {
  IN: [
    {
      q: "Is this a monthly subscription?",
      a: "No. All calculator plans (₹199, ₹349, ₹999) are one-time payments. Your project save credits never expire and there are zero recurring charges.",
    },
    {
      q: "I only need one Bank Loan Estimate PDF — should I pay ₹299 or ₹349?",
      a: "If you only want a single Bank Estimate PDF once, you can download it directly inside the Construction Calculator for ₹299. If you also want 10 cloud project saves, Pro calculators unlocked, and an extra property listing slot, Standard (₹349) gives everything for ₹50 more.",
    },
    {
      q: "Are live calculations free without paying?",
      a: "Yes. Running estimates, adjusting specs, and viewing cost charts are 100% free. Upgrading is only needed for Pro calculators, saving multiple projects, and downloading official PDFs.",
    },
    {
      q: "Are existing paid accounts still protected?",
      a: "Yes. Existing paid customers retain all unlocked features and credits permanently.",
    },
  ],
  US: [
    {
      q: "Is this a monthly SaaS subscription?",
      a: "No. All plans are one-time payments with zero recurring monthly charges. Purchased project saves never expire.",
    },
    {
      q: "Are basic calculations free?",
      a: "Yes. Framing, roofing, and remodeling calculations run free anytime. Upgrading unlocks Pro calculators, cloud project saves, and PDF bid exports.",
    },
  ],
  AE: [
    {
      q: "Is this a recurring subscription?",
      a: "No. Every plan is a single one-time payment and your saved investment evaluations never expire.",
    },
    {
      q: "Are live DLD and mortgage calculations free?",
      a: "Yes. Live property acquisition calculations are free anytime; credits are only used to save portfolios and export PDF breakdowns.",
    },
  ],
};

const UpgradePage = () => {
  const { user, refreshProfile, planTier, hasPaid } = useUser();
  const { showToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const calcParam = searchParams.get("calc");
  const calcDetails = calcParam ? PRO_CALCULATOR_DETAILS[calcParam] : null;
  const { region, setRegion } = useRegion();

  const currentRegion: RegionCode =
    region && ["US", "IN", "AE"].includes(region) ? (region as RegionCode) : "IN";
  const activePlans = PLANS_BY_REGION[currentRegion];
  const currencySymbol = currentRegion === "US" ? "$" : currentRegion === "AE" ? "AED " : "₹";
  const comparisonRows = COMPARISON_ROWS[currentRegion];
  const faqs = FAQS[currentRegion];

  useEffect(() => {
    const scriptId = "razorpay-checkout-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async (planId: string) => {
    setLoadingPlan(planId);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate.push("/signin");
        return;
      }

      const paymentCurrency = currentRegion === "IN" ? "INR" : "USD";
      const { data: order, error: orderError } = await supabase.functions.invoke(
        "create-order",
        { body: { planId, currency: paymentCurrency } }
      );

      if (orderError || !order || order.error) {
        throw new Error(order?.error || "Failed to create order.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HDE Premium",
        description: `Unlocking ${planId.replace("_", " ")}`,
        order_id: order.id,
        handler: async (response: any) => {
          const { data: result } = await supabase.functions.invoke("verify-payment", {
            body: { ...response, planId, currency: paymentCurrency },
          });
          if (result?.status === "success") {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("hde_user_has_paid", "true");
              window.localStorage.setItem("hde_bank_report_paid", "true");
            }
            await refreshProfile();
            navigate.push("/dashboard");
          } else {
            setError("Verification failed. Please contact support.");
          }
        },
        prefill: { email: user?.email },
        theme: { color: "#d9a443" },
      };
      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4 transition-colors">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Compact Header + Region Toggle */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-1 p-1 bg-gray-200/70 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRegion("IN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentRegion === "IN"
                  ? "bg-white dark:bg-zinc-900 text-[#0f2042] dark:text-[#c5a059] shadow-xs"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🇮🇳 India (₹)
            </button>
            <button
              type="button"
              onClick={() => setRegion("US")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentRegion === "US"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xs"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🇺🇸 USA ($)
            </button>
            <button
              type="button"
              onClick={() => setRegion("AE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentRegion === "AE"
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🇦🇪 UAE (AED)
            </button>
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
              One-Time Payment • No Subscriptions
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
              Simple, One-Time Upgrade Plans
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Live calculators are always free. Upgrade once to unlock Pro tools, cloud saves, and client/bank-ready PDFs.
            </p>
          </div>

          {/* Contextual Pro Tool Callout (only shown if redirected from a locked tool) */}
          {calcParam && (
            <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-amber-500/10 border border-[#c5a059]/40 text-left flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c5a059] text-white flex items-center justify-center shrink-0">
                <i className="fas fa-crown text-sm"></i>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                  Unlocking: {calcDetails?.name || calcParam.replace(/-/g, " ").toUpperCase()}
                </p>
                <p className="text-[11px] text-gray-600 dark:text-zinc-400 truncate">
                  Choose any plan below to immediately access this tool &amp; PDF exports.
                </p>
              </div>
            </div>
          )}

          {/* Active Paid Member Banner */}
          {(hasPaid || planTier === "pro") && (
            <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5 text-left">
              <i className="fas fa-check-circle text-emerald-600 text-base shrink-0"></i>
              <span>
                <strong>Active Plan ({planTier.toUpperCase()}):</strong> Your unlocked tools remain active permanently. Top up anytime if you need more cloud save slots.
              </span>
            </div>
          )}
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-center text-sm font-medium">
            {error}
          </div>
        )}

        {/* Primary 3-Card Pricing Grid (Immediately Visible Above the Fold) */}
        <section aria-label="Upgrade plans" className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {activePlans.map((plan) => {
            const isPopular = Boolean(plan.badge);
            const isActiveTier = planTier === plan.tier;
            const discountPct = Math.round(
              ((plan.originalPrice - plan.price) / plan.originalPrice) * 100
            );

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-shadow border-2 ${
                  isPopular
                    ? "border-[#c5a059] shadow-xl md:-translate-y-1"
                    : "border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#c5a059] text-white text-[11px] font-extrabold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-zinc-100">
                          {plan.name}
                        </h2>
                        {isActiveTier && (
                          <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {plan.tagline}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ICON_BADGE_CLASSES[plan.color]
                      }`}
                    >
                      <i className={`fas ${plan.icon}`}></i>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="pb-4 mb-4 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 line-through">
                        {currencySymbol}
                        {plan.originalPrice}
                      </span>
                      {discountPct > 0 && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
                          Save {discountPct}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-4xl font-black text-gray-900 dark:text-zinc-100">
                        {currencySymbol}
                        {plan.price}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                        one-time
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#0f2042] dark:text-[#c5a059] mt-2">
                      Includes {plan.credits}
                    </p>
                  </div>

                  {/* Concise Features List */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-zinc-300"
                      >
                        <i className="fas fa-check text-emerald-500 mt-1 shrink-0 text-xs"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handlePayment(plan.id)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                    isPopular
                      ? "bg-[#c5a059] hover:bg-[#b58e45] text-white shadow-md"
                      : "bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-black dark:hover:bg-zinc-700"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </span>
                  ) : isActiveTier ? (
                    "Add More Saves"
                  ) : (
                    `Choose ${plan.name} — ${currencySymbol}${plan.price}`
                  )}
                </button>
              </div>
            );
          })}
        </section>

        {/* Payment Trust Row */}
        <p className="text-center text-xs text-gray-500 dark:text-zinc-400">
          <i className="fas fa-lock text-emerald-600 mr-1.5"></i>
          Razorpay Secure Checkout • UPI, Cards &amp; NetBanking • Instant activation
        </p>

        {/* Secondary Details Behind Clean Native Disclosures (No Page Clutter) */}
        <section aria-label="Additional plan details" className="space-y-3 max-w-4xl mx-auto">
          {/* 1. Free vs Pro Table */}
          <details className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-zinc-100 select-none">
              <i className="fas fa-chevron-right text-xs text-gray-400 transition-transform duration-200 group-open:rotate-90"></i>
              <span>Compare Free Visitor vs. Paid Plans</span>
            </summary>
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-zinc-800 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm mt-3">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400">
                    <th className="py-2.5 font-semibold">Feature</th>
                    <th className="py-2.5 font-semibold text-center">Free</th>
                    <th className="py-2.5 font-bold text-center text-[#0f2042] dark:text-[#c5a059]">
                      Paid Plan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-gray-800 dark:text-zinc-200 font-medium">
                        {row.feature}
                      </td>
                      <td className="py-2.5 text-center text-gray-500 dark:text-zinc-400">
                        {row.free}
                      </td>
                      <td className="py-2.5 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.paid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {/* 2. Bangalore Real Estate Details (India only) */}
          {currentRegion === "IN" && (
            <details className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800">
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-zinc-100 select-none">
                <i className="fas fa-chevron-right text-xs text-gray-400 transition-transform duration-200 group-open:rotate-90"></i>
                <span>Bangalore Real Estate Perks (Free vs. Included Passes)</span>
              </summary>
              <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-zinc-300">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    Always Free (₹0)
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li>Unlimited browsing across 24 Bangalore localities</li>
                    <li>1 active owner property listing (30 days free)</li>
                    <li>First 3 direct owner phone/WhatsApp reveals</li>
                    <li>Zero brokerage commission</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 space-y-2">
                  <p className="font-bold text-slate-900 dark:text-zinc-100">
                    Included with Upgrade Tiers
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>Basic (₹199):</strong> Unlimited direct owner contacts for 30 days</li>
                    <li><strong>Standard (₹349):</strong> Extra active owner listing slot included</li>
                    <li><strong>Pro (₹999):</strong> 5 commercial broker listing slots included</li>
                  </ul>
                </div>
              </div>
            </details>
          )}

          {/* 3. FAQs */}
          <details className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800">
            <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-5 py-4 flex items-center gap-3 text-sm font-bold text-gray-900 dark:text-zinc-100 select-none">
              <i className="fas fa-chevron-right text-xs text-gray-400 transition-transform duration-200 group-open:rotate-90"></i>
              <span>Frequently Asked Questions</span>
            </summary>
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/40 space-y-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-zinc-100">{faq.q}</p>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </details>
        </section>

        {/* Quiet 1-Line Footer Link for Desktop CAD */}
        <div className="text-center pt-2 text-xs text-gray-500 dark:text-zinc-400">
          Looking for our offline 2D CAD software (HDE Studio)?{" "}
          <Link
            href="/download"
            className="font-bold text-[#0f2042] dark:text-[#c5a059] hover:underline"
          >
            View Desktop CAD License Pricing →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
