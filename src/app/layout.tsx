import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'RustlingsWeb',
  description: 'Interactive Rust learning environment based on Rustlings.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
