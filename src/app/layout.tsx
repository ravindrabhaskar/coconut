import { DEFAULT_LOCALE } from "@/i18n";
import type { Metadata, Viewport } from "next";
import { Manrope, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/layout/chrome";
import { DepthProvider } from "@/components/layout/depth";
import { SITE } from "@/lib/seo/site";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["600", "700", "800"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — One Coconut. An Entire Industry.`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#06150f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} className={`${manrope.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <DepthProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-cocos focus:px-4 focus:py-2">Skip to content</a>
          <SiteHeader />
          <main id="main" className="flex-1">{children}</main>
          <SiteFooter />
        </DepthProvider>
      </body>
    </html>
  );
}
