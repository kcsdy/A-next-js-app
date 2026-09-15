import { z } from "zod";
import { services } from "@/content/services";

const slugs = services.map((s) => s.slug);

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Podaj imię i nazwisko.")
    .max(120, "To pole jest za długie."),

  email: z.email("Podaj poprawny adres e-mail."),

  phone: z
    .string()
    .trim()
    .max(32, "To pole jest za długie.")
    .optional()
    .or(z.literal("")),

  /** Which procedure the enquiry is about; must match a known service slug. */
  matter: z
    .string()
    .refine((v) => v === "inna" || slugs.includes(v), "Wybierz sprawę z listy."),

  message: z
    .string()
    .trim()
    .min(20, "Opisz sprawę w co najmniej 20 znakach.")
    .max(4000, "Wiadomość jest za długa."),

  /** RODO: consent is recorded explicitly, not assumed from form submission. */
  consent: z.literal(true, "Zgoda jest wymagana, żeby odpowiedzieć na wiadomość."),

  /** Honeypot — real people leave this empty, most bots fill it in. */
  company: z.string().max(0).optional().or(z.literal("")),

  /** Cloudflare Turnstile token, when Turnstile is configured. */
  turnstileToken: z.string().optional(),
});

export type Enquiry = z.infer<typeof enquirySchema>;
