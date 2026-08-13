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
      <p><strong>Last Updated: August 13, 2026</strong></p>
      
      <h3>1. General Information</h3>
      <p>The information, calculators, and tools provided on Home Design English (homedesignenglish.com) are for general estimation and educational purposes only.</p>
      
      <h3>2. Not Professional Advice</h3>
      <p>The owner, developers, and writers of this website are not licensed architects, civil engineers, or registered contractors. The estimates provided by our calculators are approximations based on general market averages and algorithms. They should <strong>never</strong> be used as absolute values for purchasing, legal contracts, or structural design.</p>
      
      <h3>3. Accuracy of Data</h3>
      <p>While we strive to keep material rates and algorithms updated, local prices fluctuate daily. Material quantities and cost estimates vary significantly based on your site conditions, structural design, and contractor efficiency.</p>
      
      <h3>4. Professional Consultation Required</h3>
      <p>You must always consult a certified architect, structural engineer, and local building authorities before commencing any construction or making financial commitments.</p>
    </div>
  );
}