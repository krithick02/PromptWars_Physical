import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

/**
 * SEO + Google Service metadata for the Beatline venue operations platform.
 * Integrates Google Analytics 4 for operational telemetry and event tracking.
 */
export const metadata: Metadata = {
  title: "Beatline — Live Venue Operations Hub",
  description:
    "Real-time stadium crowd management and operational intelligence platform. Monitor crowd density, concessions, emergency protocols, and live analytics.",
  keywords: ["stadium", "crowd management", "live operations", "venue intelligence", "beatline"],
  authors: [{ name: "Beatline Operations Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Beatline — Live Venue Operations Hub",
    description: "Real-time stadium crowd management and operational intelligence platform.",
    type: "website",
    locale: "en_US",
  },
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

// Google Analytics 4 Measurement ID (set via environment variable)
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-BEATLINE2026";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        {/* ── Google Analytics 4 ──────────────────────────────────────────── */}
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
          }}
        />
        {/* ── Google Maps API preconnect ───────────────────────────────────── */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#09090b] text-[#fafafa]">
        {children}
      </body>
    </html>
  );
}
