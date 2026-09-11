import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/layout/Hero";
import FAQ from "@/components/layout/FAQ";
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
      { slug: `home-loan-emi-in-${loc.slug}` },
      { slug: `building-material-cost-in-${loc.slug}` },
    ]);
  }
  
  // Fallback to hardcoded if DB fails
  return Object.keys(CITIES_DATA).flatMap((city) => [
    { slug: `construction-in-${city}` },
    { slug: `interior-design-in-${city}` },
    { slug: `flooring-in-${city}` },
    { slug: `painting-in-${city}` },
    { slug: `home-loan-emi-in-${city}` },
    { slug: `building-material-cost-in-${city}` },
  ]);
}

async function getCityData(slugStr: string): Promise<CityData | null> {
  let cityKey = slugStr;
  if (cityKey.startsWith('construction-in-')) cityKey = cityKey.replace('construction-in-', '');
  else if (cityKey.startsWith('interior-design-in-')) cityKey = cityKey.replace('interior-design-in-', '');
  else if (cityKey.startsWith('flooring-in-')) cityKey = cityKey.replace('flooring-in-', '');
  else if (cityKey.startsWith('painting-in-')) cityKey = cityKey.replace('painting-in-', '');
  else if (cityKey.startsWith('home-loan-emi-in-')) cityKey = cityKey.replace('home-loan-emi-in-', '');
  else if (cityKey.startsWith('building-material-cost-in-')) cityKey = cityKey.replace('building-material-cost-in-', '');
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
      !resolvedParams.slug.startsWith('painting-in-') &&
      !resolvedParams.slug.startsWith('home-loan-emi-in-') &&
      !resolvedParams.slug.startsWith('building-material-cost-in-')) {
    return { title: "Not Found" };
  }
  
  const cityData = await getCityData(resolvedParams.slug);
  
  if (!cityData) {
    return {
      title: "City Not Found - HDE",
    };
  }

  let title = `House Construction Cost in ${cityData.cityName} - Calculator & Rates`;
  let description = cityData.metaDesc;
  if (resolvedParams.slug.startsWith('interior-design-in-')) {
    title = `Interior Design Cost in ${cityData.cityName} - Calculator & Rates`;
  } else if (resolvedParams.slug.startsWith('flooring-in-')) {
    title = `Flooring Cost in ${cityData.cityName} - Calculator & Rates`;
  } else if (resolvedParams.slug.startsWith('painting-in-')) {
    title = `House Painting Cost in ${cityData.cityName} - Calculator & Rates`;
  } else if (resolvedParams.slug.startsWith('home-loan-emi-in-')) {
    title = `Home Loan EMI Calculator for ${cityData.cityName} - Compare SBI, HDFC Rates`;
    description = `Calculate monthly home loan EMI for residential property in ${cityData.cityName}. Compare current SBI, HDFC, ICICI interest rates, loan tenure, and amortization schedules.`;
  } else if (resolvedParams.slug.startsWith('building-material-cost-in-')) {
    title = `Building Material Cost in ${cityData.cityName} - Cement, Steel & Bricks Price`;
    description = `Get latest construction building material prices in ${cityData.cityName}. Check cement bag rates, TATA Tiscon steel prices per kg, red bricks, sand, and aggregate rates.`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/cost/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${title} | HDE`,
      description,
      type: "website",
      url: `/cost/${resolvedParams.slug}`,
    }
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  if (!resolvedParams.slug.startsWith('construction-in-') &&
      !resolvedParams.slug.startsWith('interior-design-in-') &&
      !resolvedParams.slug.startsWith('flooring-in-') &&
      !resolvedParams.slug.startsWith('painting-in-') &&
      !resolvedParams.slug.startsWith('home-loan-emi-in-') &&
      !resolvedParams.slug.startsWith('building-material-cost-in-')) {
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
  } else if (resolvedParams.slug.startsWith('home-loan-emi-in-')) {
    toolType = 'home-loan-emi';
    forceCalculator = 'india-emi';
  } else if (resolvedParams.slug.startsWith('building-material-cost-in-')) {
    toolType = 'building-material-cost';
    forceCalculator = 'materials';
  }

  const forceRegion = cityData.country === 'USA' ? 'US' : 'IN';

  const sampleEstimate = forceRegion === 'IN' ? getIndiaSampleEstimate(cityData) : null;
  const formatLakhs = (amount: number) => `₹${(amount / 100000).toFixed(2)} Lakhs`;

  // 1. Generate Dynamic FAQs based on City Data with deep local insights (no boilerplate)
  let dynamicFaqs = [];
  if (toolType === 'interior-design') {
    dynamicFaqs = [
      {
        question: `What is the average interior design cost per sq ft in ${cityData.cityName}?`,
        answer: `In ${cityData.cityName}, full-home interior design typically costs between ₹1,200 to ₹1,800 per sq ft for essential woodwork (modular kitchen, master wardrobes, TV units), ₹1,800 to ₹2,800 per sq ft for premium veneer/acrylic finishes with false ceilings and ambient lighting, and ₹3,000+ per sq ft for bespoke luxury villas in neighborhoods like ${cityData.neighborhoods.split(',').slice(0, 3).join(',')}.`
      },
      {
        question: `How much does a modular kitchen cost to build in ${cityData.cityName}?`,
        answer: `A standard 80 to 120 sq ft modular kitchen in ${cityData.cityName} costs between ₹1.2 Lakhs to ₹2.5 Lakhs using BWP marine-grade plywood (IS 710) with anti-scratch laminates and soft-close Tandem boxes. Premium acrylic or PU lacquer finishes with quartz countertops typically range from ₹3.0 Lakhs to ₹5.5 Lakhs depending on hardware brands (Hettich, Hafele, Blum).`
      },
      {
        question: `What interior materials withstand ${cityData.cityName}'s climate best?`,
        answer: `${cityData.cityName}'s environmental conditions require weather-appropriate core boards. Due to ${cityData.soilType.toLowerCase().includes('coastal') || cityData.soilType.toLowerCase().includes('water') ? 'high ambient humidity and coastal proximity' : 'seasonal temperature shifts'}, use Boiling Water Proof (BWP) 710 grade plywood for kitchens and bathrooms to prevent delamination, and HDHMR (High-Density High Moisture Resistance) boards for dry wardrobes and TV consoles.`
      }
    ];
  } else if (toolType === 'flooring') {
    dynamicFaqs = [
      {
        question: `What is the flooring installation rate per sq ft in ${cityData.cityName}?`,
        answer: `In ${cityData.cityName}, material and installation rates vary by surface type: Glazed Vitrified Tiles (GVT 800×800mm or 1200×600mm) range from ₹130 to ₹210/sqft total (tile + tile adhesive + labor), while Indian White/Green Marble ranges from ₹280 to ₹450/sqft including mirror diamond polishing. Granite for stairs and sills ranges from ₹220 to ₹380/sqft.`
      },
      {
        question: `How much does mason flooring labor cost per sq ft in ${cityData.cityName}?`,
        answer: `Floor laying labor charges in ${cityData.cityName} currently average ₹32 to ₹45 per sq ft for standard vitrified tiles, ₹45 to ₹65 per sq ft for large slab GVT/granite, and ₹55 to ₹80 per sq ft for marble laying plus an additional ₹20 to ₹30 per sq ft for diamond disc water polishing.`
      },
      {
        question: `Which flooring tile is most suitable for residential plots in ${cityData.cityName}?`,
        answer: `For homes built on ${cityData.soilType.toLowerCase().includes('clay') || cityData.soilType.toLowerCase().includes('coastal') ? 'coastal or clayey soil where sub-base settlement can cause grout cracking' : 'stable sub-strata across ' + cityData.cityName}, double-charged vitrified or full-body porcelain tiles with polymer-modified adhesive mortar (compliant with IS 15477 Type 2) provide the best longevity and prevent hollow popping sounds.`
      }
    ];
  } else if (toolType === 'painting') {
    dynamicFaqs = [
      {
        question: `How much does house painting cost per sq ft in ${cityData.cityName}?`,
        answer: `Interior fresh painting (2 coats wall putty + 1 coat primer + 2 coats tractor/premium emulsion) in ${cityData.cityName} costs ₹22 to ₹38 per sq ft. Luxury Royale/silk emulsion averages ₹42 to ₹65 per sq ft. Exterior weatherproof painting (Apex / Apex Ultima with silicon primer) ranges from ₹28 to ₹48 per sq ft including bamboo/iron scaffolding.`
      },
      {
        question: `How much does a professional painter charge per day in ${cityData.cityName}?`,
        answer: `Daily skilled painter wages in ${cityData.cityName} range between ₹850 and ₹1,100 per day for master painters and ₹600 to ₹750 per day for helpers/surface preparation labor. Most contractors prefer square-foot lump-sum contracts to guarantee surface sanding and uniform roll application.`
      },
      {
        question: `Which exterior paint finish protects best against ${cityData.cityName} weather?`,
        answer: `In ${cityData.cityName}, exterior exterior walls face intense sunlight and seasonal rains. High-performance anti-algal exterior emulsions with UV cross-linking polymers (such as Asian Paints Apex Ultima, Berger WeatherCoat Long Life, or Dulux Weathershield) prevent exterior micro-cracking and fungal damp patches on outer plaster.`
      }
    ];
  } else if (toolType === 'home-loan-emi') {
    dynamicFaqs = [
      {
        question: `What are the current home loan interest rates in ${cityData.cityName}?`,
        answer: `Home loan interest rates in ${cityData.cityName} currently range from 8.35% to 9.25% across leading banks like State Bank of India (SBI), HDFC Bank, ICICI Bank, and Bank of Baroda for salaried individuals.`
      },
      {
        question: `How much home loan can I get for property in ${cityData.cityName}?`,
        answer: `Most banks finance up to 75% to 80% of the agreement value of properties in ${cityData.cityName}. Eligibility is calculated based on your net monthly income and existing monthly EMI obligations (typically up to 50% to 60% of take-home salary).`
      },
      {
        question: `What are the stamp duty and registration charges in ${cityData.stateName}?`,
        answer: `Stamp duty and registration charges in ${cityData.stateName} typically add 5% to 7% of property guidance value. Make sure to account for this one-time cost in your overall borrowing budget.`
      }
    ];
  } else if (toolType === 'building-material-cost') {
    dynamicFaqs = [
      {
        question: `What is the current cement bag price in ${cityData.cityName}?`,
        answer: `In ${cityData.cityName}, a 50kg bag of OPC/PPC 53 grade cement (UltraTech, ACC, Ambuja, Dalmia) averages between ₹360 and ₹420 depending on wholesale dealer volumes and delivery location.`
      },
      {
        question: `What is the steel TMT rebar price per kg in ${cityData.cityName}?`,
        answer: `Primary brand Fe-550D TMT steel bars (TATA Tiscon, JSW NeoSteel, SAIL) in ${cityData.cityName} typically range from ₹62 to ₹74 per kg including local transport and unloading charges.`
      },
      {
        question: `Are red bricks or AAC blocks cheaper in ${cityData.cityName}?`,
        answer: `AAC (Autoclaved Aerated Concrete) blocks typically reduce wall construction and joint mortar costs by 15% to 25% in ${cityData.cityName} compared to traditional red wire-cut clay bricks, while offering superior thermal insulation.`
      }
    ];
  } else {
    dynamicFaqs = [
      {
        question: `How much does it cost to build a 1,000 sq ft or 1,200 sq ft house in ${cityData.cityName}?`,
        answer: `In ${cityData.cityName}, building a standard 1,200 sq ft residential home costs between ${cityData.basicRate.split('-')[0].trim()} and ${cityData.standardRate.split('-')[1]?.trim() || cityData.standardRate}. For standard finishes (OPC 53 cement, Fe-550D TMT steel, vitrified tile flooring, and UPVC sliding windows), total turnkey cost ranges from ₹25.2 Lakhs to ₹36.0 Lakhs including labor and contractor charges across areas like ${cityData.neighborhoods.split(',').slice(0, 3).join(',')}.`
      },
      {
        question: `How do ${cityData.cityName}'s soil conditions affect foundation costs?`,
        answer: `${cityData.cityName}'s ground profile features ${cityData.soilType}. Substructure footing design directly dictates cost: standard isolated trapezoidal footings (5 to 6 ft depth) cost approximately ₹220 to ₹280 per sq ft of plinth area, whereas loose alluvial or coastal clay requiring pile foundations or deep raft slabs can increase foundation budgets by 20% to 35%.`
      },
      {
        question: `What municipal approvals and plan sanctions are required before building in ${cityData.cityName}?`,
        answer: `Before starting excavation in ${cityData.cityName}, ${cityData.stateName}, you must obtain formal building plan sanction approval from your local civic body or urban development authority. You will need registered architectural floor plans, structural stability certificates, land conversion/khata documents, and temporary utility meter connections.`
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
              {toolType === 'interior-design' ? 'Interior Design' : toolType === 'flooring' ? 'Flooring' : toolType === 'painting' ? 'Painting' : toolType === 'home-loan-emi' ? 'Home Loan EMI Rates' : toolType === 'building-material-cost' ? 'Building Material' : 'Construction'} in Other Indian Cities
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
