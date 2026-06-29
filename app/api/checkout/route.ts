import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getStripe, siteUrl } from "@/lib/stripe";
import {
  SPONSOR_PRICING,
  sponsorPack,
  sponsorAmountPence,
  type PlacementKey,
} from "@/lib/pricing";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Hold abandoned checkouts for 30 minutes, then Stripe expires the session and
// the webhook releases the held Fridays. (Stripe minimum is 30 min.)
const CHECKOUT_TTL_SECONDS = 30 * 60;

function normaliseLink(url: string) {
  const u = (url || "").trim();
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function isFutureFriday(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  if (d.getUTCDay() !== 5) return false; // Friday
  const today = new Date();
  const todayIso = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  return iso >= todayIso;
}

/**
 * Sponsor checkout:
 *  1. validate placement / pack / dates / creative
 *  2. draft a `bookings` row (status 'pending') + `booking_dates`
 *     (the unique (send_date, placement) constraint blocks double-booking)
 *  3. create a Stripe Checkout session for the pack amount
 *  4. return the redirect URL
 */
export async function POST(request: Request) {
  if (!rateLimit(`checkout:${clientIp(request)}`, 8, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    placement,
    pack,
    dates,
    business_name,
    contact_email,
    contact_phone,
    cta_link,
    headline,
    body: copy,
    photo_url,
  } = (body ?? {}) as Record<string, unknown>;

  const placementKey = placement as PlacementKey;
  const packMeta = sponsorPack(String(pack));
  const amount = sponsorAmountPence(String(placement), String(pack));

  if (!SPONSOR_PRICING[placementKey] || !packMeta || amount == null) {
    return NextResponse.json(
      { error: "Invalid placement or pack." },
      { status: 422 },
    );
  }

  const dateList = Array.isArray(dates) ? (dates as string[]) : [];
  if (dateList.length !== packMeta.n) {
    return NextResponse.json(
      { error: `Pick exactly ${packMeta.n} Friday${packMeta.n > 1 ? "s" : ""}.` },
      { status: 422 },
    );
  }
  if (!dateList.every(isFutureFriday) || new Set(dateList).size !== dateList.length) {
    return NextResponse.json(
      { error: "Those dates aren't valid upcoming Fridays." },
      { status: 422 },
    );
  }

  if (!String(business_name || "").trim()) {
    return NextResponse.json(
      { error: "Business name is required." },
      { status: 422 },
    );
  }
  if (
    !String(contact_email || "").trim() ||
    !/.+@.+\..+/.test(String(contact_email))
  ) {
    return NextResponse.json(
      { error: "A valid contact email is required." },
      { status: 422 },
    );
  }

  let supabase, stripe;
  try {
    supabase = getAdminSupabase();
    stripe = getStripe();
  } catch (err) {
    console.error("[checkout] not configured", err);
    return NextResponse.json(
      { error: "Payments aren't configured yet." },
      { status: 503 },
    );
  }

  // 1. Draft booking.
  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .insert({
      placement: placementKey,
      pack: packMeta.key,
      business_name: String(business_name).trim(),
      contact_email: String(contact_email).trim(),
      contact_phone: String(contact_phone || "").trim() || null,
      cta_link: normaliseLink(String(cta_link || "")),
      headline: String(headline || "").trim() || null,
      body: String(copy || "").trim() || null,
      photo_url: (photo_url as string) || null,
      amount_pence: amount,
      status: "pending",
    })
    .select("id")
    .single();

  if (bErr || !booking) {
    console.error("[checkout] booking insert failed", bErr);
    return NextResponse.json(
      { error: "Could not start your booking. Please try again." },
      { status: 500 },
    );
  }

  // 2. Hold the dates. Unique (send_date, placement) blocks double-booking.
  const { error: dErr } = await supabase.from("booking_dates").insert(
    dateList.map((send_date) => ({
      booking_id: booking.id,
      send_date,
      placement: placementKey,
    })),
  );

  if (dErr) {
    // Roll back the draft booking; cascade removes any dates that did insert.
    await supabase.from("bookings").delete().eq("id", booking.id);
    if (dErr.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Sorry, one of those Fridays was just booked for this placement. Pick another date.",
        },
        { status: 409 },
      );
    }
    console.error("[checkout] booking_dates insert failed", dErr);
    return NextResponse.json(
      { error: "Could not hold those dates. Please try again." },
      { status: 500 },
    );
  }

  // 3. Stripe Checkout session.
  try {
    const niceDates = dateList
      .slice()
      .sort()
      .map((iso) =>
        new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }),
      )
      .join(", ");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: String(contact_email).trim(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: amount,
            product_data: {
              name: `Portsmouth Scoop · ${SPONSOR_PRICING[placementKey].name} (${packMeta.label})`,
              description: `Fridays: ${niceDates}`,
            },
          },
        },
      ],
      metadata: { kind: "sponsor", booking_id: booking.id },
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SECONDS,
      success_url: `${siteUrl()}/sponsor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/sponsor/cancelled?booking_id=${booking.id}`,
    });

    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] stripe session failed", err);
    // Release the held dates so they don't stay locked by a failed attempt.
    await supabase.from("bookings").delete().eq("id", booking.id);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 },
    );
  }
}
