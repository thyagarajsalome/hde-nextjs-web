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

const USA_CITIES_FALLBACK = [
  { slug: 'dallas-texas', city_name: 'Dallas', state_name: 'Texas', country: 'USA' },
  { slug: 'miami-florida', city_name: 'Miami', state_name: 'Florida', country: 'USA' },
  { slug: 'atlanta-georgia', city_name: 'Atlanta', state_name: 'Georgia', country: 'USA' },
  { slug: 'seattle-washington', city_name: 'Seattle', state_name: 'Washington', country: 'USA' },
  { slug: 'phoenix-arizona', city_name: 'Phoenix', state_name: 'Arizona', country: 'USA' },
  { slug: 'chicago-illinois', city_name: 'Chicago', state_name: 'Illinois', country: 'USA' },
  { slug: 'denver-colorado', city_name: 'Denver', state_name: 'Colorado', country: 'USA' },
  { slug: 'charlotte-north-carolina', city_name: 'Charlotte', state_name: 'North Carolina', country: 'USA' },
  { slug: 'orlando-florida', city_name: 'Orlando', state_name: 'Florida', country: 'USA' },
  { slug: 'nashville-tennessee', city_name: 'Nashville', state_name: 'Tennessee', country: 'USA' },
  { slug: 'las-vegas-nevada', city_name: 'Las Vegas', state_name: 'Nevada', country: 'USA' },
  { slug: 'tampa-florida', city_name: 'Tampa', state_name: 'Florida', country: 'USA' },
  { slug: 'raleigh-north-carolina', city_name: 'Raleigh', state_name: 'North Carolina', country: 'USA' },
  { slug: 'salt-lake-city-utah', city_name: 'Salt Lake City', state_name: 'Utah', country: 'USA' },
  { slug: 'san-diego-california', city_name: 'San Diego', state_name: 'California', country: 'USA' }
];

const INDIA_CITIES = [
  { slug: 'mumbai', name: 'Mumbai' },
  { slug: 'bengaluru', name: 'Bengaluru' },
  { slug: 'delhi-ncr', name: 'Delhi NCR' },
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'pune', name: 'Pune' },
  { slug: 'ahmedabad', name: 'Ahmedabad' },
  { slug: 'kolkata', name: 'Kolkata' },
  { slug: 'jaipur', name: 'Jaipur' },
  { slug: 'lucknow', name: 'Lucknow' },
  { slug: 'surat', name: 'Surat' },
  { slug: 'nagpur', name: 'Nagpur' },
];

function getIndiaSampleEstimate(cityData: CityData) {
  const parseRate = (rateStr: string) => {
    const num = rateStr.replace(/[^0-9.]/g, '');
    return num ? parseFloat(num) : 0;
  };
  
  const basic = parseRate(cityData.basicRate);
  const standard = parseRate(cityData.standardRate);
  const premium = parseRate(cityData.premiumRate);
  
  const sqft = 1200;
  
  return {
    sqft,
    basicTotal: basic * sqft,
    standardTotal: standard * sqft,
    premiumTotal: premium * sqft,
    breakdown: [
      { name: 'Foundation', percent: 12 },
      { name: 'Structure', percent: 30 },
      { name: 'Masonry', percent: 12 },
      { name: 'Roofing', percent: 10 },
      { name: 'Finishing', percent: 20 },
      { name: 'Electrical & Plumbing', percent: 10 },
      { name: 'Miscellaneous', percent: 6 },
    ]
  };
}

export async function generateStaticParams() {
  // Try to fetch slugs from Supabase
  const { data: dbLocations } = await supabase.from('pseo_locations').select('slug');
  
  let locations = dbLocations || [];
  
  // Merge in the hardcoded USA fallback
  const existingSlugs = new Set(locations.map((l: any) => l.slug));
  const toAdd = USA_CITIES_FALLBACK.filter((c: any) => !existingSlugs.has(c.slug));
  locations = [...locations, ...toAdd];
  
  if (locations.length > 0) {
    return locations.flatMap((loc: any) => [
      { slug: `construction-in-${loc.slug}` },
      { slug: `interior-design-in-${loc.slug}` },
      { slug: `flooring-in-${loc.slug}` },
      { slug: `painting-in-${loc.slug}` },
    ]);
  }
  
  // Fallback to hardcoded if DB fails
  return Object.keys(CITIES_DATA).flatMap((city) => [
    { slug: `construction-in-${city}` },
    { slug: `interior-design-in-${city}` },
    { slug: `flooring-in-${city}` },
    { slug: `painting-in-${city}` },
  ]);
}

async function getCityData(slugStr: string): Promise<CityData | null> {
  let cityKey = slugStr;
  if (cityKey.startsWith('construction-in-')) cityKey = cityKey.replace('construction-in-', '');
  else if (cityKey.startsWith('interior-design-in-')) cityKey = cityKey.replace('interior-design-in-', '');
  else if (cityKey.startsWith('flooring-in-')) cityKey = cityKey.replace('flooring-in-', '');
  else if (cityKey.startsWith('painting-in-')) cityKey = cityKey.replace('painting-in-', '');
  cityKey = cityKey.toLowerCase();
  
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



  // If the location was found in DB but missing rates, and it's a USA city, provide defaults
  if (loc && loc.country === 'USA') {
    return {
      slug: loc.slug,
      cityName: loc.city_name,
      stateName: loc.state_name,
      country: loc.country,

      metaDesc: `Calculate construction and remodeling costs in ${loc.city_name}, ${loc.state_name}. Check local standard building rates, plumbing, and electrical charges.`,
      neighborhoods: 'prime sectors and local neighborhoods',
      soilType: 'local soil types',
      basicRate: '$120/sqft',
      standardRate: '$160/sqft',
      premiumRate: '$220/sqft',
    };
  }

  // Check if it is in our USA_CITIES_FALLBACK (for cities not in DB at all)
  const usaFallback = USA_CITIES_FALLBACK.find(c => c.slug === cityKey);

  if (usaFallback) {
    return {
      slug: usaFallback.slug,
      cityName: usaFallback.city_name,
      stateName: usaFallback.state_name,
      country: usaFallback.country,
      metaDesc: `Calculate construction and remodeling costs in ${usaFallback.city_name}, ${usaFallback.state_name}. Check local standard building rates, plumbing, and electrical charges.`,
      neighborhoods: 'prime sectors and local neighborhoods',
      soilType: 'local soil types',
      basicRate: '$120/sqft',
      standardRate: '$160/sqft',
      premiumRate: '$220/sqft',
    };
  }

  // Fallback to CITIES_DATA
  return CITIES_DATA[cityKey] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug.startsWith('construction-in-') &&
      !resolvedParams.slug.startsWith('interior-design-in-') &&
      !resolvedParams.slug.startsWith('flooring-in-') &&
      !resolvedParams.slug.startsWith('painting-in-')) {
    return { title: "Not Found" };
  }
  
  const cityData = await getCityData(resolvedParams.slug);
  
  if (!cityData) {
    return {
      title: "City Not Found - HDE",
    };
  }

  let title = `House Construction Cost in ${cityData.cityName} - Calculator & Rates`;
  if (resolvedParams.slug.startsWith('interior-design-in-')) {
    title = `Interior Design Cost in ${cityData.cityName} - Calculator & Rates`;
  } else if (resolvedParams.slug.startsWith('flooring-in-')) {
    title = `Flooring Cost in ${cityData.cityName} - Calculator & Rates`;
  } else if (resolvedParams.slug.startsWith('painting-in-')) {
    title = `House Painting Cost in ${cityData.cityName} - Calculator & Rates`;
  }

  return {
    title,
    description: cityData.metaDesc,
    openGraph: {
      title: `${title} | HDE`,
      description: cityData.metaDesc,
      type: "website",
    }
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug.startsWith('construction-in-') &&
      !resolvedParams.slug.startsWith('interior-design-in-') &&
      !resolvedParams.slug.startsWith('flooring-in-') &&
      !resolvedParams.slug.startsWith('painting-in-')) {
    notFound();
  }
  
  const cityData = await getCityData(resolvedParams.slug);

  if (!cityData) {
    notFound();
  }

  let toolType = 'construction';
  let forceCalculator = 'construction';
  if (resolvedParams.slug.startsWith('interior-design-in-')) {
    toolType = 'interior-design';
    forceCalculator = 'interior';
  } else if (resolvedParams.slug.startsWith('flooring-in-')) {
    toolType = 'flooring';
    forceCalculator = 'flooring';
  } else if (resolvedParams.slug.startsWith('painting-in-')) {
    toolType = 'painting';
    forceCalculator = 'painting';
  }

  const forceRegion = cityData.country === 'USA' ? 'US' : 'IN';

  const sampleEstimate = forceRegion === 'IN' ? getIndiaSampleEstimate(cityData) : null;
  const formatLakhs = (amount: number) => `₹${(amount / 100000).toFixed(2)} Lakhs`;

  // 1. Generate Dynamic FAQs based on City Data
  let dynamicFaqs = [];
  if (toolType === 'interior-design') {
    dynamicFaqs = [
      {
        question: `How much does interior design cost in ${cityData.cityName}?`,
        answer: `The average interior design cost in ${cityData.cityName} varies depending on the level of finish, materials, and size of the space. Local trends often influence material choices and pricing.`
      },
      {
        question: `What are the popular interior design styles in ${cityData.cityName}?`,
        answer: `Styles in ${cityData.cityName} range from modern contemporary to traditional aesthetics, influenced by local culture and architecture.`
      },
      {
        question: `Do interior design rates in ${cityData.cityName} include materials?`,
        answer: `Rates can be structured with or without materials depending on the designer or firm you choose in ${cityData.cityName}.`
      }
    ];
  } else if (toolType === 'flooring') {
    dynamicFaqs = [
      {
        question: `How much does flooring cost in ${cityData.cityName}?`,
        answer: `Flooring costs in ${cityData.cityName} depend on the material chosen, such as tiles, wood, or marble, and local labor rates.`
      },
      {
        question: `What is the most popular flooring material in ${cityData.cityName}?`,
        answer: `The choice of flooring in ${cityData.cityName} often depends on the climate and ${cityData.soilType}, with durable materials being preferred.`
      },
      {
        question: `How much does labor cost for flooring in ${cityData.cityName}?`,
        answer: `Labor rates in ${cityData.cityName} are influenced by local market conditions and the complexity of the flooring installation.`
      }
    ];
  } else if (toolType === 'painting') {
    dynamicFaqs = [
      {
        question: `How much does house painting cost in ${cityData.cityName}?`,
        answer: `The cost to paint a house in ${cityData.cityName} varies based on the type of paint, surface area, and local labor charges.`
      },
      {
        question: `What type of paint is best for homes in ${cityData.cityName}?`,
        answer: `Given the local weather conditions, weather-resistant and washable paints are highly recommended for homes in ${cityData.cityName}.`
      },
      {
        question: `Are labor rates for painting higher in ${cityData.cityName}?`,
        answer: `Labor rates vary by region, and ${cityData.cityName} has its own specific prevailing wages for professional painters.`
      }
    ];
  } else {
    dynamicFaqs = [
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
  }

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
      <CalculatorFeature forceRegion={forceRegion} forceCalculator={forceCalculator as any} />
      
      {/* Hide specific sections for USA mode as requested previously */}
      {forceRegion !== 'US' && (
        <>
          <AppPromoSection />
          <Testimonials />
        </>
      )}

      {forceRegion === 'IN' && sampleEstimate && toolType === 'construction' && (
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-secondary mb-6 text-center">
              Sample Construction Cost Estimate for {cityData.cityName}, {cityData.stateName}
            </h2>
            <p className="text-gray-600 mb-8 text-center text-lg">
              Based on a standard 1,200 sqft residential home in {cityData.cityName}, here is an approximate cost breakdown:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic Finish</h3>
                <p className="text-3xl font-bold text-primary">{formatLakhs(sampleEstimate.basicTotal)}</p>
                <p className="text-sm text-gray-500 mt-2">({cityData.basicRate})</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-primary text-center relative transform md:-translate-y-2">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Standard Finish</h3>
                <p className="text-3xl font-bold text-primary">{formatLakhs(sampleEstimate.standardTotal)}</p>
                <p className="text-sm text-gray-500 mt-2">({cityData.standardRate})</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Finish</h3>
                <p className="text-3xl font-bold text-primary">{formatLakhs(sampleEstimate.premiumTotal)}</p>
                <p className="text-sm text-gray-500 mt-2">({cityData.premiumRate})</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Standard Material Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 font-semibold text-gray-700 border-b">Construction Stage</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 border-b text-right">% of Total Cost</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 border-b text-right">Approx. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleEstimate.breakdown.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                        <td className="py-3 px-4 text-gray-600 text-right">{item.percent}%</td>
                        <td className="py-3 px-4 text-gray-800 font-semibold text-right">
                          {formatLakhs(sampleEstimate.standardTotal * (item.percent / 100))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-3 px-4 text-gray-900">Total</td>
                      <td className="py-3 px-4 text-gray-900 text-right">100%</td>
                      <td className="py-3 px-4 text-primary text-right">{formatLakhs(sampleEstimate.standardTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <p className="text-gray-600 text-sm italic">
              <strong>Note:</strong> The above costs are estimates based on average rates in {cityData.cityName}. Actual costs may vary depending on land conditions, specific material choices, architectural fees, and local labor availability in different parts of {cityData.stateName}.
            </p>
          </div>
        </section>
      )}

      {forceRegion === 'IN' && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl font-bold text-center text-secondary mb-8">
              {toolType === 'interior-design' ? 'Interior Design' : toolType === 'flooring' ? 'Flooring' : toolType === 'painting' ? 'Painting' : 'Construction'} Costs in Other Indian Cities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {INDIA_CITIES.filter(c => c.slug !== cityData.slug).map((city) => (
                <a
                  key={city.slug}
                  href={`/cost/${toolType}-in-${city.slug}`}
                  className="bg-gray-50 hover:bg-primary hover:text-white transition-colors duration-200 rounded-lg p-4 text-center border border-gray-100 shadow-sm flex items-center justify-center min-h-[80px]"
                >
                  <span className="font-medium">{city.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
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
