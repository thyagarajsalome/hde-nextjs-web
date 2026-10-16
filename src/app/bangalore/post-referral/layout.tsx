import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post To-Let Referral Lead in Bangalore | Earn Referral Bonus | HDE',
  description: 'Spot a To-Let board in your Bangalore neighborhood? Snap a photo, submit the details, and earn instant cash rewards when verified.',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/bangalore/post-referral',
  },
};

export default function PostReferralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
