import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YourAppName - The best platform for X, Y, Z',
  description: 'YourAppName helps you achieve X, Y, and Z with ease. Start your free trial today!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
