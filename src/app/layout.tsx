import type { Metadata } from 'next';
import '../styles/global.css'; // Assuming you have a global CSS file, Next.js usually uses globals.css
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'HDE - Dream Home Construction & Interior Cost Calculator',
  description: 'Calculate your dream home construction, materials BOQ, interior design, flooring, and MEP utility costs in India accurately.',
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
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
        <ToastProvider>
          <UserProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
