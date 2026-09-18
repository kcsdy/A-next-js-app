import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schedulePage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/schedule-appointment" },
  };
}

export default async function ScheduleAppointmentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("schedulePage");

  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 pb-4">
      <h1 className="text-title sm:text-display">{t("title")}</h1>
      <p className="mt-5 text-lede leading-relaxed text-muted">{t("intro")}</p>

      <div className="mt-10 border border-rule">
        <iframe
          src="https://calendeo.pl/embed/7452dd3d-838b-4912-98a1-5b5f54a0131a"
          title={t("iframeTitle")}
          width="100%"
          height="600"
          frameBorder="0"
        />
      </div>
    </div>
  );
}
