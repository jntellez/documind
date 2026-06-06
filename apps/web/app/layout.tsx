import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/features/site/components/site-footer";
import { Geist } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Documind for Android",
  description: "Official Android landing page and download hub for Documind.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="bg-white text-slate-950 antialiased">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
