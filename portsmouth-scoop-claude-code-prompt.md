# Claude Code build prompt — Portsmouth Scoop website

Paste this into Claude Code from an empty project folder. First, drop the file
`portsmouth-scoop-sponsor.html` (the working sponsor page) into the project root —
the prompt refers to it.

---

## Goal

Build a new marketing website for **Portsmouth Scoop** (portsmouthscoop.co.uk), a free
weekly local newsletter for Portsmouth. It replaces an existing WordPress/Elementor site.
Keep the current content and page structure, but build it as a fast, modern Next.js app
with a cohesive new design. Reuse the existing slugs so SEO is preserved, and add redirects
where a slug changes.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase** (Postgres + Storage) for form submissions, sponsor bookings, and creative uploads
- **Stripe Checkout** for sponsor payments
- **Anthropic API** for the "Suggest with AI" copy helper (server-side only)
- Deploy target: **Vercel**

Use environment variables for all secrets; never expose secret keys to the client. Create a
`.env.example` listing every variable used.

## Brand & design

- Voice: friendly, local, plain-spoken. Tagline: **"Portsmouth News, With Personality."**
- Apply the design system from `portsmouth-scoop-sponsor.html` across the **whole** site so
  every page feels like one product. Pull the palette and type treatment from that file's
  `:root` (deep navy ink, coral accent, cool-white background, supporting blue/green).
- Reuse existing brand assets: download the current logo and homepage hero image into
  `/public` (logo: the "cropped-Portsmouth-Scoop" PNG; hero: "Portsmouth-Scoop-Homepage.png").
  If they can't be fetched, leave clearly-named placeholders.
- Quality floor: fully responsive to mobile, visible keyboard focus, respects reduced motion,
  semantic HTML, good Lighthouse scores.

## Site structure

Header nav (and matching footer nav), in this order:

1. **Home** → `/`
2. **Live Music Lineup** → `/live-music-portsmouth` *(keep this exact slug)*
3. **Sponsor** → `/sponsor` *(was "Advertise With Us")*
4. **Contact** → `/contact`

Add a permanent **301 redirect** from `/advertise-with-us` → `/sponsor`.

Footer on every page: nav links + `© [current year] Portsmouth Scoop`. Include a generated
`sitemap.xml` and `robots.txt`.

### Page: Home (`/`)

Match the current homepage content:
- H1: **Portsmouth News, With Personality.**
- Subhead: *Your free weekly scoop on what's happening in and around Portsmouth — events,
  local gems, small biz spotlights & more.*
- Primary CTA button: **Subscribe For Free** → `https://portsmouthscoop.beehiiv.com/subscribe`
- Hero image (the homepage PNG).
- Keep it clean and minimal like the current site, just better-looking. A light secondary
  section ("What you get each Friday" — events, local gems, small-biz spotlights) is welcome
  but optional; don't over-build.

### Page: Live Music Lineup (`/live-music-portsmouth`)

Leave this **intentionally blank for now** — a simple "Coming soon" state in the site's style:
heading + one line ("Our weekly live music lineup is coming soon — subscribe to get it in your
inbox first") + the Subscribe CTA. Keep the route and nav link live so it's ready to fill later.

### Page: Sponsor (`/sponsor`)

This is the main build. Convert `portsmouth-scoop-sponsor.html` into this route as a React
client component, **faithfully preserving** its layout, copy, pricing, placement cards,
Friday date picker, creative form, live preview, and review/pay section. Key facts (already in
the file, listed here so they're explicit):

- Stats: **3,119 subscribers · 50% open rate (~2× industry average) · 9.9% click-to-open**
- Publish day: **Friday**
- Pricing (single / 4-pack −10% / 12-pack −20%):
  - **Primary** £75 / £270 / £720
  - **Feature** £45 / £162 / £432
  - **Classified** £20 / £72 / £192
- Custom enquiry / contact email: **portsmouthscoop@weltodigital.com**
- The "Trusted by" + testimonials block in the HTML is placeholder content — **hide/comment it
  out** for launch; leave it easy to switch back on later.

Three changes from the static file when porting:
1. **AI helper → server route.** Replace the browser `fetch` to `api.anthropic.com` with a call
   to a new internal route `POST /api/suggest` (see Phase 3). The API key must stay server-side.
2. **Date picker → live availability** (Phase 3): fetch booked dates from `GET /api/availability`
   and grey them out, instead of the hard-coded `BOOKED` array.
3. **Pay button → Stripe Checkout** (Phase 3): on click, create a Checkout session and redirect.

## Build in phases

Work in this order and confirm each phase builds and runs before moving on.

**Phase 1 — Static site.** Scaffold the Next.js app, design system, shared layout (header/footer),
and the Home, Live Music (coming soon), and Contact pages. Wire the Subscribe buttons to beehiiv.
Site should look finished and deploy to Vercel as-is.

**Phase 2 — Sponsor page UI.** Port `portsmouth-scoop-sponsor.html` into `/sponsor` as described
(UI and interactions only — AI helper, availability, and payment can be stubbed/mocked at this
stage so the page is fully clickable). Add the `/advertise-with-us` → `/sponsor` redirect.

**Phase 3 — Backend & wiring.**
- **Supabase schema:**
  - `bookings` (id, placement, pack, business_name, contact_email, contact_phone, cta_link,
    headline, body, photo_url, amount_pence, stripe_session_id, status, created_at)
  - `booking_dates` (id, booking_id → bookings, send_date, placement) with a **unique constraint
    on (send_date, placement)** so a placement can't be double-booked for the same Friday
  - `messages` (id, kind ['contact' | 'sponsor_enquiry'], name, company, email, phone,
    based_in_portsmouth, body, created_at)
  - Storage bucket `creatives` for uploaded sponsor photos
- **Contact form** (`/contact`): fields First Name\*, Email\*, Phone, Message (max 180 chars).
  POST to `/api/contact` → insert into `messages` (kind 'contact'). Optionally email a
  notification (Resend) if `RESEND_API_KEY` + `NOTIFY_EMAIL` are set. Show success/empty/error
  states in the site's voice.
- **`GET /api/availability`** → returns booked (send_date, placement) pairs for the sponsor
  date picker.
- **`POST /api/suggest`** → calls Anthropic (`claude-sonnet-4-6`, max_tokens 1000) with the
  business name + what they're promoting; returns `{ headline, body }`. Validate/clamp lengths.
- **`POST /api/checkout`** → validates the selected placement, pack, and dates are still
  available, uploads the creative photo to Supabase Storage, creates a draft `bookings` row
  (status 'pending') + `booking_dates`, then creates a **Stripe Checkout session** for the pack
  amount and returns the redirect URL.
- **`POST /api/stripe/webhook`** → on `checkout.session.completed`, mark the booking 'paid' and
  confirm its dates. On failure/expiry, release the held dates.
- Success and cancel return pages for the Stripe redirect (`/sponsor/success`, `/sponsor/cancelled`).

## Environment variables (`.env.example`)

```
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=        # optional, for form notifications
NOTIFY_EMAIL=          # optional, where form notifications go
NEXT_PUBLIC_SITE_URL=https://portsmouthscoop.co.uk
```

## Acceptance criteria

- All four nav routes work; `/advertise-with-us` 301s to `/sponsor`.
- Home matches the current copy and links to beehiiv; Live Music is a clean "coming soon".
- The sponsor page matches `portsmouth-scoop-sponsor.html` in layout, copy, and pricing, and is
  fully interactive (pick placement → pack → Fridays → fill creative → see live preview → review).
- No secret keys reach the browser; the AI helper runs through `/api/suggest`.
- A placement can't be double-booked for the same Friday (DB constraint enforced).
- Contact form persists submissions.
- Builds with no type errors and deploys cleanly to Vercel.
- README documents setup, env vars, Supabase schema/migrations, and the Stripe webhook step.

## Notes for me (not for the build)

- After deploy, point the `portsmouthscoop.co.uk` DNS at Vercel and retire the WordPress host.
- Add the Stripe webhook endpoint in the Stripe dashboard and paste its signing secret into env.
- Replace the placeholder testimonials/"Trusted by" with real ones once the first sponsors land.
