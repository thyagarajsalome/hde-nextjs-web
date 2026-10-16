import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modular Kitchen Designs Gallery | Layouts, 3D Photos & Cost Estimates | HDE',
  description: 'Explore 50+ modern modular kitchen design ideas: L-shape, U-shape, parallel, and island layouts with real material specifications and instant cost estimates.',
  keywords: 'modular kitchen designs, modern kitchen layouts, kitchen design gallery, L-shaped kitchen, kitchen interior cost, modular kitchen photos',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/gallery/kitchen-designs',
  },
  openGraph: {
    title: 'Modular Kitchen Designs Gallery | HDE',
    description: 'Explore modern modular kitchen designs with instant pricing and layout options.',
    url: 'https://www.homedesignenglish.com/gallery/kitchen-designs',
    siteName: 'Home Design English',
  },
};

export default function KitchenGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
