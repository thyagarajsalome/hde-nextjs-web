import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dubai Property Buying Cost Calculator | HDE',
  description: 'Calculate the true cost of buying property in Dubai. Includes DLD fees (4%), agent commission, mortgage registration, service charges, and more. Free and instant.',
  alternates: {
    canonical: 'https://dubai.homedesignenglish.com/dubai-property/calculator',
  },
  openGraph: {
    title: 'Dubai Property Buying Cost Calculator | HDE',
    description: 'Calculate the true cost of buying property in Dubai. Includes DLD fees (4%), agent commission, mortgage registration, service charges, and more.',
    url: 'https://dubai.homedesignenglish.com/dubai-property/calculator',
    siteName: 'Home Design English',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
