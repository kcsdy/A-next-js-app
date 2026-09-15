"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg leading-tight text-burgundy-deep"
          onClick={() => setOpen(false)}
        >
          MCH
          <span className="ml-2 font-body text-xs font-medium tracking-wide text-muted">
            Kancelaria Imigracyjna
          </span>
        </Link>

        <nav className="hidden items-center gap-7 sm:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink underline-offset-4 hover:text-burgundy hover:underline"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`tel:${site.contact.phoneHref}`}
            className="bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep"
          >
            Zadzwoń
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobilne"
          className="border border-rule px-3 py-2 text-sm sm:hidden"
        >
          {open ? "Zamknij" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="menu-mobilne"
          className="border-t border-rule bg-beige-pale sm:hidden"
        >
          <ul className="mx-auto max-w-5xl px-5 py-2">
            {site.nav.map((item) => (
              <li key={item.href} className="border-b border-rule last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
