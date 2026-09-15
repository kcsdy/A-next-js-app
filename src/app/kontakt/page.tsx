import { Suspense } from "react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Opisz swoją sprawę pobytową. Kancelaria imigracyjna w Warszawie — " +
    "karty pobytu, zezwolenia na pracę, PESEL i meldunek.",
  alternates: { canonical: "/kontakt" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-14">
      <h1 className="text-title sm:text-display">Opisz swoją sprawę</h1>
      <p className="mt-5 max-w-xl text-lede leading-relaxed text-muted">
        Im więcej szczegółów podasz, tym konkretniej odpowiemy. Wystarczy
        kilka zdań — na tym etapie nie trzeba niczego załączać.
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_18rem]">
        <Suspense fallback={<p className="text-muted">Wczytywanie formularza…</p>}>
          <ContactForm />
        </Suspense>

        <aside className="lg:border-l lg:border-rule lg:pl-8">
          <h2 className="text-lg">Bezpośredni kontakt</h2>
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

          <h2 className="mt-8 text-lg">Godziny</h2>
          <dl className="mt-4 space-y-2 text-sm text-muted">
            {site.hours.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd className="text-ink">{h.time}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 text-lg">Języki</h2>
          <p className="mt-3 text-sm text-muted">{site.languages.join(", ")}</p>
        </aside>
      </div>
    </div>
  );
}
