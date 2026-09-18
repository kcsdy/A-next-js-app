import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Source_Serif_4, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";

/**
 * `latin-ext` and `cyrillic` are not optional here. Without them, Polish
 * diacritics (ą ć ę ł ń ó ś ź ż) and Ukrainian/Russian Cyrillic text fall
 * back to a different face mid-word and the page looks broken to exactly
 * the audience it is written for.
 */
const serifDisplay = Source_Serif_4({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-serif-display",
});

const sansBody = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans-body",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} — ${t("city")}`,
      template: `%s — ${site.name}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      locale,
      siteName: site.name,
      title: `${site.name} — ${t("city")}`,
      description: t("description"),
    },
    alternates: { canonical: "/" },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: "a11y" });

  return (
    <html lang={locale} className={`${serifDisplay.variable} ${sansBody.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a
            href="#tresc"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-burgundy focus:px-4 focus:py-2 focus:text-white"
          >
            {t("skipToContent")}
          </a>
          <SiteHeader />
          <main id="tresc" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
