import type { Metadata } from "next";
import Link from "next/link";
import { BeehiivForm } from "@/components/BeehiivForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Live Music & Comedy Lineup",
  description:
    "This weekend's live music and comedy lineup across Portsmouth: gigs, tribute acts, open mics, comedy clubs and more. Subscribe to Portsmouth Scoop to get it in your inbox first.",
};

type Gig = {
  time?: string;
  act: string;
  venue?: string;
};

type Day = {
  label: string;
  gigs: Gig[];
};

// The weekend's lineup. Update this each week.
const LINEUP: Day[] = [
  {
    label: "Friday 18 September",
    gigs: [
      { time: "8.30pm", act: "Harrison Rhys", venue: "Kassia" },
      { time: "7.30pm", act: "Sabbra Cadabra", venue: "Portsmouth Guildhall" },
      { time: "9pm", act: "Keith Simon", venue: "O'Neill's" },
      { time: "8.45pm", act: "Patrick", venue: "The Bold Forester" },
      { time: "9pm", act: "Beard", venue: "The Vaults" },
      { time: "7pm", act: "A Night of Raw Metal", venue: "The Deco" },
    ],
  },
  {
    label: "Saturday 19 September",
    gigs: [
      { time: "7.30pm", act: "INDIE 80'S", venue: "Wedgewood Rooms" },
      { time: "8.30pm", act: "DJ Shakey (Vinyl)", venue: "Kassia" },
      {
        time: "4pm",
        act: "The Big Indoor Britpop Festival",
        venue: "Portsmouth Guildhall",
      },
      { time: "9pm", act: "Rhythm City", venue: "O'Neill's" },
      { time: "9pm", act: "Rich as Gary Barlow", venue: "The Vaults" },
      { time: "8pm", act: "The Soul Suspects", venue: "The Jolly Sailor" },
      { time: "8pm", act: "Roy Peplow", venue: "The Apsley" },
    ],
  },
  {
    label: "Sunday 20 September",
    gigs: [
      { time: "2pm", act: "THE GLORIAS", venue: "Wedgewood Rooms" },
      {
        time: "7.30pm",
        act: "Carole King's Tapestry",
        venue: "Portsmouth Guildhall",
      },
      {
        time: "2.30pm",
        act: "Joni Mitchell's Blue",
        venue: "Portsmouth Guildhall",
      },
      {
        time: "3pm",
        act: "Rossco & Sam McCarthy",
        venue: "Casemates Studios & Cafe",
      },
      { time: "6pm", act: "Jazz Night", venue: "The Vaults" },
      { time: "5pm", act: "Six String Steve", venue: "The Jolly Sailor" },
      {
        time: "6.45pm",
        act: "Alleycats Open Mic Night",
        venue: "The Barley Mow",
      },
    ],
  },
];

// The weekend's comedy lineup. Update this each week.
const COMEDY: Day[] = [
  {
    label: "Friday 18 September",
    gigs: [{ act: "Stitches Comedy Club", venue: "The Drayton Centre" }],
  },
  {
    label: "Saturday 19 September",
    gigs: [
      {
        act: "Comedy @ the Fort with Stephen K Amos, Andy Field & David Arnold",
      },
    ],
  },
  {
    label: "Sunday 20 September",
    gigs: [{ act: "Gary Meikle – YER MAW", venue: "The Gaiety, Southsea" }],
  },
];

/**
 * Convert a listing time to minutes-since-midnight for sorting. Handles
 * "8pm", "8.30pm", "11am" and ranges like "3pm–8pm" (sorts on the start).
 * Anything unparseable (or missing) sorts last.
 */
function toMinutes(time?: string): number {
  if (!time) return Number.MAX_SAFE_INTEGER;
  const start = time.split(/[–-]/)[0].trim();
  const m = start.match(/^(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)$/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3].toLowerCase();
  if (meridiem === "pm" && h !== 12) h += 12;
  if (meridiem === "am" && h === 12) h = 0;
  return h * 60 + min;
}

/** A group of day cards (time · act @ venue), shared by music and comedy. */
function DaySchedule({ days }: { days: Day[] }) {
  return (
    <div className="mt-8 space-y-12">
      {days.map((day) => (
        <div key={day.label}>
          <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
            {day.label}
          </h3>
          <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-card">
            {[...day.gigs]
              .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
              .map((gig, i) => (
                <li
                  key={`${gig.act}-${i}`}
                  className="flex items-baseline gap-4 px-5 py-4"
                >
                  {gig.time && (
                    <span className="w-24 shrink-0 font-bold text-brand tabular-nums">
                      {gig.time}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="font-semibold text-ink">{gig.act}</span>
                    {gig.venue && (
                      <span className="text-ink-soft"> @ {gig.venue}</span>
                    )}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function LiveMusicPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-coral" />
          This weekend
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Live Music &amp; Comedy Lineup
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          Every gig and comedy night we&rsquo;ve got our eye on across
          Portsmouth this weekend. Subscribe to get the full lineup in your
          inbox first.
        </p>
        <BeehiivForm
          formId={SITE.beehiivFormId}
          className="mx-auto mt-8 max-w-xl"
        />
      </header>

      <div className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          🎵 Live Music
        </h2>
        <DaySchedule days={LINEUP} />
      </div>

      <div className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          🎤 Comedy
        </h2>
        <DaySchedule days={COMEDY} />
      </div>

      <p className="mt-14 text-center text-sm text-muted">
        Got a gig or comedy night coming up?{" "}
        <Link
          href="/list-your-event"
          className="font-semibold text-brand hover:underline"
        >
          List your event
        </Link>{" "}
        and we&rsquo;ll feature it in the lineup.
      </p>
    </section>
  );
}
