import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Stripe needs the raw request body to verify the signature.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = request.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 },
    );
  }

  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const md = session.metadata ?? {};
      if (md.kind === "sponsor" && md.booking_id) {
        await supabase
          .from("bookings")
          .update({ status: "paid" })
          .eq("id", md.booking_id);
      } else if (md.kind === "event" && md.listing_id) {
        await supabase
          .from("event_listings")
          .update({ status: "paid" })
          .eq("id", md.listing_id);
      }
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const md = session.metadata ?? {};
      if (md.kind === "sponsor" && md.booking_id) {
        // Release the held Fridays (cascade deletes booking_dates).
        await supabase.from("bookings").delete().eq("id", md.booking_id);
      } else if (md.kind === "event" && md.listing_id) {
        await supabase
          .from("event_listings")
          .update({ status: "expired" })
          .eq("id", md.listing_id);
      }
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
