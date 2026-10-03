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
          src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3NN4wtQVpFF7vua5hjIppPwbV-WtcTlK6eRIUMsKRJ3fOQYNOmYsx7tqY_sq_CZzE5UXTs9cME?gv=true"
          title={t("iframeTitle")}
          // Tall enough to show a full day of slots without the iframe
          // scrolling internally (Google's page stacks on narrow screens).
          className="block h-[1750px] w-full md:h-[1250px]"
          style={{ border: 0 }}
        />
      </div>
    </div>
  );
}
