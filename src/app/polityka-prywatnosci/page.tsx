import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  robots: { index: false },
  alternates: { canonical: "/polityka-prywatnosci" },
};

/**
 * TODO — REQUIRED BEFORE LAUNCH.
 *
 * This is a structural skeleton, not a compliant privacy policy. The
 * administrator's identity, retention periods and legal bases must be filled
 * in and the whole text reviewed. A law firm publishing an incorrect RODO
 * notice is a bad look on top of being a breach.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-14">
      <h1 className="text-title">Polityka prywatności</h1>

      <div className="mt-10 space-y-8 leading-relaxed text-ink">
        <section>
          <h2 className="text-xl">Administrator danych</h2>
          <p className="mt-3 text-muted">
            Administratorem danych osobowych jest {site.legal.entity},
            {" "}{site.contact.street}, {site.contact.postcode}{" "}
            {site.contact.city}. Kontakt w sprawach danych osobowych:{" "}
            {site.contact.email}.
          </p>
        </section>

        <section>
          <h2 className="text-xl">Zakres i cel przetwarzania</h2>
          <p className="mt-3 text-muted">
            Dane podane w formularzu kontaktowym (imię i nazwisko, adres e-mail,
            opcjonalnie numer telefonu oraz treść wiadomości) przetwarzane są
            wyłącznie w celu udzielenia odpowiedzi na zapytanie, na podstawie
            zgody osoby, której dane dotyczą (art. 6 ust. 1 lit. a RODO).
          </p>
        </section>

        <section>
          <h2 className="text-xl">Okres przechowywania</h2>
          <p className="mt-3 text-muted">
            TODO: określić okres przechowywania korespondencji oraz zasady
            usuwania wiadomości, które nie doprowadziły do podjęcia sprawy.
          </p>
        </section>

        <section>
          <h2 className="text-xl">Odbiorcy danych</h2>
          <p className="mt-3 text-muted">
            Wiadomości przesyłane przez formularz są dostarczane za
            pośrednictwem dostawcy usługi poczty elektronicznej. Strona jest
            hostowana przez Vercel Inc. TODO: uzupełnić listę podmiotów
            przetwarzających i informację o transferze danych poza EOG.
          </p>
        </section>

        <section>
          <h2 className="text-xl">Prawa osoby, której dane dotyczą</h2>
          <p className="mt-3 text-muted">
            Przysługuje prawo dostępu do danych, ich sprostowania, usunięcia
            lub ograniczenia przetwarzania, prawo do przenoszenia danych,
            wniesienia sprzeciwu, cofnięcia zgody w dowolnym momencie oraz
            wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.
          </p>
        </section>

        <section>
          <h2 className="text-xl">Pliki cookie</h2>
          <p className="mt-3 text-muted">
            Strona nie używa plików cookie do celów analitycznych ani
            marketingowych. Po dodaniu narzędzi analitycznych konieczne będzie
            wdrożenie banera zgody i uzupełnienie tej sekcji.
          </p>
        </section>
      </div>
    </div>
  );
}
