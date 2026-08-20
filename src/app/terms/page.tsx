import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Home Design English',
  description: 'Terms and conditions of using our services.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo">
      <h1>Terms of Service</h1>
      <p><strong>Last Updated: August 13, 2026</strong></p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using homedesignenglish.com (the "Site"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website.</p>
      
      <h3>2. Use of Service</h3>
      <p>The calculators and tools provided on the Site are intended for personal, non-commercial use. You may not reverse-engineer, scrape, or systematically extract data from our algorithms.</p>
      
      <h3>3. Limitation of Liability</h3>
      <p>Home Design English, its developers, and affiliates shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our tools, including financial losses or structural failures resulting from reliance on our estimates.</p>
      
      <h3>4. User Accounts</h3>
      <p>You are responsible for safeguarding your login credentials. We reserve the right to terminate accounts that violate our terms or attempt to abuse the system.</p>
      
      <h3>5. Payments & Refunds</h3>
      <p>All credit packages and premium features are billed in your local currency (e.g., USD or INR) via our third-party payment processor. Because credits are delivered and usable instantly upon purchase, all sales are considered final and non-refundable unless otherwise required by local law. We do not offer auto-renewing subscriptions; all purchases are one-time credit top-ups.</p>
    </div>
  );
}