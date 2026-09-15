import Link from "next/link";
import { services } from "@/content/services";
import { site } from "@/content/site";

/**
 * The hero is the list of procedures, not a slogan over a stock photo.
 * People arriving here already know their problem — they typed
 * "karta pobytu" into a search box. The fastest useful thing the page can do
 * is show the procedure names and let them click through.
 */
export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-12 sm:pt-24">
        <p className="font-display text-lede text-burgundy-soft">
          {site.tagline}
        </p>
        <h1 className="mt-5 max-w-2xl text-display">
          Sprawy pobytowe prowadzone od początku do końca
        </h1>
        <p className="mt-6 max-w-xl text-lede text-muted">
          Kancelaria imigracyjna w Warszawie. Kompletujemy dokumenty,
          pilnujemy terminów i prowadzimy korespondencję z urzędem, żeby
          nie trzeba było robić tego samemu.
        </p>

        <p className="mt-6 text-sm text-muted">
          Rozmawiamy po: {site.languages.join(" · ")}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/kontakt"
            className="bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
          >
            Opisz swoją sprawę
          </Link>
          <a
            href={`tel:${site.contact.phoneHref}`}
            className="border border-burgundy px-6 py-3 text-burgundy hover:bg-beige-pale"
          >
            {site.contact.phone}
          </a>
        </div>
      </section>

      <section
        id="uslugi"
        aria-labelledby="uslugi-naglowek"
        className="mx-auto max-w-5xl px-5 py-8"
      >
        <h2 id="uslugi-naglowek" className="sr-only">
          Zakres pomocy
        </h2>

        <ul className="border-t border-burgundy/25">
          {services.map((service) => (
            <li key={service.slug} className="border-b border-burgundy/25">
              <Link
                href={`/uslugi/${service.slug}`}
                className="group grid gap-2 py-7 sm:grid-cols-[minmax(0,18rem)_1fr] sm:gap-10"
              >
                <h3 className="text-title text-burgundy-deep group-hover:text-burgundy">
                  {service.title}
                </h3>
                <p className="max-w-xl self-center leading-relaxed text-muted">
                  {service.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 bg-beige-pale">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-title">Jak wygląda współpraca</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Rozmowa wstępna",
                body:
                  "Opisujesz sytuację i pokazujesz dokumenty, które już masz. " +
                  "Ustalamy, która procedura jest właściwa i czy termin jest zachowany.",
              },
              {
                step: "2",
                title: "Kompletowanie wniosku",
                body:
                  "Przygotowujemy listę brakujących dokumentów, sprawdzamy " +
                  "tłumaczenia i piszemy uzasadnienie wniosku.",
              },
              {
                step: "3",
                title: "Postępowanie",
                body:
                  "Składamy wniosek, odbieramy korespondencję z urzędu " +
                  "i odpowiadamy na wezwania do uzupełnienia braków.",
              },
            ].map((s) => (
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

      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2 className="max-w-lg text-title">
          Nie wiesz, która procedura dotyczy twojej sytuacji?
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          Napisz kilka zdań o swojej sprawie. Odpowiadamy zwykle w ciągu
          jednego dnia roboczego.
        </p>
        <Link
          href="/kontakt"
          className="mt-7 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
        >
          Opisz swoją sprawę
        </Link>
      </section>
    </>
  );
}
