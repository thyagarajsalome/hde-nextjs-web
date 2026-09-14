import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Home Design English (HDE)',
  description: 'Learn about Home Design English (HDE) - our mission and three tailored modes (India, USA, UAE) solving real construction and property budgeting problems.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo dark:prose-invert">
      <h1>About Home Design English (HDE)</h1>
      <p className="text-lg text-gray-600 dark:text-zinc-400">
        Empowering homeowners, architects, and builders with transparent construction costing, architectural floor plans, and real estate tools.
      </p>

      <h2>Our Mission</h2>
      <p>
        Building, renovating, or investing in property is one of the most significant financial and personal commitments anyone will make. Yet, homeowners and investors frequently encounter opaque contractor quotes, unpredictable material expenses, hidden closing costs, and fragmented information.
      </p>
      <p>
        <strong>Home Design English (HDE)</strong> was built to solve these real-world problems. We replace guesswork with transparent, data-driven calculators, practical floor plans, and reliable cost estimation models tailored to local construction practices.
      </p>

      <h2>Three Dedicated Regional Modes: Solving Real Problems</h2>
      <p>
        Construction standards, regulatory fees, and currencies vary drastically across the globe. Rather than offering generic formulas, HDE features three purpose-built regional modes designed to assist and address real challenges:
      </p>

      <div className="not-prose space-y-4 my-6">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2.5 mb-1">
            <span className="text-2xl">🇮🇳</span> India Mode (INR)
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Addresses the lack of transparent construction pricing in Indian cities. Accurately estimate civil construction per sq ft rates, modular interiors, flooring, and exact material bill of quantities (cement bags, steel in kg/tonnes, bricks, and sand). Includes instant regional land area conversions (Gunta, Bigha, Cent to Sq Ft) and Home Loan EMI calculations.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2.5 mb-1">
            <span className="text-2xl">🇺🇸</span> USA Mode (USD)
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Solves remodeling and home addition budgeting hurdles for American homeowners. Calculate accurate costs for kitchen remodels, bathroom renovations, home additions, swimming pools, outdoor kitchens, and pickleball courts, along with local property tax assessments and rent-vs-buy financial analyses.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2.5 mb-1">
            <span className="text-2xl">🇦🇪</span> UAE / Dubai Mode (AED)
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            Eliminates fee ambiguity for international and expatriate property buyers. Accurately calculates upfront acquisition expenses including Dubai Land Department (DLD 4%) transfer fees, mortgage registration, trustee admin fees, and ongoing community service charges across Dubai freehold districts.
          </p>
        </div>
      </div>

      <h2>What We Provide</h2>
      <ul>
        <li>
          <strong>Cost Estimation Calculators:</strong> Instant, localized budget calculators covering turnkey civil construction, flooring, painting, modular interiors, and structural bill of quantities (BOQ) for cement, steel, bricks, and sand.
        </li>
        <li>
          <strong>Architectural Floor Plans:</strong> Curated 2D residential floor plans and room layouts with dimension guidelines, natural lighting considerations, and functional space planning.
        </li>
        <li>
          <strong>Land Area Converter:</strong> Seamless conversions across regional Indian land measurement units including Gunta, Bigha, Cent, Ground, Biswa, Kanal, Marla, and Square Feet.
        </li>
        <li>
          <strong>Verified Experts Directory:</strong> An open directory enabling homeowners to contact certified civil contractors, architects, structural engineers, and interior designers directly—with zero middleman commissions.
        </li>
      </ul>

      <h2>Standard License &amp; Conceptual Use Terms</h2>
      <p>
        All calculations, floor plans, digital tools, and content on Home Design English are protected under standard intellectual property and copyright laws.
      </p>
      <ul>
        <li>
          <strong>Informational &amp; Conceptual License:</strong> House plans, material estimates, and budget breakdowns generated on this platform are licensed to users for personal, non-commercial, informational planning purposes.
        </li>
        <li>
          <strong>Architectural Concept Notice:</strong> Floor plans and visual designs serve as initial architectural concepts. Before commencing construction, all plans must be reviewed, adapted, and stamped by licensed professional architects and structural engineers in accordance with local municipal bylaws and statutory building codes.
        </li>
        <li>
          <strong>Restrictions:</strong> Automated scraping, unauthorized redistribution, reverse-engineering of calculator algorithms, or commercial resale of HDE proprietary assets without express written consent is strictly prohibited.
        </li>
      </ul>

      <h2>Get in Touch</h2>
      <p>
        Have questions, feedback, or need support? Visit our <Link href="/contact" className="text-primary hover:underline font-semibold">Contact Us</Link> page to connect with our team.
      </p>
    </div>
  );
}
