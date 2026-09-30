/**
 * Just the routing identity of each procedure — slug and document count
 * used for generateStaticParams and the contact form's dropdown. The actual
 * title/summary/intro/who/documents/help text is translated per locale in
 * messages/*.json under "services.<slug>", not here.
 */

export const serviceSlugs = [
  "karta-pobytu-czasowego",
  "pobyt-staly",
  "zezwolenie-na-prace",
  "zaproszenie-dla-rodziny",
  "wymiana-prawa-jazdy",
  "pesel-i-meldunek",
  "profil-zaufany",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
