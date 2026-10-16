import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post Property Free in Bangalore | 0% Brokerage Direct Owner | HDE',
  description: 'List your house, flat, plot, or commercial space for rent or sale in Bangalore for free. Reach verified tenants and buyers directly with zero brokerage.',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/bangalore/post-property',
  },
};

export default function PostPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
