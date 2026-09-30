import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createTranslator } from "next-intl";
import { createEnquirySchema } from "@/lib/schema";
import { routing } from "@/i18n/routing";

/**
 * Client-side validation is a convenience; this is the check that counts.
 * Nothing is written to a database — the enquiry is forwarded as email and
 * then forgotten, which keeps the RODO surface as small as possible.
 *
 * This route sits outside the [locale] segment (see src/middleware.ts
 * matcher), so it gets no locale from the URL — the client sends the
 * locale it was on in the request body instead, purely to pick which
 * language to reply in.
 */

// Crude in-memory throttle. Serverless instances are short-lived so this only
// blunts naive floods; Turnstile does the real work. Swap for Upstash Redis if
// the site ever needs a guarantee.
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Not configured yet — skip.
  if (!token) return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    },
  );
  const result = (await response.json()) as { success: boolean };
  return result.success;
}

async function loadMessages(locale: string) {
  try {
    return (await import(`../../../../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../../../../messages/${routing.defaultLocale}.json`))
      .default;
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const body = await request.json().catch(() => null);
  const rawLocale = typeof body?.locale === "string" ? body.locale : "";
  const locale = (routing.locales as readonly string[]).includes(rawLocale)
    ? rawLocale
    : routing.defaultLocale;

  const messages = await loadMessages(locale);
  const t = createTranslator({ locale, messages, namespace: "contactForm" });

  if (rateLimited(ip)) {
    return NextResponse.json({ error: t("api.rateLimited") }, { status: 429 });
  }

  const schema = createEnquirySchema((key) => t(`errors.${key}`));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: t("api.invalid") }, { status: 400 });
  }

  const enquiry = parsed.data;

  // Honeypot filled in — accept silently so the bot does not learn anything.
  if (enquiry.company) {
    return NextResponse.json({ ok: true });
  }

  if (!(await verifyTurnstile(enquiry.turnstileToken, ip))) {
    return NextResponse.json(
      { error: t("api.turnstileFailed") },
      { status: 400 },
    );
  }

  // The internal notification email is always Polish — it goes to the
  // firm's own inbox, not the visitor, regardless of which locale they used
  // or which locale the site defaults to for visitors.
  const plMessages = await loadMessages("pl");
  const tPl = createTranslator({ locale: "pl", messages: plMessages });
  const matterLabel =
    enquiry.matter === "inna"
      ? tPl("contactForm.fields.matterOther")
      : tPl(`services.${enquiry.matter}.title`);

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO ?? user;

  // Without SMTP configured, log instead of failing — lets the form be
  // exercised locally before the mailbox credentials are set up.
  if (!host || !user || !pass || !to) {
    console.info("[kontakt] SMTP not configured. Enquiry:", {
      ...enquiry,
      matter: matterLabel,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    // Sent from the firm's own mailbox to itself; the visitor's address is in
    // the body (and replyTo) rather than the From header, which must stay on
    // our domain for the mail server to accept it.
    await transporter.sendMail({
      from: process.env.CONTACT_FROM ?? user,
      to,
      replyTo: enquiry.email,
      subject: `Zapytanie: ${matterLabel} — ${enquiry.name}`,
      text: [
        `Sprawa: ${matterLabel}`,
        `Imię i nazwisko: ${enquiry.name}`,
        `E-mail: ${enquiry.email}`,
        `Telefon: ${enquiry.phone || "nie podano"}`,
        `Język strony: ${locale}`,
        `Zgoda RODO: tak (${new Date().toISOString()})`,
        "",
        enquiry.message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("[kontakt] send failed", error);
    return NextResponse.json({ error: t("api.sendFailed") }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
