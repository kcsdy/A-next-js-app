import { z } from "zod";
import { isServiceSlug } from "@/content/services";

/** Looks up one message key; matches next-intl's `t()` signature closely
 *  enough to be passed either a scoped `useTranslations` result or a plain
 *  function, so the same schema shape works client-side and in the API route. */
type ErrorTranslator = (key: string) => string;

/**
 * Validation messages are localized, so the schema is built per-request
 * instead of exported as a singleton — used identically by the client form
 * (immediate feedback) and the API route (the check that actually counts).
 */
export function createEnquirySchema(t: ErrorTranslator) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("name"))
      .max(120, t("tooLong")),

    email: z.email(t("email")),

    phone: z
      .string()
      .trim()
      .max(32, t("tooLong"))
      .optional()
      .or(z.literal("")),

    /** Which procedure the enquiry is about; must match a known service slug. */
    matter: z
      .string()
      .refine((v) => v === "inna" || isServiceSlug(v), t("matter")),

    message: z
      .string()
      .trim()
      .min(20, t("messageMin"))
      .max(4000, t("messageMax")),

    /** RODO: consent is recorded explicitly, not assumed from form submission. */
    consent: z.literal(true, t("consent")),

    /** Honeypot — real people leave this empty, most bots fill it in. */
    company: z.string().max(0).optional().or(z.literal("")),

    /** Cloudflare Turnstile token, when Turnstile is configured. */
    turnstileToken: z.string().optional(),

    /** Which locale the visitor was on, so the API route can reply in kind. */
    locale: z.string().optional(),
  });
}

export type Enquiry = z.infer<ReturnType<typeof createEnquirySchema>>;
