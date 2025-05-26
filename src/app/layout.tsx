import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // Corrected import for Geist Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// GeistSans from 'geist/font/sans' directly provides .variable and .className
// No need to call it as a function or specify subsets/variable name here.
// The `variable` property (e.g., GeistSans.variable) will provide the CSS variable name like '--font-geist-sans'.

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
    <html lang="en" className={GeistSans.variable}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
