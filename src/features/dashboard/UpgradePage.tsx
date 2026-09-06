"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../config/supabaseClient";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { useRegion } from "../../context/RegionContext";

// 1. Define the strict TypeScript interface for your plans
type PlanType = {
  id: string;
  name: string;
  tier: string;
  price: number;
  originalPrice: number;
  description: string;
  credits: string;
  useCase: string;
  features: string[];
  color: string;
  icon: string;
  badge?: string; // Optional property prevents the TS error!
};

// 2. Apply the interface to the plans object
const plans = {
  basic: {
    id: "5_credits",
    name: "Basic",
    tier: "basic",
    price: 199,
    originalPrice: 249,
    description: "Ideal for homeowners planning a single room remodel or personal home project.",
    credits: "5 Project Credits",
    useCase: "Best for: Saving personal renovation budgets and exporting quotes.",
    badge: undefined,
    features: [
      "5 Permanent Cloud Project Save Credits",
      "Itemized PDF Quotes (Bank & Contractor Ready)",
      "Full House Plan & CAD Gallery Access",
      "Material & Room Cost Breakdown Spreadsheets",
      "Credits never expire"
    ],
    color: "blue",
    icon: "fa-paint-roller"
  },
  standard: {
    id: "10_credits",
    name: "Standard",
    tier: "standard",
    price: 349,
    originalPrice: 499,
    description: "Perfect for self-builders and interior designers managing full-house construction.",
    credits: "10 Project Credits",
    useCase: "Best for: Complete multi-room home builds and client presentations.",
    badge: "Most Popular",
    features: [
      "10 Permanent Cloud Project Save Credits",
      "Detailed Multi-Trade PDF Reports (Plumbing, Electrical, Flooring)",
      "Doors & Windows Schedule PDF Exports",
      "Side-by-side Project Scenario Tracking",
      "Priority Customer Support",
      "Everything in Basic"
    ],
    color: "amber",
    icon: "fa-drafting-compass"
  },
  pro: {
    id: "pro",
    name: "Pro",
    tier: "pro",
    price: 999,
    originalPrice: 1427,
    description: "Built for civil contractors, builders, and architects needing high-volume client management.",
    credits: "100 Project Credits",
    useCase: "Best for: Professional builders, commercial contractors, and developers.",
    badge: undefined,
    features: [
      "100 Project Credits (Store up to 100 sites)",
      "Complete 7-Phase Material BOQ (Bill of Quantities)",
      "Exact Cement, Steel & Masonry Brand Schedules",
      "Contractor-grade Client PDF & Excel Exports",
      "10 Daily Save Limit (Anti-Bot Protection)",
      "Priority VIP Support"
    ],
    color: "gray",
    icon: "fa-hard-hat"
  },
};

const usaPlans = {
  basic: {
    id: "usa_basic",
    name: "Basic",
    tier: "basic",
    price: 9.99,
    originalPrice: 14.99,
    description: "Perfect for homeowners looking to save remodeling estimates and generate contractor quotes.",
    credits: "5 Project Credits",
    useCase: "Best for: Quick renovations and aesthetic projects.",
    badge: undefined,
    features: [
      "5 Permanent Cloud Project Save Credits",
      "Client-Ready Professional PDF Estimates",
      "Cost-per-sqft & Material Comparisons",
      "Side-by-side Scenario Tracking in Dashboard",
      "Credits never expire"
    ],
    color: "blue",
    icon: "fa-home"
  },
  standard: {
    id: "usa_standard",
    name: "Standard",
    tier: "standard",
    price: 24.99,
    originalPrice: 39.99,
    description: "Ideal for advanced DIYers or flippers needing technical estimates for framing, plumbing, and additions.",
    credits: "15 Project Credits",
    useCase: "Best for: Full property rehabs and structural estimates.",
    badge: "Best Value",
    features: [
      "15 Permanent Cloud Project Save Credits",
      "Technical Trade & Luxury Project PDF Exports",
      "Permit & Contractor Cost Breakdown Sheets",
      "Side-by-side Multi-Property Comparisons",
      "Priority Email Support",
      "Everything in Basic"
    ],
    color: "amber",
    icon: "fa-building"
  },
  pro: {
    id: "usa_pro",
    name: "Pro",
    tier: "pro",
    price: 59.99,
    originalPrice: 89.99,
    description: "Built for professional contractors, builders, and realtors needing high-volume project saves and client-ready PDFs.",
    credits: "100 Project Credits",
    useCase: "Best for: Professionals managing multiple client projects.",
    badge: undefined,
    features: [
      "100 Project Credits (Store up to 100 projects)",
      "Client-Ready Professional PDF Reports",
      "Complete Trade-by-Trade Cost Schedules",
      "10 Daily Save Limit (Anti-Bot Protection)",
      "White-Glove Technical Support"
    ],
    color: "gray",
    icon: "fa-hard-hat"
  },
};

const UpgradePage = () => {
  const { user, refreshProfile, planTier, hasPaid, credits } = useUser();
  const { showToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useRouter();
  const { region } = useRegion();

  const activePlans = region === 'US' ? usaPlans : plans;
  const currencySymbol = region === 'US' ? '$' : '₹';

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async (planId: string) => {
    setLoadingPlan(planId);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate.push("/signin");
        return;
      }

      const { data: order, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { planId, currency: region === 'US' ? 'USD' : 'INR' } 
      });

      if (orderError || !order || order.error) throw new Error(order?.error || "Failed to create order.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HDE Premium",
        description: `Unlocking ${planId.replace('_', ' ')}`,
        order_id: order.id,
        handler: async (response: any) => {
          const { data: result } = await supabase.functions.invoke('verify-payment', {
            body: { ...response, planId, currency: region === 'US' ? 'USD' : 'INR' }
          });
          if (result?.status === "success") {
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            Transparent Credit Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-zinc-100 mt-3 mb-3 uppercase tracking-tight">
            Choose Your Project Credit Plan
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            {region === 'US' 
              ? "Calculating online is 100% free anytime. Upgrade to save estimates permanently to your cloud dashboard and generate client-ready PDF bills." 
              : "Live calculations are 100% free anytime. Upgrade to save estimates to your cloud portfolio and download itemized PDF cost sheets."}
          </p>
          
          {/* Existing Customer Protection Notice */}
          {(hasPaid || planTier === 'pro') && (
            <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-3 text-left">
              <i className="fas fa-crown text-amber-500 text-lg shrink-0"></i>
              <div>
                <strong>You are an active paid member ({planTier.toUpperCase()}):</strong> Your account has permanent access to your unlocked calculators. You can top up additional project credits below anytime if you need more cloud save slots.
              </div>
            </div>
          )}

          {/* Pro Benefits Highlights */}
          <div className="mt-8 text-left max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/60">
                ⭐ What You Unlock With Pro
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 mt-2">
                Why Homeowners &amp; Contractors Upgrade
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs hover:border-amber-400/40 transition">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">Bank Loan &amp; Sanction Ready</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Export formal, itemized cost sheets &amp; BOQ reports accepted by major banks (SBI, HDFC, ICICI, US lenders) for loan approvals.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs hover:border-amber-400/40 transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">Anti-Overbilling BOQ</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Get exact quantities for cement bags, steel reinforcement tonnes, sand, and bricks so contractors cannot overcharge you.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs hover:border-amber-400/40 transition">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">Permanent Cloud Saves</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Save multiple house designs and finish levels to your private dashboard. Re-open, adjust specs, and edit anytime.
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs hover:border-amber-400/40 transition">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-lg mb-3">
                  <i className="fas fa-infinity"></i>
                </div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">100% Lifetime Ownership</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  One-time payment with zero recurring monthly fees. Your project credits never expire and stay in your account forever.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-8 text-center font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {Object.entries(activePlans).map(([key, plan]) => {
            const isBestValue = plan.badge;
            const isActiveTier = planTier === plan.tier;

            return (
              <div 
                key={key} 
                className={`relative bg-white dark:bg-zinc-900 rounded-3xl p-8 transition-all hover:shadow-2xl border-2 flex flex-col min-h-[600px] ${
                  isBestValue ? 'border-primary dark:border-zinc-100 shadow-xl scale-105' : 'border-transparent dark:border-zinc-800 shadow-md'
                }`}
              >
                {isBestValue && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white dark:text-zinc-950 text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {plan.badge}
                  </span>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{plan.name}</h3>
                      {isActiveTier && (
                        <span className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Current Tier
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl shrink-0 bg-${plan.color}-50 dark:bg-zinc-800 text-${plan.color}-600 dark:text-zinc-300`}>
                    <i className={`fas ${plan.icon} text-xl`}></i>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 dark:text-zinc-500 line-through text-lg">{currencySymbol}{plan.originalPrice}</span>
                    <span className="bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded">Save 30%</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900 dark:text-zinc-100">{currencySymbol}{plan.price}</span>
                    <span className="text-gray-500 dark:text-zinc-400 font-medium">/one-time</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800/40 p-4 rounded-2xl mb-6">
                  <p className="text-primary font-bold text-lg mb-1">{plan.credits}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{plan.useCase}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-zinc-300 font-medium">
                      <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan.id)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer ${
                    isBestValue 
                      ? 'bg-primary text-white dark:text-zinc-950 hover:bg-primary-hover shadow-lg' 
                      : 'bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-black dark:hover:bg-zinc-700'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i> Processing
                    </span>
                  ) : isActiveTier ? (
                    'Top-up Credits'
                  ) : (
                    'Buy Credits Now'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* --- FREE VS PRO DETAILED COMPARISON TABLE --- */}
        <div id="compare" className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/60">
              Full Feature Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 mt-2.5">
              Free Plan vs. Pro Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1.5">
              See exactly what makes a Pro account essential for homeowners, architects, and civil contractors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-zinc-800">
                  <th className="pb-4 font-bold text-gray-400 uppercase tracking-wider text-[11px] w-2/5">Capability</th>
                  <th className="pb-4 font-bold text-gray-600 dark:text-zinc-300 text-center w-1/5">Free Visitor</th>
                  <th className="pb-4 font-black text-amber-600 dark:text-amber-400 text-center w-2/5 bg-amber-50/50 dark:bg-amber-950/20 rounded-t-xl">
                    👑 Pro Account ({region === 'US' ? '$9.99+' : '₹199+'})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Live Calculator Calculations</span>
                    <p className="text-[11px] text-gray-400 font-normal">Test room sizes, wall dimensions, roof pitches, and budgets</p>
                  </td>
                  <td className="py-4 text-center text-emerald-600 font-bold">100% Free &amp; Unlimited</td>
                  <td className="py-4 text-center text-emerald-600 font-bold bg-amber-50/50 dark:bg-amber-950/20">100% Free &amp; Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Real-Time Cost Sliders &amp; Donut Charts</span>
                    <p className="text-[11px] text-gray-400 font-normal">Adjust labor rates, materials, and view charts live</p>
                  </td>
                  <td className="py-4 text-center text-emerald-600 font-bold">Included</td>
                  <td className="py-4 text-center text-emerald-600 font-bold bg-amber-50/50 dark:bg-amber-950/20">Included</td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Cloud Project Saves (Dashboard)</span>
                    <p className="text-[11px] text-gray-400 font-normal">Store completed estimates safely in your cloud workspace</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">1 Free Starter Save</td>
                  <td className="py-4 text-center text-amber-600 dark:text-amber-400 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    Up to 100 Permanent Saves
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Official Bank &amp; Contractor PDF Reports</span>
                    <p className="text-[11px] text-gray-400 font-normal">Formal cost sheets accepted for loans (SBI, HDFC, Wells Fargo)</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">❌ Not Included</td>
                  <td className="py-4 text-center text-amber-600 dark:text-amber-400 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    ✅ Official Downloadable PDFs
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Complete 7-Phase Material BOQ</span>
                    <p className="text-[11px] text-gray-400 font-normal">Exact cement bags, steel tonnes, sand loads, and brick schedules</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">Basic totals only</td>
                  <td className="py-4 text-center text-amber-600 dark:text-amber-400 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    ✅ Exact Quantities &amp; Brand Schedules
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Multi-Scenario Budget Comparisons</span>
                    <p className="text-[11px] text-gray-400 font-normal">Compare Ground Floor vs Duplex or Basic vs Luxury finishes</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">❌ Disabled</td>
                  <td className="py-4 text-center text-amber-600 dark:text-amber-400 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    ✅ Side-by-Side Dashboard Comparison
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">1-Click Saved Estimate Re-Editing</span>
                    <p className="text-[11px] text-gray-400 font-normal">Re-open any previously saved project to update rates anytime</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">❌ Disabled</td>
                  <td className="py-4 text-center text-amber-600 dark:text-amber-400 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    ✅ Unlimited Re-edits
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Ownership &amp; Subscription Terms</span>
                    <p className="text-[11px] text-gray-400 font-normal">Billing model and credit duration</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">Free forever</td>
                  <td className="py-4 text-center text-emerald-600 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    ♾️ One-Time Payment (Credits Never Expire)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-slate-900 dark:text-zinc-100">
                    <span className="font-bold">Customer &amp; Technical Support</span>
                    <p className="text-[11px] text-gray-400 font-normal">Speed of email and support ticket resolution</p>
                  </td>
                  <td className="py-4 text-center text-gray-400">Standard</td>
                  <td className="py-4 text-center text-amber-600 dark:text-amber-400 font-black bg-amber-50/50 dark:bg-amber-950/20">
                    👑 Priority VIP Support
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- FREQUENTLY ASKED QUESTIONS ABOUT CREDITS & ACCESS --- */}
        <div className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="text-center max-w-lg mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Everything you need to know about our free tools, credits, and existing customer benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-question-circle text-primary"></i>
                <span>Do all calculators require credits to use?</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                <strong>No.</strong> Live calculations, changing specs, comparing materials, and viewing graphs are 100% free for everyone. Credits are only deducted when you permanently <strong>Save a Project</strong> to your cloud dashboard or export formal PDF reports.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-gift text-primary"></i>
                <span>How much credit is free for new users?</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Every newly registered account automatically receives <strong>1 Free Project Credit</strong> upon signing up. This allows you to test saving a complete construction, interior, or remodel estimate to your dashboard without paying anything.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-shield-alt text-primary"></i>
                <span>I am already a paid customer. Are my benefits safe?</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                <strong>Yes, absolutely.</strong> Existing paid customers are permanently grandfathered. You keep all calculator unlocks, account privileges, and remaining credit balances. Topping up smaller bundles will never downgrade your membership tier.
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-clock text-primary"></i>
                <span>Do purchased project credits ever expire?</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                <strong>No.</strong> Your purchased credits never expire. They stay in your account balance until you choose to save a project or generate an export.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
