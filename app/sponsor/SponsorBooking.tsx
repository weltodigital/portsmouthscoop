"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./sponsor.css";
import { SITE } from "@/lib/site";
import {
  SPONSOR_PRICING as PRICING,
  SPONSOR_PACKS as PACKS,
  type PlacementKey,
  type SponsorPackKey as PackKey,
} from "@/lib/pricing";

/* ============================================================
   CONFIG (ported from portsmouth-scoop-sponsor.html)
   ============================================================ */
const SEND_DAY = 5; // 0=Sun … 6=Sat. Friday = 5.
const WEEKS_AHEAD = 26;

// Testimonials + "Trusted by" are placeholder content, hidden for launch.
// Flip to `true` once real sponsors/quotes are in.
const SHOW_TESTIMONIALS = false;

type IssueDate = { iso: string; label: string };

const gbp = (n: number) => "£" + n.toLocaleString("en-GB");

// Which slot of the mini newsletter diagram the ad occupies (0=top … 2=bottom).
const AD_SLOT: Record<PlacementKey, number> = {
  primary: 0,
  feature: 1,
  classified: 2,
};

/** Tiny "where your ad sits in the issue" mockup for a placement card. */
function PlacementDiagram({ adSlot }: { adSlot: number }) {
  return (
    <div className="mini" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`mini-slot ${i === adSlot ? "ad" : ""}`}>
          <div className="mini-thumb" />
          <div className="mini-line" />
          <div className="mini-line short" />
        </div>
      ))}
    </div>
  );
}

/** Build the upcoming Friday send-dates (client-side to avoid hydration drift). */
function buildDates(): IssueDate[] {
  const out: IssueDate[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== SEND_DAY) d.setDate(d.getDate() + 1);
  for (let i = 0; i < WEEKS_AHEAD; i++) {
    // Build ISO from local parts (avoids the UTC day-shift toISOString can cause).
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({
      iso,
      label: d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    });
    d.setDate(d.getDate() + 7);
  }
  return out;
}

export function SponsorBooking() {
  const [place, setPlace] = useState<PlacementKey>("primary");
  const [pack, setPack] = useState<PackKey>("single");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const [dates, setDates] = useState<IssueDate[]>([]);
  // Booked (send_date|placement) pairs from /api/availability.
  const [booked, setBooked] = useState<Set<string>>(new Set());

  const [headline, setHeadline] = useState("");
  const [bodyCopy, setBodyCopy] = useState("");
  const [biz, setBiz] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [link, setLink] = useState("");

  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [payBusy, setPayBusy] = useState(false);
  const [payMsg, setPayMsg] = useState<{ text: string; ok: boolean } | null>(
    null,
  );

  const bookingRef = useRef<HTMLDivElement>(null);

  // Generate the date list on mount.
  useEffect(() => {
    setDates(buildDates());
  }, []);

  // Pull live availability (greys out taken Fridays for the chosen placement).
  const loadAvailability = useCallback(async () => {
    try {
      const r = await fetch("/api/availability", { cache: "no-store" });
      const data: { booked?: { send_date: string; placement: string }[] } =
        r.ok ? await r.json() : { booked: [] };
      setBooked(
        new Set((data.booked ?? []).map((b) => `${b.send_date}|${b.placement}`)),
      );
    } catch {
      /* fail open; picker still works */
    }
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const packMeta = PACKS.find((p) => p.key === pack)!;
  const n = packMeta.n;
  const p = PRICING[place];
  const price = p[packMeta.field];

  const isBooked = (iso: string) => booked.has(`${iso}|${place}`);

  // Keep selection valid when placement/pack changes.
  function selectPlacement(k: PlacementKey) {
    setPlace(k);
    setPicked(new Set());
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectPack(key: PackKey) {
    const newN = PACKS.find((x) => x.key === key)!.n;
    setPack(key);
    setPicked((prev) => (prev.size > newN ? new Set() : prev));
  }

  function toggleDate(iso: string) {
    if (isBooked(iso)) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(iso)) {
        next.delete(iso);
      } else {
        if (next.size >= n) {
          if (n === 1) next.clear();
          else return next;
        }
        next.add(iso);
      }
      return next;
    });
  }

  const pickedSorted = useMemo(
    () => [...picked].sort(),
    [picked],
  );
  const ready = picked.size === n;
  const left = n - picked.size;
  const nextAvail = dates.find((d) => !isBooked(d.iso));

  const pickHint = ready
    ? `All ${n} dates picked ✓`
    : left === n
      ? `Pick ${n} Friday${n > 1 ? "s" : ""} to continue.`
      : `Pick ${left} more date${left > 1 ? "s" : ""} to continue.`;

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const r = new FileReader();
    r.onload = (ev) => {
      setPhotoData(ev.target?.result as string);
      setPhotoName(f.name);
    };
    r.readAsDataURL(f);
  }

  /** Upload the creative photo to Supabase Storage, return its public URL. */
  async function uploadPhoto(): Promise<string | null> {
    if (!photoFile) return null;
    // Lazy-load the Supabase client so it stays out of the initial page bundle.
    const { getBrowserSupabase } = await import("@/lib/supabase/browser");
    const supabase = getBrowserSupabase();
    if (!supabase) return null; // Storage not configured; proceed without it.
    const ext = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("creatives")
      .upload(path, photoFile, { contentType: photoFile.type, upsert: false });
    if (error) {
      console.error("photo upload failed", error);
      return null;
    }
    return supabase.storage.from("creatives").getPublicUrl(path).data.publicUrl;
  }

  async function onPay() {
    setPayMsg(null);

    // Validate the creative before taking payment.
    if (!biz.trim()) {
      return setPayMsg({ text: "Add your business name.", ok: false });
    }
    if (!/.+@.+\..+/.test(email.trim())) {
      return setPayMsg({ text: "Add a valid contact email.", ok: false });
    }
    if (!phone.trim()) {
      return setPayMsg({ text: "Add a contact phone number.", ok: false });
    }
    if (!link.trim()) {
      return setPayMsg({ text: "Add a link for the CTA.", ok: false });
    }
    if (!headline.trim() || !bodyCopy.trim()) {
      return setPayMsg({
        text: "Add a headline and body copy for your ad.",
        ok: false,
      });
    }

    setPayBusy(true);
    try {
      const photo_url = await uploadPhoto();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placement: place,
          pack,
          dates: [...picked].sort(),
          business_name: biz.trim(),
          contact_email: email.trim(),
          contact_phone: phone.trim(),
          cta_link: link.trim(),
          headline: headline.trim(),
          body: bodyCopy.trim(),
          photo_url,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      if (res.status === 409) {
        await loadAvailability();
        setPicked(new Set());
      }
      setPayMsg({
        text: data.error || "Could not start payment. Please try again.",
        ok: false,
      });
    } catch {
      setPayMsg({ text: "Something went wrong. Please try again.", ok: false });
    } finally {
      setPayBusy(false);
    }
  }

  return (
    <div id="ps-root">
      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <div className="kicker">
            <span className="dot" /> Sponsor the Scoop
          </div>
          <h1>Portsmouth Scoop</h1>
          <p>
            The weekly newsletter for Portsmouth. Pick a placement, pick your
            Fridays, and be in the next issue.
          </p>
          <div className="pills">
            <span className="pill">Portsmouth</span>
            <span className="pill">Weekly</span>
            <span className="pill">100% local</span>
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="wrap">
        <div className="stats">
          <div className="stat">
            <div className="label">Subscribers</div>
            <div className="num">3,119</div>
            <div className="sub plain">Engaged Portsmouth locals</div>
          </div>
          <div className="stat">
            <div className="label">Open rate</div>
            <div className="num">50%</div>
            <div className="sub">≈2× industry average</div>
          </div>
          <div className="stat">
            <div className="label">Click-to-open</div>
            <div className="num">9.9%</div>
            <div className="sub plain">~1,570 opens every issue</div>
          </div>
        </div>
      </div>

      {/* TRUSTED / TESTIMONIALS: placeholder content, hidden for launch. */}
      {SHOW_TESTIMONIALS && (
        <section className="seg">
          <div className="wrap trusted">
            <div className="placeholder-flag">
              Example content · replace once you have real sponsors
            </div>
            <div className="head">Trusted by Portsmouth businesses</div>
            <div className="logos">
              <span className="logo-chip">Your Sponsor</span>
              <span className="logo-chip">A Local Café</span>
              <span className="logo-chip">An Independent Shop</span>
              <span className="logo-chip">A Gym</span>
              <span className="logo-chip">A Restaurant</span>
            </div>
            <div className="quotes">
              <div className="quote">
                <span className="mark">&ldquo;</span>
                <p>
                  Placeholder testimonial. Swap this for a real quote from your
                  first sponsor once you have one: short, specific, and about
                  results.
                </p>
                <div className="who">
                  First Name <span>· Their Business</span>
                </div>
              </div>
              <div className="quote">
                <span className="mark">&ldquo;</span>
                <p>
                  Placeholder testimonial. A line about how easy it was to book
                  and how it felt to reach a local, engaged audience works well
                  here.
                </p>
                <div className="who">
                  First Name <span>· Their Business</span>
                </div>
              </div>
              <div className="quote">
                <span className="mark">&ldquo;</span>
                <p>
                  Placeholder testimonial. A reader quote, someone who loves the
                  Scoop, is great social proof for sponsors too.
                </p>
                <div className="who">
                  First Name <span>· Subscriber</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PLACEMENTS */}
      <section className="seg" style={{ paddingTop: SHOW_TESTIMONIALS ? 0 : 48 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2>Pick a placement</h2>
            <p>
              Three slots per issue. Book a single Friday or save with a
              multi-issue pack.
            </p>
          </div>
          <div className="cards">
            {(Object.keys(PRICING) as PlacementKey[]).map((k) => {
              const pc = PRICING[k];
              return (
                <div
                  key={k}
                  className={`card ${k === "feature" ? "is-feat" : ""}`}
                  style={{
                    outline: k === place ? "2px solid var(--blue)" : "none",
                  }}
                >
                  <div className="tag">
                    <span className="tname">{pc.name}</span>
                    <span className="tpos">· {pc.pos}</span>
                  </div>
                  <div className="blurb">{pc.blurb}</div>
                  <PlacementDiagram adSlot={AD_SLOT[k]} />
                  <div className="mini-cap">
                    Sits at the {pc.pos.replace(" of newsletter", "")}
                  </div>
                  <div className="avail">
                    Next available: {nextAvail ? nextAvail.label : "soon"}
                  </div>
                  <div className="price-rows">
                    <div className="prow">
                      <span className="pl">Single issue</span>
                      <span className="pv">{gbp(pc.single)}</span>
                    </div>
                    <div className="prow">
                      <span className="pl">
                        4-pack <small>save 10%</small>
                      </span>
                      <span className="pv">{gbp(pc.four)}</span>
                    </div>
                    <div className="prow">
                      <span className="pl">
                        12-pack <small>save 20%</small>
                      </span>
                      <span className="pv">{gbp(pc.twelve)}</span>
                    </div>
                  </div>
                  <button
                    className="book"
                    type="button"
                    onClick={() => selectPlacement(k)}
                  >
                    Book {pc.name} · from {gbp(pc.single)}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="custom">
            Looking for something custom? <b>Let&rsquo;s talk</b>:{" "}
            <a href={`mailto:${SITE.enquiryEmail}`}>{SITE.enquiryEmail}</a>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className="seg" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="booking" ref={bookingRef}>
            <div className="bk-head">
              <div>
                <h2>Book your issues</h2>
                <div className="bk-sub">
                  {p.name} placement · {p.pos}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                  }}
                >
                  Running total
                </div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{gbp(price)}</div>
              </div>
            </div>

            <div className="step-label">1 · How many?</div>
            <div className="packs">
              {PACKS.map((pk) => (
                <div
                  key={pk.key}
                  className={`pack ${pk.key === pack ? "on" : ""}`}
                  onClick={() => selectPack(pk.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectPack(pk.key);
                    }
                  }}
                >
                  <div className="pn">{pk.label}</div>
                  <div className="pp">{gbp(PRICING[place][pk.field])}</div>
                  <div className="ps">{pk.save}</div>
                </div>
              ))}
            </div>

            <div className="step-label">
              2 · Pick your {n} Friday{n > 1 ? "s" : ""}
            </div>
            <div className="dates">
              {dates.map((d) => {
                const on = picked.has(d.iso);
                const bk = isBooked(d.iso);
                return (
                  <div
                    key={d.iso}
                    className={`date ${bk ? "booked" : ""} ${on ? "on" : ""}`}
                    onClick={() => toggleDate(d.iso)}
                    role="button"
                    aria-disabled={bk}
                    aria-pressed={on}
                    tabIndex={bk ? -1 : 0}
                    onKeyDown={(e) => {
                      if (!bk && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        toggleDate(d.iso);
                      }
                    }}
                  >
                    <div className="dd">{d.label}</div>
                    <div className={`ds ${bk ? "" : "ok"}`}>
                      {bk ? "Booked" : on ? "Selected" : "Available"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pick-hint">{pickHint}</div>

            <div className="step-label">3 · Your creative</div>
            <div className="preview-note">
              This is what Portsmouth Scoop readers will see on the day. You can
              change it up to 48h before send.
            </div>

            <div className="grid2">
              <div className="field">
                <label>
                  Business name <span className="req">*</span>
                </label>
                <input
                  value={biz}
                  onChange={(e) => setBiz(e.target.value)}
                  placeholder="Required"
                />
              </div>
              <div className="field">
                <label>
                  Contact email <span className="req">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.co.uk"
                />
              </div>
            </div>
            <div className="grid2">
              <div className="field">
                <label>
                  Contact phone <span className="req">*</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Required"
                />
              </div>
              <div className="field">
                <label>
                  Link for the CTA <span className="req">*</span>
                </label>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="yourbusiness.co.uk"
                />
              </div>
            </div>
            <div className="field">
              <label>
                Headline{" "}
                <span className="count">{headline.length}/60</span>
              </label>
              <input
                maxLength={60}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Required"
              />
            </div>
            <div className="field">
              <label>
                Body copy{" "}
                <span className="count">{bodyCopy.length}/600</span>
              </label>
              <textarea
                maxLength={600}
                value={bodyCopy}
                onChange={(e) => setBodyCopy(e.target.value)}
                placeholder="A sentence or two for Portsmouth Scoop readers."
              />
            </div>
            <div className="field">
              <label>Photo</label>
              <div
                className={`photo-drop ${photoData ? "has" : ""}`}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileRef.current?.click();
                  }
                }}
              >
                {photoData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoData} alt="Your upload preview" />
                ) : (
                  <span>
                    Click to add a photo · JPEG or PNG · min 1200px wide · max
                    5&nbsp;MB
                  </span>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={onPhoto}
                />
              </div>
              {photoName && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 6,
                  }}
                >
                  {photoName}
                </div>
              )}
            </div>

            <div className="preview-wrap">
              <div className="step-label" style={{ marginTop: 8 }}>
                Preview
              </div>
              <div className="preview-note">
                Rough, not a pixel-perfect newsletter render.
              </div>
              <div className="nl-block">
                <div className="nl-tag">{p.name}</div>
                <div className="nl-img">
                  {photoData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoData} alt="" />
                  ) : (
                    "Photo"
                  )}
                </div>
                <div className="nl-h">{headline || "Your headline here"}</div>
                <div className="nl-b">
                  {bodyCopy ||
                    "Your copy goes here. A sentence or two for Portsmouth Scoop readers."}
                </div>
                <div className="nl-cta">Learn more →</div>
              </div>
            </div>

            <div className="review">
              <div className="step-label" style={{ marginTop: 0 }}>
                4 · Review &amp; pay
              </div>
              <div className="rev-row">
                <span>Placement</span>
                <b>
                  {p.name} · {p.pos}
                </b>
              </div>
              <div className="rev-row">
                <span>Quantity</span>
                <b>{packMeta.label}</b>
              </div>
              <div className="rev-row">
                <span>Dates</span>
                <b>
                  {pickedSorted.length
                    ? pickedSorted
                        .map((iso) => dates.find((d) => d.iso === iso)?.label)
                        .join(", ")
                    : "Not selected yet"}
                </b>
              </div>
              <div className="rev-total">
                <span>Total</span>
                <span>{gbp(price)}</span>
              </div>
              <div className="disc">
                <input placeholder="Discount code (optional)" />
                <button
                  className="ai-btn"
                  type="button"
                  style={{ background: "var(--ink)" }}
                >
                  Apply
                </button>
              </div>
              <button
                className="pay"
                type="button"
                disabled={!ready || payBusy}
                onClick={onPay}
              >
                {payBusy
                  ? "Taking you to Stripe…"
                  : ready
                    ? `Pay ${gbp(price)} with Stripe`
                    : `Pick your ${n} date${n > 1 ? "s" : ""} to continue`}
              </button>
              {payMsg && (
                <p
                  style={{
                    fontSize: 13,
                    color: payMsg.ok ? "var(--green)" : "var(--accent-dark)",
                    fontWeight: 600,
                    marginTop: 12,
                  }}
                >
                  {payMsg.text}
                </p>
              )}
              <ul className="assure">
                <li>You&rsquo;ll pop over to Stripe to pay, then come straight back.</li>
                <li>
                  Change your creative any time up to 48h before the issue sends.
                </li>
                <li>
                  Need to swap a date or ask something? Just reply to your receipt
                  or email {SITE.enquiryEmail}.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="ft">
        Portsmouth Scoop · The weekly what&rsquo;s-on for Portsmouth
      </div>
    </div>
  );
}
