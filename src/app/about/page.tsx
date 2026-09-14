import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Home Design English (HDE)',
  description: 'Learn about Home Design English (HDE) - our mission to provide transparent construction cost estimators, 2D floor plans, and building calculators.',
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
        Building or remodeling a home is one of life&apos;s most significant personal and financial milestones. Yet, homeowners frequently face ambiguous contractor quotes, fluctuating material prices, and opaque budgeting processes.
      </p>
      <p>
        <strong>Home Design English (HDE)</strong> was created to solve this problem. We provide accessible, accurate, and localized digital tools that help users estimate construction budgets, understand material requirements, explore curated floor plans, and connect with trusted local professionals.
      </p>

      <h2>What We Provide</h2>
      <ul>
        <li>
          <strong>Cost Estimation Calculators:</strong> Instant, localized budget calculators covering turnkey civil construction, flooring, painting, modular interiors, and structural bill of quantities (BOQ) for cement, steel, bricks, and sand.
        </li>
        <li>
          <strong>Architectural Floor Plans:</strong> Curated 2D residential floor plans and room layouts with dimension guidelines, ventilation standards, and Vastu orientation principles.
        </li>
        <li>
          <strong>Land Area Converter:</strong> Seamless conversions across regional Indian land measurement units including Gunta, Bigha, Cent, Ground, Biswa, Kanal, Marla, and Square Feet.
        </li>
        <li>
          <strong>Verified Experts Directory:</strong> An open directory enabling homeowners to contact certified civil contractors, architects, structural engineers, and interior designers directly—with zero middleman commissions.
        </li>
        <li>
          <strong>International Property Guides:</strong> Specialized cost estimation and regulatory fee calculators for real estate buyers in the United States and the United Arab Emirates (Dubai).
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
