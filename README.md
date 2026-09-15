# MCH Kancelaria Imigracyjna — website

Next.js 16 (App Router, TypeScript, Tailwind 4). One app, no separate backend:
pages are pre-rendered as static HTML, and the single server-side concern —
the contact form — lives in `src/app/api/kontakt/route.ts`.

Verified: `npx tsc --noEmit` clean, `next build` generates 16 routes, only the
API route is dynamic.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With no `RESEND_API_KEY` set, the contact form
still works end to end and logs the enquiry to the terminal instead of sending
mail, so you can build out the rest before touching an email provider.

## Where things live

```
src/content/site.ts        firm details, nav, hours, legal footer
src/content/services.ts    the seven practice areas — drives the homepage list,
                           the /uslugi/[slug] pages, the form dropdown, sitemap
src/app/globals.css        brand tokens (burgundy / beige / white), type scale
src/app/api/kontakt/       form handler: validation, Turnstile, Resend
src/lib/schema.ts          one zod schema shared by client and server
```

Adding a practice area means adding one object to `services.ts`. Nothing else
needs to change.

## Environment variables

| Variable | Needed | What it does |
|---|---|---|
| `RESEND_API_KEY` | before launch | Sends the contact form. Free tier is plenty. |
| `CONTACT_FROM` | before launch | Must be on a domain verified in Resend. |
| `CONTACT_TO` | before launch | Where enquiries land. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | recommended | Cloudflare Turnstile, free. Leave blank to disable. |
| `TURNSTILE_SECRET_KEY` | recommended | Server-side half of the above. |
| `NEXT_PUBLIC_SITE_URL` | before launch | Canonical URLs and `sitemap.xml`. No trailing slash. |

## Deploy to Vercel

1. Push the repo to GitHub.
2. On vercel.com, **Add New → Project**, import the repo. Framework detection
   picks up Next.js on its own; no build settings to change.
3. Add the environment variables above under **Settings → Environment
   Variables**, for Production and Preview both.
4. Deploy. You get `something.vercel.app` immediately.

When the domain is ready, add it under **Settings → Domains** and point the
registrar's DNS at Vercel. Certificates are issued automatically. Set
`NEXT_PUBLIC_SITE_URL` to the real domain at the same time, or the sitemap will
keep advertising the wrong hostname.

Every push to `main` redeploys; every pull request gets its own preview URL,
which is a convenient way to show the client a change before it goes live.

## Before this goes live

These are not polish items. The first three are legal requirements.

- [ ] **Privacy policy.** `/polityka-prywatnosci` is a skeleton with TODOs in
      it. Retention periods, processors and the transfer-outside-EEA note must
      be filled in. Vercel and Resend are both processors and both belong in
      the list.
- [ ] **Entity details.** NIP and REGON in `src/content/site.ts` are `TODO`.
      Polish law requires identifying the business behind a commercial site.
- [ ] **Professional advertising rules.** If the practice is run by an adwokat
      or radca prawny, the relevant code of ethics constrains how services can
      be described, and testimonials and comparative claims in particular. Copy
      should be checked against it before publishing.
- [ ] **Verify the legal content.** Everything in `services.ts` under
      `documents` and `intro` is a drafted starting point, not verified law.
      Check it against current practice at the Mazowiecki Urząd Wojewódzki.
- [ ] **Real contact details** — phone, email, address, opening hours.
- [ ] **`/o-kancelarii`** is placeholder prose. It needs the actual story.
- [ ] **Turn on Turnstile.** A contact form on an immigration site attracts a
      lot of automated junk.
- [ ] **Open Graph image** for link previews when the site gets shared.

## Adding English (and Ukrainian, Russian)

The site is Polish-only right now. When you want more languages, the shape is:

1. Move everything under `src/app/` into `src/app/[locale]/` (except `api/`,
   `sitemap.ts`, `robots.ts`).
2. Change the `Service` type so the text fields hold `{ pl: string; en: string }`
   instead of `string`.
3. Read `locale` from the awaited `params` and pick the right field.
4. Add `alternates.languages` to the metadata so search engines pair the
   versions up.

Worth doing sooner rather than later — a large share of the audience searches
in English or Ukrainian rather than Polish.

## Notes on the design

White is the reading surface; beige appears only as a band behind supporting
sections; burgundy carries structure (rules, headings, footer). The homepage
hero is the list of procedures rather than a slogan, on the reasoning that
people arrive already knowing their problem and the fastest useful thing the
page can do is show them the procedure names.

Type is Source Serif 4 for headings and IBM Plex Sans for body, both loaded
with the `latin-ext` subset. That subset is not optional: without it the Polish
diacritics fall back to a different face mid-word.
