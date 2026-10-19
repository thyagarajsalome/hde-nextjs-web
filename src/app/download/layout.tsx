import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download HDE Studio CAD | Professional 2D Architectural Drafting & Floor Plan Software',
  description: 'Download HDE Studio CAD for PC. Professional offline 2D architectural drafting software with smart wall snapping, metric & imperial catalogs, and high-resolution vector PDF export.',
  keywords: 'HDE Studio CAD, architectural drafting software, 2D CAD download, floor plan software, offline CAD, house planning software, CAD for Windows',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/download',
  },
  openGraph: {
    title: 'Download HDE Studio CAD | Professional 2D Architectural Drafting Software',
    description: 'Standalone desktop CAD application for home builders, drafters, and architects. Offline, fast, and built for modern architectural drafting.',
    url: 'https://www.homedesignenglish.com/download',
    siteName: 'Home Design English',
    type: 'website',
    images: [{ url: '/HDE_256px.webp', width: 256, height: 256, alt: 'HDE Studio CAD' }],
  },
  twitter: {
    card: 'summary',
    title: 'Download HDE Studio CAD | Professional 2D Architectural Drafting Software',
    description: 'Download HDE Studio CAD for Windows. Native offline 2D CAD drafting with dual unit catalogs and crisp vector PDF export.',
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HDE Studio CAD",
  "operatingSystem": "Windows 10, Windows 11, macOS, Linux",
  "applicationCategory": "DesignApplication",
  "description": "Professional offline 2D architectural CAD software for house planning, smart wall drafting, dynamic dimensioning, and vector PDF blueprint export.",
  "offers": [
    {
      "@type": "Offer",
      "price": "299.00",
      "priceCurrency": "USD",
      "name": "Lifetime Commercial License (USA)",
      "availability": "https://schema.org/InStock",
      "url": "https://www.homedesignenglish.com/download#pricing"
    },
    {
      "@type": "Offer",
      "price": "9999.00",
      "priceCurrency": "INR",
      "name": "Lifetime Commercial License (India)",
      "availability": "https://schema.org/InStock",
      "url": "https://www.homedesignenglish.com/download#pricing"
    },
    {
      "@type": "Offer",
      "price": "1099.00",
      "priceCurrency": "AED",
      "name": "Lifetime Commercial License (Dubai / UAE)",
      "availability": "https://schema.org/InStock",
      "url": "https://www.homedesignenglish.com/download#pricing"
    }
  ],
  "softwareVersion": "2.1",
  "fileSize": "38MB",
  "author": {
    "@type": "Organization",
    "name": "Home Design English",
    "url": "https://www.homedesignenglish.com"
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.homedesignenglish.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Download HDE Studio CAD",
      "item": "https://www.homedesignenglish.com/download"
    }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need prior 2D CAD drafting experience to use HDE Studio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No CAD experience is required. HDE Studio was engineered to be visual, intuitive, and accessible to everyone. You can start drawing walls, placing doors, adding furniture, and dimensioning rooms within 5 minutes of opening the app."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use HDE Studio CAD without an active internet connection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, 100%. HDE Studio is a native, offline desktop CAD application built for independent drafting with zero internet connection required."
      }
    },
    {
      "@type": "Question",
      "name": "What file formats does HDE Studio support for export and printing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HDE Studio allows you to export your 2D plans directly to crisp, lossless vector PDF files up to 300 DPI, optimized for large-format architectural plotters (A0 to A4) as well as PNG and SVG graphics."
      }
    },
    {
      "@type": "Question",
      "name": "How does the desktop license key activation work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you purchase an HDE Studio Pro license (Monthly or Lifetime), an official license key in the format HDE-PRO-YYYY-XXXX-XXXX is instantly generated and tied to your account email to unlock all commercial features."
      }
    }
  ]
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
