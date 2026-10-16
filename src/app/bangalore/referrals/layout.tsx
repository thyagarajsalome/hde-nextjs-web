import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bangalore Property Scout Referral Board | Earn Rewards | HDE',
  description: 'Community-sourced real estate referral board for Bangalore. Discover exclusive direct-owner rental leads, to-let boards, and earn rewards for property referrals.',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/bangalore/referrals',
  },
};

export default function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
