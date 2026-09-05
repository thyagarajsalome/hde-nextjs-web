import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | Home Design English',
  description: 'Legal disclaimer and terms of use for our calculators.',
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo">
      <h1>Disclaimer</h1>
      <p><strong>Last Updated: September 5, 2026</strong></p>
      
      <h3>1. General Information & Scope of Services</h3>
      <p>The information, calculators, and tools provided on Home Design English (homedesignenglish.com) are for general estimation and educational purposes only. This platform serves users in <strong>India</strong>, the <strong>United States of America (USA)</strong>, and the <strong>United Arab Emirates (UAE)</strong> through our respective regional tools.</p>
      
      <h3>2. HDE is an Estimation Platform, Not a Builder or Real Estate Broker</h3>
      <p><strong>Home Design English (HDE) is strictly an independent estimation and budgeting platform.</strong> We provide calculations, cost breakdowns, area guides, and planning tools. HDE is <strong>not</strong> a construction developer, contractor, or builder in India or the USA, nor are we a licensed real estate agency or broker in the United Arab Emirates.</p>

      <h3>3. UAE & Dubai Property Information (RERA & DLD)</h3>
      <p>All Dubai real estate data, fee calculations (including Dubai Land Department - DLD 4% fees, trustee fees, and title deed costs), estimated rental yields, and service charges are provided for preliminary informational purposes based on public RERA and DLD guidelines as of 2026. Official government fees, mortgage caps, and service charges may change without notice. Real estate transactions must always be processed through licensed escrow accounts and registered with the Dubai Land Department (DLD).</p>

      <h3>4. No Financial, Legal, or Investment Advice</h3>
      <p>The content and tools on this website do not constitute financial, investment, legal, or tax advice. Real estate investments involve capital risk, market fluctuation, and foreign currency volatility. Past yields or historical appreciation in Dubai or other markets do not guarantee future returns. Always seek independent advice from a certified financial planner, certified tax advisor, or RERA-licensed property consultant before committing capital.</p>
      
      <h3>5. UAE Golden Visa Information</h3>
      <p>Mentions of the 10-Year UAE Golden Visa for property investors purchasing properties worth AED 2,000,000 or above reflect general government announcements and are subject to immigration approval, developer payment milestones, and regulatory updates from the Federal Authority for Identity, Citizenship, Customs and Port Security (ICP).</p>
      
      <h3>6. Accuracy of Data & Currency Conversion</h3>
      <p>While we strive to keep material prices, property price ranges, and currency conversion rates updated via daily cached forex feeds, market prices fluctuate constantly. Conversion equivalents in INR, USD, and other currencies are indicative approximations.</p>
      
      <h3>7. Professional Consultation Required</h3>
      <p>You must always consult licensed architects, structural engineers, or RERA-registered real estate specialists before commencing construction, signing contracts, or transferring funds.</p>
    </div>
  );
}