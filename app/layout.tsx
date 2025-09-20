import type React from 'react';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
// import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { Suspense } from 'react';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SocketProvider } from '@/components/socket/SocketProvider';

export const metadata: Metadata = {
  title: {
    default: 'Logeera - Logistics Era | Trusted Rideshare',
    template: '%s | Logeera',
  },
  description:
    'Connect, Share, Travel - Your trusted rideshare platform. Find rides, share journeys, and travel sustainably with verified drivers.',
  keywords: [
    'rideshare',
    'carpooling',
    'travel',
    'logistics',
    'Africa',
    'transportation',
    'ride sharing',
    'trusted drivers',
    'sustainable travel',
    'journey sharing',
  ],
  authors: [{ name: 'Logeera Team' }],
  creator: 'Logeera',
  publisher: 'Logeera',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://logeera.com',
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Logeera - Logistics Era | Trusted Rideshare',
    description:
      'Connect, Share, Travel - Your trusted rideshare platform. Find rides, share journeys, and travel sustainably with verified drivers.',
    siteName: 'Logeera',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Logeera - Logistics Era',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logeera - Logistics Era | Trusted Rideshare',
    description: 'Connect, Share, Travel - Your trusted rideshare platform.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Logeera',
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <SocketProvider>
                <AppShell>{children}</AppShell>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
        {/* <Analytics /> */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
