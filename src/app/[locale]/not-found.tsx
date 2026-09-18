import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="mx-auto max-w-2xl px-5 py-28">
      <h1 className="text-title">{t("title")}</h1>
      <p className="mt-4 leading-relaxed text-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
