import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer | Home Design English',
  description: 'Important legal disclaimer regarding Home Design English construction estimates, architectural concept designs, material quantities, and property calculations.',
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo dark:prose-invert">
      <h1>Disclaimer</h1>
      <p><strong>Last Updated: September 5, 2026</strong></p>
      
      <h2>1. General Information &amp; Scope of Services</h2>
      <p>The information, calculators, and tools provided on Home Design English (homedesignenglish.com) are for general estimation and educational purposes only. This platform serves users in <strong>India</strong>, the <strong>United States of America (USA)</strong>, and the <strong>United Arab Emirates (UAE)</strong> through our respective regional tools.</p>
      
      <h2>2. HDE is an Estimation Platform, Not a Builder or Real Estate Broker</h2>
      <p><strong>Home Design English (HDE) is strictly an independent estimation and budgeting platform.</strong> We provide calculations, cost breakdowns, area guides, and planning tools. HDE is <strong>not</strong> a construction developer, contractor, or builder in India or the USA, nor are we a licensed real estate agency or broker in the United Arab Emirates.</p>

      <h2>3. UAE &amp; Dubai Property Information (RERA &amp; DLD)</h2>
      <p>All Dubai real estate data, fee calculations (including Dubai Land Department - DLD 4% fees, trustee fees, and title deed costs), estimated rental yields, and service charges are provided for preliminary informational purposes based on public RERA and DLD guidelines as of 2026. Official government fees, mortgage caps, and service charges may change without notice. Real estate transactions must always be processed through licensed escrow accounts and registered with the Dubai Land Department (DLD).</p>

      <h2>4. No Financial, Legal, or Investment Advice</h2>
      <p>The content and tools on this website do not constitute financial, investment, legal, or tax advice. Real estate investments involve capital risk, market fluctuation, and foreign currency volatility. Past yields or historical appreciation in Dubai or other markets do not guarantee future returns. Always seek independent advice from a certified financial planner, certified tax advisor, or RERA-licensed property consultant before committing capital.</p>
      
      <h2>5. Government Regulations &amp; Statutory Updates</h2>
      <p>UAE property regulations, statutory fees, developer escrow criteria, and foreign ownership guidelines are governed by relevant government authorities (including DLD and RERA) and are subject to periodic regulatory updates. Users are strongly advised to verify current statutory requirements directly with official government portals or licensed legal consultants.</p>
      
      <h2>6. Accuracy of Data &amp; Currency Conversion</h2>
      <p>While we strive to keep material prices, property price ranges, and currency conversion rates updated via daily cached forex feeds, market prices fluctuate constantly. Conversion equivalents in INR, USD, and other currencies are indicative approximations.</p>
      
      <h2>7. Professional Consultation Required</h2>
      <p>You must always consult licensed architects, structural engineers, or RERA-registered real estate specialists before commencing construction, signing contracts, or transferring funds.</p>

      <h2>8. Partner Network, Non-Government Affiliation &amp; Fair-Use Verification</h2>
      <p>Home Design English (HDE) is <strong>not partnered with, endorsed by, or affiliated with the Government of Dubai, the UAE Government, the Dubai Land Department (DLD), or the Real Estate Regulatory Agency (RERA) in any manner whatsoever</strong>. HDE operates solely as an independent property technology, cost estimation, and lead-referral portal.</p>
      <p>Our internal review team manually cross-references submitted broker license numbers (BRN) and office registration numbers (ORN) against <strong>already publicly available data</strong> published by official regulatory directories under recognized fair-use information policies. This check is conducted solely to ensure participating brokers are genuine, active industry practitioners. HDE stores <strong>verified information only</strong> in its database, and never charges government-related statutory fees.</p>
    </div>
  );
}