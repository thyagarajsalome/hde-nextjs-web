import { Suspense } from 'react';
import UpgradePage from '@/features/dashboard/UpgradePage';

export default function UpgradePageRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059]"></div></div>}>
      <UpgradePage />
    </Suspense>
  );
}
