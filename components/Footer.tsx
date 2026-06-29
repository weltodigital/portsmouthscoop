import Link from "next/link";
import Image from "next/image";
import { NAV, LEGAL_NAV, SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Link href="/" aria-label={`${SITE.name} home`}>
              <Image
                src="/logo.png"
                alt={SITE.name}
                width={160}
                height={160}
                className="h-16 w-16 object-contain"
              />
            </Link>
            <p className="mt-2 text-sm text-muted">{SITE.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-ink-soft hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>© {year} Portsmouth Scoop</p>
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-semibold text-ink-soft hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="/sitemap.xml"
              className="font-semibold text-ink-soft hover:text-brand"
            >
              Sitemap
            </a>
          </div>
          <p>
            Sponsor enquiries:{" "}
            <a
              href={`mailto:${SITE.enquiryEmail}`}
              className="font-semibold text-brand hover:underline"
            >
              {SITE.enquiryEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
