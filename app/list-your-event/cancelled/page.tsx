import type { Metadata } from "next";
import { ResultPage } from "@/components/ResultPage";

export const metadata: Metadata = {
  title: "Submission cancelled",
  robots: { index: false },
};

export default function EventCancelledPage() {
  return (
    <ResultPage
      emoji="👍"
      title="No worries — nothing was charged"
      body="Your payment was cancelled and your event wasn't submitted. Whenever you're ready, head back and list it again."
      primary={{ label: "List an event", href: "/list-your-event" }}
    />
  );
}
