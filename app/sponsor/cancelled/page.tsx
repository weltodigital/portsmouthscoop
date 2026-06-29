import type { Metadata } from "next";
import { ResultPage } from "@/components/ResultPage";

export const metadata: Metadata = {
  title: "Booking cancelled",
  robots: { index: false },
};

export default function SponsorCancelledPage() {
  return (
    <ResultPage
      emoji="👍"
      title="No worries — nothing was charged"
      body="Your payment was cancelled and those Fridays have been released. Whenever you're ready, head back to the sponsor page to pick up where you left off."
      primary={{ label: "Back to Sponsor", href: "/sponsor" }}
    />
  );
}
