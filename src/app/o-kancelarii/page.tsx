import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "O kancelarii",
  description:
    "Kancelaria imigracyjna w Warszawie prowadząca sprawy pobytowe cudzoziemców.",
  alternates: { canonical: "/o-kancelarii" },
};

/**
 * TODO: this page needs the real story — who runs the practice, professional
 * background, why immigration law. Placeholder copy is written to be replaced,
 * not to be kept.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-14">
      <h1 className="text-title sm:text-display">O kancelarii</h1>

      <p className="mt-8 text-lede leading-relaxed text-muted">
        {site.tagline}
      </p>

      <div className="mt-10 space-y-6 leading-relaxed">
        <p>
          Sprawy pobytowe rzadko są tylko formalnością. Za każdym wnioskiem stoi
          praca, mieszkanie, szkoła dziecka albo termin, który zaczyna biec
          w najgorszym możliwym momencie. Dlatego pierwsza rozmowa dotyczy
          sytuacji, a nie formularza.
        </p>
        <p>
          Prowadzimy sprawy przed Mazowieckim Urzędem Wojewódzkim i urzędami
          dzielnic w Warszawie. Zajmujemy się legalizacją pobytu i pracy,
          a także sprawami okołopobytowymi, bez których codzienne życie
          w Polsce jest utrudnione: numerem PESEL, meldunkiem, wymianą prawa
          jazdy czy Profilem Zaufanym.
        </p>
        <p>
          Klienci rozmawiają z nami w językach, które znają. Obsługujemy sprawy
          po polsku, angielsku, ukraińsku i rosyjsku.
        </p>
      </div>

      <div className="mt-12 bg-beige-pale p-8">
        <h2 className="text-xl">Pierwsza rozmowa</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Opisz sprawę przez formularz albo zadzwoń. Ustalimy, czy sprawa
          nadaje się do prowadzenia i co trzeba przygotować.
        </p>
        <Link
          href="/kontakt"
          className="mt-6 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
        >
          Przejdź do kontaktu
        </Link>
      </div>
    </div>
  );
}
