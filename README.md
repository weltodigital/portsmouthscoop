# Portsmouth Scoop

Marketing + self-serve booking website for **Portsmouth Scoop** — a free weekly
local newsletter for Portsmouth. _"Portsmouth News, With Personality."_

Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4**, with
**Supabase** (Postgres + Storage) and **Stripe Checkout** for bookings/payments.

---

## What's built

Full stack — pages, forms, database, and payments are all wired up.

| Feature | Status |
| --- | --- |
| Home (harbour hero), Live Music (coming soon), Contact | ✅ |
| Header/footer nav, sitemap.xml, robots.txt | ✅ |
| `/advertise-with-us` → `/sponsor` **301** redirect | ✅ |
| Sponsor page: placements, packs, Friday picker, creative + live preview | ✅ |
| Sponsor checkout → Supabase booking + Stripe + double-booking guard | ✅ |
| List an Event: £5/event, packs of 5/10 → Stripe | ✅ |
| Contact form → Supabase `messages` (+ optional Resend email) | ✅ |
| Stripe webhook (mark paid / release held dates) | ✅ |

Everything runs locally and deploys to Vercel; payments/data activate once you
add the env vars below.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in (see below)
npm run dev                  # http://localhost:3000
```

Scripts: `npm run build` · `npm run start` · `npm run typecheck`

---

## Routes

| Route | Notes |
| --- | --- |
| `/` | Home — harbour hero, "what you get each Friday", subscribe band |
| `/live-music-portsmouth` | "Coming soon" (keep this exact slug) |
| `/sponsor` | Sponsor booking (ported from `portsmouth-scoop-sponsor.html`) |
| `/list-your-event` | Self-serve event listing (£5/£20/£35) |
| `/contact` | Contact form |
| `/advertise-with-us` | **301** → `/sponsor` |
| `/sponsor/success`, `/sponsor/cancelled` | Stripe return pages |
| `/list-your-event/success`, `/list-your-event/cancelled` | Stripe return pages |
| `/api/*` | contact · availability · checkout · events · stripe/webhook |
| `/sitemap.xml`, `/robots.txt` | Auto-generated |

Subscribe buttons link to beehiiv: `https://portsmouthscoop.beehiiv.com/subscribe`.

---

## Environment variables

See `.env.example`. The site builds and the static pages work with none of these
set; the forms/payments need them. Secrets without `NEXT_PUBLIC_` stay server-side.

| Variable | Used by |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | DB + Storage (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Direct creative-photo upload from the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB writes (bypasses RLS) |
| `STRIPE_SECRET_KEY` | Create Checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL + Stripe success/cancel redirects |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | *(optional)* email when a form comes in |

---

## Going live — runbook

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL editor** → paste and run `supabase/migrations/0001_init.sql`. This creates
   the tables, the `(send_date, placement)` unique constraint that prevents
   double-booking, the `creatives` storage bucket, and its upload policies.
3. **Settings → API**: copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`, the
   `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the `service_role` key →
   `SUPABASE_SERVICE_ROLE_KEY`.

Schema:
- **`bookings`** + **`booking_dates`** (unique `(send_date, placement)`)
- **`messages`** (kind `contact` | `sponsor_enquiry`)
- **`event_listings`** + **`events`**
- Storage bucket **`creatives`** (5 MB, PNG/JPEG)

### 2. Stripe

1. Create a [Stripe](https://stripe.com) account; copy the **secret key** →
   `STRIPE_SECRET_KEY`.
2. The webhook secret is set after the first deploy (step 4).

### 3. Deploy to Vercel

1. Push to GitHub (this repo: `github.com/weltodigital/portsmouthscoop`).
2. Import it in Vercel (Next.js auto-detected).
3. Add all env vars in **Settings → Environment Variables**. Set
   `NEXT_PUBLIC_SITE_URL` to your real domain.
4. Deploy.

### 4. Stripe webhook

1. In Stripe → **Developers → Webhooks → Add endpoint**:
   `https://<your-domain>/api/stripe/webhook`.
2. Subscribe to `checkout.session.completed`, `checkout.session.expired`,
   `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.
3. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel, then redeploy.

Test locally with the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Domain

Point `portsmouthscoop.co.uk` DNS at Vercel and retire the WordPress host.

---

## How payments flow

**Sponsor:** validate placement/pack/dates → upload photo to Storage → draft a
`bookings` row (`pending`) + `booking_dates` (the unique constraint rejects a
clash with a 409) → create a Stripe Checkout session → redirect. The webhook marks
the booking `paid` on success, or deletes it (releasing the Fridays) on expiry.

**Events:** validate → insert `event_listings` (`pending`) + `events` → Stripe
session → redirect. Webhook marks `paid` on success.

The server always recomputes the price from `lib/pricing.ts` — amounts from the
browser are never trusted.

---

## Project structure

```
app/
  page.tsx, layout.tsx, globals.css
  live-music-portsmouth/  contact/
  sponsor/        page.tsx · SponsorBooking.tsx · sponsor.css · success/ · cancelled/
  list-your-event/ page.tsx · EventForm.tsx · success/ · cancelled/
  api/            contact · availability · checkout · events · stripe/webhook
  sitemap.ts, robots.ts
components/   Header · Footer · SubscribeButton · ContactForm · ResultPage
lib/          site.ts · pricing.ts · stripe.ts · notify.ts · supabase/{admin,browser}.ts
supabase/migrations/0001_init.sql
public/       logo.png · homepage-hero.png
```

---

## Notes

- **Sponsor email:** `portsmouthscoop@weltodigital.com` (in `lib/site.ts`).
- **Testimonials / "Trusted by"** on the sponsor page are hidden via
  `SHOW_TESTIMONIALS = false` in `SponsorBooking.tsx` — flip on when you have real ones.
- Replace the Resend `from` address (`onboarding@resend.dev`) with a verified
  domain sender before relying on form emails.
