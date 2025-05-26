import type { Metadata } from 'next';
import { Geist_Sans as GeistSans } from 'next/font/google'; // Updated import for Geist Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const geistSans = GeistSans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Removed Geist Mono as it's not explicitly requested for body text.
// If needed for specific elements like code blocks, it can be added selectively.

export const metadata: Metadata = {
  title: 'React Project Starter',
  description: 'A Next.js project starter with pre-configured features.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
