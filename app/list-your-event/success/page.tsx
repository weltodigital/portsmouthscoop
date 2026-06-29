import type { Metadata } from "next";
import { ResultPage } from "@/components/ResultPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Event submitted",
  robots: { index: false },
};

export default function EventSuccessPage() {
  return (
    <ResultPage
      emoji="🎉"
      title="Your event is in!"
      body={`Thanks, your receipt is on its way from Stripe. Your event will appear in the ${SITE.publishDay} edition for the week of its date. Spotted a typo? Email ${SITE.enquiryEmail}.`}
      primary={{ label: "Back to home", href: "/" }}
    />
  );
}
