import React from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import Hero from "@/components/layout/Hero";
import FAQ from "@/components/layout/FAQ";
import CalculatorFeature from "@/components/layout/CalculatorFeature";
import { supabase } from "@/config/supabaseClient";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host")?.toLowerCase() || "";
  const isUS = host.startsWith("us.") || host.includes("us.localhost");
  const isDubai = host.startsWith("dubai.") || host.includes("dubai.localhost");

  if (isUS) {
    return {
      title: "USA Real Estate Calculators & Home Building Cost Estimator (2026) | HDE",
      description: "Free, contractor-accurate 2026 USA real estate calculators. Compare rent vs. buy, property taxes, kitchen & bathroom remodels, barndominiums, and home additions.",
      alternates: {
        canonical: "https://us.homedesignenglish.com",
        languages: {
          "en-US": "https://us.homedesignenglish.com",
          "en-IN": "https://www.homedesignenglish.com",
          "en-AE": "https://dubai.homedesignenglish.com",
          "x-default": "https://www.homedesignenglish.com",
        },
      },
      openGraph: {
        title: "USA Real Estate Calculators & Home Building Cost Estimator (2026) | HDE",
        description: "Free, contractor-accurate 2026 USA real estate calculators across top US cities.",
        url: "https://us.homedesignenglish.com",
        type: "website",
      },
    };
  }

  if (isDubai) {
    return {
      title: "Dubai Property Cost Calculator & Real Estate Directory | HDE",
      description: "Calculate DLD fees, mortgage EMI, and service charges for Dubai real estate. Explore off-plan and luxury apartments across top Dubai areas.",
      alternates: {
        canonical: "https://dubai.homedesignenglish.com",
        languages: {
          "en-AE": "https://dubai.homedesignenglish.com",
          "en-US": "https://us.homedesignenglish.com",
          "en-IN": "https://www.homedesignenglish.com",
          "x-default": "https://www.homedesignenglish.com",
        },
      },
      openGraph: {
        title: "Dubai Property Cost Calculator & Real Estate Directory | HDE",
        description: "Calculate DLD fees, mortgage EMI, and service charges for Dubai real estate.",
        url: "https://dubai.homedesignenglish.com",
        type: "website",
      },
    };
  }

  // India Mode (www.homedesignenglish.com)
  return {
    title: "Dream Home Calculator | House Construction & Interior Cost Estimator (2026)",
    description: "Calculate your house construction cost, materials BOQ, interior design, flooring, and home loan EMI with accurate 2026 Indian market rates.",
    alternates: {
      canonical: "https://www.homedesignenglish.com",
      languages: {
        "en-IN": "https://www.homedesignenglish.com",
        "en-US": "https://us.homedesignenglish.com",
        "en-AE": "https://dubai.homedesignenglish.com",
        "x-default": "https://www.homedesignenglish.com",
      },
    },
    openGraph: {
      title: "Dream Home Calculator | House Construction & Interior Cost Estimator (2026)",
      description: "Calculate your home construction, interior design, and materials with accurate 2026 rates.",
      url: "https://www.homedesignenglish.com",
      type: "website",
    },
  };
}

export default async function HomePage() {
  const { data: banners } = await supabase.from('hero_banners').select('*').order('created_at', { ascending: false }).limit(2);

  return (
    <>
      <h1 className="sr-only">Home Construction Cost Estimator &amp; Building Material Calculator</h1>
      <Hero initialBanners={banners || []} />
      <CalculatorFeature />
      <FAQ />
    </>
  );
}
