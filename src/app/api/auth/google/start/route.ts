import { NextResponse } from "next/server";
import { createGoogleOAuthClient, GOOGLE_OAUTH_SCOPES } from "@/lib/google-calendar";

/**
 * One-time manual setup step — not part of any user-facing flow. Visit this
 * URL yourself, signed into whichever Google account should own the
 * calendar/Meet links, approve access, then copy the refresh token the
 * callback shows you into GOOGLE_REFRESH_TOKEN on Vercel.
 *
 * Before this works you need, from Google Cloud Console:
 *   1. A project with the "Google Calendar API" enabled.
 *   2. An OAuth consent screen — External, and set to "In production"
 *      (NOT "Testing" — Testing-mode refresh tokens expire after ~7 days).
 *   3. An OAuth 2.0 Client ID, type "Web application", with
 *      `${siteUrl}/api/auth/google/callback` added as an authorized
 *      redirect URI.
 *   4. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET set from that client.
 */
export function GET() {
  const client = createGoogleOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    // Forces Google to issue a refresh token even if this account has
    // authorized the app before.
    prompt: "consent",
    scope: GOOGLE_OAUTH_SCOPES,
  });

  return NextResponse.redirect(url);
}
