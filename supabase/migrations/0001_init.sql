-- ============================================================
-- Portsmouth Scoop — initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI).
-- ============================================================

-- ---------- Sponsor bookings ----------
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  placement        text not null check (placement in ('primary','feature','classified')),
  pack             text not null check (pack in ('single','four','twelve')),
  business_name    text not null,
  contact_email    text not null,
  contact_phone    text,
  cta_link         text,
  headline         text,
  body             text,
  photo_url        text,
  amount_pence     integer not null,
  stripe_session_id text,
  status           text not null default 'pending'
                     check (status in ('pending','paid','expired','cancelled')),
  created_at       timestamptz not null default now()
);

-- Each Friday slot can hold one booking per placement. The unique constraint
-- below is what prevents a placement being double-booked for the same Friday.
create table if not exists public.booking_dates (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  send_date   date not null,
  placement   text not null check (placement in ('primary','feature','classified')),
  unique (send_date, placement)
);

create index if not exists booking_dates_booking_id_idx
  on public.booking_dates (booking_id);

-- ---------- Contact / enquiry messages ----------
create table if not exists public.messages (
  id                  uuid primary key default gen_random_uuid(),
  kind                text not null check (kind in ('contact','sponsor_enquiry')),
  name                text,
  company             text,
  email               text,
  phone               text,
  based_in_portsmouth boolean,
  body                text,
  created_at          timestamptz not null default now()
);

-- ---------- Event listings ----------
create table if not exists public.event_listings (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  business          text,
  pack              text not null check (pack in ('single','five','ten')),
  amount_pence      integer not null,
  discount_code     text,
  stripe_session_id text,
  status            text not null default 'pending'
                      check (status in ('pending','paid','expired','cancelled')),
  created_at        timestamptz not null default now()
);

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.event_listings(id) on delete cascade,
  name        text not null,
  venue       text,
  event_date  date not null,
  event_time  text,
  link        text,
  created_at  timestamptz not null default now()
);

create index if not exists events_listing_id_idx
  on public.events (listing_id);

-- ---------- Row Level Security ----------
-- All reads/writes happen server-side with the service-role key (which bypasses
-- RLS). We enable RLS with no public policies so the anon key can't touch these
-- tables directly.
alter table public.bookings        enable row level security;
alter table public.booking_dates   enable row level security;
alter table public.messages        enable row level security;
alter table public.event_listings  enable row level security;
alter table public.events          enable row level security;

-- ---------- Storage: sponsor creative uploads ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creatives', 'creatives', true, 5242880, array['image/png','image/jpeg'])
on conflict (id) do nothing;

-- Allow anonymous visitors to upload to (and read from) the creatives bucket.
-- The bucket is size/type limited above. Tighten later if you add auth.
drop policy if exists "creatives anon upload" on storage.objects;
create policy "creatives anon upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'creatives');

drop policy if exists "creatives public read" on storage.objects;
create policy "creatives public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'creatives');
