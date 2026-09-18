import type { Metadata } from "next";
import { BeehiivForm } from "@/components/BeehiivForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Subscribe to Portsmouth Scoop for free: one friendly email every Friday with events, gigs, local gems and small-biz spotlights across Portsmouth.",
  alternates: { canonical: "/subscribe" },
};

export default function SubscribePage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          Free weekly newsletter
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
          Get the Scoop
        </h1>
        <BeehiivForm
          formId={SITE.beehiivFormId}
          className="mx-auto mt-10 max-w-3xl"
          footnote="No spam, unsubscribe anytime."
        />
      </div>
    </section>
  );
}
