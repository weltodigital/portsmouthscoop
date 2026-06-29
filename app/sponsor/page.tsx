import type { Metadata } from "next";
import { SponsorBooking } from "./SponsorBooking";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "Sponsor Portsmouth Scoop: reach 3,119 engaged Portsmouth locals with a 50% open rate. Pick a placement, pick your Fridays, and book online.",
  alternates: { canonical: "/sponsor" },
};

export default function SponsorPage() {
  return <SponsorBooking />;
}
