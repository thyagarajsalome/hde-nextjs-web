import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

export default function DubaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={montserrat.className}>
      {children}
    </div>
  );
}
