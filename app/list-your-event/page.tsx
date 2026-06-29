import type { Metadata } from "next";
import { SUBSCRIBERS } from "@/lib/site";
import { EventForm } from "./EventForm";

export const metadata: Metadata = {
  title: "List an Event",
  description: `Get your event in front of ${SUBSCRIBERS}+ Portsmouth locals in Portsmouth Scoop. Single event from £5, or pay once for up to ten events.`,
  alternates: { canonical: "/list-your-event" },
};

export default function ListEventPage() {
  return <EventForm />;
}
