import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { serviceSlugs, isServiceSlug } from "@/content/services";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Pre-renders every service page, in every locale, at build time. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    serviceSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};

  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t(`${slug}.title`),
    description: t(`${slug}.summary`),
    alternates: { canonical: `/uslugi/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) notFound();

  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tDetail = await getTranslations("serviceDetail");

  const who = t.raw(`${slug}.who`) as string[];
  const documents = t.raw(`${slug}.documents`) as string[];
  const help = t.raw(`${slug}.help`) as string[];

  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 pb-4">
      <Link
        href="/uslugi"
        className="text-sm text-burgundy underline-offset-4 hover:underline"
      >
        {tDetail("backLink")}
      </Link>

      <h1 className="mt-6 text-title sm:text-display">{t(`${slug}.title`)}</h1>
      <p className="mt-6 text-lede leading-relaxed text-muted">
        {t(`${slug}.intro`)}
      </p>

      <section className="mt-14">
        <h2 className="text-xl">{tDetail("whoHeading")}</h2>
        <ul className="mt-4 space-y-2">
          {who.map((item) => (
            <li key={item} className="border-l-2 border-beige pl-4 text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">{tDetail("documentsHeading")}</h2>
        <p className="mt-2 text-sm text-muted">{tDetail("documentsNote")}</p>
        <ul className="mt-4 space-y-2">
          {documents.map((item) => (
            <li key={item} className="border-l-2 border-beige pl-4 text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">{tDetail("helpHeading")}</h2>
        <ul className="mt-4 space-y-2">
          {help.map((item) => (
            <li key={item} className="border-l-2 border-burgundy pl-4 text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-16 bg-beige-pale p-8">
        <h2 className="text-xl">{tDetail("consultHeading")}</h2>
        <p className="mt-3 leading-relaxed text-muted">
          {tDetail("consultBody", { service: t(`${slug}.title`).toLowerCase() })}
        </p>
        <Link
          href={`/kontakt?sprawa=${slug}`}
          className="mt-6 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
        >
          {tDetail("consultCta")}
        </Link>
      </aside>
    </article>
  );
}
