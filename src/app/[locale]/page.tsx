import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/content/site";
import { CaseFinder } from "@/components/case-finder";

/**
 * The full procedure list with descriptions lives at /uslugi (linked from
 * the header's "Usługi" dropdown and "Baza wiedzy"), not here — the
 * homepage stays short and routes people to it instead of repeating it.
 */

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/" },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tSchedule = await getTranslations("scheduleBanner");

  const whyItems = t.raw("why.items") as { title: string; body: string }[];
  const stepItems = t.raw("process.steps") as { title: string; body: string }[];
  const steps = stepItems.map((s, i) => ({ ...s, step: String(i + 1) }));
  const testimonials = t.raw("testimonials") as {
    quote: string;
    name: string;
    context: string;
  }[];
  const faqItems = t.raw("faq") as { question: string; answer: string }[];

  return (
    <>
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-12 sm:pt-24">
        <p className="font-display text-lede text-burgundy-soft">
          {t("tagline")}
        </p>
        <h1 className="mt-5 max-w-2xl text-display">{t("title")}</h1>
        <p className="mt-6 max-w-xl text-lede text-muted">{t("lede")}</p>

        <p className="mt-6 text-sm text-muted">{t("languagesLine")}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/kontakt"
            className="bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
          >
            {t("ctaDescribe")}
          </Link>
          <a
            href={`tel:${site.contact.phoneHref}`}
            className="border border-burgundy px-6 py-3 text-burgundy hover:bg-beige-pale"
          >
            {site.contact.phone}
          </a>
        </div>

        <CaseFinder />
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <Link
          href="/schedule-appointment"
          className="group flex flex-col items-start justify-between gap-4 border border-burgundy bg-beige-pale px-6 py-6 sm:flex-row sm:items-center"
        >
          <span>
            <span className="block text-lg text-burgundy-deep group-hover:text-burgundy">
              {tSchedule("heading")}
            </span>
            <span className="mt-1 block text-sm text-muted">
              {tSchedule("body")}
            </span>
          </span>
          <span className="shrink-0 bg-burgundy px-6 py-3 text-sm font-medium text-white group-hover:bg-burgundy-deep">
            {tSchedule("cta")}
          </span>
        </Link>
      </section>

      <section
        aria-labelledby="dlaczego-naglowek"
        className="mx-auto max-w-5xl px-5 py-8"
      >
        <h2 id="dlaczego-naglowek" className="sr-only">
          {t("why.heading")}
        </h2>
        <ul className="grid gap-10 sm:grid-cols-3">
          {whyItems.map((item) => (
            <li key={item.title}>
              <h3 className="text-lg text-burgundy-deep">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 bg-beige-pale">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-title">{t("process.heading")}</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.step}>
                <span className="font-display text-title text-burgundy-soft">
                  {s.step}
                </span>
                <h3 className="mt-2 text-lg">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="opinie-naglowek"
        className="mx-auto max-w-5xl px-5 py-16"
      >
        <h2 id="opinie-naglowek" className="text-title">
          {t("testimonialsHeading")}
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {testimonials.map((item) => (
            <li key={item.name} className="border-t-2 border-burgundy pt-5">
              <p className="leading-relaxed text-ink">“{item.quote}”</p>
              <p className="mt-4 text-sm text-muted">
                {item.name} · {item.context}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="faq-naglowek"
        className="mx-auto max-w-3xl px-5 py-16"
      >
        <h2 id="faq-naglowek" className="text-title">
          {t("faqHeading")}
        </h2>
        <div className="mt-10 divide-y divide-rule border-y border-rule">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg text-burgundy-deep">
                {item.question}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-burgundy-soft group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="max-w-lg text-title">{t("finalCta.heading")}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          {t("finalCta.body")}
        </p>
        <Link
          href="/kontakt"
          className="mt-7 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
        >
          {t("finalCta.cta")}
        </Link>
      </section>
    </>
  );
}
