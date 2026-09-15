import { NextResponse } from "next/server";
import { Resend } from "resend";
import { enquirySchema } from "@/lib/schema";
import { getService } from "@/content/services";

/**
 * Client-side validation is a convenience; this is the check that counts.
 * Nothing is written to a database — the enquiry is forwarded as email and
 * then forgotten, which keeps the RODO surface as small as possible.
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

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Zbyt wiele prób. Spróbuj ponownie za chwilę." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formularz zawiera błędy." },
      { status: 400 },
    );
  }

  const enquiry = parsed.data;

  // Honeypot filled in — accept silently so the bot does not learn anything.
  if (enquiry.company) {
    return NextResponse.json({ ok: true });
  }

  if (!(await verifyTurnstile(enquiry.turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Weryfikacja nie powiodła się. Odśwież stronę i spróbuj ponownie." },
      { status: 400 },
    );
  }

  const matterLabel =
    enquiry.matter === "inna"
      ? "Inna sprawa"
      : (getService(enquiry.matter)?.title ?? enquiry.matter);

  const apiKey = process.env.RESEND_API_KEY;

  // Without a key configured, log instead of failing — lets the form be
  // exercised locally before the email provider is set up.
  if (!apiKey) {
    console.info("[kontakt] RESEND_API_KEY not set. Enquiry:", {
      ...enquiry,
      matter: matterLabel,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "onboarding@resend.dev",
      to: process.env.CONTACT_TO ?? "",
      replyTo: enquiry.email,
      subject: `Zapytanie: ${matterLabel} — ${enquiry.name}`,
      text: [
        `Sprawa: ${matterLabel}`,
        `Imię i nazwisko: ${enquiry.name}`,
        `E-mail: ${enquiry.email}`,
        `Telefon: ${enquiry.phone || "nie podano"}`,
        `Zgoda RODO: tak (${new Date().toISOString()})`,
        "",
        enquiry.message,
      ].join("\n"),
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("[kontakt] send failed", error);
    return NextResponse.json(
      { error: "Nie udało się wysłać wiadomości. Zadzwoń albo napisz e-mail." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
