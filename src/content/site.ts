/**
 * Every piece of firm-specific text lives here so copy changes never require
 * touching a component. Anything marked TODO must be filled in before launch —
 * several of these are legal requirements, not nice-to-haves.
 */

export const site = {
  name: "MCH Kancelaria Imigracyjna",
  shortName: "MCH",
  tagline: "Tam, gdzie prawo imigracyjne spotyka człowieka",
  taglineEn: "Where immigration law meets humanity",

  description:
    "Kancelaria imigracyjna w Warszawie. Karty pobytu, zezwolenia na pracę, " +
    "zaproszenia dla rodziny, PESEL i meldunek, wymiana prawa jazdy.",

  city: "Warszawa",

  contact: {
    // TODO: replace with real details
    email: "kontakt@example.pl",
    phone: "+48 000 000 000",
    phoneHref: "+48000000000",
    street: "ul. Przykładowa 1",
    postcode: "00-000",
    city: "Warszawa",
  },

  hours: [
    { days: "Poniedziałek – piątek", time: "9:00 – 17:00" },
    { days: "Sobota", time: "po wcześniejszym umówieniu" },
  ],

  // Languages the firm actually handles enquiries in. Immigration clients look
  // for this before anything else, so it sits high on the page.
  languages: ["polski", "english", "українська", "русский"],

  /**
   * RODO / legal footer. Polish law requires identifying the entity behind a
   * commercial site. TODO: confirm the exact legal form and numbers.
   */
  legal: {
    entity: "MCH Kancelaria Imigracyjna",
    nip: "TODO",
    regon: "TODO",
    // If the practice is run by an adwokat or radca prawny, the bar
    // registration details belong here too, and the professional advertising
    // rules apply to all copy on this site.
    barInfo: null as string | null,
  },

  nav: [
    { href: "/#uslugi", label: "Zakres pomocy" },
    { href: "/o-kancelarii", label: "O kancelarii" },
    { href: "/kontakt", label: "Kontakt" },
  ],
} as const;
