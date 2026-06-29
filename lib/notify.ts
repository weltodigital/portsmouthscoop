import { Resend } from "resend";

// Fire-and-forget email notification. No-op unless RESEND_API_KEY + NOTIFY_EMAIL
// are set, so the app works fine without email configured.
export async function notify(subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      // Resend's shared sandbox sender; swap for a verified domain in prod.
      from: "Portsmouth Scoop <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("[notify] email failed", err);
  }
}
