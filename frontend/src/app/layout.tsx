import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/app/providers';
import { Toaster } from 'react-hot-toast';
import { ChatCta } from '@/components/ChatCta';
import { TopNav } from '@/components/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jupho - Meta Ads Creative Analyzer',
  description: 'Analyze why your Meta ad creatives fail or work. Get clear reasons, supporting logic, and actionable fixes.',
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
          <TopNav />
          {children}
          <Toaster position="top-right" />
          <ChatCta />
        </Providers>
      </body>
    </html>
  );
}
