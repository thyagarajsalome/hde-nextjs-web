import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Home Design English',
  description: 'Get in touch with the Home Design English team.',
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo">
      <h1>Contact Us</h1>
      <p>If you have any questions, suggestions, or need support with our construction calculators, please feel free to reach out to us.</p>
      
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8">
        <h3>Email Support</h3>
        <p><strong>General Inquiries:</strong> info@homedesignenglish.com</p>
        <p><strong>Technical Support:</strong> support@homedesignenglish.com</p>
      </div>

      <p className="mt-8 text-gray-500 text-sm">Please allow 24-48 hours for a response from our team. We appreciate your feedback!</p>
    </div>
  );
}