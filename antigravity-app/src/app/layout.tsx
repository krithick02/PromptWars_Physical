import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beatline — Stadium View",
  description: "Live stadium results and help center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      style={{ 
        ["--font-inter" as any]: inter.style.fontFamily,
        ["--font-outfit" as any]: outfit.style.fontFamily 
      }}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#09090b] text-[#fafafa]">{children}</body>
    </html>
  );
}
