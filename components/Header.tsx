"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV, SITE } from "@/lib/site";
import { SubscribeButton } from "./SubscribeButton";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={`${SITE.name} home`}
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt={SITE.name}
            width={132}
            height={132}
            priority
            className="h-12 w-12 object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? "text-brand"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <SubscribeButton className="ml-2 px-4 py-2 text-sm" />
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-line p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav
          aria-label="Primary mobile"
          className="border-t border-line bg-white px-5 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                    isActive(item.href)
                      ? "bg-brand-soft text-brand"
                      : "text-ink-soft hover:bg-cream"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <SubscribeButton className="w-full" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
