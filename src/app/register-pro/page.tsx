import type { Metadata } from 'next';
import { ProRegistration } from '@/features/directory/ProRegistration';

export const metadata: Metadata = {
  title: 'Register as a Professional | Home Design English (HDE)',
  description: 'Register or manage your professional listing on Home Design English. Connect directly with homeowners looking for contractors, architects, and designers.',
  alternates: {
    canonical: '/register-pro',
  },
};

export default function RegisterProPage() {
  return <ProRegistration />;
}
