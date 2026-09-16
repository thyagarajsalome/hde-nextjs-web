"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRegion } from "../../context/RegionContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../config/supabaseClient";
import { PRO_CALCULATOR_DETAILS } from "../../config/calculatorTiers";

interface ProCalculatorGateProps {
  calculatorId: string;
  onSwitchToFree?: () => void;
}

export const ProCalculatorGate: React.FC<ProCalculatorGateProps> = ({
  calculatorId,
  onSwitchToFree,
}) => {
  const { user, planTier, hasPaid, role, refreshProfile } = useUser();
  const { region } = useRegion();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Load Razorpay checkout script on demand
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

  const details = PRO_CALCULATOR_DETAILS[calculatorId] || {
    name: "Pro Calculator & BOQ Generator",
    subtitle: "This calculator requires an active HDE Pro account. Unlock detailed cost breakdowns, trade schedules, and contractor-ready PDF exports.",
    bullets: [
      "Itemized room-by-room material & labor takeoff",
      "Manufacturer brand recommendations & market pricing",
      "Contractor & Bank-ready PDF quote export with no watermarks"
    ]
  };

  const currentRegion = (region && ["US", "IN", "AE"].includes(region) ? region : "IN") as "US" | "IN" | "AE";
  
  let priceLabel = "₹199";
  let planId = "5_credits";
  if (currentRegion === "US") {
    priceLabel = "$9.99";
    planId = "usa_basic";
  } else if (currentRegion === "AE") {
    priceLabel = "39 AED";
    planId = "usa_basic";
  }

  const handleInstantCheckout = async () => {
    if (!user) {
      showToast("Please sign in or create a free account to upgrade.", "info");
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/signin");
        return;
      }

      const paymentCurrency = currentRegion === "US" || currentRegion === "AE" ? "USD" : "INR";

      const { data: order, error: orderError } = await supabase.functions.invoke("create-order", {
        body: { planId, currency: paymentCurrency }
      });

      if (orderError || !order || order.error) {
        throw new Error(order?.error || "Failed to initialize checkout.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HDE Pro Suite",
        description: `Unlock ${details.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const { data: result } = await supabase.functions.invoke("verify-payment", {
              body: { ...response, planId, currency: paymentCurrency }
            });
            if (result?.status === "success") {
              await refreshProfile();
              showToast("Pro account activated successfully! All calculators unlocked.", "success");
            } else {
              showToast("Payment verification failed. Please contact support.", "error");
            }
          } catch (err: any) {
            showToast(err.message || "Verification failed.", "error");
          }
        },
        prefill: { email: user?.email || "" },
        theme: { color: "#c5a059" },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        router.push(`/upgrade?calc=${calculatorId}`);
      }
    } catch (err: any) {
      console.error("Instant checkout error:", err);
      showToast(err.message || "Payment checkout error. Redirecting to payment page...", "error");
      router.push(`/upgrade?calc=${calculatorId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border-2 border-[#c5a059]/40 dark:border-[#c5a059]/30 shadow-2xl p-6 sm:p-10 text-center">
        {/* Background decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#c5a059]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#0f2042]/10 blur-3xl pointer-events-none"></div>

        {/* Pro Lock Crown Header */}
        <div className="relative flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-[#c5a059]/20 to-amber-500/15 border border-[#c5a059]/40 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
            <i className="fas fa-crown text-[#c5a059]"></i>
            <span>PRO Account Feature</span>
            <i className="fas fa-lock text-[10px]"></i>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight max-w-2xl">
            {details.name}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 max-w-2xl mt-3 leading-relaxed">
            {details.subtitle}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-2xl mx-auto">
          {details.bullets.map((bullet, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-start gap-3 shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                <i className="fas fa-check"></i>
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200 leading-snug">
                {bullet}
              </span>
            </div>
          ))}
        </div>

        {/* Price callout */}
        <div className="mb-6">
          <span className="text-xs text-gray-500 dark:text-zinc-400 block mb-1">
            Lifetime Pro Access • One-time payment • No monthly subscription
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#0f2042] dark:text-[#c5a059]">
            Starting at {priceLabel}
          </span>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
          <Link
            href={`/upgrade?calc=${calculatorId}`}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-[#c5a059] hover:bg-[#b38e47] text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer no-underline"
          >
            <i className="fas fa-credit-card text-xs"></i>
            <span>Proceed to Payment Page</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>

          <button
            type="button"
            onClick={handleInstantCheckout}
            disabled={loading}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border-2 border-[#c5a059] text-gray-900 dark:text-zinc-100 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs"></i>
                <span>Opening Checkout...</span>
              </>
            ) : (
              <>
                <i className="fas fa-bolt text-[#c5a059]"></i>
                <span>1-Click Unlock ({priceLabel})</span>
              </>
            )}
          </button>
        </div>

        {/* Account & Fallback Links */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          {!user ? (
            <Link
              href={`/signin?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/")}`}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
            >
              <i className="fas fa-shield-alt text-xs"></i>
              <span>Already a paid customer? Sign In to unlock</span>
            </Link>
          ) : (
            <span className="text-gray-500 dark:text-zinc-400">
              Signed in as <strong className="text-gray-800 dark:text-zinc-200">{user.email}</strong> (Free Tier)
            </span>
          )}

          {onSwitchToFree && (
            <button
              type="button"
              onClick={onSwitchToFree}
              className="font-bold text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline cursor-pointer"
            >
              ← Use 100% Free Civil Construction Calculators
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProCalculatorGate;
