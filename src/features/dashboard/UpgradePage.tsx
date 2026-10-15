"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../config/supabaseClient";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { useRegion } from "../../context/RegionContext";
import { PRO_CALCULATOR_DETAILS } from "../../config/calculatorTiers";

// 1. Define the strict TypeScript interface for your plans
type PlanType = {
  id: string;
  name: string;
  tier: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  billingPeriod: string;
  description: string;
  credits: string;
  useCase: string;
  features: string[];
  color: string;
  icon: string;
  badge?: string;
};

// 2. India Plans: Lifetime vs Monthly
const plansLifetime: Record<string, PlanType> = {
  basic: {
    id: "india_lifetime_starter",
    name: "Starter Lifetime",
    tier: "basic",
    price: 1499,
    originalPrice: 1999,
    discountBadge: "Save 25%",
    billingPeriod: "/one-time",
    description: "Ideal for homeowners planning a single home build or personal renovation.",
    credits: "10 Permanent Project Credits",
    useCase: "Best for: Individual home builders saving private estimates.",
    badge: undefined,
    features: [
      "10 Permanent Cloud Project Save Credits",
      "Itemized PDF Quotes (Bank & Contractor Ready)",
      "HDE Studio Desktop CAD Standard (India)",
      "Material & Room Cost Breakdown Spreadsheets",
      "Direct Buyer Pass: Unlimited Owner Contacts (30 Days)",
      "Credits never expire"
    ],
    color: "blue",
    icon: "fa-home"
  },
  standard: {
    id: "india_lifetime_builder",
    name: "Builder Studio",
    tier: "standard",
    price: 4999,
    originalPrice: 6999,
    discountBadge: "Save 28%",
    billingPeriod: "/one-time",
    description: "Perfect for self-builders and interior designers managing multi-room construction.",
    credits: "25 Project Credits",
    useCase: "Best for: Full-house construction and multi-room renovations.",
    badge: undefined,
    features: [
      "25 Permanent Cloud Project Save Credits",
      "Detailed Multi-Trade PDF Reports (Plumbing, Electrical, Flooring)",
      "Doors & Windows Schedule PDF Exports",
      "Side-by-side Project Scenario Tracking",
      "Real Estate Extra Listing Slots Included",
      "Priority Customer Support",
      "Everything in Starter"
    ],
    color: "amber",
    icon: "fa-drafting-compass"
  },
  pro: {
    id: "india_lifetime_pro",
    name: "All-Access Pro (CAD + Web)",
    tier: "pro",
    price: 18749,
    originalPrice: 24999,
    discountBadge: "25% OFF • LAUNCH DEAL",
    badge: "⭐ 25% OFF • BEST VALUE",
    billingPeriod: "/lifetime",
    description: "Flagship Architectural CAD suite & comprehensive cost estimating system for professionals.",
    credits: "Unlimited Cloud Projects & 100 Credits",
    useCase: "Best for: Architects, civil engineers, building contractors, and serious developers.",
    features: [
      "HDE Studio Desktop CAD All-Access Pro (Perpetual, 100% Offline)",
      "Dual India (Metric/Vastu) & USA (Imperial) AutoCAD Catalogs",
      "Full 2D AutoCAD Vector Block Library (All Room Sets)",
      "Vector PDF Blueprint Exporter (Custom Title Block & Specs, No Watermark)",
      "Multi-Device License: Activate on up to 3 PCs / Laptops",
      "Complete 7-Phase Material BOQ (Exact Cement, Steel, Sand bags)",
      "Contractor-grade Client PDF & Excel Cost Schedules",
      "Commercial Agent & Builder Listing Pack Included",
      "Lifetime Software Updates & Direct WhatsApp Priority Support"
    ],
    color: "gray",
    icon: "fa-cube"
  }
};

const plansMonthly: Record<string, PlanType> = {
  basic: {
    id: "india_monthly_starter",
    name: "Starter Monthly",
    tier: "basic",
    price: 499,
    originalPrice: 699,
    discountBadge: "Save 28%",
    billingPeriod: "/month",
    description: "Monthly access for homeowners planning ongoing single-room remodels.",
    credits: "5 Credits / month",
    useCase: "Best for: Month-by-month renovation tracking.",
    badge: undefined,
    features: [
      "5 Project Save Credits Every Month",
      "Itemized PDF Quotes (Bank & Contractor Ready)",
      "Full House Plan & CAD Gallery Access",
      "Material & Room Cost Breakdown Spreadsheets",
      "Cancel anytime"
    ],
    color: "blue",
    icon: "fa-home"
  },
  standard: {
    id: "india_monthly_builder",
    name: "Builder Monthly",
    tier: "standard",
    price: 999,
    originalPrice: 1299,
    discountBadge: "Save 23%",
    billingPeriod: "/month",
    description: "Monthly subscription for interior designers and active home remodelers.",
    credits: "20 Credits / month",
    useCase: "Best for: Multi-room home projects.",
    badge: undefined,
    features: [
      "20 Project Credits / month",
      "Detailed Multi-Trade PDF Reports (Plumbing, Electrical, Flooring)",
      "Doors & Windows Schedules",
      "Priority Customer Support"
    ],
    color: "amber",
    icon: "fa-drafting-compass"
  },
  pro: {
    id: "india_monthly_pro",
    name: "All-Access Pro Monthly",
    tier: "pro",
    price: 1999,
    originalPrice: 2499,
    discountBadge: "Save 20%",
    badge: "Most Flexible",
    billingPeriod: "/month",
    description: "Full access to HDE Studio Desktop CAD and complete contractor-grade estimators.",
    credits: "100 Credits / month",
    useCase: "Best for: Active contractors and civil engineers handling ongoing client bids.",
    features: [
      "HDE Studio Desktop CAD All-Access Pro (Active Subscription)",
      "Full 2D AutoCAD Vector Block Library (India & USA Catalogs)",
      "Vector PDF Blueprint Exporter (No Watermarks)",
      "Complete 7-Phase Anti-Overbilling Material BOQ",
      "100 Project Credits refreshed monthly",
      "Cancel or pause anytime"
    ],
    color: "gray",
    icon: "fa-cube"
  }
};

// 3. USA Plans: Lifetime vs Monthly
const usaPlansLifetime: Record<string, PlanType> = {
  basic: {
    id: "usa_lifetime_starter",
    name: "Starter Lifetime",
    tier: "basic",
    price: 49,
    originalPrice: 69,
    discountBadge: "Save 28%",
    billingPeriod: "/one-time",
    description: "Ideal for homeowners planning personal remodels, additions, or single builds.",
    credits: "10 Permanent Project Credits",
    useCase: "Best for: Quick renovations and aesthetic projects.",
    badge: undefined,
    features: [
      "10 Permanent Cloud Project Save Credits",
      "Client-Ready Professional PDF Estimates",
      "Cost-per-sqft & Material Comparisons",
      "HDE Studio CAD Standard",
      "Credits never expire"
    ],
    color: "blue",
    icon: "fa-home"
  },
  standard: {
    id: "usa_lifetime_builder",
    name: "Contractor Pack",
    tier: "standard",
    price: 149,
    originalPrice: 199,
    discountBadge: "Save 25%",
    billingPeriod: "/one-time",
    description: "Ideal for flippers and remodelers needing technical estimates for framing and additions.",
    credits: "25 Project Credits",
    useCase: "Best for: Full property rehabs and structural estimates.",
    badge: undefined,
    features: [
      "25 Permanent Cloud Project Save Credits",
      "Technical Trade & Luxury Project PDF Exports",
      "Permit & Contractor Cost Breakdown Sheets",
      "Side-by-side Multi-Property Comparisons",
      "Priority Email Support"
    ],
    color: "amber",
    icon: "fa-building"
  },
  pro: {
    id: "usa_lifetime_pro",
    name: "All-Access Pro (CAD + Web)",
    tier: "pro",
    price: 299,
    originalPrice: 399,
    discountBadge: "25% OFF • LAUNCH DEAL",
    badge: "⭐ 25% OFF • BEST VALUE",
    billingPeriod: "/lifetime",
    description: "Flagship Architectural CAD suite & comprehensive American cost estimating system.",
    credits: "Unlimited Cloud Projects & 100 Credits",
    useCase: "Best for: General contractors, remodelers, architects, and professional builders.",
    features: [
      "HDE Studio Desktop CAD All-Access Pro (Perpetual, 100% Offline)",
      "Full 2D AutoCAD Vector Block Library (IBC/IRC Standards)",
      "Dual USA Imperial & India Metric Catalogs",
      "Vector PDF Blueprint Exporter (Custom Title Block & Specs, No Watermark)",
      "Multi-Device License: Activate on up to 3 PCs / Macs",
      "Comprehensive Trade Cost Schedules (Framing, Roofing, Plumbing, Electrical)",
      "Unlimited Cloud Project Saves & Client-Ready Estimates",
      "Lifetime Software Updates & Direct Engineering Support"
    ],
    color: "gray",
    icon: "fa-cube"
  }
};

const usaPlansMonthly: Record<string, PlanType> = {
  basic: {
    id: "usa_monthly_starter",
    name: "Starter Monthly",
    tier: "basic",
    price: 14.99,
    originalPrice: 19.99,
    discountBadge: "Save 25%",
    billingPeriod: "/month",
    description: "Month-to-month access for quick DIY rehab estimates.",
    credits: "5 Credits / month",
    useCase: "Best for: Single month rehab evaluations.",
    badge: undefined,
    features: [
      "5 Monthly Project Save Credits",
      "Client-Ready PDF Estimates",
      "Cost-per-sqft & Material Comparisons",
      "Cancel anytime"
    ],
    color: "blue",
    icon: "fa-home"
  },
  standard: {
    id: "usa_monthly_builder",
    name: "Contractor Monthly",
    tier: "standard",
    price: 24.99,
    originalPrice: 34.99,
    discountBadge: "Save 28%",
    billingPeriod: "/month",
    description: "Monthly subscription for active flippers and remodelers.",
    credits: "20 Credits / month",
    useCase: "Best for: Ongoing subcontractor budgeting.",
    badge: undefined,
    features: [
      "20 Monthly Project Credits",
      "Trade & Luxury PDF Exports",
      "Permit & Contractor Cost Breakdown Sheets",
      "Priority Email Support"
    ],
    color: "amber",
    icon: "fa-building"
  },
  pro: {
    id: "usa_monthly_pro",
    name: "All-Access Pro Monthly",
    tier: "pro",
    price: 49,
    originalPrice: 69,
    discountBadge: "Save 28%",
    badge: "Most Flexible",
    billingPeriod: "/month",
    description: "Full monthly access to HDE Studio Desktop CAD and complete American cost estimators.",
    credits: "100 Credits / month",
    useCase: "Best for: Active general contractors with ongoing monthly client proposals.",
    features: [
      "HDE Studio Desktop CAD All-Access Pro (Active Subscription)",
      "Full AutoCAD 2D Vector Blocks (IBC/IRC Standards)",
      "Dual USA & India Catalogs",
      "Vector PDF Blueprint Exporter (No Watermarks)",
      "Complete Trade Schedules & Client Bids",
      "100 Project Saves / month",
      "Cancel anytime"
    ],
    color: "gray",
    icon: "fa-cube"
  }
};

// 4. UAE Plans
const uaePlansLifetime: Record<string, PlanType> = {
  basic: {
    id: "usa_basic",
    name: "Starter",
    tier: "basic",
    price: 180,
    originalPrice: 250,
    discountBadge: "Save 28%",
    billingPeriod: "/one-time",
    description: "Ideal for individual buyers evaluating single property purchases in Dubai.",
    credits: "5 Project Credits",
    useCase: "Best for: Saving off-plan vs ready property cost comparisons.",
    badge: undefined,
    features: [
      "5 Permanent Cloud Project Save Credits",
      "Itemized DLD & Land Department Fee PDFs",
      "Mortgage & Trustee Fee Breakdown Sheets",
      "Credits never expire"
    ],
    color: "blue",
    icon: "fa-building"
  },
  standard: {
    id: "usa_standard",
    name: "Investor",
    tier: "standard",
    price: 450,
    originalPrice: 600,
    discountBadge: "Save 25%",
    billingPeriod: "/one-time",
    description: "Perfect for multi-unit property portfolio investors across UAE freehold areas.",
    credits: "20 Project Credits",
    useCase: "Best for: Portfolio planning and rental yield ROI.",
    badge: undefined,
    features: [
      "20 Permanent Cloud Project Save Credits",
      "Comprehensive DLD, Trustee & Broker Fee Takeoffs",
      "Gross Yield ROI Spreadsheets",
      "Priority Support"
    ],
    color: "amber",
    icon: "fa-city"
  },
  pro: {
    id: "usa_pro",
    name: "Developer & Broker",
    tier: "pro",
    price: 1099,
    originalPrice: 1465,
    discountBadge: "25% OFF • LAUNCH DEAL",
    badge: "⭐ 25% OFF • BEST VALUE",
    billingPeriod: "/lifetime",
    description: "Built for real estate brokers, developers, and wealth managers managing multiple client portfolios.",
    credits: "100 Project Credits",
    useCase: "Best for: Professional advisors and agencies handling client transactions.",
    features: [
      "HDE Studio Desktop CAD All-Access Pro (Perpetual)",
      "100 Project Credits (Store up to 100 properties)",
      "Client-Ready Investor Presentation PDF Reports",
      "Complete Freehold Community Fee Schedules",
      "White-Glove VIP Support"
    ],
    color: "gray",
    icon: "fa-briefcase"
  }
};

const uaePlansMonthly: Record<string, PlanType> = {
  ...uaePlansLifetime,
  pro: {
    ...uaePlansLifetime.pro,
    id: "usa_monthly_pro",
    price: 180,
    originalPrice: 240,
    billingPeriod: "/month",
    badge: "Most Flexible"
  }
};

const BENEFITS_BY_REGION: Record<string, { tag: string; heading: string; cards: { icon: string; color: string; title: string; desc: string }[] }> = {
  US: {
    tag: "⭐ What You Unlock With Pro",
    heading: "Why US Homeowners, Flippers & Remodelers Upgrade",
    cards: [
      {
        icon: "fa-file-invoice-dollar",
        color: "amber",
        title: "Rehab Loans & Contractor Bids",
        desc: "Generate professional line-item estimates formatted for Fannie Mae HomeStyle, FHA 203(k) renovation loans, and GC bidding."
      },
      {
        icon: "fa-hammer",
        color: "emerald",
        title: "Accurate Trade Takeoffs",
        desc: "Get exact lumber board feet, drywall sheet counts, roofing squares, and luxury specs to verify subcontractor and tradesman quotes."
      },
      {
        icon: "fa-cloud-upload-alt",
        color: "blue",
        title: "Multi-Property Cloud Vault",
        desc: "Save kitchen remodels, room additions, pool quotes, and rent vs buy analyses across US markets. Re-open and tweak specs anytime."
      },
      {
        icon: "fa-infinity",
        color: "purple",
        title: "100% Lifetime Ownership",
        desc: "One-time payment starting at $9.99. No recurring monthly SaaS subscriptions, no auto-charges, and credits never expire."
      }
    ]
  },
  IN: {
    tag: "⭐ What You Unlock With Pro",
    heading: "Why Indian Home Builders & Contractors Upgrade",
    cards: [
      {
        icon: "fa-file-invoice-dollar",
        color: "amber",
        title: "Bank Loan & Sanction Ready",
        desc: "Export formal, itemized cost sheets & BOQ reports accepted by major banks (SBI, HDFC, ICICI) and local authorities for loan approvals."
      },
      {
        icon: "fa-shield-alt",
        color: "emerald",
        title: "Anti-Overbilling 7-Phase BOQ",
        desc: "Get exact quantities for cement bags, steel reinforcement tonnes, sand, and bricks so contractors cannot inflate material bills."
      },
      {
        icon: "fa-cloud-upload-alt",
        color: "blue",
        title: "Permanent Cloud Workspace",
        desc: "Save multiple house designs and finish levels to your private dashboard. Re-open, adjust specs, and track changes anytime."
      },
      {
        icon: "fa-infinity",
        color: "purple",
        title: "100% Lifetime Ownership",
        desc: "One-time payment starting at ₹199. Zero recurring monthly fees. Your project credits never expire and stay in your account forever."
      }
    ]
  },
  AE: {
    tag: "⭐ What You Unlock With Pro",
    heading: "Why Dubai Property Investors Upgrade",
    cards: [
      {
        icon: "fa-file-invoice-dollar",
        color: "amber",
        title: "Mortgage & Trustee Ready Reports",
        desc: "Export complete buying cost breakdowns with DLD fees, trustee charges, and mortgage registration for bank pre-approvals."
      },
      {
        icon: "fa-chart-line",
        color: "emerald",
        title: "Yield & Service Charge Takeoffs",
        desc: "Compare net rental yields, service charges per sq ft, and cash-on-cash ROI across 15+ Dubai freehold communities."
      },
      {
        icon: "fa-cloud-upload-alt",
        color: "blue",
        title: "Investment Portfolio Vault",
        desc: "Save off-plan vs ready property investment scenarios side-by-side to track your global real estate acquisitions."
      },
      {
        icon: "fa-infinity",
        color: "purple",
        title: "100% Lifetime Access",
        desc: "Pay once. No recurring fees, lifetime access to saved investment profiles and property calculators."
      }
    ]
  }
};

const COMPARISON_ROWS_BY_REGION: Record<string, { heading: string; subheading: string; proHeader: string; rows: { title: string; desc: string; free: string; freeClass: string; pro: string; proClass: string }[] }> = {
  US: {
    heading: "Free Tools vs. US Pro Account",
    subheading: "See exactly what makes a Pro account essential for American remodelers, flippers, and homeowners.",
    proHeader: "👑 Pro Account ($9.99+)",
    rows: [
      {
        title: "Live Remodeling & Trade Calculators",
        desc: "Kitchen, framing, roofing, pool, addition, and rent vs buy calculators",
        free: "100% Free & Unlimited",
        freeClass: "text-emerald-600 font-bold",
        pro: "100% Free & Unlimited",
        proClass: "text-emerald-600 font-bold"
      },
      {
        title: "Real-Time Material & Labor Sliders",
        desc: "Adjust local zip code rates and contractor margins dynamically",
        free: "Included",
        freeClass: "text-emerald-600 font-bold",
        pro: "Included",
        proClass: "text-emerald-600 font-bold"
      },
      {
        title: "Cloud Project Vault (Dashboard)",
        desc: "Store kitchen remodel, framing, and property tax estimates safely",
        free: "1 Free Starter Save",
        freeClass: "text-gray-400",
        pro: "Up to 100 Permanent Saves",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Client-Ready & Loan PDF Estimates",
        desc: "Formatted for Fannie Mae HomeStyle, 203k loans, and GC bidding",
        free: "❌ Not Included",
        freeClass: "text-gray-400",
        pro: "✅ Professional PDF Estimates",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Detailed Trade Schedules & Takeoffs",
        desc: "Lumber board feet, drywall sheets, roofing squares, luxury pool specs",
        free: "Basic totals only",
        freeClass: "text-gray-400",
        pro: "✅ Complete Trade Takeoffs",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Multi-Scenario Project Comparisons",
        desc: "Compare Budget vs Luxury Kitchen, or compare multiple flip properties",
        free: "❌ Disabled",
        freeClass: "text-gray-400",
        pro: "✅ Side-by-Side Dashboard Comparison",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "1-Click Saved Estimate Re-Editing",
        desc: "Re-open any remodel or trade takeoff to adjust contractor prices",
        free: "❌ Disabled",
        freeClass: "text-gray-400",
        pro: "✅ Unlimited Re-edits",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Ownership & Subscription Terms",
        desc: "Billing model and credit duration",
        free: "Free forever",
        freeClass: "text-gray-400",
        pro: "♾️ One-Time Payment (Never Expires)",
        proClass: "text-emerald-600 font-black"
      },
      {
        title: "Customer & Technical Support",
        desc: "Speed of email and support ticket resolution",
        free: "Standard",
        freeClass: "text-gray-400",
        pro: "👑 Priority VIP Support",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      }
    ]
  },
  IN: {
    heading: "Free Plan vs. Indian Pro Account",
    subheading: "See exactly what makes a Pro account essential for Indian home builders, architects, and civil contractors.",
    proHeader: "👑 Pro Account (₹199+)",
    rows: [
      {
        title: "Live Construction & BOQ Calculations",
        desc: "House construction, interiors, flooring, painting, EMI, and materials",
        free: "100% Free & Unlimited",
        freeClass: "text-emerald-600 font-bold",
        pro: "100% Free & Unlimited",
        proClass: "text-emerald-600 font-bold"
      },
      {
        title: "Real-Time Cost Sliders & Donut Charts",
        desc: "Adjust labor rates, materials, and view charts live",
        free: "Included",
        freeClass: "text-emerald-600 font-bold",
        pro: "Included",
        proClass: "text-emerald-600 font-bold"
      },
      {
        title: "Cloud Project Saves (Dashboard)",
        desc: "Store completed estimates safely in your cloud workspace",
        free: "1 Free Starter Save",
        freeClass: "text-gray-400",
        pro: "Up to 100 Permanent Saves",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Official Bank & Contractor PDF Reports",
        desc: "Formal cost sheets accepted for loans by SBI, HDFC, ICICI",
        free: "❌ Not Included",
        freeClass: "text-gray-400",
        pro: "✅ Official Downloadable PDFs",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Complete 7-Phase Material BOQ",
        desc: "Exact cement bags, steel tonnes, sand loads, and brick schedules",
        free: "Basic totals only",
        freeClass: "text-gray-400",
        pro: "✅ Exact Quantities & Brand Schedules",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Multi-Scenario Budget Comparisons",
        desc: "Compare Ground Floor vs Duplex or Basic vs Luxury finishes",
        free: "❌ Disabled",
        freeClass: "text-gray-400",
        pro: "✅ Side-by-Side Dashboard Comparison",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "1-Click Saved Estimate Re-Editing",
        desc: "Re-open any previously saved project to update rates anytime",
        free: "❌ Disabled",
        freeClass: "text-gray-400",
        pro: "✅ Unlimited Re-edits",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Ownership & Subscription Terms",
        desc: "Billing model and credit duration",
        free: "Free forever",
        freeClass: "text-gray-400",
        pro: "♾️ One-Time Payment (Credits Never Expire)",
        proClass: "text-emerald-600 font-black"
      },
      {
        title: "Customer & Technical Support",
        desc: "Speed of email and support ticket resolution",
        free: "Standard",
        freeClass: "text-gray-400",
        pro: "👑 Priority VIP Support",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Real Estate: Direct Buyer Contact Unlocks",
        desc: "Direct owner phone numbers & WhatsApp chats with zero brokerage",
        free: "3 Contacts Free",
        freeClass: "text-emerald-600 font-bold",
        pro: "✅ Unlimited Access (Direct Buyer Pass)",
        proClass: "text-emerald-600 dark:text-emerald-400 font-black"
      },
      {
        title: "Real Estate: Owner Listing Slots",
        desc: "Publish properties for sale or rent with verified direct buyer leads",
        free: "1 Free Active Listing",
        freeClass: "text-emerald-600 font-bold",
        pro: "✅ Multi-Listing Slots Included (Standard & Pro)",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Real Estate: Commercial Broker & Agency Packs",
        desc: "RERA verified listing pack with WhatsApp leads and priority ranking",
        free: "❌ Paid per listing (₹349)",
        freeClass: "text-gray-400",
        pro: "✅ Included in Pro Tier (5-Listing Pack Value)",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      }
    ]
  },
  AE: {
    heading: "Free Tools vs. UAE Pro Account",
    subheading: "See exactly what makes a Pro account essential for Dubai property investors and expats.",
    proHeader: "👑 Pro Account",
    rows: [
      {
        title: "Live Property Buying Cost Calculators",
        desc: "DLD fees, trustee fees, mortgage registration, and service charges",
        free: "100% Free & Unlimited",
        freeClass: "text-emerald-600 font-bold",
        pro: "100% Free & Unlimited",
        proClass: "text-emerald-600 font-bold"
      },
      {
        title: "Area Yield & Community Comparisons",
        desc: "Compare rental yields across 15+ freehold investment zones",
        free: "Included",
        freeClass: "text-emerald-600 font-bold",
        pro: "Included",
        proClass: "text-emerald-600 font-bold"
      },
      {
        title: "Cloud Investment Portfolio (Dashboard)",
        desc: "Store Dubai property evaluations and cost schedules",
        free: "1 Free Starter Save",
        freeClass: "text-gray-400",
        pro: "Up to 100 Permanent Saves",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Trustee & Bank-Ready PDF Reports",
        desc: "Complete acquisition cost summary formatted for banks & brokers",
        free: "❌ Not Included",
        freeClass: "text-gray-400",
        pro: "✅ Official Investment Reports",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Cash vs Mortgage ROI Analysis",
        desc: "Detailed amortization and net annual yield breakdown",
        free: "Basic summary",
        freeClass: "text-gray-400",
        pro: "✅ Complete Financial Schedules",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Multi-Property Portfolio Tracking",
        desc: "Compare Downtown vs Marina vs JVC investments side-by-side",
        free: "❌ Disabled",
        freeClass: "text-gray-400",
        pro: "✅ Side-by-Side Comparison",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "1-Click Saved Estimate Re-Editing",
        desc: "Re-open saved properties to adjust purchase price or service charge",
        free: "❌ Disabled",
        freeClass: "text-gray-400",
        pro: "✅ Unlimited Re-edits",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      },
      {
        title: "Ownership & Subscription Terms",
        desc: "Billing model and credit duration",
        free: "Free forever",
        freeClass: "text-gray-400",
        pro: "♾️ One-Time Payment (Credits Never Expire)",
        proClass: "text-emerald-600 font-black"
      },
      {
        title: "Customer & Technical Support",
        desc: "Priority assistance for international investors",
        free: "Standard",
        freeClass: "text-gray-400",
        pro: "👑 Priority VIP Support",
        proClass: "text-[#0f2042] dark:text-[#c5a059] font-black"
      }
    ]
  }
};

const FAQS_BY_REGION: Record<string, { question: string; answer: string }[]> = {
  US: [
    {
      question: "Do all calculators require credits to use?",
      answer: "No. Live calculations for kitchen remodels, framing, roofing, swimming pools, additions, and rent-vs-buy are 100% free anytime. Credits are only deducted when you permanently Save a Project to your cloud dashboard or export client-ready PDF estimates."
    },
    {
      question: "How much credit is free for new users?",
      answer: "Every newly registered account automatically receives 1 Free Project Credit upon signing up. This allows you to test saving a complete remodel, addition, or framing takeoff to your dashboard without paying anything."
    },
    {
      question: "I am already a paid customer. Are my benefits safe?",
      answer: "Yes, absolutely. Existing paid customers are permanently grandfathered with all account privileges and credit balances preserved. Topping up smaller bundles will never downgrade your membership tier."
    },
    {
      question: "Do purchased project credits ever expire?",
      answer: "No. Your purchased credits never expire. There are zero recurring monthly SaaS fees or auto-charges."
    }
  ],
  IN: [
    {
      question: "Do all calculators require credits to use?",
      answer: "No. Live calculations, changing specs, comparing materials, and viewing graphs are 100% free for everyone. Credits are only deducted when you permanently Save a Project to your cloud dashboard or export formal PDF reports."
    },
    {
      question: "How much credit is free for new users?",
      answer: "Every newly registered account automatically receives 1 Free Project Credit upon signing up. This allows you to test saving a complete construction, interior, or remodel estimate to your dashboard without paying anything."
    },
    {
      question: "I am already a paid customer. Are my benefits safe?",
      answer: "Yes, absolutely. Existing paid customers are permanently grandfathered. You keep all calculator unlocks, account privileges, and remaining credit balances. Topping up smaller bundles will never downgrade your membership tier."
    },
    {
      question: "Do purchased project credits ever expire?",
      answer: "No. Your purchased credits never expire. They stay in your account balance until you choose to save a project or generate an export."
    },
    {
      question: "What real estate marketplace services are 100% free?",
      answer: "Browsing Bangalore property listings, viewing high-resolution photos, checking automated transit distance profiles (airport, metro, railway, tech parks), and filtering by BHK/budget are completely free. Individual homeowners can also post 1 active property listing for free for 30 days, and buyers receive 3 free direct owner contact reveals with zero brokerage commission."
    },
    {
      question: "What are the paid real estate services and how do they work?",
      answer: "To prevent spam and keep listings authentic, buyers who need more than 3 direct owner contacts can purchase a Direct Buyer Pass for ₹199 (Basic Tier, 30 days unlimited access). Owners who want multiple active listings simultaneously can add an Extra Listing Slot for ₹349 (Standard Tier). Commercial brokers and builders can buy single verified listings (₹349) or a 5-Listing Pro Broker Pack for ₹999 (Pro Tier, 60 days validity). All active subscribers to our Standard and Pro plans get these real estate upgrades included automatically."
    }
  ],
  AE: [
    {
      question: "Do all calculators require credits to use?",
      answer: "No. Calculating Dubai property buying costs, DLD registration, mortgage amortization, and service charges is 100% free anytime. Credits are only used to save property investment evaluations to your private cloud portfolio."
    },
    {
      question: "How much credit is free for new users?",
      answer: "Every newly registered account automatically receives 1 Free Project Credit upon signing up to test saving a property acquisition report."
    },
    {
      question: "I am already a paid customer. Are my benefits safe?",
      answer: "Yes, absolutely. Existing paid customers retain full account privileges, grandfathered benefits, and all credit balances."
    },
    {
      question: "Do purchased project credits ever expire?",
      answer: "No. Your credits never expire and there are zero recurring fees."
    }
  ]
};

const UpgradePage = () => {
  const { user, refreshProfile, planTier, hasPaid, credits } = useUser();
  const { showToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'lifetime' | 'monthly'>('lifetime');
  const [error, setError] = useState("");
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const calcParam = searchParams.get('calc');
  const calcDetails = calcParam ? PRO_CALCULATOR_DETAILS[calcParam] : null;
  const { region, setRegion } = useRegion();
  const currentRegion = (region && ['US', 'IN', 'AE'].includes(region) ? region : 'IN') as 'US' | 'IN' | 'AE';

  const activePlans = currentRegion === 'US' 
    ? (billingCycle === 'lifetime' ? usaPlansLifetime : usaPlansMonthly) 
    : currentRegion === 'AE' 
    ? (billingCycle === 'lifetime' ? uaePlansLifetime : uaePlansMonthly) 
    : (billingCycle === 'lifetime' ? plansLifetime : plansMonthly);
  const currencySymbol = currentRegion === 'US' ? '$' : currentRegion === 'AE' ? 'AED ' : '₹';
  const currentBenefits = BENEFITS_BY_REGION[currentRegion] || BENEFITS_BY_REGION['IN'];
  const currentComparison = COMPARISON_ROWS_BY_REGION[currentRegion] || COMPARISON_ROWS_BY_REGION['IN'];
  const currentFaqs = FAQS_BY_REGION[currentRegion] || FAQS_BY_REGION['IN'];

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

      const paymentCurrency = currentRegion === 'US' ? 'USD' : currentRegion === 'AE' ? 'USD' : 'INR';

      const { data: order, error: orderError } = await supabase.functions.invoke('create-order', {
        body: { planId, currency: paymentCurrency } 
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
            body: { ...response, planId, currency: paymentCurrency }
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
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-gray-200/70 dark:bg-zinc-800 rounded-2xl mb-6 shadow-inner">
            <button
              onClick={() => setRegion('IN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                region === 'IN'
                  ? 'bg-white dark:bg-zinc-900 text-[#0f2042] dark:text-[#c5a059] shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>🇮🇳</span> India (INR ₹)
            </button>
            <button
              onClick={() => setRegion('US')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                region === 'US'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>🇺🇸</span> USA (USD $)
            </button>
            <button
              onClick={() => setRegion('AE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                region === 'AE'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>🇦🇪</span> UAE (AED)
            </button>
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              Transparent Credit Pricing
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-zinc-100 mt-3 mb-3 uppercase tracking-tight">
            Choose Your Project Credit Plan
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            {region === 'US' 
              ? "All online calculators are 100% free with unlimited runs. Upgrade to save estimates permanently to your cloud dashboard and generate client-ready PDF contractor bids & rehab budgets." 
              : region === 'AE'
              ? "Live property and buying cost calculations are 100% free. Upgrade to save multi-unit investment portfolios and export client-ready DLD & ROI breakdown sheets."
              : "Live calculations are 100% free anytime. Upgrade to save estimates to your cloud portfolio and download itemized PDF cost sheets & BOQs."}
          </p>
          
          {/* Contextual Pro Feature Callout */}
          {calcParam && (
            <div className="mt-6 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#c5a059]/20 to-amber-500/15 border-2 border-[#c5a059]/50 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm flex items-start sm:items-center gap-3.5 text-left shadow-sm animate-fadeIn">
              <div className="w-10 h-10 rounded-xl bg-[#c5a059] text-white flex items-center justify-center text-lg shrink-0 mt-0.5 sm:mt-0 shadow-xs">
                <i className="fas fa-crown"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Pro Tool Selected
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-1">
                    <i className="fas fa-lock text-[8px]"></i>
                    <span>PRO</span>
                  </span>
                </div>
                <p className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-zinc-100 mt-0.5">
                  {calcDetails?.name || calcParam.replace(/-/g, ' ').toUpperCase()}
                </p>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {calcDetails?.subtitle || "Upgrade to any plan below to immediately unlock this calculator, complete contractor BOQs, and unlimited PDF exports."}
                </p>
              </div>
            </div>
          )}

          {/* Existing Customer Protection Notice */}
          {(hasPaid || planTier === 'pro') && (
            <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#0f2042] dark:text-[#c5a059] text-xs flex items-center gap-3 text-left">
              <i className="fas fa-crown text-[#c5a059] text-lg shrink-0"></i>
              <div>
                <strong>You are an active paid member ({planTier.toUpperCase()}):</strong> Your account has permanent access to your unlocked calculators. You can top up additional project credits below anytime if you need more cloud save slots.
              </div>
            </div>
          )}

          {/* Pro Benefits Highlights */}
          <div className="mt-8 text-left max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0f2042] dark:text-[#c5a059] bg-[#c5a059]/15 px-3 py-1 rounded-full border border-[#c5a059]/30">
                {currentBenefits.tag}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 mt-2">
                {currentBenefits.heading}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentBenefits.cards.map((card: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs hover:border-[#c5a059]/40 transition">
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-950/40 text-${card.color}-600 flex items-center justify-center text-lg mb-3`}>
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">{card.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-8 text-center font-medium">
            {error}
          </div>
        )}

        {/* BILLING CYCLE TOGGLE: LIFETIME vs MONTHLY */}
        <div className="flex flex-col items-center justify-center gap-3 my-8">
          <div className="bg-gray-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl flex items-center border border-gray-200 dark:border-zinc-700 shadow-inner">
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 cursor-pointer ${
                billingCycle === 'lifetime'
                  ? 'bg-primary text-white shadow-md scale-102'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <i className="fas fa-infinity text-sm"></i>
              <span>Lifetime License</span>
              <span className="text-[10px] font-black uppercase bg-[#0f2042] text-[#c5a059] px-2 py-0.5 rounded-full border border-[#c5a059]/40 tracking-wider">
                25% OFF
              </span>
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-white shadow-md scale-102'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <i className="fas fa-calendar-alt text-sm"></i>
              <span>Monthly Subscription</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {billingCycle === 'lifetime' 
              ? "⚡ Limited Time 25% Launch Offer: One-time payment, perpetual software access & lifetime updates."
              : "Flexible monthly billing. Cancel or pause anytime from your dashboard."}
          </p>
        </div>

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
                    <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">
                      {plan.discountBadge || "Save 25%"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-gray-900 dark:text-zinc-100">{currencySymbol}{plan.price}</span>
                    <span className="text-gray-500 dark:text-zinc-400 font-medium">{plan.billingPeriod}</span>
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
                  ) : billingCycle === 'lifetime' ? (
                    'Get Lifetime Access'
                  ) : (
                    'Start Subscription'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* --- REAL ESTATE MARKETPLACE: WHAT IS FREE VS PAID SERVICES --- */}
        {(currentRegion === "IN" || !currentRegion) && (
          <div className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4165af] bg-[#4165af]/10 px-3.5 py-1.5 rounded-full border border-[#4165af]/20">
                Bangalore Real Estate Marketplace
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 mt-3">
                Transparent Overview: Free vs. Paid Real Estate Services
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Home Design English is a zero-brokerage marketplace. Review exactly what is 100% free forever for buyers and homeowners, and which optional paid services support verified listings and anti-spam protection.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* COLUMN 1: 100% FREE MARKETPLACE SERVICES */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/15 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
                        <i className="fas fa-gift"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                          100% Free Marketplace Services
                        </h3>
                        <span className="text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                          Always Available &bull; No Hidden Brokerage
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Free ₹0
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    Everything you need to discover homes, review verified photos, and connect directly with genuine Bangalore property owners without paying any middleman commission.
                  </p>

                  <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Unlimited Property Browsing &amp; Search:</strong>
                        <span className="text-gray-500 dark:text-zinc-400 block text-xs mt-0.5">Filter plots, flats, and villas across all 24 Bangalore localities by price, BHK, and furnishing.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Full Photo Galleries &amp; Specifications:</strong>
                        <span className="text-gray-500 dark:text-zinc-400 block text-xs mt-0.5">High-resolution compressed photos, super built-up sqft, facing direction, and Khata verification are public.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Automated Transit Distance Engine:</strong>
                        <span className="text-gray-500 dark:text-zinc-400 block text-xs mt-0.5">Instant automated distances to Kempegowda Airport, Namma Metro, railway stations, and IT tech parks.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div>
                        <strong className="text-slate-900 dark:text-white">1 Free Active Listing for Individual Owners:</strong>
                        <span className="text-gray-500 dark:text-zinc-400 block text-xs mt-0.5">Publish your property for 30 days with direct verified buyer leads. 100% free forever for homeowners.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div>
                        <strong className="text-slate-900 dark:text-white">First 3 Direct Contact Unlocks:</strong>
                        <span className="text-gray-500 dark:text-zinc-400 block text-xs mt-0.5">Every buyer can reveal up to 3 owner phone numbers and WhatsApp chats with zero brokerage commission.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <i className="fas fa-check-circle text-emerald-500 text-base mt-0.5 shrink-0"></i>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Free 30-Day Listing Renewals:</strong>
                        <span className="text-gray-500 dark:text-zinc-400 block text-xs mt-0.5">Renew your listing with a single click or mark "Deal Closed" in My Properties to recycle your listing slot.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-emerald-200/60 dark:border-emerald-900/30 flex items-center justify-between flex-wrap gap-3">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                    Ready to explore or list your property?
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href="/bangalore/properties"
                      className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs transition"
                    >
                      Browse Listings
                    </Link>
                    <Link
                      href="/bangalore/post-property"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Post Free Property
                    </Link>
                  </div>
                </div>
              </div>

              {/* COLUMN 2: PAID SERVICES & VALUE-ADDED UPGRADES */}
              <div className="bg-slate-50/70 dark:bg-zinc-800/30 border-2 border-[#4165af]/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#4165af] text-white flex items-center justify-center text-xl shadow-xs">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                          Paid Services &amp; Anti-Spam Upgrades
                        </h3>
                        <span className="text-[#4165af] dark:text-blue-400 text-xs font-bold">
                          Strictly Aligned with Platform Upgrade Tiers
                        </span>
                      </div>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-950/60 text-[#4165af] dark:text-blue-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      From ₹199
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    Reasonable micro-fees designed to prevent spam scrapers, authenticate commercial brokers, and fund fast, ad-free platform hosting with verified leads.
                  </p>

                  <div className="space-y-3.5">
                    {/* Service Card 1: Direct Buyer Pass */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-[#4165af] flex items-center justify-center text-xs font-black">
                            1
                          </span>
                          <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">Direct Buyer Pass (Basic Tier)</strong>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-[#4165af]">₹199</span>
                          <span className="text-[10px] text-gray-400 line-through">₹249</span>
                          <span className="text-[10px] text-gray-500">/ 30 Days</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        Unlocked after using 3 free contacts. Gives <strong>unlimited direct owner phone numbers &amp; WhatsApp chats</strong> for 30 days with zero brokerage. Included free for all paid subscribers.
                      </p>
                    </div>

                    {/* Service Card 2: Owner Extra Listing Slot */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 flex items-center justify-center text-xs font-black">
                            2
                          </span>
                          <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">Owner Extra Listing Slot (Standard Tier)</strong>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-amber-600">₹349</span>
                          <span className="text-[10px] text-gray-400 line-through">₹499</span>
                          <span className="text-[10px] text-gray-500">/ 30 Days</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        For owners with multiple properties who want 2 or more active listings simultaneously. <strong>Included free of charge</strong> for all Standard &amp; Pro plan members.
                      </p>
                    </div>

                    {/* Service Card 3: Single Commercial Broker Listing */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 flex items-center justify-center text-xs font-black">
                            3
                          </span>
                          <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">Single Commercial Broker Listing</strong>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-zinc-200">₹349</span>
                          <span className="text-[10px] text-gray-500">/ 30 Days</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        Commercial agents &amp; brokers posting 1 verified listing. Includes verified RERA badge and direct buyer inquiries.
                      </p>
                    </div>

                    {/* Service Card 4: 5-Listing Pro Broker Pack */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 flex items-center justify-center text-xs font-black">
                            4
                          </span>
                          <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">5-Listing Pro Broker Pack (Pro Tier)</strong>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-purple-600">₹999</span>
                          <span className="text-[10px] text-gray-400 line-through">₹1,427</span>
                          <span className="text-[10px] text-gray-500">/ 60 Days</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                        For high-volume property managers &amp; developers: 5 commercial slots, 60 days validity, direct WhatsApp buyer routing. <strong>Included in the ₹999 Pro Subscription</strong> (which also gives 100 cloud construction credits).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-lock text-emerald-600"></i>
                    <span>Secure Razorpay Payments &bull; UPI, Cards, NetBanking</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#4165af]">
                    Auto-applied to your logged-in account
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FREE VS PRO DETAILED COMPARISON TABLE --- */}
        <div id="compare" className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800 shadow-sm scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0f2042] dark:text-[#c5a059] bg-[#c5a059]/15 px-3 py-1 rounded-full border border-[#c5a059]/30">
              Full Feature Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100 mt-2.5">
              {currentComparison.heading}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1.5">
              {currentComparison.subheading}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-zinc-800">
                  <th className="pb-4 font-bold text-gray-400 uppercase tracking-wider text-[11px] w-2/5">Capability</th>
                  <th className="pb-4 font-bold text-gray-600 dark:text-zinc-300 text-center w-1/5">Free Visitor</th>
                  <th className="pb-4 font-black text-[#0f2042] dark:text-[#c5a059] text-center w-2/5 bg-[#c5a059]/10 dark:bg-[#c5a059]/15 rounded-t-xl">
                    {currentComparison.proHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
                {currentComparison.rows.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-4 text-slate-900 dark:text-zinc-100">
                      <span className="font-bold">{row.title}</span>
                      <p className="text-[11px] text-gray-400 font-normal">{row.desc}</p>
                    </td>
                    <td className={`py-4 text-center ${row.freeClass || 'text-gray-400'}`}>{row.free}</td>
                    <td className={`py-4 text-center ${row.proClass || 'text-[#0f2042] dark:text-[#c5a059] font-black'} bg-[#c5a059]/10 dark:bg-[#c5a059]/15`}>
                      {row.pro}
                    </td>
                  </tr>
                ))}
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
              Everything you need to know about our free tools, credits, and existing customer benefits in {region === 'US' ? 'the United States' : region === 'AE' ? 'the UAE' : 'India'}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {currentFaqs.map((faq: any, idx: number) => (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40">
                <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                  <i className="fas fa-question-circle text-primary"></i>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
