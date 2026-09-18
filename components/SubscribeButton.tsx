import Link from "next/link";

type Props = {
  className?: string;
  children?: React.ReactNode;
  variant?: "coral" | "ink" | "outline";
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  coral: "bg-coral text-ink hover:bg-coral-dark",
  ink: "bg-ink text-white hover:bg-black",
  outline:
    "border border-line bg-white text-ink hover:border-brand hover:text-brand",
};

/** Primary call to action everywhere; sends people to the subscribe page. */
export function SubscribeButton({
  className = "",
  children = "Subscribe For Free",
  variant = "coral",
}: Props) {
  return (
    <Link
      href="/subscribe"
      className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-bold transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
