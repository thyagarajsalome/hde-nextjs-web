import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DUBAI_AREAS } from '@/data/dubaiAreas';
import DubaiLeadForm from '@/components/dubai/DubaiLeadForm';

const PROPERTY_TYPES = [
  { id: 'apartments', label: 'Apartments' },
  { id: 'villas', label: 'Villas' },
  { id: 'townhouses', label: 'Townhouses' },
  { id: 'penthouses', label: 'Penthouses' },
  { id: 'off-plan-properties', label: 'Off-Plan Properties' },
];

const BASE_URL = 'https://www.homedesignenglish.com';

function getUniquePropertyContent(typeId: string, areaName: string) {
  switch (typeId) {
    case 'apartments':
      return `Apartments in ${areaName} are highly sought after by professionals and expatriates looking for a modern lifestyle. They typically offer the highest rental yields in the community and give residents direct access to premium tower amenities like shared pools, fitness centers, and concierge services.`;
    case 'villas':
      return `Villas in ${areaName} provide the ultimate luxury living experience. Perfect for families, these spacious properties offer private gardens, multi-car garages, and significantly more privacy. The long-term capital appreciation on villa properties in this community is exceptionally strong.`;
    case 'townhouses':
      return `Townhouses in ${areaName} strike the perfect balance between apartment affordability and villa spaciousness. They are incredibly popular with growing families who want private outdoor space and multiple bedrooms, often clustered around excellent community parks.`;
    case 'penthouses':
      return `Penthouses in ${areaName} represent the pinnacle of Dubai real estate. Located at the top of the area's most prestigious towers, these ultra-luxury units offer panoramic skyline views, sprawling terraces, and bespoke designer interiors tailored for high-net-worth buyers.`;
    case 'off-plan-properties':
      return `Investing in off-plan properties in ${areaName} is one of the smartest ways to maximize ROI. Buyers can secure units at launch prices, benefit from flexible developer payment plans, and enjoy significant capital appreciation by the time the project reaches completion.`;
    default:
      return `Properties in ${areaName} represent a solid investment in Dubai's thriving real estate market.`;
  }
}

function getStartingPrice(typeId: string, area: typeof DUBAI_AREAS[0]) {
  switch (typeId) {
    case 'apartments':
      return area.priceRange.oneBed !== 'N/A' ? area.priceRange.oneBed : area.priceRange.studio;
    case 'townhouses':
      return area.priceRange.twoBed !== 'N/A' ? area.priceRange.twoBed : 'Contact Us';
    case 'penthouses':
      return area.priceRange.threeBed !== 'N/A' ? area.priceRange.threeBed : 'Contact Us';
    case 'villas':
      return area.priceRange.villa || 'Contact Us';
    case 'off-plan-properties':
      return area.priceRange.studio !== 'N/A' ? area.priceRange.studio : area.priceRange.oneBed;
    default:
      return 'Contact Us';
  }
}

function generateFAQs(typeId: string, areaName: string, rentalYield: string) {
  const faqs = [
    {
      question: `What is the average price of ${typeId.replace(/-/g, ' ')} in ${areaName}?`,
      answer: `Prices vary based on size, floor, and view. Use our free Dubai Property Cost Calculator for a detailed breakdown of all buying costs including DLD fees, agent commission, and mortgage charges.`
    },
    {
      question: `Is ${areaName} a good area to buy ${typeId.replace(/-/g, ' ')}?`,
      answer: `${areaName} offers rental yields of ${rentalYield}, which is competitive compared to global averages of 2-4%. However, investment involves risk. Always verify current regulations and seek professional advice.`
    },
    {
      question: `Can foreigners buy ${typeId.replace(/-/g, ' ')} in ${areaName}?`,
      answer: `Yes. ${areaName} is a designated freehold area where foreign nationals can buy, sell, and lease property with full ownership rights. Properties worth AED 2M+ may also qualify for a 10-year UAE Golden Visa.`
    }
  ];
  return faqs;
}

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  
  DUBAI_AREAS.forEach(area => {
    PROPERTY_TYPES.forEach(pt => {
      params.push({ slug: `${pt.id}-for-sale-in-${area.slug}` });
    });
  });

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  let currentArea = null;
  let currentType = null;

  for (const area of DUBAI_AREAS) {
    for (const pt of PROPERTY_TYPES) {
      if (slug === `${pt.id}-for-sale-in-${area.slug}`) {
        currentArea = area;
        currentType = pt;
      }
    }
  }

  if (!currentArea || !currentType) return { title: 'Not Found' };

  const title = `${currentType.label} for Sale in ${currentArea.name} | ROI & Prices`;
  const description = `Looking for ${currentType.label.toLowerCase()} in ${currentArea.name}? Compare prices, rental yields (${currentArea.rentalYield}), and find the best investment properties in Dubai.`;
  const pageUrl = `${BASE_URL}/dubai-property/buy/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Home Design English',
      type: 'website',
      images: [{ url: `${BASE_URL}/images/dubai-skyline.jpg`, width: 1200, height: 630, alt: `${currentType.label} in ${currentArea.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/images/dubai-skyline.jpg`],
    },
  };
}

export default async function BuyPropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let currentArea = null;
  let currentType = null;

  for (const area of DUBAI_AREAS) {
    for (const pt of PROPERTY_TYPES) {
      if (slug === `${pt.id}-for-sale-in-${area.slug}`) {
        currentArea = area;
        currentType = pt;
      }
    }
  }

  if (!currentArea || !currentType) {
    notFound();
  }

  const faqs = generateFAQs(currentType.id, currentArea.name, currentArea.rentalYield);
  const siblingTypes = PROPERTY_TYPES.filter(pt => pt.id !== currentType.id);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Dubai Property', item: `${BASE_URL}/dubai-property` },
      { '@type': 'ListItem', position: 3, name: currentArea.name, item: `${BASE_URL}/dubai-property/areas/${currentArea.slug}` },
      { '@type': 'ListItem', position: 4, name: `${currentType.label} in ${currentArea.name}`, item: `${BASE_URL}/dubai-property/buy/${slug}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="text-xs text-gray-500 dark:text-zinc-400 mb-2 flex items-center space-x-2">
            <Link href="/" className="hover:text-primary dark:hover:text-primary">Home</Link>
            <span>&gt;</span>
            <Link href="/dubai-property" className="hover:text-primary dark:hover:text-primary">Dubai Property</Link>
            <span>&gt;</span>
            <Link href={`/dubai-property/areas/${currentArea.slug}`} className="hover:text-primary dark:hover:text-primary">{currentArea.name}</Link>
            <span>&gt;</span>
            <span className="text-gray-900 dark:text-zinc-100">{currentType.label}</span>
          </nav>
          
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-zinc-100 mt-2">
            {currentType.label} for Sale in {currentArea.name}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2 text-sm md:text-base">
            Discover premium {currentType.label.toLowerCase()} in {currentArea.name}. Analyze average prices, rental yields, and investment potential.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          {/* Investment Overview */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Investment Overview</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">Average Rental Yield</p>
                  <p className="text-xl font-bold text-primary">{currentArea.rentalYield}</p>
               </div>
               <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">Starting Price</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-zinc-100">
                    {getStartingPrice(currentType.id, currentArea)}
                  </p>
               </div>
            </div>
            
            <p className="text-gray-700 dark:text-zinc-300 mt-4 text-sm leading-relaxed">
              {currentArea.description}
            </p>
            <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10">
              <p className="text-gray-800 dark:text-zinc-200 text-sm leading-relaxed font-medium">
                <i className="fas fa-chart-line text-primary mr-2"></i>
                {getUniquePropertyContent(currentType.id, currentArea.name)}
              </p>
            </div>
          </div>

          {/* Why This Area */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
             <h3 className="text-md font-bold text-slate-900 dark:text-zinc-100 mb-3">Why {currentArea.name}?</h3>
             <ul className="space-y-2 text-sm">
               {currentArea.lifestyle.slice(0,4).map((item, i) => (
                 <li key={i} className="flex items-center gap-2">
                   <i className="fas fa-check text-primary"></i> <span className="text-gray-700 dark:text-zinc-300">{item}</span>
                 </li>
               ))}
             </ul>
             <div className="mt-4">
               <Link href={`/dubai-property/areas/${currentArea.slug}`} className="text-primary text-sm font-semibold hover:underline">
                 <i className="fas fa-arrow-right mr-1"></i> Read Full {currentArea.name} Area Guide
               </Link>
             </div>
          </div>

          {/* Cross-Links: Other Property Types in This Area */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-md font-bold text-slate-900 dark:text-zinc-100 mb-3">
              Also in {currentArea.name}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {siblingTypes.map(pt => (
                <Link
                  key={pt.id}
                  href={`/dubai-property/buy/${pt.id}-for-sale-in-${currentArea.slug}`}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-gray-100 dark:border-zinc-800"
                >
                  <i className="fas fa-building text-primary text-sm"></i>
                  <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">{pt.label}</span>
                </Link>
              ))}
              <Link
                href="/dubai-property/calculator"
                className="flex items-center gap-2 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors border border-primary/20"
              >
                <i className="fas fa-calculator text-primary text-sm"></i>
                <span className="text-sm font-semibold text-primary">Cost Calculator</span>
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-md font-bold text-slate-900 dark:text-zinc-100 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-1">{faq.question}</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Form Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <DubaiLeadForm source={`${currentType.id}-for-sale-in-${currentArea.slug}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
