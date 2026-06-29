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

// Legal / data-controller details for the Privacy Policy + Terms.
export const LEGAL = {
  controller: "Welto Limited",
  brand: "Portsmouth Scoop",
  companyNumber: "14630258",
  registeredAddress: "167-169 Great Portland Street, London, England, W1W 5PF",
  contactEmail: "portsmouthscoop@weltodigital.com",
  governingLaw: "England and Wales",
  lastUpdated: "29 June 2026",
} as const;

export const LEGAL_NAV = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;
