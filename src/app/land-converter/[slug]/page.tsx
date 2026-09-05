import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import LandUnitConverter from '@/features/tools/LandUnitConverter';
import { TOP_CONVERSION_PAIRS, LAND_UNITS, convertUnits } from '@/data/landUnits';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return TOP_CONVERSION_PAIRS.map((pair) => ({
    slug: pair.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pair = TOP_CONVERSION_PAIRS.find((p) => p.slug === slug);

  if (!pair) {
    return {
      title: 'Land Converter | HDE',
      description: 'Indian land measurement converter.',
    };
  }

  const fromUnit = LAND_UNITS[pair.fromUnit];
  const toUnit = LAND_UNITS[pair.toUnit];

  return {
    title: `${pair.title} | Instant Ratio & Chart | HDE`,
    description: `${pair.shortDesc} Convert ${fromUnit?.plural || ''} to ${toUnit?.plural || ''} with instant calculations, pre-computed tables, and state benchmarks.`,
    keywords: `${pair.slug.replace(/-/g, ' ')}, ${fromUnit?.name} to ${toUnit?.name}, land converter india, land area calculator`,
    alternates: {
      canonical: `https://www.homedesignenglish.com/land-converter/${slug}`,
    },
    openGraph: {
      title: `${pair.title} | Instant Calculator`,
      description: pair.shortDesc,
      url: `https://www.homedesignenglish.com/land-converter/${slug}`,
      siteName: 'Home Design English',
      type: 'website',
    },
  };
}

export default async function ConversionPairPage({ params }: PageProps) {
  const { slug } = await params;
  const pair = TOP_CONVERSION_PAIRS.find((p) => p.slug === slug);

  if (!pair) {
    notFound();
  }

  const fromUnit = LAND_UNITS[pair.fromUnit] || LAND_UNITS.gunta;
  const toUnit = LAND_UNITS[pair.toUnit] || LAND_UNITS.sqft;

  // Formula text
  const ratio = convertUnits(1, pair.fromUnit, pair.toUnit);
  const reverseRatio = convertUnits(1, pair.toUnit, pair.fromUnit);

  // Pre-computed table numbers
  const tableValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 100];

  const breadcrumbsSchema = {
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
        name: 'Land Converter',
        item: 'https://www.homedesignenglish.com/land-converter',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: pair.title,
        item: `https://www.homedesignenglish.com/land-converter/${slug}`,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How to convert ${fromUnit.name} to ${toUnit.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To convert ${fromUnit.name} to ${toUnit.name}, multiply the value in ${fromUnit.plural} by ${ratio.toLocaleString()}. For example, 5 ${fromUnit.plural} = 5 × ${ratio.toLocaleString()} = ${(5 * ratio).toLocaleString()} ${toUnit.plural}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the exact ratio of 1 ${fromUnit.name} in ${toUnit.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `1 ${fromUnit.name} equals exactly ${ratio.toLocaleString()} ${toUnit.plural}. Conversely, 1 ${toUnit.name} equals ${reverseRatio.toFixed(6)} ${fromUnit.plural}.`,
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <Script
        id="faq-pair-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-secondary via-slate-900 to-secondary text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-primary/20">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          {/* Breadcrumbs */}
          <nav className="text-xs text-gray-400 flex items-center justify-center gap-2 mb-2">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <Link href="/land-converter" className="hover:text-primary transition">Land Converter</Link>
            <span>/</span>
            <span className="text-primary font-bold">{pair.title}</span>
          </nav>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {pair.title}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {pair.shortDesc} Use the calculator below for custom values or reference the conversion chart.
          </p>

          <div className="pt-2 inline-flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-300">
            <span>Formula: 1 {fromUnit.name} = {ratio.toLocaleString()} {toUnit.plural}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Pre-filled Interactive Tool */}
        <LandUnitConverter
          initialFrom={pair.fromUnit}
          initialTo={pair.toUnit}
          initialValue={1}
          showAllUnitsTable={true}
        />

        {/* Pre-Calculated Static Table for Crawlers & Instant User Value */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {fromUnit.name} to {toUnit.name} Conversion Table
              </h2>
              <p className="text-xs text-gray-500">
                Pre-calculated reference list from 1 to 100 {fromUnit.plural}.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-400">
              Ratio: 1 = {ratio.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">{fromUnit.name}</th>
                  <th className="p-3">{toUnit.name} ({toUnit.symbol})</th>
                  <th className="p-3">Calculation Formula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-800">
                {tableValues.map((val) => {
                  const result = val * ratio;
                  return (
                    <tr key={val} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-bold">
                        {val} {val === 1 ? fromUnit.name : fromUnit.plural}
                      </td>
                      <td className="p-3 font-mono font-bold text-primary text-sm">
                        {result >= 1000 ? result.toLocaleString() : result.toFixed(2)} {toUnit.symbol}
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">
                        {val} × {ratio.toLocaleString()} = {result.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Explanation & Regional Context */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-4 text-xs text-gray-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">
            Understanding {fromUnit.name} and {toUnit.name}
          </h2>
          <p>
            <strong>{fromUnit.name}</strong> is widely referenced in <em>{fromUnit.region}</em>. {fromUnit.description}
          </p>
          <p>
            When purchasing residential plots or agricultural land, official land sale deeds (patta or khata records) may list area in {fromUnit.plural}, while architects and municipal authorities approve building plans in <strong>Square Feet (sq ft)</strong> or <strong>Square Meters (sq m)</strong>.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Planning to build a house on this plot?</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Calculate the exact materials, labor, and construction cost per sq ft for your land size.
              </p>
            </div>
            <Link
              href="/cost/construction-in-bengaluru"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition whitespace-nowrap cursor-pointer"
            >
              Calculate Construction Cost →
            </Link>
          </div>
        </section>

        {/* Other Related Converters Grid */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-150 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            More Popular Land Measurement Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOP_CONVERSION_PAIRS.filter((p) => p.slug !== slug).map((other) => (
              <Link
                key={other.slug}
                href={`/land-converter/${other.slug}`}
                className="p-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-gray-50 transition block"
              >
                <div className="font-bold text-xs text-slate-900 truncate">
                  {other.title.replace(' Converter', '')}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 truncate">
                  {other.shortDesc}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
