import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/config/supabaseClient';
import USARentVsBuyCalculator from '@/features/construction/USARentVsBuyCalculator';
import USAPropertyTaxCalculator from '@/features/construction/USAPropertyTaxCalculator';
import USASalaryCalculator from '@/features/construction/USASalaryCalculator';

import USARemodelROICalculator from '@/features/construction/USARemodelROICalculator';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static routes for all USA locations x 4 tools

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

export async function generateStaticParams() {
  const { data: dbLocations } = await supabase
    .from('pseo_locations')
    .select('slug')
    .eq('country', 'USA');

  let locations = dbLocations || [];
  if (locations.length === 0) {
    locations = USA_CITIES_FALLBACK;
  } else {
    const existingSlugs = new Set(locations.map(l => l.slug));
    const toAdd = USA_CITIES_FALLBACK.filter(c => !existingSlugs.has(c.slug));
    locations = [...locations, ...toAdd];
  }



  const params: { slug: string }[] = [];
  for (const loc of locations) {
    params.push({ slug: `rent-vs-buy-in-${loc.slug}` });
    params.push({ slug: `property-tax-in-${loc.slug}` });
    params.push({ slug: `salary-needed-to-buy-in-${loc.slug}` });
    params.push({ slug: `remodel-roi-in-${loc.slug}` });
  }

  return params;
}

// Helper to parse slug
function parseSlug(slug: string) {
  if (!slug) return null;
  const match = slug.match(/^(rent-vs-buy|property-tax|salary-needed-to-buy|remodel-roi)-in-(.+)$/);
  if (!match) return null;
  return {
    toolType: match[1],
    citySlug: match[2],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const parsed = parseSlug(resolvedParams.slug);
  if (!parsed) return { title: 'Not Found' };

  const { toolType, citySlug } = parsed;


  let location = null;
  const { data: dbLoc } = await supabase
    .from('pseo_locations')
    .select('city_name, state_name')
    .eq('slug', citySlug)
    .single();
    
  if (dbLoc) {
    location = dbLoc;
  } else {
    location = USA_CITIES_FALLBACK.find(c => c.slug === citySlug);
  }


  if (!location) return { title: 'Not Found' };

  let titlePrefix = '';
  if (toolType === 'rent-vs-buy') titlePrefix = 'Rent vs. Buy Calculator';
  else if (toolType === 'property-tax') titlePrefix = 'Property Tax Calculator';
  else if (toolType === 'salary-needed-to-buy') titlePrefix = 'Salary Needed to Buy a House';
  else if (toolType === 'remodel-roi') titlePrefix = 'Remodel ROI Calculator';

  return {
    title: `${titlePrefix} in ${location.city_name}, ${location.state_name} | HDE`,
    description: `Use our free ${titlePrefix.toLowerCase()} for ${location.city_name}, ${location.state_name} to make informed real estate decisions.`,
  };
}

export default async function RealEstateToolPage({ params }: PageProps) {
  const resolvedParams = await params;
  const parsed = parseSlug(resolvedParams.slug);
  if (!parsed) notFound();

  const { toolType, citySlug } = parsed;


  let location = null;
  const { data: dbLoc } = await supabase
    .from('pseo_locations')
    .select('*')
    .eq('slug', citySlug)
    .single();
    
  if (dbLoc) {
    location = dbLoc;
  } else {
    location = USA_CITIES_FALLBACK.find(c => c.slug === citySlug);
  }


  if (!location) notFound();

  let toolName = '';
  let CalculatorComponent = null;

  if (toolType === 'rent-vs-buy') {
    toolName = 'Rent vs. Buy Calculator';
    CalculatorComponent = USARentVsBuyCalculator;
  } else if (toolType === 'property-tax') {
    toolName = 'Property Tax Calculator';
    CalculatorComponent = USAPropertyTaxCalculator;
  } else if (toolType === 'salary-needed-to-buy') {
    toolName = 'Salary Needed to Buy a House';
    CalculatorComponent = USASalaryCalculator;
  } else if (toolType === 'remodel-roi') {
    toolName = 'Remodel ROI Calculator';
    CalculatorComponent = USARemodelROICalculator;
  }

  const faqs = [];
  if (toolType === 'rent-vs-buy') {
    faqs.push({
      question: `Is it better to rent or buy in ${location.city_name} right now?`,
      answer: `The decision to rent or buy in ${location.city_name}, ${location.state_name} depends on your current interest rate, property tax rate, and how long you plan to stay. Use our calculator above to compare the exact 5-year cost of renting versus building equity through a mortgage in the local ${location.city_name} market.`
    });
    faqs.push({
      question: `How much down payment do I need for a house in ${location.city_name}?`,
      answer: `While the traditional down payment is 20%, many lenders in ${location.state_name} offer conventional loans for as little as 3-5% down, and FHA loans at 3.5%. Keep in mind that putting down less than 20% in ${location.city_name} will usually require Private Mortgage Insurance (PMI).`
    });
  } else if (toolType === 'property-tax') {
    faqs.push({
      question: `How are property taxes calculated in ${location.city_name}?`,
      answer: `Property taxes in ${location.city_name}, ${location.state_name} are calculated based on the assessed value of your home multiplied by the local tax rate. This rate funds local services like public schools, infrastructure, and emergency services.`
    });
    faqs.push({
      question: `Does my monthly mortgage payment include ${location.city_name} property taxes?`,
      answer: `Yes, in most cases. If you have an escrow account, your lender will collect a portion of your annual ${location.city_name} property tax every month along with your principal and interest, and they will pay the tax bill on your behalf when it is due.`
    });
  } else if (toolType === 'salary-needed-to-buy') {
    faqs.push({
      question: `What salary do I need to afford a median home in ${location.city_name}?`,
      answer: `The exact salary needed depends on the current interest rates and your debt-to-income (DTI) ratio. Lenders generally recommend that your housing payment (PITI) does not exceed 28% of your gross monthly income in ${location.city_name}.`
    });
  } else if (toolType === 'remodel-roi') {
    faqs.push({
      question: `What home renovations add the most value in ${location.city_name}?`,
      answer: `In ${location.city_name}, ${location.state_name}, kitchen remodels, bathroom updates, and adding usable square footage typically yield the highest Return on Investment (ROI) when it comes time to sell your property.`
    });
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `${toolName} - ${location.city_name}`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "description": `Use our free ${toolName.toLowerCase()} for ${location.city_name}, ${location.state_name}.`,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
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
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {toolName} for {location.city_name}, {location.state_name}
          </h1>
          <p className="text-xl text-primary-50">
            Make informed decisions about real estate in {location.city_name} with our precise calculator tools.
          </p>
        </div>
      </div>

      {/* Calculator Container */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        {CalculatorComponent && <CalculatorComponent />}
      </div>

      {/* Dynamic FAQ Section */}
      {faqs.length > 0 && (
        <div className="max-w-4xl mx-auto py-12 px-4 border-t border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
