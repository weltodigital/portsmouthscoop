import Link from "next/link";
import { SubscribeButton } from "./SubscribeButton";

type Props = {
  emoji: string;
  title: string;
  body: string;
  primary?: { label: string; href: string };
  showSubscribe?: boolean;
};

/** Shared layout for the Stripe success / cancelled return pages. */
export function ResultPage({
  emoji,
  title,
  body,
  primary,
  showSubscribe,
}: Props) {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center md:py-32">
      <div className="text-5xl" aria-hidden="true">
        {emoji}
      </div>
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">{body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {primary && (
          <Link
            href={primary.href}
            className="inline-flex items-center justify-center rounded-xl bg-ink px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-black"
          >
            {primary.label}
          </Link>
        )}
        {showSubscribe && <SubscribeButton variant="outline" className="px-6 py-3.5" />}
      </div>
    </section>
  );
}
