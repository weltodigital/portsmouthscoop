import type { Metadata } from "next";
import { SubscribeButton } from "@/components/SubscribeButton";

export const metadata: Metadata = {
  title: "Live Music & Comedy Lineup",
  description:
    "This weekend's live music and comedy lineup across Portsmouth: gigs, tribute acts, open mics, comedy clubs and more. Subscribe to Portsmouth Scoop to get it in your inbox first.",
};

type Gig = {
  time: string;
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
    label: "Friday 3 July",
    gigs: [
      { time: "8.30pm", act: "Marley Blandford", venue: "Kassia" },
      { time: "8pm", act: "Ricky Zalez", venue: "Sherlocks Bar" },
      { time: "9pm", act: "Doghouse", venue: "The Admiral Drake" },
      {
        time: "7.30pm",
        act: "Rich as Gary Barlow",
        venue: "Casemates Studios & Cafe",
      },
      { time: "8pm", act: "Greg Barnes", venue: "Durty Nelly's" },
      { time: "9pm", act: "Sweet and Soul", venue: "O'Neill's" },
      { time: "9pm", act: "WHY?2K", venue: "The Vaults" },
    ],
  },
  {
    label: "Saturday 4 July",
    gigs: [
      {
        time: "7pm",
        act: "The Illegal Eagles",
        venue: "Portsmouth Guildhall",
      },
      { time: "11am", act: "HOMEGROWN SOUNDS", venue: "Wedgewood Rooms" },
      {
        time: "3pm–8pm",
        act: "Brewery Grooves – Hipshaker vs Funk Club",
        venue: "Staggeringly Good Brewery",
      },
      {
        time: "7pm–11.30pm",
        act: "What the Funk is Disco?",
        venue: "Staggeringly Good Brewery",
      },
      {
        time: "7.30pm",
        act: "No Jacket Required – Both Sides of the Hits Tour",
        venue: "Wedgewood Rooms",
      },
      { time: "1pm", act: "Live at the Bandstand" },
      { time: "7.30pm", act: "The Monochrome Set", venue: "Kola" },
      { time: "7pm", act: "80s Night", venue: "Mother Shipton" },
      { time: "8pm", act: "Roy Peplow", venue: "The Apsley" },
      { time: "8pm", act: "Robbie McMinn", venue: "Durty Nelly's" },
      { time: "9pm", act: "Queue the Audio", venue: "O'Neill's" },
      { time: "5.30pm", act: "The Hill Brothers", venue: "The Jolly Sailor" },
    ],
  },
  {
    label: "Sunday 5 July",
    gigs: [
      { time: "11am", act: "HOMEGROWN SOUNDS", venue: "Wedgewood Rooms" },
      { time: "4pm", act: "Andy Osman", venue: "Sherlocks Bar" },
      { time: "3pm", act: "Pf", venue: "The Derby Tavern" },
      {
        time: "3pm",
        act: "Jay Munday & Absuma",
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
    label: "Friday 3 July",
    gigs: [
      { time: "7.30pm", act: "Wedge Comedy Club", venue: "Wedgewood Rooms" },
      { time: "8pm", act: "Aubrey Blakeledge", venue: "The Fawcett Inn" },
      { time: "8.15pm", act: "Comedy at The Tower", venue: "Spinnaker Tower" },
    ],
  },
  {
    label: "Saturday 4 July",
    gigs: [
      { time: "8pm", act: "Puns and Roses", venue: "The Rose in June" },
    ],
  },
  {
    label: "Sunday 5 July",
    gigs: [
      {
        time: "7.30pm",
        act: "Gary Delaney – Gary On Laughing",
        venue: "New Theatre Royal",
      },
    ],
  },
];

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
            {day.gigs.map((gig, i) => (
              <li
                key={`${gig.act}-${i}`}
                className="flex items-baseline gap-4 px-5 py-4"
              >
                <span className="w-24 shrink-0 font-bold text-brand tabular-nums">
                  {gig.time}
                </span>
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
        <SubscribeButton className="mt-8 px-8 py-3.5 text-lg" />
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
        Got a gig we&rsquo;ve missed? Let us know and we&rsquo;ll add it to next
        week&rsquo;s lineup.
      </p>
    </section>
  );
}
