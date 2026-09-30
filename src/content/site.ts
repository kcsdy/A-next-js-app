/**
 * Facts about the firm that do not change with the site's language: legal
 * identity, contact details, postal address. Everything that IS language —
 * tagline, descriptions, nav labels, hours in prose — lives in
 * messages/*.json instead. See src/content/services.ts for why the
 * procedure list moved out too.
 */

export const site = {
  name: "MCH Kancelaria Imigracyjna",
  shortName: "MCH",

  contact: {
    // TODO: replace with real details
    email: "kontakt@example.pl",
    phone: "+48 000 000 000",
    phoneHref: "+48000000000",
    // Postal addresses are not translated — mail is addressed in the local
    // administrative language regardless of the page the visitor reads.
    street: "ul. Przykładowa 1",
    postcode: "00-000",
    city: "Warszawa",
  },

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
} as const;
