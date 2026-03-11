import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: {
    default: "ApexApps.in - Free Developer Tools",
    template: "%s | ApexApps.in"
  },
  description: "10 essential tools for frontend and backend developers. Zero Data Uploaded. Ever.",
  openGraph: {
    title: "ApexApps.in - Free Developer Tools",
    description: "10 essential tools for frontend and backend developers. Zero Data Uploaded. Ever.",
    url: "https://apexapps.in",
    siteName: "ApexApps.in",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexApps.in - Free Developer Tools",
    description: "10 essential tools for frontend and backend developers. Zero Data Uploaded. Ever.",
  },
  verification: {
    google: "NhW9lliOVcqlIDl7zLzj268RuxV8hNfIi83ZbboYHs0",
  },
  other: {
    "google-adsense-account": "ca-pub-7407044476086851",
    "geo.region": "IN"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7407044476086851"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8M76FKSPZ6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8M76FKSPZ6');
          `}
        </Script>
      </head>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased font-ui bg-background text-textPrimary`} suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html >
  );
}
