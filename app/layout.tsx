import type { Metadata } from "next";
import "./globals.css";
import { Inter, Cairo, Noto_Sans_Arabic } from "next/font/google";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["latin"], variable: "--font-cairo", display: "swap" });
const noto = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto", display: "swap" });

export const metadata: Metadata = {
  title: "مدرسة الخرجة الثانوية بنين | Official Website",
  description: "Official website of Al-Khargha Secondary School for Boys",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${inter.variable} ${cairo.variable} ${noto.variable} font-cairo bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}