import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/config/supabaseClient';
import USARentVsBuyCalculator from '@/features/construction/USARentVsBuyCalculator';
import USAPropertyTaxCalculator from '@/features/construction/USAPropertyTaxCalculator';
import USASalaryCalculator from '@/features/construction/USASalaryCalculator';
import USARemodelROICalculator from '@/features/construction/USARemodelROICalculator';
import USAKitchenRemodelCalculator from '@/features/construction/USAKitchenRemodelCalculator';
import USAHomeAdditionCalculator from '@/features/construction/USAHomeAdditionCalculator';
import USASwimmingPoolCalculator from '@/features/construction/USASwimmingPoolCalculator';
import USAPickleballCalculator from '@/features/construction/USAPickleballCalculator';
import USAOutdoorKitchenCalculator from '@/features/construction/USAOutdoorKitchenCalculator';

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
    params.push({ slug: `kitchen-remodel-in-${loc.slug}` });
    params.push({ slug: `home-addition-in-${loc.slug}` });
    params.push({ slug: `swimming-pool-cost-in-${loc.slug}` });
    params.push({ slug: `pickleball-court-cost-in-${loc.slug}` });
    params.push({ slug: `outdoor-kitchen-cost-in-${loc.slug}` });
  }

  return params;
}

// Helper to parse slug
function parseSlug(slug: string) {
  if (!slug) return null;
  const match = slug.match(/^(rent-vs-buy|property-tax|salary-needed-to-buy|remodel-roi|kitchen-remodel|home-addition|swimming-pool-cost|pickleball-court-cost|outdoor-kitchen-cost)-in-(.+)$/);
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

  if (!location) {
    // Dynamic fallback for missing cities in state hubs
    const stateSuffixes = ['-texas', '-california', '-florida', '-georgia', '-washington', '-arizona', '-illinois', '-colorado', '-north-carolina', '-tennessee', '-nevada', '-utah'];
    for (const suffix of stateSuffixes) {
      if (citySlug.endsWith(suffix)) {
        const rawCity = citySlug.slice(0, -suffix.length);
        const formatWord = (str: string) => str.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        location = {
          slug: citySlug,
          city_name: formatWord(rawCity),
          state_name: formatWord(suffix.replace('-', '')),
          country: 'USA'
        };
        break;
      }
    }
  }

  if (!location) return { title: 'Not Found' };

  let titlePrefix = '';
  if (toolType === 'rent-vs-buy') titlePrefix = 'Rent vs. Buy Calculator';
  else if (toolType === 'property-tax') titlePrefix = 'Property Tax Calculator';
  else if (toolType === 'salary-needed-to-buy') titlePrefix = 'Salary Needed to Buy a House';
  else if (toolType === 'remodel-roi') titlePrefix = 'Remodel ROI Calculator';
  else if (toolType === 'kitchen-remodel') titlePrefix = 'Kitchen Remodel Cost Estimator';
  else if (toolType === 'home-addition') titlePrefix = 'Home Addition Cost Estimator';
  else if (toolType === 'swimming-pool-cost') titlePrefix = 'Swimming Pool Cost Estimator';
  else if (toolType === 'pickleball-court-cost') titlePrefix = 'Pickleball Court Cost Estimator';
  else if (toolType === 'outdoor-kitchen-cost') titlePrefix = 'Outdoor Kitchen Cost Estimator';

  return {
    title: `${titlePrefix} in ${location.city_name}, ${location.state_name} | HDE`,
    description: `Use our free ${titlePrefix.toLowerCase()} for ${location.city_name}, ${location.state_name} to make informed real estate decisions.`,
  };
}

const ALL_TOOLS = [
  { id: 'rent-vs-buy', name: 'Rent vs. Buy', icon: '🏠' },
  { id: 'property-tax', name: 'Property Tax', icon: '📋' },
  { id: 'salary-needed-to-buy', name: 'Salary Needed', icon: '💰' },
  { id: 'remodel-roi', name: 'Remodel ROI', icon: '📈' },
  { id: 'kitchen-remodel', name: 'Kitchen Remodel', icon: '🍳' },
  { id: 'home-addition', name: 'Home Addition', icon: '🏗️' },
  { id: 'swimming-pool-cost', name: 'Swimming Pool', icon: '🏊' },
  { id: 'pickleball-court-cost', name: 'Pickleball Court', icon: '🏓' },
  { id: 'outdoor-kitchen-cost', name: 'Outdoor Kitchen', icon: '🔥' },
];

function getSampleCalculation(toolType: string, cityName: string, stateName: string) {
  switch (toolType) {
    case 'rent-vs-buy':
      return {
        description: `This sample compares buying a $400,000 home versus renting in ${cityName}, ${stateName} over a 5-year period.`,
        data: [
          { label: 'Home Price', value: '$400,000' },
          { label: 'Down Payment (20%)', value: '$80,000' },
          { label: 'Mortgage Rate', value: '6.5%' },
          { label: 'Monthly PITI', value: '~$2,500' },
          { label: 'Monthly Rent', value: '~$2,100' },
          { label: '5-year equity built', value: '~$38,000' },
        ],
        verdict: 'In this scenario, buying builds $38,000 in equity over 5 years, offsetting the higher monthly cost.'
      };
    case 'property-tax':
      return {
        description: `Estimated annual property taxes for a sample home in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Assessed Home Value', value: '$350,000' },
          { label: 'Estimated Tax Rate', value: '1.8%' },
          { label: 'Annual Property Tax', value: '~$6,300' },
          { label: 'Monthly Tax Escrow', value: '~$525' },
          { label: 'Annual Home Insurance', value: '~$1,200' },
        ],
        verdict: 'Expect to add approximately $525 to your monthly mortgage payment for property tax escrow.'
      };
    case 'salary-needed-to-buy':
      return {
        description: `Income required to afford a $450,000 home using the standard 28/36 debt-to-income (DTI) rule in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Home Price', value: '$450,000' },
          { label: 'Monthly PITI', value: '~$2,200' },
          { label: 'DTI Target', value: '28%' },
          { label: 'Required Annual Salary', value: '~$95,000' },
        ],
        verdict: 'A household income of ~$95,000 is recommended to comfortably afford a $450,000 home.'
      };
    case 'remodel-roi':
      return {
        description: `Estimated Return on Investment for a mid-range kitchen remodel in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Project Type', value: 'Mid-Range Kitchen' },
          { label: 'Remodel Cost', value: '$35,000' },
          { label: 'Added Home Value', value: '$28,000' },
          { label: 'Estimated ROI', value: '80%' },
        ],
        verdict: 'Kitchen remodels typically recover about 80% of their cost when selling the home.'
      };
    case 'kitchen-remodel':
      return {
        description: `Cost breakdown for remodeling a sample 10x12 kitchen in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Cabinets', value: '$8,000' },
          { label: 'Countertops', value: '$4,500' },
          { label: 'Appliances', value: '$6,000' },
          { label: 'Labor', value: '$12,000' },
          { label: 'Total Estimated Cost', value: '~$30,500' },
        ],
        verdict: 'A standard 10x12 kitchen remodel typically costs around $30,500 depending on materials and labor rates.'
      };
    case 'home-addition':
      return {
        description: `Estimated cost for a standard 400 square foot home addition in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Size', value: '400 sq. ft.' },
          { label: 'Cost per sq. ft.', value: '$200 - $350' },
          { label: 'Low-End Total', value: '$80,000' },
          { label: 'High-End Total', value: '$140,000' },
        ],
        verdict: 'Adding 400 square feet usually ranges from $80,000 to $140,000 depending on finishes and structural requirements.'
      };
    case 'swimming-pool-cost':
      return {
        description: `Estimated cost for a sample 15x30 gunite swimming pool in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Pool Type', value: '15x30 Gunite' },
          { label: 'Excavation', value: '$5,000' },
          { label: 'Pool Shell', value: '$25,000' },
          { label: 'Decking', value: '$8,000' },
          { label: 'Total Estimated Cost', value: '~$55,000' },
        ],
        verdict: 'A standard 15x30 gunite pool installation typically costs around $55,000.'
      };
    case 'pickleball-court-cost':
      return {
        description: `Estimated cost for a 30x60 post-tension concrete pickleball court in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Size', value: '30x60 feet' },
          { label: 'Concrete Base', value: '$16,000' },
          { label: 'Surface & Lines', value: '$5,000' },
          { label: 'Fencing', value: '$6,000' },
          { label: 'Lighting', value: '$7,000' },
          { label: 'Total Estimated Cost', value: '~$34,000' },
        ],
        verdict: 'Expect to spend approximately $34,000 for a fully equipped residential pickleball court.'
      };
    case 'outdoor-kitchen-cost':
      return {
        description: `Estimated cost for a mid-range outdoor kitchen setup in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Project Type', value: 'Mid-Range Outdoor Kitchen' },
          { label: 'Masonry & Framework', value: '$8,000' },
          { label: 'Appliances (Grill, Fridge)', value: '$12,000' },
          { label: 'Countertops', value: '$4,000' },
          { label: 'Utilities (Gas, Electric)', value: '$4,000' },
          { label: 'Total Estimated Cost', value: '~$28,000' },
        ],
        verdict: 'A complete mid-range outdoor kitchen typically costs around $28,000 to construct.'
      };
    default:
      return null;
  }
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

  if (!location) {
    // Dynamic fallback for missing cities in state hubs
    const stateSuffixes = ['-texas', '-california', '-florida', '-georgia', '-washington', '-arizona', '-illinois', '-colorado', '-north-carolina', '-tennessee', '-nevada', '-utah'];
    for (const suffix of stateSuffixes) {
      if (citySlug.endsWith(suffix)) {
        const rawCity = citySlug.slice(0, -suffix.length);
        const formatWord = (str: string) => str.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        location = {
          slug: citySlug,
          city_name: formatWord(rawCity),
          state_name: formatWord(suffix.replace('-', '')),
          country: 'USA'
        };
        break;
      }
    }
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
  } else if (toolType === 'kitchen-remodel') {
    toolName = 'Kitchen Remodel Cost Estimator';
    CalculatorComponent = USAKitchenRemodelCalculator;
  } else if (toolType === 'home-addition') {
    toolName = 'Home Addition Cost Estimator';
    CalculatorComponent = USAHomeAdditionCalculator;
  } else if (toolType === 'swimming-pool-cost') {
    toolName = 'Swimming Pool Cost Estimator';
    CalculatorComponent = USASwimmingPoolCalculator;
  } else if (toolType === 'pickleball-court-cost') {
    toolName = 'Pickleball Court Cost Estimator';
    CalculatorComponent = USAPickleballCalculator;
  } else if (toolType === 'outdoor-kitchen-cost') {
    toolName = 'Outdoor Kitchen Cost Estimator';
    CalculatorComponent = USAOutdoorKitchenCalculator;
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
  } else if (toolType === 'kitchen-remodel') {
    faqs.push({
      question: `How much does a kitchen remodel cost in ${location.city_name}?`,
      answer: `The cost varies significantly based on size and materials. Use our ${location.city_name} Kitchen Remodel Estimator above to get a breakdown of cabinets, countertops, and labor costs.`
    });
    faqs.push({
      question: `Do I need a permit for a kitchen remodel in ${location.city_name}?`,
      answer: `Usually, yes. If you are moving plumbing or electrical lines, ${location.city_name} building codes require permits. Replacing cabinets or countertops generally does not require a permit.`
    });
  } else if (toolType === 'home-addition') {
    faqs.push({
      question: `How much does it cost to add a room in ${location.city_name}?`,
      answer: `Costs depend on whether you are building a sunroom, a bedroom, or a second story. Use our Home Addition Cost Estimator to check local pricing for ${location.city_name}, ${location.state_name}.`
    });
  } else if (toolType === 'swimming-pool-cost') {
    faqs.push({
      question: `How much does it cost to build a pool in ${location.city_name}?`,
      answer: `The cost of pool construction in ${location.city_name} depends heavily on the material (gunite vs fiberglass) and size. Use our Swimming Pool Cost Estimator above to get a tailored estimate.`
    });
    faqs.push({
      question: `Who are the best pool builders in ${location.city_name}?`,
      answer: `When looking for pool contractors in ${location.city_name}, ${location.state_name}, always ensure they are fully licensed and bonded. Get at least 3 quotes and compare them against our cost estimator.`
    });
  } else if (toolType === 'pickleball-court-cost') {
    faqs.push({
      question: `What are the standard dimensions for a pickleball court in ${location.city_name}?`,
      answer: `The standard size for a pickleball court is 20 feet wide by 44 feet long. However, it's recommended to have a total playing area of 30 feet by 60 feet in ${location.city_name} to allow room for out-of-bounds play.`
    });
    faqs.push({
      question: `Will a pickleball court increase my property value in ${location.city_name}?`,
      answer: `Yes, adding a pickleball court can increase your property value in ${location.city_name}, ${location.state_name}. It's a highly sought-after amenity that appeals to buyers of all ages.`
    });
  } else if (toolType === 'outdoor-kitchen-cost') {
    faqs.push({
      question: `Do I need a permit to build an outdoor kitchen in ${location.city_name}?`,
      answer: `In ${location.city_name}, permits are typically required for outdoor kitchens, especially if you are running new electrical, gas, or plumbing lines.`
    });
    faqs.push({
      question: `What is the ROI of an outdoor kitchen in ${location.city_name}?`,
      answer: `An outdoor kitchen in ${location.city_name}, ${location.state_name} can offer an ROI of 55% to 200%, depending on the quality of materials and features.`
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

      {/* Static Sample Calculation Section for SEO */}
      {(() => {
        const sample = getSampleCalculation(toolType, location.city_name, location.state_name);
        if (!sample) return null;
        return (
          <div className="max-w-4xl mx-auto py-12 px-4 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Sample {toolName} for {location.city_name}, {location.state_name}
            </h2>
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              {sample.description}
            </p>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {sample.data.map((item, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center">
                    <span className="text-gray-600 font-medium">{item.label}</span>
                    <span className="text-gray-900 font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-primary-700 font-semibold text-lg">
              {sample.verdict}
            </p>
          </div>
        );
      })()}

      {/* Related Tools Cross-Linking Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 border-t border-gray-200 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          More Real Estate Tools for {location.city_name}, {location.state_name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ALL_TOOLS.filter(t => t.id !== toolType).map(tool => (
            <a 
              key={tool.id} 
              href={`/real-estate/${tool.id}-in-${citySlug}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all flex items-center gap-4 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{tool.icon}</span>
              <span className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                {tool.name}
              </span>
            </a>
          ))}
        </div>
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
