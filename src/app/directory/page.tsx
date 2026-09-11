import type { Metadata } from 'next';
import DirectoryPage from '@/features/directory/DirectoryPage';

export const metadata: Metadata = {
  title: 'Contractor & Material Supplier Directory | HDE',
  description: 'Find trusted local civil contractors, architects, structural engineers, and building material suppliers.',
  alternates: {
    canonical: '/directory',
  },
};

export default function DirectoryPageRoute() {
  return <DirectoryPage />;
}
