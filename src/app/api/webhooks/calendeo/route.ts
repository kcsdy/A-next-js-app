import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createMeetingWithMeetLink } from "@/lib/google-calendar";
import { buildIcsEvent } from "@/lib/ics";
import { site } from "@/content/site";

/**
 * Receives Calendeo's booking webhook, creates a Google Calendar event with
 * a fresh Meet link, and emails the client a confirmation (Meet link + an
 * .ics they can drop into iCloud, Google Calendar, Outlook — whatever they
 * use) via Resend, from the firm's own domain.
 *
 * Contract verified against Calendeo's own docs:
 * https://www.mycalendeo.pl/en/help-center/integracja-webhook
 *
 * One hop, synchronous, no queue: if Google or Resend fails we return a
 * non-2xx so Calendeo's own retry (up to 5 attempts, increasing delay) does
 * the work, rather than acking the webhook and silently losing the booking.
 * Calendeo expects a response within a few seconds though, and disables the
 * webhook after 5 consecutive failures — add a durable queue if this route
 * is ever actually seen timing out in practice.
 */

// ---------------------------------------------------------------------------
// Signature verification, per Calendeo's docs: the `X-Calendeo-Signature`
// header is `t=<unix_timestamp>,v1=<hex HMAC-SHA256 digest>`, computed over
// `"{timestamp}.{raw request body}"` using the signing secret from
// Dashboard → Integrations → Webhook. Must run against the *raw* body text,
// before JSON.parse.
// ---------------------------------------------------------------------------

const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function verifySignature(header: string | null, rawBody: string, secret: string): boolean {
  if (!header) return false;

  const parts = new Map(
    header.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value] as const;
    }),
  );
  const timestamp = parts.get("t");
  const signature = parts.get("v1");
  if (!timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_SIGNATURE_AGE_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEqualHex(signature, expected);
}

// ---------------------------------------------------------------------------
// Payload shape, per Calendeo's docs:
//
// {
//   "id": "3e2f6b8a-...",
//   "event_type": "event.created" | "event.accepted" | "event.cancelled" | "event.did_not_attend",
//   "created_at": "2026-07-15T10:00:00Z",
//   "data": {
//     "calendar_id": 12,
//     "calendar_event_id": 345,
//     "status": "pending",
//     "service_name": "Consultation",
//     "start_time": "2026-07-20T09:00:00Z",
//     "end_time": "2026-07-20T09:30:00Z",
//     "client": { "name": "Jane Doe", "email": "jane@example.com", "phone": "+15551234567" },
//     "description": null
//   }
// }
// ---------------------------------------------------------------------------

type CalendeoEventType =
  | "event.created"
  | "event.accepted"
  | "event.cancelled"
  | "event.did_not_attend";

type CalendeoPayload = {
  id: string;
  eventType: CalendeoEventType;
  bookingId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  description: string | null;
};

function parseCalendeoPayload(body: unknown): CalendeoPayload | null {
  if (typeof body !== "object" || body === null) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = body as Record<string, any>;
  const data = b.data;
  if (typeof data !== "object" || data === null) return null;

  const id = b.id;
  const eventType = b.event_type;
  const bookingId = data.calendar_event_id;
  const startTime = data.start_time;
  const endTime = data.end_time;
  const clientEmail = data.client?.email;

  if (!id || !eventType || bookingId === undefined || !startTime || !endTime || !clientEmail) {
    return null;
  }

  return {
    id: String(id),
    eventType,
    bookingId: String(bookingId),
    serviceName: data.service_name ? String(data.service_name) : "Consultation",
    startTime: String(startTime),
    endTime: String(endTime),
    clientName: data.client?.name ? String(data.client.name) : String(clientEmail),
    clientEmail: String(clientEmail),
    clientPhone: data.client?.phone ? String(data.client.phone) : null,
    description: data.description ? String(data.description) : null,
  };
}

// ---------------------------------------------------------------------------
// Dedupe on `calendar_event_id` — Calendeo can send both event.created and
// event.accepted for the same booking, and can retry any delivery up to 5
// times. Best-effort only: resets on cold start and isn't shared across
// instances, same tradeoff already accepted by the rate limiter in
// /api/kontakt. Swap for Upstash Redis (or Vercel KV) if that turns out to
// matter in practice.
// ---------------------------------------------------------------------------

const processedBookingIds = new Set<string>();
const MAX_TRACKED = 500;

function alreadyProcessed(id: string): boolean {
  if (processedBookingIds.has(id)) return true;
  if (processedBookingIds.size >= MAX_TRACKED) {
    const oldest = processedBookingIds.values().next().value;
    if (oldest !== undefined) processedBookingIds.delete(oldest);
  }
  processedBookingIds.add(id);
  return false;
}

const resendApiKey = process.env.RESEND_API_KEY;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CALENDEO_WEBHOOK_SECRET;

  if (secret) {
    const signatureHeader = request.headers.get("x-calendeo-signature");
    if (!verifySignature(signatureHeader, rawBody, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }
  // If no secret is configured yet, verification is skipped — same pattern
  // as Turnstile in /api/kontakt while the site is still being set up.

  const body = JSON.parse(rawBody === "" ? "null" : rawBody);
  const event = parseCalendeoPayload(body);

  if (!event) {
    console.error("[calendeo] Unrecognized payload shape:", rawBody);
    return NextResponse.json({ error: "Unrecognized payload shape" }, { status: 400 });
  }

  // Only a created-or-accepted booking should get a meeting + email.
  // Cancellations and no-shows are acknowledged but otherwise ignored here —
  // deleting an already-created Google Calendar event on cancellation is a
  // reasonable next step, but needs a persistent calendar_event_id -> Google
  // event id mapping (not just the in-memory dedupe set) to do reliably.
  if (event.eventType === "event.cancelled" || event.eventType === "event.did_not_attend") {
    return NextResponse.json({ ok: true, ignored: event.eventType });
  }

  if (alreadyProcessed(event.bookingId)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  let meeting;
  try {
    meeting = await createMeetingWithMeetLink({
      bookingId: event.bookingId,
      attendeeName: event.clientName,
      attendeeEmail: event.clientEmail,
      startTime: event.startTime,
      endTime: event.endTime,
      summary: `${event.serviceName} — ${event.clientName}`,
      description: [
        "Booked via the website.",
        event.clientPhone ? `Phone: ${event.clientPhone}` : null,
        event.description,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (error) {
    console.error("[calendeo] Google Calendar event creation failed", error);
    return NextResponse.json({ error: "Calendar event creation failed" }, { status: 502 });
  }

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(event.startTime));

  const ics = buildIcsEvent({
    uid: `${event.bookingId}@mch-kancelaria`,
    summary: `${event.serviceName} — MCH Kancelaria Imigracyjna`,
    description: `Video call: ${meeting.meetLink}`,
    location: meeting.meetLink,
    startTime: event.startTime,
    endTime: event.endTime,
    organizerEmail: site.contact.email,
    attendeeEmail: event.clientEmail,
    attendeeName: event.clientName,
  });

  if (!resendApiKey) {
    console.info("[calendeo] RESEND_API_KEY not set. Booking processed but no email sent:", {
      event,
      meetLink: meeting.meetLink,
    });
    return NextResponse.json({ ok: true, delivered: false, meetLink: meeting.meetLink });
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "onboarding@resend.dev",
      to: event.clientEmail,
      subject: `Your ${event.serviceName.toLowerCase()} is confirmed`,
      text: [
        `Hi ${event.clientName},`,
        "",
        `Your ${event.serviceName.toLowerCase()} is confirmed for ${dateLabel} (Europe/Warsaw time).`,
        "",
        `Join by Google Meet: ${meeting.meetLink}`,
        "",
        "A calendar invite is attached — add it to whichever calendar you use.",
        "",
        "See you then,",
        "MCH Kancelaria Imigracyjna",
      ].join("\n"),
      attachments: [
        {
          filename: "consultation.ics",
          content: Buffer.from(ics).toString("base64"),
        },
      ],
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("[calendeo] confirmation email failed", error);
    return NextResponse.json(
      { error: "Meeting created but confirmation email failed" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true, meetLink: meeting.meetLink });
}
