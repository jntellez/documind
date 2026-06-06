import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/features/site/components/site-footer";
import { siteMetadata } from "@/features/site/seo";
import { Geist } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = siteMetadata;

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="bg-white text-slate-950 antialiased web-site-layout">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
