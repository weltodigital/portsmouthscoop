import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { notify } from "@/lib/notify";

/**
 * Contact form handler → inserts into Supabase `messages` (kind 'contact').
 * Optionally emails a notification via Resend if it's configured.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { firstName, email, phone, message } = (body ?? {}) as Record<
    string,
    string
  >;

  if (!firstName?.trim()) {
    return NextResponse.json(
      { error: "First name is required." },
      { status: 422 },
    );
  }
  if (!email?.trim() || !/.+@.+\..+/.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 422 },
    );
  }
  if (message && message.length > 180) {
    return NextResponse.json(
      { error: "Message must be 180 characters or fewer." },
      { status: 422 },
    );
  }

  try {
    const supabase = getAdminSupabase();
    const { error } = await supabase.from("messages").insert({
      kind: "contact",
      name: firstName.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      body: message?.trim() || null,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[contact] insert failed", err);
    return NextResponse.json(
      { error: "Could not save your message. Please try again." },
      { status: 500 },
    );
  }

  await notify(
    `New contact message from ${firstName.trim()}`,
    `From: ${firstName.trim()} <${email.trim()}>\nPhone: ${phone?.trim() || "—"}\n\n${message?.trim() || "(no message)"}`,
  );

  return NextResponse.json({ ok: true });
}
