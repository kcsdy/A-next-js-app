import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceSlugs } from "@/content/services";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "knowledgeBase" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/uslugi" },
  };
}

export default async function KnowledgeBasePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("knowledgeBase");
  const tServices = await getTranslations("services");

  return (
    <div className="mx-auto max-w-5xl px-5 pt-14">
      <h1 className="text-title sm:text-display">{t("title")}</h1>
      <p className="mt-5 max-w-xl text-lede leading-relaxed text-muted">
        {t("intro")}
      </p>

      <ul className="mt-14 border-t border-burgundy/25">
        {serviceSlugs.map((slug) => (
          <li key={slug} className="border-b border-burgundy/25">
            <Link
              href={`/uslugi/${slug}`}
              className="group grid gap-2 py-7 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-10"
            >
              <h2 className="text-title text-burgundy-deep group-hover:text-burgundy">
                {tServices(`${slug}.title`)}
              </h2>
              <p className="max-w-xl self-center leading-relaxed text-muted">
                {tServices(`${slug}.summary`)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
