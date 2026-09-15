import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Dream Home Calculator & Home Design English',
  description: 'Privacy Policy for Dream Home Calculator and Home Design English, developed by Thyagaraj Salome. Learn how we handle your data and privacy.',
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
        This Privacy Policy applies to the <strong>Dream Home Calculator</strong> mobile application 
        (available on the Google Play Store) and the <strong>Home Design English (HDE)</strong> web platform 
        (located at <Link href="/" className="text-primary hover:underline">homedesignenglish.com</Link>), 
        owned, developed, and operated by independent developer <strong>Thyagaraj Salome</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
      </p>

      <h2>1. Application &amp; Developer Identification</h2>
      <ul>
        <li><strong>Application Name:</strong> Dream Home Calculator</li>
        <li><strong>Website:</strong> Home Design English (homedesignenglish.com)</li>
        <li><strong>Developer / Publisher:</strong> Thyagaraj Salome</li>
        <li><strong>Contact Email:</strong> <a href="mailto:hdeadmin@gmail.com" className="text-primary hover:underline font-semibold">hdeadmin@gmail.com</a></li>
      </ul>

      <h2>2. Information We Collect</h2>
      <p>We collect information to provide and improve our estimation and architectural planning services:</p>
      <ul>
        <li>
          <strong>Account Information:</strong> When you create an account, we collect your email address and authentication credentials securely via our authentication provider (Google Sign-In / Supabase Auth).
        </li>
        <li>
          <strong>User Inputs &amp; Saved Projects:</strong> Construction dimensions, selected materials, project locations, and saved cost estimation calculations that you explicitly create and save.
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
        If you have questions, concerns, or privacy-related requests regarding the <strong>Dream Home Calculator</strong> app or <strong>Home Design English</strong>, please contact:
      </p>
      <p>
        <strong>Developer:</strong> Thyagaraj Salome<br />
        <strong>Email:</strong> <a href="mailto:hdeadmin@gmail.com" className="text-primary hover:underline font-semibold">hdeadmin@gmail.com</a><br />
        <strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://www.homedesignenglish.com</Link>
      </p>
    </div>
  );
}