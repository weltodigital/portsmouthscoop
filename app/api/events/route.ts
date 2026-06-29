import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getStripe, siteUrl } from "@/lib/stripe";
import { eventPackForCount, MAX_EVENTS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function normaliseLink(url: string) {
  const u = (url || "").trim();
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

type IncomingEvent = {
  name?: string;
  venue?: string;
  date?: string;
  time?: string;
  link?: string;
};

/**
 * Event listing checkout:
 *  1. validate details + events (1–10)
 *  2. insert `event_listings` (status 'pending') + child `events`
 *  3. create a Stripe Checkout session for the pack price (£5 / £20 / £35)
 *  4. return the redirect URL
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, business, discount, events } = (body ?? {}) as {
    name?: string;
    email?: string;
    business?: string;
    discount?: string;
    events?: IncomingEvent[];
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Your name is required." }, { status: 422 });
  }
  if (!email?.trim() || !/.+@.+\..+/.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 422 },
    );
  }
  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "Add at least one event." }, { status: 422 });
  }
  if (events.length > MAX_EVENTS) {
    return NextResponse.json(
      { error: `Up to ${MAX_EVENTS} events per submission.` },
      { status: 422 },
    );
  }
  for (const ev of events) {
    if (!ev?.name?.trim() || !ev?.date) {
      return NextResponse.json(
        { error: "Each event needs a name and a date." },
        { status: 422 },
      );
    }
  }

  const pack = eventPackForCount(events.length);
  const amount = pack.price * 100;

  let supabase, stripe;
  try {
    supabase = getAdminSupabase();
    stripe = getStripe();
  } catch (err) {
    console.error("[events] not configured", err);
    return NextResponse.json(
      { error: "Payments aren't configured yet." },
      { status: 503 },
    );
  }

  const { data: listing, error: lErr } = await supabase
    .from("event_listings")
    .insert({
      name: name.trim(),
      email: email.trim(),
      business: business?.trim() || null,
      discount_code: discount?.trim() || null,
      pack: pack.key,
      amount_pence: amount,
      status: "pending",
    })
    .select("id")
    .single();

  if (lErr || !listing) {
    console.error("[events] listing insert failed", lErr);
    return NextResponse.json(
      { error: "Could not start your submission. Please try again." },
      { status: 500 },
    );
  }

  const { error: eErr } = await supabase.from("events").insert(
    events.map((ev) => ({
      listing_id: listing.id,
      name: ev.name!.trim(),
      venue: ev.venue?.trim() || null,
      event_date: ev.date,
      event_time: ev.time?.trim() || null,
      link: normaliseLink(ev.link || ""),
    })),
  );

  if (eErr) {
    await supabase.from("event_listings").delete().eq("id", listing.id);
    console.error("[events] events insert failed", eErr);
    return NextResponse.json(
      { error: "Could not save your events. Please try again." },
      { status: 500 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email.trim(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: amount,
            product_data: {
              name: `Portsmouth Scoop — Event listing (${pack.label})`,
              description: `${events.length} event${events.length > 1 ? "s" : ""}`,
            },
          },
        },
      ],
      metadata: { kind: "event", listing_id: listing.id },
      success_url: `${siteUrl()}/list-your-event/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/list-your-event/cancelled`,
    });

    await supabase
      .from("event_listings")
      .update({ stripe_session_id: session.id })
      .eq("id", listing.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[events] stripe session failed", err);
    await supabase.from("event_listings").delete().eq("id", listing.id);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }
}
