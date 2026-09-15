/**
 * The seven practice areas. This array drives the homepage list, the service
 * pages, the contact-form dropdown and the sitemap — add a service here and it
 * appears everywhere.
 *
 * IMPORTANT: the `process` and `documents` text below is a plausible starting
 * draft, not verified legal content. Every statement about deadlines, required
 * documents and procedure must be checked against current practice at the
 * Mazowiecki Urząd Wojewódzki before this site goes live.
 */

export type Service = {
  slug: string;
  /** Official Polish term — this is what people search for. */
  title: string;
  /** What it means in plain language, for someone who is not a lawyer. */
  summary: string;
  /** Shown on the service page, under the heading. */
  intro: string;
  /** Who this procedure is for. */
  who: string[];
  /** Typical documents. TODO: verify. */
  documents: string[];
  /** What the firm actually does for the client. */
  help: string[];
};

export const services: Service[] = [
  {
    slug: "karta-pobytu-czasowego",
    title: "Karta pobytu czasowego",
    summary:
      "Zezwolenie na pobyt czasowy — praca, studia, pobyt z rodziną lub inna podstawa.",
    intro:
      "Zezwolenie na pobyt czasowy to najczęstsza droga legalizacji pobytu w Polsce. " +
      "Wniosek składa się osobiście w urzędzie wojewódzkim właściwym dla miejsca pobytu, " +
      "najpóźniej w ostatnim dniu legalnego pobytu.",
    who: [
      "Osoby pracujące w Polsce na podstawie umowy",
      "Studenci i doktoranci",
      "Członkowie rodziny osoby mieszkającej w Polsce",
      "Osoby prowadzące działalność gospodarczą",
    ],
    documents: [
      "Wypełniony wniosek i cztery fotografie",
      "Ważny dokument podróży (paszport) wraz z kopią wszystkich stron",
      "Dokumenty potwierdzające cel pobytu (umowa, zaświadczenie z uczelni, akt małżeństwa)",
      "Potwierdzenie ubezpieczenia zdrowotnego",
      "Dokumenty potwierdzające źródło stabilnego dochodu",
      "Potwierdzenie miejsca zamieszkania",
    ],
    help: [
      "Ustalamy właściwą podstawę prawną wniosku i sprawdzamy, czy termin jest zachowany",
      "Kompletujemy i weryfikujemy dokumenty przed złożeniem",
      "Przygotowujemy uzasadnienie wniosku",
      "Odpowiadamy na wezwania urzędu do uzupełnienia braków",
      "Reprezentujemy w postępowaniu na podstawie pełnomocnictwa",
    ],
  },
  {
    slug: "pobyt-staly",
    title: "Pobyt stały i rezydent długoterminowy UE",
    summary:
      "Zezwolenie bezterminowe dla osób z Kartą Polaka, małżonków obywateli RP i po latach legalnego pobytu.",
    intro:
      "Zezwolenie na pobyt stały wydawane jest na czas nieoznaczony, a sama karta pobytu " +
      "wymaga wymiany co dziesięć lat. Zezwolenie na pobyt rezydenta długoterminowego UE " +
      "to odrębna procedura, dostępna po nieprzerwanym pobycie w Polsce.",
    who: [
      "Posiadacze Karty Polaka",
      "Małżonkowie obywateli polskich po wymaganym okresie małżeństwa i pobytu",
      "Dzieci obywateli polskich lub osób z zezwoleniem na pobyt stały",
      "Osoby po wymaganym okresie nieprzerwanego legalnego pobytu",
    ],
    documents: [
      "Wypełniony wniosek i cztery fotografie",
      "Ważny dokument podróży wraz z kopią",
      "Dokumenty potwierdzające podstawę ubiegania się o zezwolenie",
      "Dokumenty potwierdzające nieprzerwany pobyt w Polsce",
      "Dla rezydenta UE: potwierdzenie znajomości języka polskiego, stabilnego dochodu i ubezpieczenia",
    ],
    help: [
      "Sprawdzamy, czy okres pobytu liczy się jako nieprzerwany",
      "Dobieramy procedurę korzystniejszą w danej sytuacji",
      "Kompletujemy dokumentację potwierdzającą historię pobytu",
      "Prowadzimy korespondencję z urzędem",
    ],
  },
  {
    slug: "zezwolenie-na-prace",
    title: "Zezwolenie na pracę",
    summary:
      "Zezwolenia typu A i C, oświadczenia o powierzeniu pracy, praca sezonowa — dla pracownika i pracodawcy.",
    intro:
      "O zezwolenie na pracę występuje pracodawca, a nie cudzoziemiec. " +
      "Pomagamy obu stronom: pracownikowi sprawdzić, czy jego praca jest legalna, " +
      "a pracodawcy przeprowadzić procedurę bez błędów formalnych.",
    who: [
      "Pracodawcy zatrudniający cudzoziemców",
      "Pracownicy zmieniający pracodawcę lub stanowisko",
      "Agencje pracy tymczasowej",
      "Osoby wykonujące pracę sezonową",
    ],
    documents: [
      "Wniosek pracodawcy wraz z dokumentami rejestrowymi firmy",
      "Dokument podróży cudzoziemca",
      "Dokumenty potwierdzające kwalifikacje, jeżeli są wymagane na danym stanowisku",
      "Informacja starosty, jeżeli jest wymagana",
      "Dowód wniesienia opłaty",
    ],
    help: [
      "Ustalamy, który typ zezwolenia jest właściwy dla danego stanowiska",
      "Sprawdzamy, czy wymagany jest test rynku pracy",
      "Przygotowujemy dokumentację po stronie pracodawcy",
      "Doradzamy przy zmianie warunków zatrudnienia w trakcie ważności zezwolenia",
    ],
  },
  {
    slug: "zaproszenie-dla-rodziny",
    title: "Zaproszenie dla rodziny",
    summary:
      "Wpis zaproszenia do ewidencji zaproszeń — dokument potrzebny bliskim starającym się o wizę.",
    intro:
      "Zaproszenie wpisane do ewidencji przez wojewodę potwierdza, że zapraszający " +
      "zapewnia zapraszanemu zakwaterowanie i pokrycie kosztów pobytu. " +
      "Jest jednym z dokumentów przedkładanych przy wniosku wizowym.",
    who: [
      "Osoby zapraszające członków rodziny w odwiedziny",
      "Cudzoziemcy z ważnym zezwoleniem na pobyt w Polsce",
      "Obywatele polscy zapraszający bliskich z zagranicy",
    ],
    documents: [
      "Wniosek o wpisanie zaproszenia do ewidencji",
      "Dokument potwierdzający tytuł prawny do lokalu",
      "Dokumenty potwierdzające możliwość pokrycia kosztów pobytu",
      "Dokument tożsamości zapraszającego",
    ],
    help: [
      "Wypełniamy wniosek i sprawdzamy wymagane progi finansowe",
      "Kompletujemy dokumenty dotyczące lokalu",
      "Wyjaśniamy, jak zaproszenie jest oceniane w procedurze wizowej",
    ],
  },
  {
    slug: "wymiana-prawa-jazdy",
    title: "Wymiana prawa jazdy",
    summary:
      "Wymiana zagranicznego prawa jazdy na polskie, bez ponownego kursu tam, gdzie to możliwe.",
    intro:
      "Zagraniczne prawo jazdy można wymienić na polskie, jeżeli wydał je kraj " +
      "będący stroną odpowiedniej konwencji. W części przypadków wymagany jest egzamin " +
      "teoretyczny, w innych wymiana odbywa się bez egzaminu.",
    who: [
      "Osoby z prawem jazdy wydanym poza Unią Europejską",
      "Osoby, którym kończy się okres uznawania zagranicznego dokumentu",
      "Kierowcy zawodowi potrzebujący polskiego dokumentu",
    ],
    documents: [
      "Wniosek o wymianę prawa jazdy",
      "Oryginał zagranicznego prawa jazdy wraz z tłumaczeniem przysięgłym",
      "Fotografia spełniająca wymogi",
      "Dokument potwierdzający pobyt w Polsce",
    ],
    help: [
      "Sprawdzamy, czy dokument podlega wymianie i czy wymagany jest egzamin",
      "Organizujemy tłumaczenie przysięgłe",
      "Składamy wniosek w wydziale komunikacji",
    ],
  },
  {
    slug: "pesel-i-meldunek",
    title: "PESEL i meldunek",
    summary:
      "Nadanie numeru PESEL i zameldowanie — podstawa do rozliczeń, opieki zdrowotnej i e-usług.",
    intro:
      "Numer PESEL i zameldowanie otwierają dostęp do większości spraw urzędowych: " +
      "rozliczenia podatkowego, rejestracji u lekarza, założenia Profilu Zaufanego. " +
      "Obie sprawy załatwia się w urzędzie dzielnicy.",
    who: [
      "Osoby, które właśnie przeprowadziły się do Polski",
      "Osoby zmieniające adres zamieszkania",
      "Rodzice rejestrujący dziecko urodzone w Polsce",
    ],
    documents: [
      "Dokument tożsamości",
      "Dokument potwierdzający tytuł prawny do lokalu lub zgoda właściciela",
      "Wniosek o nadanie numeru PESEL ze wskazaniem podstawy prawnej",
      "Formularz zgłoszenia pobytu stałego lub czasowego",
    ],
    help: [
      "Ustalamy właściwą podstawę prawną nadania numeru PESEL",
      "Przygotowujemy formularze i sprawdzamy dokumenty lokalowe",
      "Umawiamy wizytę w urzędzie dzielnicy",
    ],
  },
  {
    slug: "profil-zaufany",
    title: "Profil Zaufany",
    summary:
      "Założenie i potwierdzenie Profilu Zaufanego — podpis elektroniczny do spraw urzędowych.",
    intro:
      "Profil Zaufany pozwala załatwiać sprawy urzędowe online i podpisywać wnioski " +
      "elektronicznie. Do jego założenia potrzebny jest numer PESEL oraz potwierdzenie " +
      "tożsamości w punkcie potwierdzającym lub przez bankowość elektroniczną.",
    who: [
      "Osoby z nadanym numerem PESEL",
      "Osoby składające wnioski przez mObywatel lub ePUAP",
      "Przedsiębiorcy prowadzący sprawy firmowe online",
    ],
    documents: [
      "Numer PESEL",
      "Dokument tożsamości",
      "Dostęp do polskiej bankowości elektronicznej albo wizyta w punkcie potwierdzającym",
    ],
    help: [
      "Prowadzimy krok po kroku przez rejestrację",
      "Wskazujemy najszybszą dostępną metodę potwierdzenia tożsamości",
      "Pomagamy przy pierwszych wnioskach składanych elektronicznie",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
