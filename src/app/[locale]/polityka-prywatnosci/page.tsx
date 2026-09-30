import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { site } from "@/content/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    robots: { index: false },
    alternates: { canonical: "/polityka-prywatnosci" },
  };
}

/**
 * TODO — REQUIRED BEFORE LAUNCH.
 *
 * This is a structural skeleton, not a compliant privacy policy. The
 * administrator's identity, retention periods and legal bases must be filled
 * in and the whole text reviewed. A law firm publishing an incorrect RODO
 * notice is a bad look on top of being a breach.
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <h1 className="text-title">{t("title")}</h1>

      <div className="mt-10 space-y-8 leading-relaxed text-ink">
        <section>
          <h2 className="text-xl">{t("sections.administrator.heading")}</h2>
          <p className="mt-3 text-muted">
            {t("sections.administrator.body", {
              entity: site.legal.entity,
              street: site.contact.street,
              postcode: site.contact.postcode,
              city: site.contact.city,
              email: site.contact.email,
            })}
          </p>
        </section>

        <section>
          <h2 className="text-xl">{t("sections.scope.heading")}</h2>
          <p className="mt-3 text-muted">{t("sections.scope.body")}</p>
        </section>

        <section>
          <h2 className="text-xl">{t("sections.retention.heading")}</h2>
          <p className="mt-3 text-muted">{t("sections.retention.body")}</p>
        </section>

        <section>
          <h2 className="text-xl">{t("sections.recipients.heading")}</h2>
          <p className="mt-3 text-muted">{t("sections.recipients.body")}</p>
        </section>

        <section>
          <h2 className="text-xl">{t("sections.rights.heading")}</h2>
          <p className="mt-3 text-muted">{t("sections.rights.body")}</p>
        </section>

        <section>
          <h2 className="text-xl">{t("sections.cookies.heading")}</h2>
          <p className="mt-3 text-muted">{t("sections.cookies.body")}</p>
        </section>
      </div>
    </div>
  );
}
