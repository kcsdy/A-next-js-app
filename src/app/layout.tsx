import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import "./globals.css";

/**
 * `latin-ext` is not optional here. Without it the Polish diacritics
 * (ą ć ę ł ń ó ś ź ż) fall back to a different face mid-word and the page
 * looks broken to exactly the audience it is written for.
 */
const serifDisplay = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-serif-display",
});

const sansBody = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans-body",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.city}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: site.name,
    title: `${site.name} — ${site.city}`,
    description: site.description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${serifDisplay.variable} ${sansBody.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#tresc"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-burgundy focus:px-4 focus:py-2 focus:text-white"
        >
          Przejdź do treści
        </a>
        <SiteHeader />
        <main id="tresc" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
