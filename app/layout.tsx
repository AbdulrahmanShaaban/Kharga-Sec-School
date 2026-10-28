import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { constants } from "@/lib/constants";

/**
 * Cairo — a clear, modern Arabic face with full system fallbacks, so the
 * page stays readable even if the web font never loads (spec §8).
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: constants.DEFAULT_SEO_TITLE,
    template: `%s | ${constants.APP_NAME}`,
  },
  description: constants.DEFAULT_SEO_DESC,
  // The school logo serves as the browser/tab icon (favicon).
  icons: {
    icon: [{ url: "/logo.jpg", sizes: "32x32", type: "image/jpeg" }],
    apple: [{ url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" }],
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: constants.APP_NAME,
    title: constants.DEFAULT_SEO_TITLE,
    description: constants.DEFAULT_SEO_DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} min-h-screen flex flex-col antialiased`}>{children}</body>
    </html>
  );
}
