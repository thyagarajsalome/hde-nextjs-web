import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AppPromoPage from '@/features/promo/AppPromoPage';

interface PageProps {
  searchParams: Promise<{ calc?: string; tab?: string; region?: string }>;
}

export default async function MobileAppRoute({ searchParams }: PageProps) {
  const params = await searchParams;
  const headerList = await headers();
  const host = headerList.get('host')?.toLowerCase() || '';
  const isUS = host.startsWith('us.');
  const isDubai = host.startsWith('dubai.');

  const requestedCalc = params?.calc || params?.tab;

  // On US domain, never show Indian mobile app promo page. Always redirect to web calculators.
  if (isUS) {
    const targetCalc = requestedCalc || 'usa-barndominium';
    redirect(`/?region=US&calc=${targetCalc}#tools`);
  }

  // On Dubai domain, redirect to Dubai calculators
  if (isDubai) {
    redirect(`/dubai-property/calculator`);
  }

  // If a specific calculator or tab is requested from any domain
  if (requestedCalc) {
    const reg = params?.region || (requestedCalc.startsWith('usa-') ? 'US' : 'IN');
    redirect(`/?region=${reg}&calc=${requestedCalc}#tools`);
  }

  return <AppPromoPage />;
}
