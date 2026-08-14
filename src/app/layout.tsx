import type { Metadata } from 'next';
import '../styles/global.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import { RegionProvider } from '@/context/RegionContext';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'HDE - Dream Home Construction & Interior Cost Calculator',
  description: 'Calculate your dream home construction, materials BOQ, interior design, flooring, and MEP utility costs accurately.',
  verification: {
    google: 'j0tDFreq7BZOn79uEWGW5K_70WrkdIr8GCnJRcC57MA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="bg-background text-zinc-900 min-h-screen flex flex-col font-sans">
        <ToastProvider>
          <UserProvider>
            <RegionProvider>
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </RegionProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
