import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DubaiLeadForm from '@/components/dubai/DubaiLeadForm';

import { DUBAI_AREAS } from '@/data/dubaiAreas';


export function generateStaticParams() {
  return DUBAI_AREAS.map((area) => ({
    slug: area.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = DUBAI_AREAS.find((a) => a.slug === slug);
  if (!area) return { title: 'Area Not Found | Dubai Property Guide' };

  return {
    title: `${area.name} Area Guide & Property Prices | HDE`,
    description: `Comprehensive guide to ${area.name}. Explore property prices, rental yields, amenities, and lifestyle for ${area.name}, Dubai.`,
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = DUBAI_AREAS.find((a) => a.slug === slug);

  if (!area) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homedesignenglish.com' },
      { '@type': 'ListItem', position: 2, name: 'Dubai Property', item: 'https://www.homedesignenglish.com/dubai-property' },
      { '@type': 'ListItem', position: 3, name: 'Areas', item: 'https://www.homedesignenglish.com/dubai-property/areas' },
      { '@type': 'ListItem', position: 4, name: area.name, item: `https://www.homedesignenglish.com/dubai-property/areas/${area.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <div className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs text-gray-500 dark:text-zinc-400 mb-2 flex items-center space-x-2">
            <Link href="/" className="hover:text-primary dark:hover:text-primary">Home</Link>
            <span>&gt;</span>
            <Link href="/dubai-property" className="hover:text-primary dark:hover:text-primary">Dubai Property</Link>
            <span>&gt;</span>
            <span className="text-gray-900 dark:text-zinc-100">{area.name}</span>
          </nav>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-1">
            <span className="mr-2 text-gray-400 dark:text-zinc-500"><i className={area.icon}></i></span>
            {area.name}
          </h1>
          <p className="text-base text-gray-600 dark:text-zinc-400">{area.tagline}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Overview Section */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Overview</h2>
          <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{area.description}</p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">Best For</h3>
              <div className="flex flex-wrap gap-1.5">
                {area.bestFor.map((item) => (
                  <span key={item} className="px-2.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 rounded-md text-xs font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-1.5">Property Types</h3>
              <div className="flex flex-wrap gap-1.5">
                {area.propertyTypes.map((item) => (
                  <span key={item} className="px-2.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-md text-xs font-medium border border-gray-200 dark:border-zinc-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Price Guide Table */}
        <section className="space-y-4 bg-white dark:bg-zinc-950 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Estimated Property Prices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <th className="py-2 px-4 text-gray-500 dark:text-zinc-400 font-semibold">Property Type</th>
                  <th className="py-2 px-4 text-gray-500 dark:text-zinc-400 font-semibold">Starting Price</th>
                </tr>
              </thead>
              <tbody>
                {area.priceRange.studio !== 'N/A' && (
                  <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                    <td className="py-2 px-4 font-medium text-gray-800 dark:text-zinc-200">Studio</td>
                    <td className="py-2 px-4 text-primary dark:text-blue-400 font-semibold">{area.priceRange.studio}</td>
                  </tr>
                )}
                {area.priceRange.oneBed !== 'N/A' && (
                  <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                    <td className="py-2 px-4 font-medium text-gray-800 dark:text-zinc-200">1 Bedroom</td>
                    <td className="py-2 px-4 text-primary dark:text-blue-400 font-semibold">{area.priceRange.oneBed}</td>
                  </tr>
                )}
                {area.priceRange.twoBed !== 'N/A' && (
                  <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                    <td className="py-2 px-4 font-medium text-gray-800 dark:text-zinc-200">2 Bedroom</td>
                    <td className="py-2 px-4 text-primary dark:text-blue-400 font-semibold">{area.priceRange.twoBed}</td>
                  </tr>
                )}
                {area.priceRange.threeBed && area.priceRange.threeBed !== 'N/A' && (
                  <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                    <td className="py-2 px-4 font-medium text-gray-800 dark:text-zinc-200">3 Bedroom</td>
                    <td className="py-2 px-4 text-primary dark:text-blue-400 font-semibold">{area.priceRange.threeBed}</td>
                  </tr>
                )}
                {area.priceRange.villa && area.priceRange.villa !== 'N/A' && (
                  <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                    <td className="py-2 px-4 font-medium text-gray-800 dark:text-zinc-200">Villas / Townhouses</td>
                    <td className="py-2 px-4 text-primary dark:text-blue-400 font-semibold">{area.priceRange.villa}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-primary/5 dark:bg-primary/10 p-3 rounded-lg mt-4">
            <div className="mb-3 sm:mb-0">
              <span className="block text-xs text-primary dark:text-blue-400 font-semibold uppercase tracking-wide">Estimated Rental Yield</span>
              <span className="text-xl font-bold text-gray-900 dark:text-zinc-100">{area.rentalYield}</span>
            </div>
            <Link 
              href="/dubai-property/calculator" 
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto text-center"
            >
              Calculate your buying costs &rarr;
            </Link>
          </div>
        </section>

        {/* Location & Lifestyle Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Location & Transport</h2>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Nearby Landmarks</h3>
              <ul className="space-y-1">
                {area.nearbyLandmarks.map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 mt-4">Transport Options</h3>
              <ul className="space-y-1">
                {area.transport.map((item) => (
                  <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Shopping & Malls</h2>
            <ul className="space-y-1">
              {area.malls.map((item) => (
                <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mt-6">Airport Access</h2>
            <ul className="space-y-1">
              {area.airports.map((item) => (
                <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                  <i className="fas fa-plane text-primary/60 mr-2 text-xs"></i>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Lifestyle & Amenities</h2>
            <ul className="space-y-1">
              {area.lifestyle.map((item) => (
                <li key={item} className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
                  <i className="fas fa-check text-primary/80 mr-2 text-xs"></i>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Investment Considerations */}
        <section className="space-y-4 bg-primary/5 dark:bg-primary/10 p-5 rounded-xl border border-primary/20 dark:border-primary/30">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Investment Considerations</h2>
          <ul className="space-y-2">
            {area.considerations.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <i className="fas fa-exclamation-circle text-primary mr-2 mt-0.5 text-sm"></i>
                <span className="text-gray-800 dark:text-zinc-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {area.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-1">{faq.question}</h3>
                <p className="text-sm text-gray-700 dark:text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Linking Section */}
        <section className="space-y-4 pt-6 border-t dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Explore More Dubai Areas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DUBAI_AREAS.filter(a => a.slug !== area.slug).map((otherArea) => (
              <Link 
                key={otherArea.slug} 
                href={`/dubai-property/areas/${otherArea.slug}`}
                className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-primary dark:hover:border-primary hover:shadow-sm transition-all text-center flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-xl text-gray-400 dark:text-zinc-500"><i className={otherArea.icon}></i></span>
                <span className="text-xs font-semibold text-gray-900 dark:text-zinc-300">{otherArea.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-gray-500 text-center pt-12">
          Disclaimer: All prices and yields are estimates based on publicly available market data as of September 2026. Actual prices vary. Verify current pricing with a licensed real estate agent.
        </p>

      </div>
    </div>
  );
}
