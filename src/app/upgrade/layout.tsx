import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans | Home Design English (HDE)',
  description: 'Choose your HDE project credits and subscription plan. Access professional construction cost calculators, CAD floor plans, and bill of quantities estimation tools.',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/upgrade',
  },
  openGraph: {
    title: 'Pricing & Plans | Home Design English',
    description: 'Affordable project estimation credits and pro drafting tools for self-builders, architects, and contractors.',
    url: 'https://www.homedesignenglish.com/upgrade',
    siteName: 'Home Design English',
  },
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
