import React from "react";
import { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import AppPromoSection from "@/components/layout/AppPromoSection";
import FAQ from "@/components/layout/FAQ";
import CalculatorFeature from "@/components/layout/CalculatorFeature";
import { supabase } from "@/config/supabaseClient";

export const metadata: Metadata = {
  title: "Dream Home Calculator | Construction Cost Estimator",
  description: "Calculate your home construction, interior, and material costs accurately.",
};

export default async function HomePage() {
  const { data: banners } = await supabase.from('hero_banners').select('*').order('created_at', { ascending: false }).limit(2);

  return (
    <>
      <Hero initialBanners={banners || []} />
      <CalculatorFeature />
      <AppPromoSection />
      <FAQ />
    </>
  );
}
