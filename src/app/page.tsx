import React from "react";
import { Metadata } from "next";
import Hero from "@/components/layout/Hero";
import AppPromoSection from "@/components/layout/AppPromoSection";
import FAQ from "@/components/layout/FAQ";
import Testimonials from "@/components/layout/Testimonials";
import CalculatorFeature from "@/components/layout/CalculatorFeature";

export const metadata: Metadata = {
  title: "Dream Home Calculator | Construction Cost Estimator",
  description: "Calculate your home construction, interior, and material costs accurately.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <CalculatorFeature />
      <AppPromoSection />
      <Testimonials />
      <FAQ />
    </>
  );
}
