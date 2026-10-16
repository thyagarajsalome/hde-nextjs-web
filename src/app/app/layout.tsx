import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HDE Mobile App | Construction Cost Estimator & House Floor Plans',
  description: 'Download the official Home Design English (HDE) mobile app for Android. Estimate building construction costs, floor plans, and material BOQ on the go.',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/app',
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
