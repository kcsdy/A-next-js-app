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

/**
 * Every notification shares this envelope — including the reachability
 * check Calendeo's dashboard sends when you save the webhook URL, which
 * arrives as a real POST with `event_type: "endpoint.test"` and whatever
 * (possibly empty) `data` it feels like. That one, plus `event.cancelled`
 * and `event.did_not_attend`, are acknowledged without ever needing the
 * full booking shape below — only `event.created`/`event.accepted` do.
 */
type CalendeoEnvelope = {
  id: string;
  eventType: string;
  data: unknown;
};

function parseEnvelope(body: unknown): CalendeoEnvelope | null {
  if (typeof body !== "object" || body === null) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const b = body as Record<string, any>;
  if (!b.id || !b.event_type) return null;
  return { id: String(b.id), eventType: String(b.event_type), data: b.data };
}

type CalendeoBooking = {
  bookingId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  description: string | null;
};

function parseBooking(data: unknown): CalendeoBooking | null {
  if (typeof data !== "object" || data === null) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as Record<string, any>;

  const bookingId = d.calendar_event_id;
  const startTime = d.start_time;
  const endTime = d.end_time;
  const clientEmail = d.client?.email;

  if (bookingId === undefined || !startTime || !endTime || !clientEmail) return null;

  return {
    bookingId: String(bookingId),
    serviceName: d.service_name ? String(d.service_name) : "Consultation",
    startTime: String(startTime),
    endTime: String(endTime),
    clientName: d.client?.name ? String(d.client.name) : String(clientEmail),
    clientEmail: String(clientEmail),
    clientPhone: d.client?.phone ? String(d.client.phone) : null,
    description: d.description ? String(d.description) : null,
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

/**
 * Calendeo's dashboard appears to check reachability before letting you
 * save the webhook URL — separate from actual event delivery, which is
 * always a signed POST. Answer plain GETs and CORS preflights with a bare
 * 200 so that check succeeds; real events still go through the strict
 * signature + payload checks in POST below.
 */
export function GET() {
  return NextResponse.json({ ok: true });
}

export function HEAD() {
  return new NextResponse(null, { status: 200 });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Calendeo-Signature, X-Calendeo-Event",
    },
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.CALENDEO_WEBHOOK_SECRET;

  // TEMPORARY diagnostic logging — remove once Calendeo's reachability
  // check and real deliveries are both confirmed working. Safe to keep
  // short-term: logs headers/body shape, not secrets.
  console.info("[calendeo] incoming POST", {
    headers: Object.fromEntries(request.headers.entries()),
    bodyLength: rawBody.length,
    bodyPreview: rawBody.slice(0, 500),
  });

  if (secret) {
    const signatureHeader = request.headers.get("x-calendeo-signature");
    if (!verifySignature(signatureHeader, rawBody, secret)) {
      console.warn("[calendeo] signature check failed", {
        signatureHeaderPresent: Boolean(signatureHeader),
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }
  // If no secret is configured yet, verification is skipped — same pattern
  // as Turnstile in /api/kontakt while the site is still being set up.

  const body = JSON.parse(rawBody === "" ? "null" : rawBody);
  const envelope = parseEnvelope(body);

  if (!envelope) {
    console.error("[calendeo] Unrecognized envelope shape:", rawBody);
    return NextResponse.json({ error: "Unrecognized payload shape" }, { status: 400 });
  }

  // Only a created-or-accepted booking should get a meeting + email.
  // Everything else — the "endpoint.test" reachability check Calendeo sends
  // when you save the webhook URL, cancellations, no-shows, and any future
  // event type we don't know about yet — is acknowledged and otherwise
  // ignored. (Deleting an already-created Google Calendar event on
  // cancellation is a reasonable next step, but needs a persistent
  // calendar_event_id -> Google event id mapping, not just the in-memory
  // dedupe set, to do reliably.)
  if (envelope.eventType !== "event.created" && envelope.eventType !== "event.accepted") {
    return NextResponse.json({ ok: true, acknowledged: envelope.eventType });
  }

  const booking = parseBooking(envelope.data);
  if (!booking) {
    console.error("[calendeo] Unrecognized booking shape:", rawBody);
    return NextResponse.json({ error: "Unrecognized payload shape" }, { status: 400 });
  }

  if (alreadyProcessed(booking.bookingId)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  let meeting;
  try {
    meeting = await createMeetingWithMeetLink({
      bookingId: booking.bookingId,
      attendeeName: booking.clientName,
      attendeeEmail: booking.clientEmail,
      startTime: booking.startTime,
      endTime: booking.endTime,
      summary: `${booking.serviceName} — ${booking.clientName}`,
      description: [
        "Booked via the website.",
        booking.clientPhone ? `Phone: ${booking.clientPhone}` : null,
        booking.description,
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
  }).format(new Date(booking.startTime));

  const ics = buildIcsEvent({
    uid: `${booking.bookingId}@mch-kancelaria`,
    summary: `${booking.serviceName} — MCH Kancelaria Imigracyjna`,
    description: `Video call: ${meeting.meetLink}`,
    location: meeting.meetLink,
    startTime: booking.startTime,
    endTime: booking.endTime,
    organizerEmail: site.contact.email,
    attendeeEmail: booking.clientEmail,
    attendeeName: booking.clientName,
  });

  if (!resendApiKey) {
    console.info("[calendeo] RESEND_API_KEY not set. Booking processed but no email sent:", {
      booking,
      meetLink: meeting.meetLink,
    });
    return NextResponse.json({ ok: true, delivered: false, meetLink: meeting.meetLink });
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM ?? "onboarding@resend.dev",
      to: booking.clientEmail,
      subject: `Your ${booking.serviceName.toLowerCase()} is confirmed`,
      text: [
        `Hi ${booking.clientName},`,
        "",
        `Your ${booking.serviceName.toLowerCase()} is confirmed for ${dateLabel} (Europe/Warsaw time).`,
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
