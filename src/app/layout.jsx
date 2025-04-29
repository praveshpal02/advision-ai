
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BrandProvider } from '@/context/BrandContext';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'AdVision AI',
  description: 'AI-Powered Ad Generator',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <BrandProvider>
          {children}
          <Toaster />
        </BrandProvider>
      </body>
    </html>
  );
}
