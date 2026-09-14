import React from "react";
import { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import FAQ from "@/components/layout/FAQ";
import CalculatorFeature from "@/components/layout/CalculatorFeature";
import { supabase } from "@/config/supabaseClient";

export const metadata: Metadata = {
  title: "Dream Home Calculator | Construction Cost Estimator",
  description: "Calculate your home construction, interior design, flooring, and building material costs with accurate 2026 local rates.",
  alternates: {
    canonical: '/',
  },
};

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
