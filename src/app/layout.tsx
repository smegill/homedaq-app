import './globals.css';
import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'HomeDAQ',
  description:
    'A marketplace that connects resident-owners and community investors to co-fund homes with clear, aligned terms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-50 text-ink-900 antialiased">
        <NavBar />
        <main className="pb-20">{children}</main>
      </body>
    </html>
  );
}
