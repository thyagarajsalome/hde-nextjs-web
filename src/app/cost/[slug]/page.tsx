import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/layout/Hero";
import AppPromoSection from "@/components/layout/AppPromoSection";
import FAQ from "@/components/layout/FAQ";
import Testimonials from "@/components/layout/Testimonials";
import CalculatorFeature from "@/components/layout/CalculatorFeature";
import CityContent, { CITIES_DATA, CityData } from "@/components/layout/CityContent";
import { supabase } from "@/config/supabaseClient";

export async function generateStaticParams() {
  // Try to fetch slugs from Supabase
  const { data: locations } = await supabase.from('pseo_locations').select('slug');
  
  if (locations && locations.length > 0) {
    return locations.map((loc: any) => ({
      slug: `construction-in-${loc.slug}`,
    }));
  }
  
  // Fallback to hardcoded if DB fails
  return Object.keys(CITIES_DATA).map((city) => ({
    slug: `construction-in-${city}`,
  }));
}

async function getCityData(slugStr: string): Promise<CityData | null> {
  const cityKey = slugStr.replace('construction-in-', '').toLowerCase();
  
  // Fetch from Supabase
  const { data: loc } = await supabase
    .from('pseo_locations')
    .select('*, pseo_construction_rates(*)')
    .eq('slug', cityKey)
    .single();

  if (loc && loc.pseo_construction_rates && loc.pseo_construction_rates[0]) {
    const rates = loc.pseo_construction_rates[0];
    return {
      slug: loc.slug,
      cityName: loc.city_name,
      stateName: loc.state_name,
      metaDesc: `Calculate house construction cost in ${loc.city_name}, ${loc.state_name}. Check local standard & premium building rates, ${rates.primary_material_name} rates, plumbing and electrical charges in ${loc.city_name}.`,
      neighborhoods: loc.neighborhoods || 'prime sectors and local neighborhoods',
      soilType: loc.soil_type || 'local soil types',
      basicRate: `${loc.currency_symbol}${rates.basic_rate_per_sqft}/sqft`,
      standardRate: `${loc.currency_symbol}${rates.standard_rate_per_sqft}/sqft`,
      premiumRate: `${loc.currency_symbol}${rates.premium_rate_per_sqft}/sqft`,
    };
  }

  // Fallback
  return CITIES_DATA[cityKey] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug.startsWith('construction-in-')) {
    return { title: "Not Found" };
  }
  
  const cityData = await getCityData(resolvedParams.slug);
  
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
  
  const cityData = await getCityData(resolvedParams.slug);

  if (!cityData) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `Construction Cost Calculator ${cityData.cityName}`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": cityData.basicRate.includes('$') ? 'USD' : 'INR'
    },
    "description": cityData.metaDesc,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityContent cityData={cityData} />
      <CalculatorFeature />
      <AppPromoSection />
      <Testimonials />
      <FAQ />
    </>
  );
}
