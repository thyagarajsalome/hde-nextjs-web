import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Listings | Bangalore Properties | HDE',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyPropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
