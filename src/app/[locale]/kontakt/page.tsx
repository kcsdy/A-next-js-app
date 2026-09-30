import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/content/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/kontakt" },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const tFooter = await getTranslations("footer");

  return (
    <div className="mx-auto max-w-5xl px-5 pt-14">
      <h1 className="text-title sm:text-display">{t("title")}</h1>
      <p className="mt-5 max-w-xl text-lede leading-relaxed text-muted">
        {t("intro")}
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_18rem]">
        <Suspense fallback={<p className="text-muted">{t("loadingForm")}</p>}>
          <ContactForm />
        </Suspense>

        <aside className="lg:border-l lg:border-rule lg:pl-8">
          <h2 className="text-lg">{t("directHeading")}</h2>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-muted">
            <p>
              <a
                href={`tel:${site.contact.phoneHref}`}
                className="text-burgundy underline-offset-4 hover:underline"
              >
                {site.contact.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${site.contact.email}`}
                className="text-burgundy underline-offset-4 hover:underline"
              >
                {site.contact.email}
              </a>
            </p>
            <p className="pt-3">
              {site.contact.street}
              <br />
              {site.contact.postcode} {site.contact.city}
            </p>
          </address>

          <h2 className="mt-8 text-lg">{t("hoursHeading")}</h2>
          <dl className="mt-4 space-y-2 text-sm text-muted">
            <div>
              <dt>{tFooter("hours.weekdays")}</dt>
              <dd className="text-ink">{tFooter("hours.weekdaysTime")}</dd>
            </div>
            <div>
              <dt>{tFooter("hours.saturday")}</dt>
              <dd className="text-ink">{tFooter("hours.saturdayTime")}</dd>
            </div>
          </dl>

          <h2 className="mt-8 text-lg">{t("languagesHeading")}</h2>
          <p className="mt-3 text-sm text-muted">{t("languagesList")}</p>
        </aside>
      </div>
    </div>
  );
}
