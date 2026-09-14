import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Home Design English',
  description: 'Learn how Home Design English collects, protects, and handles your personal data, saved projects, and calculator inputs across our global services.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated: September 5, 2026</strong></p>
      
      <p>At Home Design English, your privacy is our priority. This document outlines the types of information we collect and how we use it across our regional services in India, the United States, and the United Arab Emirates.</p>
      
      <h2>Information We Collect</h2>
      <ul>
        <li><strong>Account Data:</strong> When you sign up, we collect your email address for authentication via our secure provider (Supabase/Google).</li>
        <li><strong>Saved Projects:</strong> When you use our calculators, your project requirements (area, location, choices) are securely stored in our database so you can retrieve them later.</li>
        <li><strong>Dubai Consultation Inquiries:</strong> When you submit an inquiry through our Dubai Property forms, we collect your name, email, contact telephone/WhatsApp number, area of interest, and optional budget to facilitate consultation with certified property advisors.</li>
      </ul>
      
      <h2>How We Use Your Information</h2>
      <p>We use your data solely to provide, maintain, and improve our calculator services. For users requesting Dubai property guidance, your contact details are shared exclusively with verified, RERA-certified real estate professionals and authorized developer desks to answer your specific inquiry. We do not sell your personal information to unverified bulk advertising networks.</p>
      
      <h2>Payment Processing</h2>
      <p>All transactions, including USD and INR payments, are securely processed through our certified third-party payment gateway (Razorpay). Home Design English does not store your credit card numbers, bank account details, or secure payment information on our servers.</p>

      <h2>For UAE Residents (Federal Decree-Law No. 45 of 2021)</h2>
      <p>In compliance with the UAE Personal Data Protection Law (PDPL), UAE users have the right to request access, correction, or deletion of their personal information. If you have submitted a property consultation request and wish to withdraw your consent or have your contact details erased from our active lead registry, email us at <strong>hdeadmin@gmail.com</strong>.</p>

      <h2>For US Residents (CCPA & CPRA)</h2>
      <p>If you are a resident of California or other applicable US states, you have the right to request access to your personal data, request deletion of your data, and opt-out of data tracking. Because we do not sell your data, there is no need to manually opt-out of data sales. You may delete your account and all associated project data at any time from your dashboard.</p>

      <h2>Security &amp; Data Protection</h2>
      <p>We use industry-standard SSL/TLS encryption and secure cloud infrastructure to protect your personal information.</p>
    </div>
  );
}