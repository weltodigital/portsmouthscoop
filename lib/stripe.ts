import Stripe from "stripe";

// Server-only Stripe client. Created lazily so the app builds/runs without a
// key (the payment routes return a clear error if it's missing).
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured: set STRIPE_SECRET_KEY.");
  }
  cached = new Stripe(key);
  return cached;
}

/** Absolute site URL for Stripe success/cancel redirects. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
