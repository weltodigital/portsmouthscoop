import type { Metadata } from "next";
import { SubscribeButton } from "@/components/SubscribeButton";

export const metadata: Metadata = {
  title: "Live Music Lineup",
  description:
    "The weekly live music lineup for Portsmouth is coming soon. Subscribe to Portsmouth Scoop to get it in your inbox first.",
};

export default function LiveMusicPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center md:py-32">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-coral" />
        Coming soon
      </span>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Live Music Lineup
      </h1>
      <p className="mt-5 max-w-xl text-lg text-ink-soft">
        Our weekly live music lineup is coming soon, subscribe to get it in your
        inbox first.
      </p>
      <SubscribeButton className="mt-8 px-8 py-3.5 text-lg" />
    </section>
  );
}
