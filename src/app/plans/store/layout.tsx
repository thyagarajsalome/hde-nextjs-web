import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Architectural House Plans PDF Store | 2D Blueprints & Working Drawings | HDE',
  description: 'Download high-resolution 300 DPI vector PDF architectural blueprints, municipal sanction drawings, and 2D floor plans with structural setbacks, electrical schedules, and bill of quantities for Indian plots.',
  keywords: 'architectural house plans pdf, vector pdf blueprints, 30x40 house plan pdf, 30x50 floor plan drawing, 20x30 blueprint download, structural working drawings, sanction plan pdf india, house plan store',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/plans/store',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Architectural House Plans PDF Store | 2D Blueprints & Working Drawings | HDE',
    description: 'Download high-resolution 300 DPI vector PDF architectural blueprints, municipal sanction drawings, and 2D floor plans with structural setbacks, electrical schedules, and bill of quantities for Indian plots.',
    url: 'https://www.homedesignenglish.com/plans/store',
    siteName: 'Home Design English (HDE)',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Architectural House Plans PDF Store | 2D Blueprints & Working Drawings',
    description: 'Download high-resolution 300 DPI vector PDF architectural blueprints, municipal sanction drawings, and 2D floor plans.',
  },
};

const storeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://www.homedesignenglish.com'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'House Plans',
          'item': 'https://www.homedesignenglish.com/plans'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'PDF Plans Store',
          'item': 'https://www.homedesignenglish.com/plans/store'
        }
      ]
    },
    {
      '@type': 'CollectionPage',
      '@id': 'https://www.homedesignenglish.com/plans/store#webpage',
      'url': 'https://www.homedesignenglish.com/plans/store',
      'name': 'Architectural House Plans PDF Store | 2D Blueprints & Working Drawings',
      'description': 'Direct download of vector PDF architectural blueprints, sanction layouts, and engineering working drawings for Indian plot sizes.',
      'isPartOf': {
        '@type': 'WebSite',
        '@id': 'https://www.homedesignenglish.com/#website',
        'name': 'Home Design English',
        'url': 'https://www.homedesignenglish.com'
      },
      'about': {
        '@type': 'Store',
        'name': 'HDE Architectural Blueprint Store',
        'description': 'Vector PDF house plans and construction blueprints starting at ₹499',
        'priceRange': '₹499 - ₹1499'
      }
    }
  ]
};

export default function PlansStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      {children}
    </>
  );
}
