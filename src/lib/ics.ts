/**
 * Minimal .ics (RFC 5545) builder — just enough for a single VEVENT. Not a
 * general calendar library; the point is that the client can drop this into
 * iCloud, Google Calendar, Outlook or anything else without us knowing or
 * caring which one they use.
 */

function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Folds/escapes text per RFC 5545 §3.3.11 (commas, semicolons, newlines). */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

export type IcsEvent = {
  uid: string;
  summary: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
};

export function buildIcsEvent(event: IcsEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MCH Kancelaria Imigracyjna//Schedule Appointment//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.startTime)}`,
    `DTEND:${toIcsDate(event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `ORGANIZER:mailto:${event.organizerEmail}`,
    `ATTENDEE;CN=${escapeIcsText(event.attendeeName)}:mailto:${event.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // RFC 5545 requires CRLF line endings.
  return lines.join("\r\n");
}
