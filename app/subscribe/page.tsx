import type { Metadata } from "next";
import { BeehiivForm } from "@/components/BeehiivForm";
import { SITE, SUBSCRIBERS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Subscribe to Portsmouth Scoop for free: one friendly email every Friday with events, gigs, local gems and small-biz spotlights across Portsmouth.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribePage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 md:py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          Free weekly newsletter
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Get the Scoop
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink-soft">
          Join {SUBSCRIBERS} Portsmouth locals. One friendly email every{" "}
          {SITE.publishDay} with what&rsquo;s on, local gems and the independent
          businesses worth knowing about.
        </p>
      </div>

      <BeehiivForm
        formId={SITE.beehiivFormId}
        className="mx-auto mt-10"
        footnote="No spam, unsubscribe anytime."
      />
    </section>
  );
}
