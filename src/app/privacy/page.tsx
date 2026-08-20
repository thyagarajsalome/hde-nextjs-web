import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Home Design English',
  description: 'Privacy policy and data protection.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo">
      <h1>Privacy Policy</h1>
      <p><strong>Last Updated: August 13, 2026</strong></p>
      
      <p>At Home Design English, your privacy is our priority. This document outlines the types of information we collect and how we use it.</p>
      
      <h3>Information We Collect</h3>
      <ul>
        <li><strong>Account Data:</strong> When you sign up, we collect your email address for authentication via our secure provider (Supabase/Google).</li>
        <li><strong>Saved Projects:</strong> When you use our calculators, your project requirements (area, location, choices) are securely stored in our database so you can retrieve them later.</li>
      </ul>
      
      <h3>How We Use Your Information</h3>
      <p>We use your data solely to provide, maintain, and improve our calculator services. We do not sell your personal information or project data to third-party marketing agencies.</p>
      
      <h3>Payment Processing</h3>
      <p>All transactions, including USD and INR payments, are securely processed through our certified third-party payment gateway (Razorpay). Home Design English does not store your credit card numbers, bank account details, or secure payment information on our servers.</p>

      <h3>For US Residents (CCPA & CPRA)</h3>
      <p>If you are a resident of California or other applicable US states, you have the right to request access to your personal data, request deletion of your data, and opt-out of data tracking. Because we do not sell your data, there is no need to manually opt-out of data sales. You may delete your account and all associated project data at any time from your dashboard.</p>

      <h3>Security</h3>
      <p>We use industry-standard encryption and secure cloud databases to protect your personal information.</p>
    </div>
  );
}