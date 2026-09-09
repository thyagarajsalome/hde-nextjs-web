import { redirect } from 'next/navigation';
import AppPromoPage from '@/features/promo/AppPromoPage';

interface PageProps {
  searchParams: Promise<{ calc?: string; region?: string }>;
}

export default async function MobileAppRoute({ searchParams }: PageProps) {
  const params = await searchParams;
  if (params?.calc) {
    const reg = params.region || (params.calc.startsWith('usa-') ? 'US' : 'IN');
    redirect(`/?region=${reg}&calc=${params.calc}#tools`);
  }
  return <AppPromoPage />;
}
