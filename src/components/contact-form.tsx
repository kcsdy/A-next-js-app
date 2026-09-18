"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { serviceSlugs } from "@/content/services";
import { createEnquirySchema } from "@/lib/schema";

type Status = "idle" | "sending" | "sent" | "error";

const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm() {
  const locale = useLocale();
  const t = useTranslations("contactForm");
  const tServices = useTranslations("services");

  // Service pages link here as /kontakt?sprawa=karta-pobytu-czasowego so the
  // right procedure is already chosen when the form loads.
  const preselected = useSearchParams().get("sprawa") ?? "";

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!turnstileKey) return;
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      const turnstile = (window as unknown as { turnstile?: {
        render: (el: HTMLElement, opts: Record<string, unknown>) => void;
      } }).turnstile;
      if (turnstile && turnstileRef.current) {
        turnstile.render(turnstileRef.current, {
          sitekey: turnstileKey,
          theme: "light",
        });
      }
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      matter: String(data.get("matter") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      company: String(data.get("company") ?? ""),
      turnstileToken: String(data.get("cf-turnstile-response") ?? ""),
      locale,
    };

    const schema = createEnquirySchema((key) => t(`errors.${key}`));
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("sending");

    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? t("api.genericSendFailed"));
      }

      setStatus("sent");
      form.reset();
    } catch (error) {
      setStatus("error");
      setFormError(
        error instanceof Error ? error.message : t("api.genericSendFailed"),
      );
    }
  }

  if (status === "sent") {
    return (
      <div className="border-l-4 border-burgundy bg-beige-pale p-8">
        <h2 className="text-xl">{t("sentTitle")}</h2>
        <p className="mt-3 leading-relaxed text-muted">{t("sentBody")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-burgundy underline underline-offset-4"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field label={t("fields.name")} name="name" error={errors.name} required>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className={inputClass(errors.name)}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("fields.email")} name="email" error={errors.email} required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass(errors.email)}
          />
        </Field>

        <Field label={t("fields.phone")} name="phone" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass(errors.phone)}
          />
        </Field>
      </div>

      <Field label={t("fields.matter")} name="matter" error={errors.matter} required>
        <select
          id="matter"
          name="matter"
          defaultValue={preselected}
          className={inputClass(errors.matter)}
        >
          <option value="">{t("fields.matterPlaceholder")}</option>
          {serviceSlugs.map((slug) => (
            <option key={slug} value={slug}>
              {tServices(`${slug}.title`)}
            </option>
          ))}
          <option value="inna">{t("fields.matterOther")}</option>
        </select>
      </Field>

      <Field label={t("fields.message")} name="message" error={errors.message} required>
        <textarea
          id="message"
          name="message"
          rows={7}
          placeholder={t("fields.messagePlaceholder")}
          className={inputClass(errors.message)}
        />
      </Field>

      {/* Honeypot: hidden from people, visible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="company">{t("fields.company")}</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex gap-3 text-sm leading-relaxed text-muted">
          <input
            name="consent"
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-[#6b1f2e]"
          />
          <span>{t("fields.consent")}</span>
        </label>
        {errors.consent && (
          <p className="mt-2 text-sm text-burgundy">{errors.consent}</p>
        )}
      </div>

      {turnstileKey && <div ref={turnstileRef} />}

      {formError && (
        <p role="alert" className="border-l-4 border-burgundy bg-beige-pale p-4 text-sm">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-burgundy px-7 py-3 text-white hover:bg-burgundy-deep disabled:opacity-60"
      >
        {status === "sending" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function inputClass(error?: string) {
  return [
    "w-full border bg-white px-4 py-3 text-ink",
    error ? "border-burgundy" : "border-rule",
  ].join(" ");
}

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-burgundy"> *</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
    </div>
  );
}
