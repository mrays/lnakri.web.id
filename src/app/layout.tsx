import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { Toaster } from 'sonner';
import SiteAnalyticsTracker from '@/components/SiteAnalyticsTracker';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'LNAKRI NGO — Lembaga Nasional Anti Korupsi RI',
  description:
    'Lembaga Nasional Anti Korupsi RI — Pemantauan, investigasi korupsi, perlindungan hukum, dan pengaduan masyarakat untuk Indonesia yang bersih.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <Suspense fallback={null}>
          <SiteAnalyticsTracker />
        </Suspense>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
