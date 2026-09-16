"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRegion } from "../../context/RegionContext";
import { useToast } from "../../context/ToastContext";
import { supabase } from "../../config/supabaseClient";

interface PaywallLockProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  minTier?: "basic" | "standard" | "pro";
  bullets?: string[];
  previewHeight?: string;
  className?: string;
}

export const PaywallLock: React.FC<PaywallLockProps> = ({
  children,
  title = "Unlock Detailed Contractor BOQ & Rates",
  subtitle = "Access exact material quantities, manufacturer brand recommendations, and contractor-ready trade schedules.",
  minTier = "basic",
  bullets,
  previewHeight = "max-h-[220px]",
  className = "",
}) => {
  const { user, planTier, hasPaid, role, refreshProfile } = useUser();
  const { region } = useRegion();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Load Razorpay script on demand
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

  // CRITICAL: Any existing paid customer (hasPaid === true) or admin is permanently
  // grandfathered and unlocked across ALL calculators, BOQ schedules, and features.
  // Unpaid/free users (hasPaid === false && planTier === 'free') will see the paywall lock.
  const isUnlocked = Boolean(
    role === "admin" ||
    hasPaid ||
    (planTier && planTier !== "free")
  );

  // If already paid and qualified, show content directly without any wrapper overhead
  if (isUnlocked) {
    return <>{children}</>;
  }

  // Determine pricing, planId, and currency based on current region
  const currentRegion = (region && ["US", "IN", "AE"].includes(region) ? region : "IN") as "US" | "IN" | "AE";

  let priceLabel = "₹199";
  let planId = "5_credits";
  let creditsCount = "5 Save Credits";

  if (currentRegion === "US") {
    if (minTier === "standard") {
      priceLabel = "$24.99";
      planId = "usa_standard";
      creditsCount = "15 Save Credits";
    } else if (minTier === "pro") {
      priceLabel = "$59.99";
      planId = "usa_pro";
      creditsCount = "100 Save Credits";
    } else {
      priceLabel = "$9.99";
      planId = "usa_basic";
      creditsCount = "5 Save Credits";
    }
  } else if (currentRegion === "AE") {
    if (minTier === "standard") {
      priceLabel = "99 AED";
      planId = "usa_standard";
      creditsCount = "15 Save Credits";
    } else if (minTier === "pro") {
      priceLabel = "220 AED";
      planId = "usa_pro";
      creditsCount = "100 Save Credits";
    } else {
      priceLabel = "39 AED";
      planId = "usa_basic";
      creditsCount = "5 Save Credits";
    }
  } else {
    // India default
    if (minTier === "standard") {
      priceLabel = "₹349";
      planId = "10_credits";
      creditsCount = "10 Save Credits";
    } else if (minTier === "pro") {
      priceLabel = "₹999";
      planId = "pro";
      creditsCount = "100 Save Credits";
    } else {
      priceLabel = "₹199";
      planId = "5_credits";
      creditsCount = "5 Save Credits";
    }
  }

  const defaultBullets = [
    "Exact itemized material quantities & trade labor rates",
    "Verified manufacturer brand schedules & wastage allowances",
    `Permanent lifetime access + ${creditsCount}`,
  ];
  const activeBullets = bullets && bullets.length > 0 ? bullets : defaultBullets;

  const handleUnlockClick = async () => {
    if (!user) {
      showToast("Please sign in or create an account to unlock this feature.", "info");
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
        throw new Error(order?.error || "Failed to initialize secure checkout.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "HDE Premium",
        description: `Unlock ${title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const { data: result } = await supabase.functions.invoke("verify-payment", {
              body: { ...response, planId, currency: paymentCurrency }
            });
            if (result?.status === "success") {
              await refreshProfile();
              showToast("Unlocked successfully! Your premium features are now active.", "success");
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
        router.push("/upgrade");
      }
    } catch (err: any) {
      console.error("Paywall unlock error:", err);
      showToast(err.message || "Payment checkout error. Redirecting to upgrade...", "error");
      router.push("/upgrade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#c5a059]/30 dark:border-[#c5a059]/25 shadow-lg bg-white dark:bg-zinc-900 ${className}`}>
      {/* Blurred Preview of the underlying content */}
      <div className={`filter blur-[5px] opacity-35 select-none pointer-events-none ${previewHeight} overflow-hidden`}>
        {children}
      </div>

      {/* Frosted Glass Paywall Lock Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 sm:p-7 bg-gradient-to-b from-white/85 via-white/95 to-white dark:from-zinc-950/85 dark:via-zinc-950/95 dark:to-zinc-950 backdrop-blur-[2px] text-center">
        {/* Glowing Lock Badge */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a059]/20 to-[#c5a059]/5 border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center text-xl mb-3 shadow-inner">
          <i className="fas fa-lock"></i>
        </div>

        {/* Title & Subtitle */}
        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-zinc-400 max-w-md mt-1.5 mb-3.5 leading-relaxed">
          {subtitle}
        </p>

        {/* Value Proposition Bullets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 sm:gap-4 mb-4 text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
          {activeBullets.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <i className="fas fa-check-circle text-emerald-500 text-xs shrink-0"></i>
              <span>{b}</span>
            </span>
          ))}
        </div>

        {/* Unlock Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={handleUnlockClick}
            disabled={loading}
            className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-[#c5a059] to-[#d9a443] hover:from-[#b38e47] hover:to-[#c5a059] text-[#0f2042] font-black rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Preparing Checkout...</span>
              </>
            ) : (
              <>
                <i className="fas fa-bolt text-[#0f2042]"></i>
                <span>Unlock for {priceLabel} (One-Time)</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-3 text-[11px]">
          <Link
            href="/upgrade"
            className="font-bold text-[#c5a059] hover:underline flex items-center gap-1"
          >
            <span>View All Plans &amp; Bundles</span>
            <i className="fas fa-arrow-right text-[9px]"></i>
          </Link>
          {!user && (
            <>
              <span className="hidden sm:inline text-gray-300 dark:text-zinc-700">&bull;</span>
              <Link
                href={`/signin?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <i className="fas fa-shield-check text-[10px]"></i>
                <span>Already a paid customer? Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallLock;
