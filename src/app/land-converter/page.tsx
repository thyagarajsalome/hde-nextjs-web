import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import LandUnitConverter from '@/features/tools/LandUnitConverter';
import { TOP_CONVERSION_PAIRS, LAND_UNITS } from '@/data/landUnits';

export const metadata: Metadata = {
  title: 'Land Area Converter India | Gunta, Bigha, Cent, Ground to Sq Ft',
  description: 'Free Indian land measurement converter. Instantly convert Gunta, Bigha, Cent, Ground, Ankanam, Gaj to Square Feet (Sq Ft), Acres, and Square Yards with official state formulas.',
  keywords: 'land area converter india, gunta to sq ft, bigha to sq ft, cent to sq ft, ground to sqft, ankanam to sqft, gaj to sqft, land measurement units india',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/land-converter',
  },
  openGraph: {
    title: 'Indian Land Measurement Converter | HDE',
    description: 'Convert Gunta, Bigha, Cent, Ground, Gaj to Sq Ft with official state-wise ratios.',
    url: 'https://www.homedesignenglish.com/land-converter',
    siteName: 'Home Design English',
    type: 'website',
  },
};

const FAQS = [
  {
    q: 'How many square feet are in 1 Gunta?',
    a: '1 Gunta equals exactly 1,089 square feet (33 ft × 33 ft). In 1 Acre, there are 40 Guntas (43,560 sq ft). This measurement is primarily used in Karnataka, Maharashtra, and Telangana.'
  },
  {
    q: 'How many square feet are in 1 Cent?',
    a: '1 Cent equals 435.6 square feet. 1 Acre contains exactly 100 Cents. Cent is the primary land unit for residential plots and agricultural land in Kerala, Tamil Nadu, Andhra Pradesh, and parts of Karnataka.'
  },
  {
    q: 'How many square feet are in 1 Bigha in India?',
    a: 'In North India (Standard Pucca Bigha in Uttar Pradesh, Bihar, and MP), 1 Bigha equals 27,225 square feet (3,025 square yards). However, regional Kachha Bigha variations exist: 1 Bigha in Bengal is 14,400 sq ft, in Rajasthan it is 17,424 sq ft, and in Himachal it is 8,712 sq ft.'
  },
  {
    q: 'What is 1 Ground in Chennai and Tamil Nadu?',
    a: '1 Ground in Tamil Nadu equals 2,400 square feet (approx 5.51 Cents or 222.96 square meters). It is the universal metric used in Chennai real estate.'
  },
  {
    q: 'What is the difference between Gaj and Square Yard?',
    a: 'In Indian real estate, 1 Gaj is virtually identical to 1 Square Yard (9 square feet). It is widely used in Delhi NCR, Haryana, Punjab, and Uttar Pradesh.'
  }
];

export default function LandConverterPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Indian Land Measurement & Area Converter',
    url: 'https://www.homedesignenglish.com/land-converter',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    description: 'Convert Indian land measurement units including Gunta, Bigha, Cent, Ground, Ankanam, Gaj to Square Feet and Acres.',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <Script
        id="land-converter-app-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="land-converter-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary via-slate-900 to-secondary text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary/20">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
            🇮🇳 All-India Land Measurement Suite
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Indian Land Measurement &amp; Area Converter
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Convert Gunta, Bigha, Cent, Ground, Ankanam, and Gaj into Square Feet (Sq Ft) and Acres instantly. Built with official state revenue department benchmarks.
          </p>
        </div>
      </section>

      {/* Converter Feature Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <LandUnitConverter initialFrom="gunta" initialTo="sqft" initialValue={1} />

        {/* Popular Conversion Pairs Grid */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Popular Land Measurement Conversions
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Quick conversion calculators for the most common real estate queries in India.
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
              14 Official Ratio Tools
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {TOP_CONVERSION_PAIRS.map((pair) => (
              <Link
                key={pair.slug}
                href={`/land-converter/${pair.slug}`}
                className="group p-4 rounded-xl border border-gray-150 hover:border-primary/50 hover:shadow-md transition bg-gray-50/50 hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-primary transition">
                      {pair.title.replace(' Converter', '')}
                    </span>
                    <i className="fas fa-arrow-right text-xs text-gray-400 group-hover:text-primary transition transform group-hover:translate-x-1"></i>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal line-clamp-2">
                    {pair.shortDesc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    High Accuracy
                  </span>
                  <span>Instant Result →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pre-Computed Static Reference Tables (Crucial for Crawlers & Instant User Utility) */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Quick Land Conversion Reference Chart
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Standard values in Square Feet (Sq Ft) for common plot sizes across Indian states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gunta Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white p-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Gunta to Sq Ft</span>
                <span className="text-[10px] text-primary">1 Gunta = 1,089 Sq Ft</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="p-2.5">Guntas</th>
                    <th className="p-2.5">Square Feet</th>
                    <th className="p-2.5">In Acres</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-700">
                  {[1, 2, 5, 10, 20, 40].map((g) => (
                    <tr key={g} className="hover:bg-gray-50">
                      <td className="p-2.5 font-bold">{g} Gunta{g > 1 ? 's' : ''}</td>
                      <td className="p-2.5 font-mono text-primary font-bold">{(g * 1089).toLocaleString()} sq ft</td>
                      <td className="p-2.5 text-gray-500">{(g / 40).toFixed(3)} Ac</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cent Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white p-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Cent to Sq Ft</span>
                <span className="text-[10px] text-primary">1 Cent = 435.6 Sq Ft</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="p-2.5">Cents</th>
                    <th className="p-2.5">Square Feet</th>
                    <th className="p-2.5">In Acres</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-700">
                  {[1, 2, 5, 10, 25, 50, 100].map((c) => (
                    <tr key={c} className="hover:bg-gray-50">
                      <td className="p-2.5 font-bold">{c} Cent{c > 1 ? 's' : ''}</td>
                      <td className="p-2.5 font-mono text-primary font-bold">{(c * 435.6).toLocaleString()} sq ft</td>
                      <td className="p-2.5 text-gray-500">{(c / 100).toFixed(2)} Ac</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bigha Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white p-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Bigha to Sq Ft</span>
                <span className="text-[10px] text-primary">Pucca Bigha (UP)</span>
              </div>
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <tr>
                    <th className="p-2.5">Bigha</th>
                    <th className="p-2.5">Square Feet</th>
                    <th className="p-2.5">In Sq Yards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-700">
                  {[0.5, 1, 2, 3, 5, 10].map((b) => (
                    <tr key={b} className="hover:bg-gray-50">
                      <td className="p-2.5 font-bold">{b} Bigha</td>
                      <td className="p-2.5 font-mono text-primary font-bold">{(b * 27225).toLocaleString()} sq ft</td>
                      <td className="p-2.5 text-gray-500">{(b * 3025).toLocaleString()} sq yd</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* State-by-State Measurement Guide */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              State-Wise Land Measurement Standards in India
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Why land measurement units change when crossing state borders in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>📍</span> Karnataka, Maharashtra &amp; Telangana (Gunta &amp; Sq Ft)
              </h3>
              <p>
                In Karnataka (Bangalore, Mysore) and Maharashtra (Mumbai, Pune), agricultural plots are divided into <strong>Guntas</strong> and <strong>Acres</strong>. One Gunta is exactly 1,089 sq ft, which represents a plot measuring 33 feet by 33 feet. 40 Guntas make 1 standard Acre.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>📍</span> Tamil Nadu &amp; Kerala (Cent &amp; Ground)
              </h3>
              <p>
                In Chennai and Tamil Nadu, residential real estate is traditionally transacted in <strong>Grounds</strong> (1 Ground = 2,400 sq ft). In rural and suburban areas, as well as Kerala and Andhra Pradesh, <strong>Cents</strong> are used (1 Cent = 435.6 sq ft).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>📍</span> Delhi NCR, Punjab &amp; Haryana (Gaj, Marla &amp; Kanal)
              </h3>
              <p>
                In Delhi NCR and Uttar Pradesh, urban plots are sold in <strong>Gaj</strong> (1 Gaj = 1 Square Yard = 9 sq ft). In Punjab and Haryana, revenue records recognize <strong>Marlas</strong> (272.25 sq ft) and <strong>Kanals</strong> (20 Marlas = 5,445 sq ft).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>📍</span> Andhra Pradesh &amp; Rayalaseema (Ankanam)
              </h3>
              <p>
                In parts of southern Andhra Pradesh (especially Nellore and Tirupati), land is measured in <strong>Ankanams</strong>. One Ankanam equals 72 square feet (8 square yards).
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Frequently Asked Questions About Indian Land Measurements
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Clear answers to common questions when purchasing or measuring property in India.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-4 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <span className="text-primary font-extrabold">Q:</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-gray-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
