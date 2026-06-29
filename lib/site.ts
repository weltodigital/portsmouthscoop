// Central place for site-wide constants so copy + links stay consistent.

export const SITE = {
  name: "Portsmouth Scoop",
  tagline: "Portsmouth News, With Personality.",
  description:
    "Your free weekly scoop on what's happening in and around Portsmouth: events, local gems, small biz spotlights & more.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://portsmouthscoop.co.uk",
  subscribeUrl: "https://portsmouthscoop.beehiiv.com/subscribe",
  // Custom enquiry / sponsor contact (per the build brief).
  enquiryEmail: "portsmouthscoop@weltodigital.com",
  publishDay: "Friday",
} as const;

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Live Music Lineup", href: "/live-music-portsmouth" },
  { label: "Sponsor", href: "/sponsor" },
  { label: "List an Event", href: "/list-your-event" },
  { label: "Contact", href: "/contact" },
] as const;

// Subscriber count, kept in one place so copy stays consistent.
export const SUBSCRIBERS = "3,119";
