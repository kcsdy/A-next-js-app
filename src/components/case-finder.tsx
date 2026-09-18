"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { serviceSlugs } from "@/content/services";

/**
 * Hero quick-selector: pick a procedure, jump straight to its page instead
 * of scrolling the full list below. Same job as a "find a provider" search
 * box, sized for seven known procedures instead of open text.
 */
export function CaseFinder() {
  const router = useRouter();
  const t = useTranslations("home.caseFinder");
  const tServices = useTranslations("services");
  const [slug, setSlug] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!slug) return;
    router.push(`/uslugi/${slug}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex max-w-lg flex-col gap-3 border border-rule bg-white p-2 sm:flex-row"
    >
      <label htmlFor="case-finder-select" className="sr-only">
        {t("label")}
      </label>
      <div className="relative flex-1">
        <select
          id="case-finder-select"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="w-full appearance-none bg-transparent px-3 py-3 pr-9 text-ink"
        >
          <option value="">{t("placeholder")}</option>
          {serviceSlugs.map((serviceSlug) => (
            <option key={serviceSlug} value={serviceSlug}>
              {tServices(`${serviceSlug}.title`)}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-burgundy-soft"
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
      </div>
      <button
        type="submit"
        disabled={!slug}
        className="bg-burgundy px-6 py-3 text-sm font-medium text-white hover:bg-burgundy-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("cta")}
      </button>
    </form>
  );
}
