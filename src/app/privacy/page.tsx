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
      
      <h3>Security</h3>
      <p>We use industry-standard encryption and secure databases to protect your personal information.</p>
    </div>
  );
}