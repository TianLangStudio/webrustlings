
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script'; // Import Script

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
        <Script id="custom-analytics-scripts" strategy="afterInteractive">
          {`
            (function() {
              var _hmt = _hmt || [];
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?5a990c2b8047428b734d3a86ee9e881f";
              var s1 = document.getElementsByTagName("script")[0];
              if (s1 && s1.parentNode) {
                s1.parentNode.insertBefore(hm, s1);
              } else {
                // Fallback if no script tags are found (unlikely in a Next.js app)
                // or if the first script tag doesn't have a parent (also unlikely)
                document.head.appendChild(hm);
              }

              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JZ81SEB2BH');

              var gg = document.createElement("script");
              gg.src = "https://www.googletagmanager.com/gtag/js?id=G-JZ81SEB2BH";
              var s2 = document.getElementsByTagName("script")[0];
              if (s2 && s2.parentNode) {
                s2.parentNode.insertBefore(gg, s2);
              } else {
                // Fallback
                document.head.appendChild(gg);
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
