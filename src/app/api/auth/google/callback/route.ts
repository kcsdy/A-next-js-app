import { NextResponse } from "next/server";
import { createGoogleOAuthClient } from "@/lib/google-calendar";

/** Companion to /api/auth/google/start — see the setup notes there. */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return new NextResponse("Missing ?code — start over at /api/auth/google/start.", {
      status: 400,
    });
  }

  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    return new NextResponse(
      "Google did not return a refresh token. This usually means the account already " +
        "granted access before — remove the app's access at myaccount.google.com/permissions " +
        "and try /api/auth/google/start again.",
      { status: 400 },
    );
  }

  // Shown once, to you, in your own browser — never logged or stored by
  // this app. Copy it into GOOGLE_REFRESH_TOKEN and this page is done.
  return new NextResponse(
    [
      "Copy this into the GOOGLE_REFRESH_TOKEN environment variable, then delete this",
      "value from your browser history if it's shared with anyone:",
      "",
      tokens.refresh_token,
    ].join("\n"),
    { status: 200, headers: { "Content-Type": "text/plain" } },
  );
}
