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
    <div className="mx-auto max-w-6xl px-5 pt-14 pb-4">
      <div className="max-w-3xl">
        <h1 className="text-title sm:text-display">{t("title")}</h1>
        <p className="mt-5 text-lede leading-relaxed text-muted">{t("intro")}</p>
      </div>

      <div className="mt-10 border border-rule">
        <iframe
          src="https://bookings.cloud.microsoft/book/MCHImmigration1@mchimmigration.pl/?ismsaljsauthenabled"
          title={t("iframeTitle")}
          width="100%"
          height="750"
          scrolling="yes"
          frameBorder="0"
        />
      </div>
    </div>
  );
}
