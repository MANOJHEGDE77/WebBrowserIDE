import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingAIButton from '@/components/FloatingAIButton';

export const metadata: Metadata = {
  title: 'Digicomp Technologies — Engineered for Innovators',
  description:
    'Digicomp Technologies — Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability.',
  icons: {
    icon: '/images/digicomp/logo.svg',
    shortcut: '/images/digicomp/logo.svg',
    apple: '/images/digicomp/logo.svg',
  },
  themeColor: '#FF6D33',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white text-slate-900 antialiased">
      <head>
        <link rel="icon" type="image/svg+xml" href="/images/digicomp/logo.svg" />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 flex flex-col min-h-0">{children}</main>
            <Footer />
            <FloatingAIButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
