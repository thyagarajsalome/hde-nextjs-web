import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { ALL_PARTNER_SEO_PAGES, PARTNER_SEO_SLUGS, AREA_PARTNER_SLUGS, B2B_GUIDE_SLUGS } from '@/data/dubaiPartnerSeoData';
import DubaiAgentRegisterForm from '@/components/dubai/DubaiAgentRegisterForm';

export function generateStaticParams() {
  return PARTNER_SEO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = ALL_PARTNER_SEO_PAGES[slug];
  if (!item) {
    return {
      title: 'Partner Page Not Found | HDE Dubai Property',
    };
  }

  const canonicalUrl = `https://www.homedesignenglish.com/dubai-property/partners/${slug}`;

  return {
    title: item.title,
    description: item.metaDescription,
    keywords: item.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: item.title,
      description: item.metaDescription,
      url: canonicalUrl,
      siteName: 'Home Design English',
      type: 'website',
    },
  };
}

export default async function DubaiPartnerSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = ALL_PARTNER_SEO_PAGES[slug];

  if (!item) {
    notFound();
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.homedesignenglish.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dubai Property',
        item: 'https://www.homedesignenglish.com/dubai-property',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Partner Network',
        item: 'https://www.homedesignenglish.com/dubai-property/partners',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: item.areaName || item.headline,
        item: `https://www.homedesignenglish.com/dubai-property/partners/${slug}`,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: item.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  // Cross-link suggestions
  const otherAreaSlugs = AREA_PARTNER_SLUGS.filter((s) => s !== slug).slice(0, 8);
  const otherGuideSlugs = B2B_GUIDE_SLUGS.filter((s) => s !== slug).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 pb-20">
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Breadcrumb Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-[#c5a059] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/dubai-property" className="hover:text-[#c5a059] transition-colors">Dubai Property</Link>
          <span>/</span>
          <Link href="/dubai-property/partners" className="hover:text-[#c5a059] transition-colors">Partner Network</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs sm:max-w-md">
            {item.areaName || item.badge}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fcfbf7] to-[#f6f8fb] dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border-b border-[#c5a059]/20 dark:border-zinc-800 py-14 sm:py-18 px-4 sm:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-[#c5a059]/40 shadow-xs mb-5">
            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-[#0f2042] dark:text-[#c5a059]">
              {item.badge}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f2042] dark:text-white tracking-tight leading-tight">
            {item.headline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {item.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#register-form"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f2042] text-white hover:bg-[#1a365d] dark:bg-[#c5a059] dark:text-[#0f2042] dark:hover:bg-[#d4b36b] font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <i className="fas fa-file-contract text-xs" />
              <span>Apply for {item.areaName ? `${item.areaName} Desk` : 'Specialist Desk'}</span>
            </a>
            {item.areaSlug && (
              <Link
                href={`/dubai-property/areas/${item.areaSlug}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 font-semibold text-sm transition-all shadow-xs"
              >
                <i className="fas fa-compass text-xs text-[#c5a059]" />
                <span>View {item.areaName} Buyer Guide</span>
              </Link>
            )}
            <Link
              href="/dubai-property/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 font-semibold text-sm transition-all shadow-xs"
            >
              <i className="fas fa-calculator text-xs text-[#c5a059]" />
              <span>DLD Buying Cost Calculator</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {item.stats.map((st, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm text-center"
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {st.label}
              </p>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0f2042] dark:text-[#c5a059]">
                {st.value}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                {st.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content & Market Intelligence */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Market Intelligence & Demographic Profile */}
          <div className="lg:col-span-7 space-y-8">
            {/* Overview Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-2xl font-bold text-[#0f2042] dark:text-white flex items-center gap-2.5">
                <i className="fas fa-chart-line text-[#c5a059] text-xl" />
                <span>Market Dynamics & Client Demand</span>
              </h2>
              <div className="mt-5 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                {item.overview.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Buyer Profile Breakdown */}
            <div className="bg-gradient-to-br from-[#0f2042] to-[#162a56] text-white rounded-2xl p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                  <i className="fas fa-users-viewfinder" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">Target Buyer Profile & Velocity</h3>
                  <p className="text-xs text-gray-300">Audience insights generated from HDE traffic analytics</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-xs uppercase tracking-wider">Primary Demographic</span>
                  <span className="mt-1 font-semibold text-white block">{item.buyerProfile.targetAudience}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-xs uppercase tracking-wider">Average Budget Range</span>
                  <span className="mt-1 font-semibold text-[#c5a059] block">{item.buyerProfile.averageBudget}</span>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 sm:col-span-2">
                  <span className="text-gray-400 block text-xs uppercase tracking-wider">Inquiry Velocity</span>
                  <span className="mt-1 font-medium text-gray-200 block">{item.buyerProfile.inquiryVelocity}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-white/10">
                <span className="text-xs text-gray-400 block mb-2 uppercase tracking-wider">Top Inquiry Source Markets</span>
                <div className="flex flex-wrap gap-2">
                  {item.buyerProfile.primarySourceMarkets.map((mkt, mIdx) => (
                    <span
                      key={mIdx}
                      className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-gray-200 border border-white/10"
                    >
                      {mkt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner Benefits */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-xs">
              <h3 className="text-xl font-bold text-[#0f2042] dark:text-white flex items-center gap-2.5">
                <i className="fas fa-handshake text-[#c5a059]" />
                <span>Partner Value Proposition</span>
              </h3>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.partnerBenefits.map((b, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-[#f8fafc]/60 dark:bg-zinc-900/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#c5a059]/15 flex items-center justify-center text-[#c5a059] mb-3">
                      <i className={b.icon} />
                    </div>
                    <h4 className="font-semibold text-sm text-[#0f2042] dark:text-white">{b.title}</h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Registration Form */}
          <div className="lg:col-span-5" id="register-form">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 border-2 border-[#c5a059]/30 dark:border-zinc-800 shadow-lg">
                <div className="mb-5 pb-4 border-b border-gray-200 dark:border-zinc-800">
                  <div className="inline-block px-3 py-1 rounded-full bg-[#0f2042]/5 dark:bg-[#c5a059]/10 text-[#0f2042] dark:text-[#c5a059] text-xs font-semibold mb-2">
                    Official RERA Broker Portal
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0f2042] dark:text-white">
                    Apply for {item.areaName ? `${item.areaName} Desk` : 'Specialist Desk'}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Connect with high-intent buyers looking to transact in Dubai.
                  </p>
                </div>

                <DubaiAgentRegisterForm
                  defaultFocusArea={item.areaName}
                  source={item.title}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-wider">Got Questions?</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0f2042] dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {item.faqs.map((faq, fIdx) => (
            <div
              key={fIdx}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-xs"
            >
              <h3 className="text-base sm:text-lg font-bold text-[#0f2042] dark:text-white flex items-start gap-3">
                <i className="fas fa-circle-question text-[#c5a059] mt-1 text-sm" />
                <span>{faq.question}</span>
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-7">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-Linking Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-gray-200 dark:border-zinc-800">
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f2042] dark:text-white">
            Explore Dubai Community Partner Desks
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Specialist broker networks across all prime and emerging freehold communities in Dubai.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {otherAreaSlugs.map((s) => {
            const other = ALL_PARTNER_SEO_PAGES[s];
            return (
              <Link
                key={s}
                href={`/dubai-property/partners/${s}`}
                className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-[#c5a059] dark:hover:border-[#c5a059] hover:shadow-xs transition-all group"
              >
                <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#c5a059] transition-colors">
                  {other.areaName} Desk
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Yield: {other.stats[0]?.value}
                </p>
              </Link>
            );
          })}
        </div>

        {/* B2B Strategy Guides */}
        <div className="mt-10 mb-4">
          <h3 className="text-lg font-bold text-[#0f2042] dark:text-white">
            Broker Partner Guides & Strategy
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {otherGuideSlugs.map((s) => {
            const guide = ALL_PARTNER_SEO_PAGES[s];
            return (
              <Link
                key={s}
                href={`/dubai-property/partners/${s}`}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-[#c5a059] dark:hover:border-[#c5a059] hover:shadow-xs transition-all group"
              >
                <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider block mb-1">
                  Strategy Guide
                </span>
                <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#c5a059] transition-colors line-clamp-2">
                  {guide.headline}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Statutory Legal Disclaimer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-14">
        <div className="p-5 rounded-xl bg-gray-100/80 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Statutory Legal Notice & Regulatory Compliance
          </p>
          <p>
            Home Design English (HDE) is an independent real estate technology platform and digital referral network. HDE is not affiliated with, endorsed by, or partnered with the Dubai Land Department (DLD), Real Estate Regulatory Agency (RERA), or the Government of Dubai.
          </p>
          <p>
            All partner brokers and brokerage agencies must possess valid, active licensing issued by RERA and comply strictly with Law No. (85) of 2006 regarding the Real Estate Brokers Register in Dubai. HDE independently validates public regulatory credentials prior to lead dispatch under fair-use verification standards.
          </p>
        </div>
      </section>
    </main>
  );
}