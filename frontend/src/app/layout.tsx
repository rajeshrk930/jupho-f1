import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jupho - Meta Ads Creative Analyzer',
  description: 'Analyze why your Meta ad creatives fail or work. Get clear reasons, supporting logic, and actionable fixes.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen bg-base">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden pb-16 lg:pb-0">
              {children}
            </main>
          </div>
          <BottomNav />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
