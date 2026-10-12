import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'USA Real Estate Calculators & Construction Cost Estimators (2026) | HDE',
  description: 'Free, accurate 2026 real estate and remodeling calculators for top US markets. Calculate rent vs. buy, property taxes, kitchen remodels, swimming pools, additions, and more.',
  alternates: {
    canonical: '/real-estate',
  },
  openGraph: {
    title: 'USA Real Estate Calculators & Construction Cost Estimators (2026) | HDE',
    description: 'Free, accurate 2026 real estate and remodeling calculators for top US markets.',
    url: '/real-estate',
    type: 'website',
  },
};

const TOOLS = [
  {
    id: 'rent-vs-buy',
    name: 'Rent vs. Buy Calculator',
    icon: '🏠',
    description: 'Compare 5-year total costs, mortgage principal equity buildup, and rent inflation across local markets.',
    sampleQuery: 'rent-vs-buy-in-austin-texas',
    badge: 'Popular',
  },
  {
    id: 'property-tax',
    name: 'Property Tax Calculator',
    icon: '📋',
    description: 'Estimate effective county and municipal tax rates, monthly escrow reserves, and homestead exemptions.',
    sampleQuery: 'property-tax-in-dallas-texas',
    badge: 'Essential',
  },
  {
    id: 'salary-needed-to-buy',
    name: 'Salary Needed to Buy',
    icon: '💰',
    description: 'Calculate qualifying gross annual income based on local median home prices and standard 28/36 DTI rules.',
    sampleQuery: 'salary-needed-to-buy-in-miami-florida',
    badge: 'Finance',
  },
  {
    id: 'remodel-roi',
    name: 'Remodel ROI Calculator',
    icon: '📈',
    description: 'Discover how much equity value top renovations add at resale based on regional cost-vs-value data.',
    sampleQuery: 'remodel-roi-in-los-angeles-california',
    badge: 'Investment',
  },
  {
    id: 'kitchen-remodel',
    name: 'Kitchen Remodel Cost Estimator',
    icon: '🍳',
    description: 'Detailed budgeting for cabinets, quartz countertops, appliances, and licensed trade labor.',
    sampleQuery: 'kitchen-remodel-in-houston-texas',
    badge: 'Remodel',
  },
  {
    id: 'bathroom-remodel',
    name: 'Bathroom Remodel Cost Estimator',
    icon: '🛁',
    description: 'Estimate primary suite and guest bath renovation costs: plumbing fixtures, tile, vanities, and electrical.',
    sampleQuery: 'bathroom-remodel-in-seattle-washington',
    badge: 'Remodel',
  },
  {
    id: 'home-addition',
    name: 'Home Addition Cost Estimator',
    icon: '🏗️',
    description: 'Per-square-foot cost breakdowns for master suites, sunrooms, second-story bump-outs, and foundations.',
    sampleQuery: 'home-addition-in-chicago-illinois',
    badge: 'Building',
  },
  {
    id: 'swimming-pool-cost',
    name: 'Swimming Pool Cost Estimator',
    icon: '🏊',
    description: 'Compare gunite, fiberglass, and vinyl pool packages, excavation, coping, pumps, and decking costs.',
    sampleQuery: 'swimming-pool-cost-in-orlando-florida',
    badge: 'Outdoor',
  },
  {
    id: 'pickleball-court-cost',
    name: 'Pickleball Court Cost Estimator',
    icon: '🏓',
    description: 'Estimate post-tension concrete pad construction, multi-layer acrylic surfacing, fencing, and LED lighting.',
    sampleQuery: 'pickleball-court-cost-in-phoenix-arizona',
    badge: 'Luxury',
  },
  {
    id: 'outdoor-kitchen-cost',
    name: 'Outdoor Kitchen Cost Estimator',
    icon: '🔥',
    description: 'Budget for stone masonry islands, built-in gas grills, quartz counters, and underground utility trenching.',
    sampleQuery: 'outdoor-kitchen-cost-in-san-diego-california',
    badge: 'Luxury',
  },
  {
    id: 'barndominium-cost',
    name: 'Barndominium & Pole Barn Estimator',
    icon: '🌾',
    description: 'Budget engineered steel shells, concrete slabs, turnkey living quarters, and rural utilities (well, septic, driveway).',
    sampleQuery: 'barndominium-cost-in-dallas-texas',
    badge: 'Rural / Acreage',
  },
];

const STATE_HUBS = [
  {
    state: 'Texas',
    slug: 'texas',
    citiesCount: '19 Cities',
    description: 'Austin, Dallas, Houston, San Antonio, Plano, Frisco, The Woodlands, and major suburbs.',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    state: 'Florida',
    slug: 'florida',
    citiesCount: '4 Major Metros',
    description: 'Miami, Orlando, Tampa, and Jacksonville residential construction and real estate metrics.',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    state: 'California',
    slug: 'california',
    citiesCount: '3 Major Metros',
    description: 'Los Angeles, San Diego, and San Francisco Bay Area remodeling and housing affordability tools.',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
];

const OTHER_METROS = [
  { name: 'Atlanta', state: 'Georgia', slug: 'atlanta-georgia' },
  { name: 'Seattle', state: 'Washington', slug: 'seattle-washington' },
  { name: 'Phoenix', state: 'Arizona', slug: 'phoenix-arizona' },
  { name: 'Chicago', state: 'Illinois', slug: 'chicago-illinois' },
  { name: 'Denver', state: 'Colorado', slug: 'denver-colorado' },
  { name: 'Charlotte', state: 'North Carolina', slug: 'charlotte-north-carolina' },
  { name: 'Raleigh', state: 'North Carolina', slug: 'raleigh-north-carolina' },
  { name: 'Nashville', state: 'Tennessee', slug: 'nashville-tennessee' },
  { name: 'Las Vegas', state: 'Nevada', slug: 'las-vegas-nevada' },
  { name: 'Salt Lake City', state: 'Utah', slug: 'salt-lake-city-utah' },
];

const FAQS = [
  {
    q: 'How accurate are these US real estate and construction cost calculators?',
    a: 'Our calculators use 2026 regional cost datasets adjusted for local trade wage rates, building material pricing indices, and localized municipal code requirements. Estimates represent realistic mid-market ranges.',
  },
  {
    q: 'Why do construction costs vary so widely between US cities?',
    a: 'Regional price differences stem from three primary drivers: local union or non-union labor hourly rates, local permitting and impact fees, and geographical climate requirements (e.g. earthquake codes in California vs hurricane wind standards in Florida).',
  },
  {
    q: 'Can I export a contractor-ready estimate report?',
    a: 'Yes. Every calculator lets you adjust specific project line items, review a granular breakdown table, and export a clean project summary to share with lenders, architects, or general contractors.',
  },
  {
    q: 'What is the standard contingency budget recommended for US home renovations?',
    a: 'For cosmetic remodels, a 10% contingency reserve is recommended. For structural expansions, home additions, and historic properties, a 15% to 20% contingency is strongly advised to absorb hidden framing, plumbing, or electrical issues.',
  },
];

export default function USRealEstateHub() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'USA Real Estate Calculators & Construction Cost Estimators (2026)',
    description: 'Free, accurate 2026 real estate and remodeling calculators for top US markets.',
    url: 'https://www.homedesignenglish.com/real-estate',
    hasPart: TOOLS.map(t => ({
      '@type': 'WebApplication',
      name: t.name,
      description: t.description,
      applicationCategory: 'RealEstateApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.homedesignenglish.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Real Estate Calculators',
        item: 'https://www.homedesignenglish.com/real-estate',
      },
    ],
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 text-slate-900 py-14 px-4 shadow-xs">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold mb-6">
            <span>🇺🇸</span> 2026 USA Housing &amp; Construction Data
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900">
            USA Real Estate &amp; Construction Calculators
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Transparent, contractor-accurate calculators for American homebuyers, renovators, and real estate investors. Estimate accurate costs across 30+ major metro areas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-emerald-600"></i> Free &amp; Instant</span>
            <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-emerald-600"></i> No Sign-Up Required</span>
            <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-emerald-600"></i> Local Labor Rate Data</span>
          </div>
        </div>
      </section>

      {/* State Pillar Hubs */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATE_HUBS.map(hub => (
            <Link
              key={hub.slug}
              href={`/real-estate/${hub.slug}`}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-slate-200/80 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {hub.state} Hub
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${hub.badgeColor}`}>
                    {hub.citiesCount}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {hub.description}
                </p>
              </div>
              <div className="text-primary-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore {hub.state} Calculators &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Tools Directory */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Comprehensive Real Estate &amp; Building Tools
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Select a specialized calculator below to run granular projections tailored to your target city and neighborhood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 hover:border-primary-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{tool.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {tool.description}
                </p>
              </div>

              <div>
                <Link
                  href={`/real-estate/${tool.sampleQuery}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 text-slate-800 hover:text-primary-700 font-semibold text-sm border border-slate-200 hover:border-primary-300 transition-all"
                >
                  Launch Calculator &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top US Metros Grid */}
      <section className="bg-white border-y border-slate-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Explore Top US Metropolitan Markets
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Direct access to rent vs. buy, tax rates, and remodeling estimates across booming American growth centers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {OTHER_METROS.map(city => (
              <div
                key={city.slug}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-center group"
              >
                <div className="font-bold text-slate-900 group-hover:text-primary-700 text-base mb-1">
                  {city.name}
                </div>
                <div className="text-xs text-slate-500 mb-3">{city.state}</div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <Link
                    href={`/real-estate/rent-vs-buy-in-${city.slug}`}
                    className="text-slate-600 hover:text-primary-600 font-medium hover:underline"
                  >
                    Rent vs Buy
                  </Link>
                  <Link
                    href={`/real-estate/property-tax-in-${city.slug}`}
                    className="text-slate-600 hover:text-primary-600 font-medium hover:underline"
                  >
                    Property Tax
                  </Link>
                  <Link
                    href={`/real-estate/kitchen-remodel-in-${city.slug}`}
                    className="text-slate-600 hover:text-primary-600 font-medium hover:underline"
                  >
                    Kitchen Remodel
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Guides & Pillar Links */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            In-Depth Guides &amp; Research
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Read our editorial breakdowns covering current interest rate cycles, contractor budgeting strategies, and home equity ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/blog/rent-vs-buy-a-house-in-2026"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all group"
          >
            <span className="text-xs font-bold uppercase text-primary-600 tracking-wider">Housing Economics</span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mt-2 mb-2">
              Rent vs. Buy in 2026: The Math Your Realtor Isn&apos;t Telling You
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Why current mortgage rates require a minimum 5-year holding period to beat renting in top metro areas.
            </p>
          </Link>

          <Link
            href="/blog/kitchen-renovation-costs-guide"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all group"
          >
            <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">Remodeling ROI</span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mt-2 mb-2">
              Complete Kitchen Renovation Cost Guide (2026)
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Cabinetry line items, quartz vs granite slabs, appliance suites, and how to avoid contractor scope creep.
            </p>
          </Link>

          <Link
            href="/blog/swimming-pool-construction-costs"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition-all group"
          >
            <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">Outdoor Living</span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mt-2 mb-2">
              Gunite vs Fiberglass Swimming Pool Construction Costs
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Soil excavation variables, retaining walls, pump filtration packages, and true ongoing maintenance overhead.
            </p>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-100 border-t border-slate-200 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
