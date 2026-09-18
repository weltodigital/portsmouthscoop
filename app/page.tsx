import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { BeehiivForm } from "@/components/BeehiivForm";

const PERKS = [
  {
    title: "What's on",
    body: "Events, gigs and things to do across Portsmouth, sorted before your weekend starts.",
    emoji: "📅",
  },
  {
    title: "Local gems",
    body: "The cafés, walks, shops and corners of the city worth knowing about.",
    emoji: "📍",
  },
  {
    title: "Small-biz spotlights",
    body: "Meet the independent businesses making Portsmouth what it is.",
    emoji: "⭐",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[minmax(0,1fr)_auto] md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              Free weekly newsletter · Portsmouth
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand sm:text-5xl lg:text-6xl">
              Portsmouth News,
              <br />
              With Personality.
            </h1>
            <BeehiivForm
              formId={SITE.beehiivFormId}
              className="mt-8 max-w-2xl"
              footnote={`Lands every ${SITE.publishDay}. No spam, unsubscribe anytime.`}
            />
            <Link
              href="/sponsor"
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-line bg-white px-6 py-3.5 text-base font-bold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Sponsor the Scoop
            </Link>
          </div>
          {/* Portsmouth harbour / Spinnaker Tower, cropped to a circle */}
          <div className="relative mx-auto aspect-square w-64 overflow-hidden rounded-full shadow-card sm:w-80 lg:w-96">
            <Image
              src="/homepage-hero.png"
              alt="Portsmouth harbour and the Spinnaker Tower"
              fill
              priority
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 20rem, 16rem"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* ---------- What you get each Friday ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            What you get each {SITE.publishDay}
          </h2>
          <p className="mt-3 text-muted">
            One friendly email. Everything worth knowing in Portsmouth this
            week, nothing you don't.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="rounded-2xl border border-line bg-card p-7 shadow-[var(--shadow-soft)]"
            >
              <div className="text-3xl" aria-hidden="true">
                {perk.emoji}
              </div>
              <h3 className="mt-4 text-xl font-extrabold">{perk.title}</h3>
              <p className="mt-2 text-ink-soft">{perk.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Subscribe band ---------- */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl border border-line bg-white px-6 py-12 text-center shadow-card md:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand">
            Join 3,000+ Portsmouth locals
          </h2>
          <BeehiivForm
            formId={SITE.beehiivFormId}
            className="mx-auto mt-7 max-w-3xl"
          />
        </div>
      </section>
    </>
  );
}
