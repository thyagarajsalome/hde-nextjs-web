// src/app/bangalore/layout.tsx
import React from 'react';
import { Montserrat } from 'next/font/google';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

export default async function BangaloreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const host = headerList.get('host')?.toLowerCase() || '';
  if (host.startsWith('us.') || host.includes('us.localhost')) {
    redirect('https://www.homedesignenglish.com/bangalore/properties');
  }

  return (
    <div className={`${montserrat.className} font-sans antialiased text-zinc-900`}>
      {children}
    </div>
  );
}
