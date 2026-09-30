import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/content/site";
import { serviceSlugs } from "@/content/services";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tSite = await getTranslations("site");
  const tServices = await getTranslations("services");

  return (
    <footer className="mt-24 bg-burgundy-deep text-beige-pale">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl text-white">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-beige">
            {tSite("tagline")}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{t("contactHeading")}</h2>
          <address className="mt-3 space-y-1 text-sm not-italic text-beige">
            <p>{site.contact.street}</p>
            <p>
              {site.contact.postcode} {site.contact.city}
            </p>
            <p className="pt-2">
              <a
                href={`tel:${site.contact.phoneHref}`}
                className="underline-offset-4 hover:underline"
              >
                {site.contact.phone}
              </a>
            </p>
            <p>
              <a
                href={`mailto:${site.contact.email}`}
                className="underline-offset-4 hover:underline"
              >
                {site.contact.email}
              </a>
            </p>
          </address>
          <dl className="mt-4 space-y-1 text-sm text-beige">
            <div>
              <dt className="inline">{t("hours.weekdays")}: </dt>
              <dd className="inline">{t("hours.weekdaysTime")}</dd>
            </div>
            <div>
              <dt className="inline">{t("hours.saturday")}: </dt>
              <dd className="inline">{t("hours.saturdayTime")}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{t("servicesHeading")}</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-beige">
            {serviceSlugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/uslugi/${slug}`}
                  className="underline-offset-4 hover:underline"
                >
                  {tServices(`${slug}.title`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-burgundy-soft/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-xs text-beige sm:flex-row sm:items-center sm:justify-between">
          <p>
            {site.legal.entity} · NIP {site.legal.nip} · REGON{" "}
            {site.legal.regon}
          </p>
          <Link
            href="/polityka-prywatnosci"
            className="underline-offset-4 hover:underline"
          >
            {t("privacyLink")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
