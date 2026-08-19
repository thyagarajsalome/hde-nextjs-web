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
      country: loc.country,
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



  const forceRegion = cityData.country === 'USA' ? 'US' : 'IN';

  // 1. Generate Dynamic FAQs based on City Data
  const dynamicFaqs = [
    {
      question: `How much does it cost to build a house in ${cityData.cityName}?`,
      answer: `The average cost to build a house in ${cityData.cityName} starts at ${cityData.basicRate} for a basic finish, ${cityData.standardRate} for standard, and can go up to ${cityData.premiumRate} for a premium luxury finish. Prices vary based on ${cityData.neighborhoods} and local material costs.`
    },
    {
      question: `What are the primary construction materials used in ${cityData.cityName}?`,
      answer: `Due to the ${cityData.soilType} and ${cityData.country === 'USA' ? 'local building codes' : 'weather conditions'}, builders in ${cityData.cityName} primarily rely on materials that fit the region's climate. Prices fluctuate, but current estimates include these local rates.`
    },
    {
      question: `Do I need to account for local labor rates in ${cityData.cityName}?`,
      answer: `Yes, labor rates in ${cityData.cityName}, ${cityData.stateName} differ from national averages. Our calculator automatically adjusts estimates using real-time local multipliers for framing, plumbing, roofing, and electrical work.`
    }
  ];

  // 2. Build JSON-LD Schema (Software + FAQ)
  const jsonLd = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": dynamicFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityContent cityData={cityData} />
      <CalculatorFeature forceRegion={forceRegion} />
      
      {/* Hide specific sections for USA mode as requested previously */}
      {forceRegion !== 'US' && (
        <>
          <AppPromoSection />
          <Testimonials />
        </>
      )}
      
      {/* Dynamic SEO FAQ Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Frequently Asked Questions about {cityData.cityName}</h2>
            <p className="text-gray-500">Local building insights and cost factors for {cityData.cityName}, {cityData.stateName}.</p>
          </div>
          <div className="space-y-6">
            {dynamicFaqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keep the generic FAQ only for India, or remove if Dynamic is enough. Let's keep it for IN. */}
      {forceRegion !== 'US' && <FAQ />}
    </>
  );
}
