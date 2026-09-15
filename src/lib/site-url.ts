/**
 * Resolving the canonical origin.
 *
 * This has to survive three things that all actually happen:
 *   - the variable being set but empty (an empty string is not `undefined`,
 *     so `??` does not catch it)
 *   - someone entering `mch.pl` without a protocol
 *   - preview deployments, which have a different hostname every time
 *
 * Vercel injects VERCEL_PROJECT_PRODUCTION_URL and VERCEL_URL automatically
 * (System Environment Variables, on by default), both as bare hostnames with
 * no scheme. They are used as fallbacks so a deployment never produces
 * garbage canonical URLs even if nothing was configured.
 */

const FALLBACK = "http://localhost:3000";

function normalize(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    // `.origin` also strips any trailing slash or stray path.
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export const siteUrl =
  normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalize(process.env.VERCEL_URL) ??
  FALLBACK;