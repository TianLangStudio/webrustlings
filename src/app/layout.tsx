
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
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?5a990c2b8047428b734d3a86ee9e881f";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);

               var gg = document.createElement("script");
              gg.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9987237856136349";
              s.parentNode.insertBefore(gg, s);

              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-JZ81SEB2BH');
})();
          `}
        </Script>
      </body>
    </html>
  );
}
