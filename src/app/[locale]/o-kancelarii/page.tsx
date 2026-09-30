import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/o-kancelarii" },
  };
}

/**
 * TODO: this page needs the real story — who runs the practice, professional
 * background, why immigration law. Placeholder copy is written to be replaced,
 * not to be kept.
 */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-5 pt-14">
      <h1 className="text-title sm:text-display">{t("title")}</h1>

      <p className="mt-8 text-lede leading-relaxed text-muted">{t("lede")}</p>

      <div className="mt-10 space-y-6 leading-relaxed">
        <p>{t("paragraphs.0")}</p>
        <p>{t("paragraphs.1")}</p>
        <p>{t("paragraphs.2")}</p>
      </div>

      <div className="mt-12 bg-beige-pale p-8">
        <h2 className="text-xl">{t("firstCall.heading")}</h2>
        <p className="mt-3 leading-relaxed text-muted">
          {t("firstCall.body")}
        </p>
        <Link
          href="/kontakt"
          className="mt-6 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
        >
          {t("firstCall.cta")}
        </Link>
      </div>
    </div>
  );
}
