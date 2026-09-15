import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | HDE: Home Design & Real Estate',
  description: 'Privacy Policy for HDE: Home Design & Real Estate, published by HDE-TM. Learn how we handle your data, saved projects, and user privacy.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 min-h-[60vh] prose prose-indigo dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> September 15, 2026</p>
      
      <p>
        This Privacy Policy applies to the <strong>HDE: Home Design &amp; Real Estate</strong> mobile application 
        (formerly known as <em>Dream Home Calculator</em>, available on the Google Play Store) and the 
        <strong>Home Design English (HDE)</strong> platform (located at <Link href="/" className="text-primary hover:underline">homedesignenglish.com</Link>), 
        owned, developed, and published by <strong>HDE-TM</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
      </p>

      <h2>1. Application &amp; Developer Identification</h2>
      <ul>
        <li><strong>Application Name:</strong> HDE: Home Design &amp; Real Estate (Dream Home Calculator)</li>
        <li><strong>Developer / Publisher Name:</strong> HDE-TM</li>
        <li><strong>Official Website:</strong> <Link href="/" className="text-primary hover:underline">https://www.homedesignenglish.com</Link></li>
        <li><strong>Developer Contact Email:</strong> <a href="mailto:hdeadmin@gmail.com" className="text-primary hover:underline font-semibold">hdeadmin@gmail.com</a></li>
      </ul>

      <h2>2. Information We Collect</h2>
      <p>We collect information to provide, maintain, and improve our construction cost estimation and architectural planning tools:</p>
      <ul>
        <li>
          <strong>Account Information:</strong> When you create an account, we collect your email address and authentication credentials securely via our authentication providers (Google Sign-In / Supabase Auth).
        </li>
        <li>
          <strong>User Inputs &amp; Saved Projects:</strong> Construction dimensions, material preferences, project locations, and saved cost estimation calculations that you explicitly create and save.
        </li>
        <li>
          <strong>Device &amp; Diagnostic Data:</strong> In the mobile application, non-identifying technical data such as operating system version, device model, and crash diagnostics may be collected to ensure app stability.
        </li>
        <li>
          <strong>Inquiries &amp; Consultations:</strong> When you submit an optional consultation or directory request, you may provide your name, contact phone/WhatsApp number, and project requirements.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information strictly for the following purposes:</p>
      <ul>
        <li>To calculate accurate building materials, turnkey costs, and structural estimates based on your inputs.</li>
        <li>To synchronize your saved calculation projects across devices.</li>
        <li>To provide customer support and respond to user inquiries.</li>
        <li>To maintain app performance, prevent fraud, and ensure security.</li>
      </ul>
      <p><strong>We do not sell, rent, or trade your personal data</strong> to third-party data brokers or bulk marketing lists.</p>

      <h2>4. Third-Party Service Providers</h2>
      <p>
        The mobile application and website integrate trusted third-party services that may collect information used to identify you in accordance with their respective privacy policies:
      </p>
      <ul>
        <li><strong>Google Play Services:</strong> For core Android runtime utilities and app distribution.</li>
        <li><strong>Google Sign-In &amp; Supabase:</strong> For secure user authentication and cloud database synchronization.</li>
        <li><strong>Razorpay:</strong> For secure processing of optional premium credit packages. We do not store credit card or banking details on our servers.</li>
      </ul>

      <h2>5. User Data Deletion &amp; Retention</h2>
      <p>
        We respect your right to control your personal information. You can request the complete deletion of your account and all associated saved calculations at any time:
      </p>
      <ul>
        <li><strong>In-App / On Web:</strong> You can delete your saved projects directly within your user dashboard.</li>
        <li><strong>By Email:</strong> You can send an account deletion request to <a href="mailto:hdeadmin@gmail.com" className="text-primary hover:underline font-semibold">hdeadmin@gmail.com</a> with the subject line <em>&quot;Delete My Account&quot;</em> from your registered email address. We will permanently erase your user profile and all associated data within 7 business days.</li>
      </ul>

      <h2>6. Children&apos;s Privacy (COPPA Compliance)</h2>
      <p>
        Our services are not intended for children under 13 years of age (or under 16 in certain jurisdictions). We do not knowingly collect personal identifiable information from children. If we discover that a child has provided us with personal information, we will immediately delete it from our servers.
      </p>

      <h2>7. Security of Your Data</h2>
      <p>
        We implement industry-standard security measures, including HTTPS/TLS encryption for all data in transit and encrypted cloud storage for authenticated accounts, to protect your personal information against unauthorized access, alteration, or disclosure.
      </p>

      <h2>8. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
      </p>

      <h2>9. Contact Information</h2>
      <p>
        If you have questions, concerns, or privacy-related requests regarding the <strong>HDE: Home Design &amp; Real Estate</strong> app or <strong>Home Design English</strong>, please contact:
      </p>
      <p>
        <strong>Developer:</strong> HDE-TM<br />
        <strong>Email:</strong> <a href="mailto:hdeadmin@gmail.com" className="text-primary hover:underline font-semibold">hdeadmin@gmail.com</a><br />
        <strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://www.homedesignenglish.com</Link>
      </p>
    </div>
  );
}