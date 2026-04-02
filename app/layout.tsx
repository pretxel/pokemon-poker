import type { Metadata, Viewport } from 'next';
import { Syne, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pokemon Poker',
  description: 'Scrum planning estimation with your favorite Pokemon',
};

export const viewport: Viewport = {
  themeColor: '#09090f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
