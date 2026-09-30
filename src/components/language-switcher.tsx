"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Endonyms — a language switcher shows each language's own name for itself,
 * regardless of the current UI locale, so visitors can spot their language
 * without already being able to read the page.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  pl: "Polski",
  en: "English",
  uk: "Українська",
  ru: "Русский",
};

export function LanguageSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  function switchTo(nextLocale: string) {
    setOpen(false);
    // Translated copy runs shorter or longer than the original, so the
    // page's height above the fold changes with the language. Left to
    // Next's default scroll-to-changed-segment heuristic, the same scroll
    // offset can land on a completely different section after the switch —
    // so we take scroll restoration out of its hands and always reset to
    // the top instead.
    router.replace(pathname, { locale: nextLocale, scroll: false });
    window.scrollTo({ top: 0 });
  }

  if (variant === "mobile") {
    return (
      <div className="py-3">
        <span className="sr-only">{t("language")}</span>
        <div className="flex flex-wrap gap-2">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchTo(l)}
              aria-current={l === locale}
              className={[
                "border px-3 py-1.5 text-sm",
                l === locale
                  ? "border-burgundy bg-burgundy text-white"
                  : "border-rule text-ink",
              ].join(" ")}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("language")}
        className="flex items-center gap-1 text-sm text-ink hover:text-burgundy"
      >
        {LANGUAGE_NAMES[locale]}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={["size-3 text-burgundy-soft transition-transform", open ? "rotate-180" : ""].join(" ")}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full w-36 border border-rule bg-white py-2 shadow-lg">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchTo(l)}
              aria-current={l === locale}
              className={[
                "block w-full px-4 py-2 text-left text-sm hover:bg-beige-pale hover:text-burgundy",
                l === locale ? "font-medium text-burgundy" : "text-ink",
              ].join(" ")}
            >
              {LANGUAGE_NAMES[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
