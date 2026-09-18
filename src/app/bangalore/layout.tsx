// src/app/bangalore/layout.tsx
import React from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

export default function BangaloreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.className} font-sans antialiased text-zinc-900`}>
      {children}
    </div>
  );
}
