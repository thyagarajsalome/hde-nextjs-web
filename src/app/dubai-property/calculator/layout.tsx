import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dubai Property Buying Cost Calculator | HDE',
  description: 'Calculate the true cost of buying property in Dubai. Includes DLD fees (4%), agent commission, mortgage registration, service charges, and more. Free and instant.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
