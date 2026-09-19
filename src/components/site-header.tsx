"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { site } from "@/content/site";
import { serviceSlugs } from "@/content/services";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tServices = useTranslations("services");
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeAll() {
    setOpen(false);
    setServicesOpen(false);
  }

  const navLinks = [
    { href: "/o-kancelarii", label: t("about") },
    { href: "/uslugi", label: t("knowledgeBase") },
    { href: "/kontakt", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-white/95 backdrop-blur">
      <div
        className={[
          "mx-auto flex max-w-5xl items-center justify-between px-5 transition-[padding] duration-200",
          scrolled ? "py-2.5" : "py-4",
        ].join(" ")}
      >
        <Link
          href="/"
          className="font-display text-lg leading-tight text-burgundy-deep"
          onClick={closeAll}
        >
          {site.shortName}
          <span className="ml-2 inline-block font-body text-xs font-medium tracking-wide text-muted">
            {t("logoSubtitle")}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              aria-controls="uslugi-menu"
              className="flex items-center gap-1 text-sm text-ink hover:text-burgundy"
            >
              {t("services")}
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={[
                  "size-3 text-burgundy-soft transition-transform",
                  servicesOpen ? "rotate-180" : "",
                ].join(" ")}
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

            {servicesOpen && (
              <div
                id="uslugi-menu"
                className="absolute left-0 top-full w-72 border border-rule bg-white py-2 shadow-lg"
              >
                {serviceSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/uslugi/${slug}`}
                    onClick={closeAll}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-beige-pale hover:text-burgundy"
                  >
                    {tServices(`${slug}.title`)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink underline-offset-4 hover:text-burgundy hover:underline"
            >
              {item.label}
            </Link>
          ))}

          <LanguageSwitcher />

          <a
            href={`tel:${site.contact.phoneHref}`}
            className="bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep"
          >
            {t("call")}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobilne"
          className="border border-rule px-3 py-2 text-sm sm:hidden"
        >
          {open ? t("close") : t("menu")}
        </button>
      </div>

      {open && (
        <nav
          id="menu-mobilne"
          className="border-t border-rule bg-beige-pale sm:hidden"
        >
          <ul className="mx-auto max-w-5xl px-5 py-2">
            <li className="border-b border-rule">
              <details>
                <summary className="cursor-pointer list-none py-3 text-ink">
                  {t("services")}
                </summary>
                <ul className="pb-2 pl-3">
                  {serviceSlugs.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/uslugi/${slug}`}
                        onClick={closeAll}
                        className="block py-2 text-sm text-muted hover:text-burgundy"
                      >
                        {tServices(`${slug}.title`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            {navLinks.map((item) => (
              <li key={item.href} className="border-b border-rule">
                <Link
                  href={item.href}
                  onClick={closeAll}
                  className="block py-3 text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <LanguageSwitcher variant="mobile" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
