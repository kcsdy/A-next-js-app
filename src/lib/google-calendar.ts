import { google } from "googleapis";
import { siteUrl } from "@/lib/site-url";

/**
 * One dedicated Google account (personal Gmail is fine) hosts these events —
 * it doesn't need to match the firm's actual mail domain (which is on
 * iCloud+). Authorized once via /api/auth/google/start, see that route and
 * the callback for the one-time setup. The refresh token obtained there is
 * what makes every later call here silent — no user interaction at runtime.
 */
export const GOOGLE_OAUTH_SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

export function getGoogleOAuthRedirectUri() {
  return `${siteUrl}/api/auth/google/callback`;
}

export function createGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not configured.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, getGoogleOAuthRedirectUri());
}

function getAuthorizedClient() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error(
      "GOOGLE_REFRESH_TOKEN is not configured — complete the one-time setup at /api/auth/google/start first.",
    );
  }

  const client = createGoogleOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export type MeetingBooking = {
  /** Used as the calendar event's idempotency key with Google's API too. */
  bookingId: string;
  attendeeName: string;
  attendeeEmail: string;
  /** ISO 8601 date-times. */
  startTime: string;
  endTime: string;
  summary: string;
  description?: string;
};

export type CreatedMeeting = {
  meetLink: string;
  htmlLink: string;
};

/**
 * Creates the calendar event with `conferenceData.createRequest`, which is
 * what makes Google mint a fresh Meet link — a plain event insert without it
 * doesn't get one. `sendUpdates: "none"` stops Google Calendar from emailing
 * the attendee itself; the confirmation email (with our own branding, from
 * our own domain) is sent separately via Resend.
 */
export async function createMeetingWithMeetLink(
  booking: MeetingBooking,
): Promise<CreatedMeeting> {
  const auth = getAuthorizedClient();
  const calendar = google.calendar({ version: "v3", auth });

  const { data } = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "none",
    requestBody: {
      summary: booking.summary,
      description: booking.description,
      start: { dateTime: booking.startTime },
      end: { dateTime: booking.endTime },
      attendees: [{ email: booking.attendeeEmail, displayName: booking.attendeeName }],
      conferenceData: {
        createRequest: {
          // Google dedupes on this, so redelivering the same booking id
          // reuses the same conference instead of minting a second one.
          requestId: booking.bookingId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    },
  });

  const meetLink = data.hangoutLink;
  if (!meetLink) {
    throw new Error("Google Calendar did not return a Meet link for this event.");
  }

  return { meetLink, htmlLink: data.htmlLink ?? "" };
}
