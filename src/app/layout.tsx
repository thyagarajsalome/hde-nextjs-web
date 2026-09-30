import type { Metadata } from 'next';
import Script from 'next/script';
import '../styles/global.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import { RegionProvider } from '@/context/RegionContext';

export const metadata: Metadata = {
  title: 'HDE - Dream Home Construction & Interior Cost Calculator',
  description: 'Calculate your dream home construction, materials BOQ, interior design, flooring, and MEP utility costs accurately.',
  keywords: 'house design, floor plans, construction cost calculator, building estimator, remodel budget, rent vs buy calculator, site khata, vastu floor plan, dubai dld fees, home loan EMI calculator, land unit converter',
  alternates: {
    canonical: 'https://www.homedesignenglish.com',
  },
  metadataBase: new URL('https://www.homedesignenglish.com'),
  verification: {
    google: 'j0tDFreq7BZOn79uEWGW5K_70WrkdIr8GCnJRcC57MA',
  },
  openGraph: {
    title: 'HDE - Dream Home Construction & Interior Cost Calculator',
    description: 'Calculate your dream home construction, materials BOQ, interior design, flooring, and MEP utility costs accurately.',
    url: 'https://www.homedesignenglish.com',
    siteName: 'Home Design English',
    type: 'website',
    images: [{ url: '/bg-logo.png', width: 512, height: 512, alt: 'Home Design English' }],
  },
  twitter: {
    card: 'summary',
    title: 'HDE - Dream Home Construction & Interior Cost Calculator',
    description: 'Calculate your dream home construction, materials BOQ, interior design, flooring, and MEP utility costs accurately.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="google-play-app" content="app-id=in.toolwebsite.twa" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HDE: Floor Plan & Estimator",
              "operatingSystem": "Android",
              "applicationCategory": "BusinessApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "ratingCount": "100"
              },
              "description": "House floor plans, construction cost estimation, remodel budgets & property ROI. Supports India, USA, and UAE with region-specific tools.",
              "url": "https://play.google.com/store/apps/details?id=in.toolwebsite.twa",
              "downloadUrl": "https://play.google.com/store/apps/details?id=in.toolwebsite.twa"
            })
          }}
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossOrigin="anonymous" referrerPolicy="no-referrer" precedence="default" />
      </head>
      <body className="bg-background text-zinc-900 min-h-screen flex flex-col font-sans">
        {/* Google tag (gtag.js) GA4 */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-NEWK4NXEVD"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NEWK4NXEVD', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        <ToastProvider>
          <UserProvider>
            <RegionProvider>
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </RegionProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
