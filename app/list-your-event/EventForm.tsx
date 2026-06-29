"use client";

import { useState } from "react";
import { SITE, SUBSCRIBERS } from "@/lib/site";
import {
  EVENT_TIERS,
  MAX_EVENTS,
  eventTierForCount,
  eventAmountPence,
} from "@/lib/pricing";

// Show pence only when needed (e.g. £24.50), otherwise a clean £24.
const gbp = (n: number) =>
  "£" + (Number.isInteger(n) ? n.toLocaleString("en-GB") : n.toFixed(2));

type EventRow = {
  name: string;
  venue: string;
  date: string;
  time: string;
  link: string;
};

const emptyEvent = (): EventRow => ({
  name: "",
  venue: "",
  date: "",
  time: "",
  link: "",
});

type Status = "idle" | "submitting" | "success" | "error";

/** Add https:// if the user left the scheme off. */
function normaliseLink(url: string) {
  const u = url.trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

export function EventForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [events, setEvents] = useState<EventRow[]>([emptyEvent()]);
  const [discount, setDiscount] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [showDiscount, setShowDiscount] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const count = events.length;
  const tier = eventTierForCount(count);
  const price = eventAmountPence(count) / 100;

  function updateEvent(i: number, field: keyof EventRow, value: string) {
    setEvents((prev) =>
      prev.map((ev, idx) => (idx === i ? { ...ev, [field]: value } : ev)),
    );
  }

  function addEvent() {
    setEvents((prev) =>
      prev.length < MAX_EVENTS ? [...prev, emptyEvent()] : prev,
    );
  }

  function removeEvent(i: number) {
    setEvents((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
    );
  }

  const emailOk = /.+@.+\..+/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !emailOk) {
      setStatus("error");
      setErrorMsg("Add your name and a valid email so we can send your receipt.");
      return;
    }
    const missing = events.some((ev) => !ev.name.trim() || !ev.date);
    if (missing) {
      setStatus("error");
      setErrorMsg("Each event needs at least a name and a date.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          business: business.trim(),
          discount: discount.trim(),
          website,
          events: events.map((ev) => ({
            ...ev,
            link: normaliseLink(ev.link),
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string; // off to Stripe Checkout
        return;
      }
      setStatus("error");
      setErrorMsg(data.error || "Something went wrong. Try again.");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again, or email us directly.");
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-5 py-16 md:py-20">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          List your event in Portsmouth Scoop
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
          Get your event in front of {SUBSCRIBERS}+ Portsmouth locals in this
          week&rsquo;s newsletter. Single event from £5, or pay once for up to ten
          different events at any of your venues.
        </p>
      </div>

      {/* Pricing tiles */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {EVENT_TIERS.map((t) => {
          const active = t.key === tier.key;
          return (
            <div
              key={t.key}
              className={`rounded-xl border p-5 text-center transition-colors ${
                active ? "border-brand bg-brand-soft" : "border-line bg-card"
              }`}
            >
              <div className="text-sm font-semibold text-ink-soft">
                {t.label}
              </div>
              <div className="mt-1 text-2xl font-extrabold">{gbp(t.rate)}</div>
              <div className="mt-1 text-xs font-semibold text-grass">
                per event
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        The more you list, the less each one costs.{" "}
        <span className="font-semibold text-ink">
          {count} event{count > 1 ? "s" : ""} × {gbp(tier.rate)} = {gbp(price)}
        </span>
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
      >
        {/* Honeypot — hidden from people, catches bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Leave this field empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* Your details */}
        <h2 className="text-lg font-extrabold">Your details</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Your name" required htmlFor="name">
            <input
              id="name"
              className="ps-input"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sam Davies"
            />
          </Field>
          <Field label="Email" required htmlFor="email">
            <input
              id="email"
              type="email"
              className="ps-input"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@venue.co.uk"
            />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Business / venue (optional)" htmlFor="business">
            <input
              id="business"
              className="ps-input"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="e.g. The Wellington"
            />
          </Field>
          <p className="mt-1.5 text-xs text-muted">
            So we can link this to your account if you book sponsorship later.
          </p>
        </div>

        {/* Events */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Your events</h2>
          <span className="text-sm font-semibold text-muted">
            {count}/{MAX_EVENTS}
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {events.map((ev, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-cream/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">
                  Event {i + 1}
                </span>
                {events.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEvent(i)}
                    className="text-sm font-semibold text-muted hover:text-coral-dark"
                  >
                    Remove
                  </button>
                )}
              </div>

              <Field label="Event name" required htmlFor={`ev-name-${i}`}>
                <input
                  id={`ev-name-${i}`}
                  className="ps-input"
                  value={ev.name}
                  onChange={(e) => updateEvent(i, "name", e.target.value)}
                  placeholder="e.g. Live music from The Band"
                />
              </Field>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Venue" htmlFor={`ev-venue-${i}`}>
                  <input
                    id={`ev-venue-${i}`}
                    className="ps-input"
                    value={ev.venue}
                    onChange={(e) => updateEvent(i, "venue", e.target.value)}
                    placeholder="e.g. The Amazing Music Venue"
                  />
                </Field>
                <Field label="Date" required htmlFor={`ev-date-${i}`}>
                  <input
                    id={`ev-date-${i}`}
                    type="date"
                    className="ps-input"
                    value={ev.date}
                    onChange={(e) => updateEvent(i, "date", e.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Time" htmlFor={`ev-time-${i}`}>
                  <input
                    id={`ev-time-${i}`}
                    className="ps-input"
                    value={ev.time}
                    onChange={(e) => updateEvent(i, "time", e.target.value)}
                    placeholder="e.g. 7:30pm"
                  />
                </Field>
                <Field label="Link for more info" htmlFor={`ev-link-${i}`}>
                  <input
                    id={`ev-link-${i}`}
                    className="ps-input"
                    value={ev.link}
                    onChange={(e) => updateEvent(i, "link", e.target.value)}
                    placeholder="ticketsite.com/your-event"
                  />
                </Field>
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Tickets, booking, or your event page. We&rsquo;ll add https://
                automatically.
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEvent}
          disabled={events.length >= MAX_EVENTS}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-bold text-brand transition-colors hover:border-brand disabled:cursor-not-allowed disabled:text-muted"
        >
          + Add another event
        </button>

        {/* Discount */}
        <div className="mt-6">
          {showDiscount ? (
            <Field label="Discount code" htmlFor="discount">
              <input
                id="discount"
                className="ps-input"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="Enter code"
              />
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setShowDiscount(true)}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Got a discount code?
            </button>
          )}
        </div>

        {status === "error" && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-coral/15 px-4 py-3 text-sm font-semibold text-ink"
          >
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 w-full rounded-xl bg-coral px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-coral-dark disabled:cursor-not-allowed disabled:bg-grey"
        >
          {status === "submitting"
            ? "Submitting…"
            : `Pay ${gbp(price)} and submit`}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          Payment via Stripe; your receipt comes from them. Your event will appear
          in the {SITE.publishDay} edition for the week of the event date.
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold"
      >
        {label}
        {required && <span className="text-coral-dark"> *</span>}
      </label>
      {children}
    </div>
  );
}
