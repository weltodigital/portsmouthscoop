import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { SubscribeButton } from "@/components/SubscribeButton";

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
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {/* Portsmouth harbour / Spinnaker Tower backdrop */}
        <Image
          src="/homepage-hero.png"
          alt="Portsmouth harbour and the Spinnaker Tower"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        {/* Navy overlay keeps the text readable over the photo */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/85 to-ink/55"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#cfe0f0]">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              Free weekly newsletter · Portsmouth
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
              Portsmouth News,
              <br />
              With Personality.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[#dbe7f3]">
              {SITE.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SubscribeButton className="px-7 py-3.5 text-lg" />
              <Link
                href="/sponsor"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Sponsor the Scoop
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#cfe0f0]">
              Lands every {SITE.publishDay}. No spam, unsubscribe anytime.
            </p>
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
            One friendly email. Everything worth knowing in Portsmouth this week,
            nothing you don't.
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
        <div className="mx-auto max-w-5xl rounded-3xl bg-brand px-6 py-12 text-center text-white md:py-16">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Join 3,000+ Portsmouth locals
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            It's free, it's friendly, and it's the easiest way to keep up with the
            city. Get the next issue in your inbox this {SITE.publishDay}.
          </p>
          <SubscribeButton variant="coral" className="mt-7 px-8 py-3.5 text-lg" />
        </div>
      </section>
    </>
  );
}
