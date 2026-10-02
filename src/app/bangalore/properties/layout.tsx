// src/app/bangalore/properties/layout.tsx
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties & House Rent in Bangalore | 0% Brokerage Direct Owner Portal | HDE",
  description:
    "Find houses for rent, flats, plots & villas in Bangalore directly from home owners. 0% brokerage, zero spam. Post your rental property or browse 1RK, 1BHK, 2BHK, 3BHK listings across North, South, East & West Bangalore.",
  keywords: [
    "house for rent in bangalore",
    "bangalore house rent",
    "flats for rent bangalore",
    "rent house bangalore",
    "post property free bangalore",
    "house rent owners bangalore",
    "1bhk for rent bangalore",
    "2bhk for rent bangalore",
    "3bhk for rent bangalore",
    "independent house for rent bangalore",
    "bangalore properties",
    "no broker house rent bangalore",
    "to let bangalore",
  ],
  alternates: {
    canonical: "https://www.homedesignenglish.com/bangalore/properties",
  },
  openGraph: {
    title: "Properties & House Rent in Bangalore | 0% Brokerage Direct Owner Portal",
    description:
      "Find houses for rent, flats & plots in Bangalore directly from home owners with 0% brokerage. Post your property free or find verified rentals.",
    url: "https://www.homedesignenglish.com/bangalore/properties",
    siteName: "Home Design English",
    locale: "en_IN",
    type: "website",
  },
};

export default function BangalorePropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.homedesignenglish.com/#website",
        url: "https://www.homedesignenglish.com/",
        name: "Home Design English",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.homedesignenglish.com/bangalore/properties?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "RealEstateAgent",
        "@id": "https://www.homedesignenglish.com/bangalore/properties#agent",
        name: "HDE Bangalore Real Estate & Rental Portal",
        url: "https://www.homedesignenglish.com/bangalore/properties",
        description:
          "Zero-brokerage Bangalore property discovery portal connecting home owners, buyers, and tenants directly without telemarketing spam.",
        areaServed: {
          "@type": "City",
          name: "Bengaluru",
          sameAs: "https://en.wikipedia.org/wiki/Bangalore",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.homedesignenglish.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Bangalore",
            item: "https://www.homedesignenglish.com/bangalore",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Properties & Rentals",
            item: "https://www.homedesignenglish.com/bangalore/properties",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How can home owners post their house for rent in Bangalore for free on HDE?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Home owners can click 'Post Property Free', specify rental details (monthly rent, advance deposit, BHK type, furnished status, available date), and publish instantly with zero brokerage fees. Owners retain full control to edit details, delete listings, or mark 'Deal Done' once rented.",
            },
          },
          {
            "@type": "Question",
            name: "How does HDE eliminate broker commission for Bangalore tenants?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "HDE connects house hunters directly with individual property owners and landlords. There are no middleman brokerage charges (typically 1 month rent saved), and tenant phone numbers are safeguarded against spam brokers.",
            },
          },
          {
            "@type": "Question",
            name: "What are typical security deposit standards for house rent in Bangalore in 2026?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "While historical practices required 10 months deposit, standard Bangalore rental deposits in 2026 range from 3 to 6 months of rent depending on the locality, society amenities, and furnishing level.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
