import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download HDE Studio CAD | Professional 2D Architectural Drafting & Floor Plan Software',
  description: 'Download HDE Studio CAD for PC. Professional offline 2D architectural drafting software with smart wall snapping, metric & imperial catalogs, and high-resolution vector PDF export.',
  keywords: 'HDE Studio CAD, architectural drafting software, 2D CAD download, floor plan software, offline CAD, house planning software, CAD for Windows',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/download',
  },
  openGraph: {
    title: 'Download HDE Studio CAD | Professional 2D Architectural Drafting Software',
    description: 'Standalone desktop CAD application for home builders, drafters, and architects. Offline, fast, and built for modern architectural drafting.',
    url: 'https://www.homedesignenglish.com/download',
    siteName: 'Home Design English',
    type: 'website',
    images: [{ url: '/HDE_256px.webp', width: 256, height: 256, alt: 'HDE Studio CAD' }],
  },
  twitter: {
    card: 'summary',
    title: 'Download HDE Studio CAD | Professional 2D Architectural Drafting Software',
    description: 'Download HDE Studio CAD for Windows. Native offline 2D CAD drafting with dual unit catalogs and crisp vector PDF export.',
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
