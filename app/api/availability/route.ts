import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Always fetch fresh; availability changes as people book.
export const dynamic = "force-dynamic";

/**
 * Booked (send_date, placement) pairs for the sponsor date picker.
 * Any row in `booking_dates` is a held slot (pending or paid); the picker greys
 * these out. Released slots are deleted by the Stripe webhook on expiry.
 */
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("booking_dates")
      .select("send_date, placement");
    if (error) throw error;

    const booked = (data ?? []).map((r) => ({
      send_date: r.send_date as string,
      placement: r.placement as string,
    }));
    return NextResponse.json({ booked });
  } catch (err) {
    console.error("[availability] query failed", err);
    // Fail open with an empty list so the picker still works if the DB is down.
    return NextResponse.json({ booked: [] });
  }
}
