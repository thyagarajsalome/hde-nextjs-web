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
    description: "Ideal for individuals starting a single home renovation or a small DIY project.",
    credits: "5 Project Credits",
    useCase: "Best for: Quick room makeovers and interior planning.",
    badge: undefined, // Add this line
    features: [
      "Unlock Interiors, Flooring & Painting",
      "House Plan Access",
      "Save up to 5 unique projects",
      "Standard PDF Cost Reports"
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
    description: "Perfect for homeowners or independent designers managing multiple layouts simultaneously.",
    credits: "10 Project Credits",
    useCase: "Best for: Self-builders planning a full home construction.",
    badge: "Most Popular",
    features: [
      "Everything in Basic",
      "Unlock Plumbing & Electrical Layouts",
      "Doors & Windows Schedule Tools",
      "Save up to 10 unique projects",
      "Detailed Technical PDF Exports"
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
    description: "Built for professional contractors and builders who need high-volume access.",
    credits: "100 Project Credits",
    useCase: "Best for: Professional builders, contractors, and heavy users.",
    badge: undefined,
    features: [
      "100 Project Credits",
      "10 Daily Save Limit (Anti-Bot Protection)",
      "Everything in Standard",
      "Material BOQ (Bill of Quantities)",
      "Priority Support"
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
    description: "Perfect for homeowners looking to estimate ROI and material costs for home renovations.",
    credits: "5 Project Credits",
    useCase: "Best for: Quick renovations and aesthetic projects.",
    badge: undefined,
    features: [
      "Unlock ROI, Roofing & Flooring Calculators",
      "5 Consumable Project Credits",
      "Export Professional PDF Reports",
      "Side-by-side scenario tracking"
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
    description: "Ideal for advanced DIYers or buyers needing technical estimates for plumbing, framing, and electrical.",
    credits: "15 Project Credits",
    useCase: "Best for: Full property rehabs and structural estimates.",
    badge: "Best Value",
    features: [
      "Unlock Plumbing, Electrical & Framing Tools",
      "Unlock Technical Trades & Luxury Upgrades",
      "15 Consumable Project Credits",
      "Export Professional PDF Reports",
      "Priority Email Support"
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
      "100 Consumable Project Credits",
      "Save up to 100 unique property estimates",
      "Client-ready Professional PDF Reports",
      "10 Daily Save Limit (Anti-Bot Protection)",
      "White-glove technical support"
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

          {/* 3 Core Value Pillars */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center shrink-0 text-sm">
                <i className="fas fa-calculator"></i>
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">100% Free Live Calculating</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 mt-0.5 leading-snug">
                  Use all calculators to test dimensions and compare prices freely without spending credits.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm">
                <i className="fas fa-gift"></i>
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">1 Free Starter Save</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 mt-0.5 leading-snug">
                  Every registered account includes 1 Free Welcome Credit to save your first project to dashboard.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center shrink-0 text-sm">
                <i className="fas fa-infinity"></i>
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">Credits Never Expire</p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-400 mt-0.5 leading-snug">
                  1 Credit = 1 Project Saved to cloud with PDF report. Top-up credits stay in your account forever.
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
