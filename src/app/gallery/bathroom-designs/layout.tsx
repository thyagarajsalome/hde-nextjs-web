import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modern Bathroom Designs Gallery | Master Bath, Vanities & Tile Ideas | HDE',
  description: 'Browse modern bathroom designs: master bathrooms, guest baths, wet-dry partition layouts, and premium vanity ideas with budget breakdowns.',
  keywords: 'bathroom designs, modern bathroom gallery, master bathroom ideas, bathroom vanity designs, wet dry bathroom, bathroom tile ideas',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/gallery/bathroom-designs',
  },
  openGraph: {
    title: 'Modern Bathroom Designs Gallery | HDE',
    description: 'Browse modern bathroom designs with budget breakdowns and layout ideas.',
    url: 'https://www.homedesignenglish.com/gallery/bathroom-designs',
    siteName: 'Home Design English',
  },
};

export default function BathroomGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
