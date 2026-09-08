import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Texas Real Estate Calculators & City Directory | HDE',
  description: 'Free Texas real estate calculators across 19 major cities. Compare rent vs. buy, property taxes, kitchen remodel costs, swimming pool costs, and salary requirements.',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/real-estate/texas',
  },
};

const TOOLS = [
  { id: 'rent-vs-buy', name: 'Rent vs. Buy', icon: '🏠', desc: '5-year mortgage vs rent comparison' },
  { id: 'property-tax', name: 'Property Tax', icon: '📋', desc: 'County tax rate & monthly escrow' },
  { id: 'salary-needed-to-buy', name: 'Salary Needed', icon: '💰', desc: '28/36 DTI income threshold' },
  { id: 'remodel-roi', name: 'Remodel ROI', icon: '📈', desc: 'Home equity value recovery' },
  { id: 'kitchen-remodel', name: 'Kitchen Remodel', icon: '🍳', desc: 'Cabinets, counters & labor' },
  { id: 'home-addition', name: 'Home Addition', icon: '🏗️', desc: 'Per sq ft expansion costs' },
  { id: 'swimming-pool-cost', name: 'Swimming Pool', icon: '🏊', desc: 'Gunite & fiberglass estimates' },
  { id: 'pickleball-court-cost', name: 'Pickleball Court', icon: '🏓', desc: 'Post-tension concrete & surface' },
  { id: 'outdoor-kitchen-cost', name: 'Outdoor Kitchen', icon: '🔥', desc: 'Masonry island & appliances' },
];

const CITIES = [
  { name: 'Austin', slug: 'austin-texas', region: 'Central TX' },
  { name: 'Dallas', slug: 'dallas-texas', region: 'North TX' },
  { name: 'Houston', slug: 'houston-texas', region: 'Gulf Coast' },
  { name: 'San Antonio', slug: 'san-antonio-texas', region: 'South TX' },
  { name: 'Plano', slug: 'plano-texas', region: 'DFW Metro' },
  { name: 'Frisco', slug: 'frisco-texas', region: 'DFW Metro' },
  { name: 'McKinney', slug: 'mckinney-texas', region: 'DFW Metro' },
  { name: 'Allen', slug: 'allen-texas', region: 'DFW Metro' },
  { name: 'Richardson', slug: 'richardson-texas', region: 'DFW Metro' },
  { name: 'Round Rock', slug: 'round-rock-texas', region: 'Austin Metro' },
  { name: 'Georgetown', slug: 'georgetown-texas', region: 'Austin Metro' },
  { name: 'Cedar Park', slug: 'cedar-park-texas', region: 'Austin Metro' },
  { name: 'Pflugerville', slug: 'pflugerville-texas', region: 'Austin Metro' },
  { name: 'Leander', slug: 'leander-texas', region: 'Austin Metro' },
  { name: 'The Woodlands', slug: 'the-woodlands-texas', region: 'Houston Metro' },
  { name: 'Sugar Land', slug: 'sugar-land-texas', region: 'Houston Metro' },
  { name: 'Katy', slug: 'katy-texas', region: 'Houston Metro' },
  { name: 'Pearland', slug: 'pearland-texas', region: 'Houston Metro' },
  { name: 'Cypress', slug: 'cypress-texas', region: 'Houston Metro' },
];

export default function TexasHubPage() {
  const jsonLd = {
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
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Texas',
        item: 'https://www.homedesignenglish.com/real-estate/texas',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-800 dark:text-zinc-200">
        {/* Compact Hero Section with High-Contrast Navy/Slate Theme */}
        <section className="bg-slate-900 border-b border-slate-800 text-white py-10 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-amber-400 transition">Home</Link>
              <span>/</span>
              <Link href="/dev-links" className="hover:text-amber-400 transition">Real Estate</Link>
              <span>/</span>
              <span className="text-amber-400 font-semibold">Texas</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 uppercase tracking-wider mb-2">
                  <span>★</span> Lone Star State Directory
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Texas Real Estate Calculators
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                  Access 171 localized calculators across 19 major Texas cities. Accurate local estimation for property taxes, mortgage affordability, and home remodeling.
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 text-center">
                  <div className="text-lg font-black text-[#c5a059]">19</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Texas Cities</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 text-center">
                  <div className="text-lg font-black text-white">9</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Tools / City</div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 text-center">
                  <div className="text-lg font-black text-emerald-400">171</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Calculators</div>
                </div>
              </div>
            </div>

            {/* Quick City Jump Anchor Pills */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Jump to City:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.map((c) => (
                  <a
                    key={c.slug}
                    href={`#city-${c.slug}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 hover:text-[#0f2042] hover:bg-[#c5a059] transition-all border border-slate-700/60"
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Directory Body */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Quick Tool Index Legend */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
              <i className="fas fa-layer-group text-amber-500"></i>
              Available Estimators Included for Each City
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
              {TOOLS.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 rounded-xl p-2.5 text-center flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple Structured List of Cities & Calculators */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-amber-500"></i>
                City-by-City Real Estate Calculators Directory
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400">19 Cities</span>
            </div>

            <div className="space-y-3">
              {CITIES.map((city) => (
                <div
                  key={city.slug}
                  id={`city-${city.slug}`}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition scroll-mt-6"
                >
                  {/* City Header Row */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#c5a059]/15 text-[#0f2042] dark:text-[#c5a059] flex items-center justify-center text-sm font-bold">
                        <i className="fas fa-city"></i>
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                          <span>{city.name}, Texas</span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                            {city.region}
                          </span>
                        </h3>
                      </div>
                    </div>

                    <a
                      href={`/cost/construction-in-${city.slug}`}
                      className="text-xs font-semibold text-[#0f2042] dark:text-[#c5a059] hover:underline flex items-center gap-1"
                    >
                      <span>Construction Cost</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </a>
                  </div>

                  {/* Clean 3-Column List Format for Tools */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {TOOLS.map((tool) => (
                      <a
                        key={tool.id}
                        href={`/real-estate/${tool.id}-in-${city.slug}`}
                        className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-800/40 hover:bg-[#c5a059]/10 dark:hover:bg-[#c5a059]/15 hover:border-[#c5a059]/30 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{tool.icon}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#0f2042] dark:group-hover:text-[#c5a059] transition truncate">
                            {tool.name}
                          </span>
                        </div>
                        <i className="fas fa-chevron-right text-[10px] text-slate-400 group-hover:text-[#c5a059] group-hover:translate-x-0.5 transition shrink-0 ml-2"></i>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Simple Texas Market Note */}
          <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            <h4 className="font-bold text-slate-900 dark:text-zinc-200 text-sm mb-1 flex items-center gap-1.5">
              <i className="fas fa-info-circle text-amber-500"></i>
              Texas Real Estate Methodology &amp; Property Tax Context
            </h4>
            <p>
              Texas property tax rates typically range from 1.6% to over 2.4% depending on local school districts, county assessments, and municipal utility districts (MUDs). Because Texas levies no personal state income tax, property tax rates are higher than the US national average. Our calculators dynamically apply local appraisal district benchmarks for accurate mortgage escrow and ROI forecasting.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
