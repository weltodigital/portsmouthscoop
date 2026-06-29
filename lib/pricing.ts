// Single source of truth for pricing, shared by client UI and server routes.
// The server always recomputes amounts from these tables — never trust a
// price sent from the browser.

export type PlacementKey = "primary" | "feature" | "classified";
export type SponsorPackKey = "single" | "four" | "twelve";

export const SPONSOR_PRICING: Record<
  PlacementKey,
  {
    name: string;
    pos: string;
    blurb: string;
    single: number;
    four: number;
    twelve: number;
  }
> = {
  primary: {
    name: "Primary",
    pos: "top of newsletter",
    blurb: "Logo + photo + copy at the very top, the full-attention slot.",
    single: 75,
    four: 270,
    twelve: 720,
  },
  feature: {
    name: "Feature",
    pos: "middle of newsletter",
    blurb: "Photo + copy placement in the middle of the issue.",
    single: 45,
    four: 162,
    twelve: 432,
  },
  classified: {
    name: "Classified",
    pos: "bottom of newsletter",
    blurb: "A short content block near the bottom of the issue.",
    single: 20,
    four: 72,
    twelve: 192,
  },
};

export const SPONSOR_PACKS: {
  key: SponsorPackKey;
  label: string;
  n: number;
  field: "single" | "four" | "twelve";
  save: string;
}[] = [
  { key: "single", label: "Single issue", n: 1, field: "single", save: "" },
  { key: "four", label: "4-pack", n: 4, field: "four", save: "save 10%" },
  { key: "twelve", label: "12-pack", n: 12, field: "twelve", save: "save 20%" },
];

export function sponsorPack(packKey: string) {
  return SPONSOR_PACKS.find((p) => p.key === packKey) ?? null;
}

/** Authoritative sponsor amount in pence for a placement + pack. */
export function sponsorAmountPence(
  placement: string,
  packKey: string,
): number | null {
  const p = SPONSOR_PRICING[placement as PlacementKey];
  const pack = sponsorPack(packKey);
  if (!p || !pack) return null;
  return p[pack.field] * 100;
}

// ---- Events --------------------------------------------------------------

export type EventPackKey = "single" | "five" | "ten";

export const EVENT_PACKS: {
  key: EventPackKey;
  label: string;
  cap: number;
  price: number;
  per: string;
}[] = [
  { key: "single", label: "Single event", cap: 1, price: 5, per: "" },
  { key: "five", label: "Up to 5 events", cap: 5, price: 20, per: "£4 per event" },
  { key: "ten", label: "Up to 10 events", cap: 10, price: 35, per: "£3.50 per event" },
];

export const MAX_EVENTS = 10;

/** The pack whose cap covers `count` events. */
export function eventPackForCount(count: number) {
  return (
    EVENT_PACKS.find((p) => p.cap >= count) ?? EVENT_PACKS[EVENT_PACKS.length - 1]
  );
}
