import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/layout/Hero";
import AppPromoSection from "@/components/layout/AppPromoSection";
import FAQ from "@/components/layout/FAQ";
import Testimonials from "@/components/layout/Testimonials";
import CalculatorFeature from "@/components/layout/CalculatorFeature";
import CityContent, { CITIES_DATA } from "@/components/layout/CityContent";

export async function generateStaticParams() {
  return Object.keys(CITIES_DATA).map((city) => ({
    slug: `construction-in-${city}`,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug.startsWith('construction-in-')) {
    return { title: "Not Found" };
  }
  
  const cityKey = resolvedParams.slug.replace('construction-in-', '').toLowerCase();
  const cityData = CITIES_DATA[cityKey];
  
  if (!cityData) {
    return {
      title: "City Not Found - HDE",
    };
  }

  return {
    title: `House Construction Cost in ${cityData.cityName} - Calculator & Rates`,
    description: cityData.metaDesc,
    openGraph: {
      title: `House Construction Cost in ${cityData.cityName} | HDE`,
      description: cityData.metaDesc,
      type: "website",
    }
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug.startsWith('construction-in-')) {
    notFound();
  }
  
  const cityKey = resolvedParams.slug.replace('construction-in-', '').toLowerCase();
  const cityData = CITIES_DATA[cityKey];

  if (!cityData) {
    notFound();
  }

  return (
    <>
      <CityContent cityData={cityData} />
      <CalculatorFeature />
      <AppPromoSection />
      <Testimonials />
      <FAQ />
    </>
  );
}
